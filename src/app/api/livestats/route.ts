import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";
import axiosInstance from "@/lib/api/axiosInstance";
import { SleeperPlayerStat } from "@/lib/types/sleeperApiTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");

  const livestats_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["livestats"]
  );

  const livestats = livestats_db.rows[0];

  if (
    new Date().getTime() - livestats?.updatedat < 1000 * 60 * 15 &&
    livestats?.data?.week === week
  ) {
    return NextResponse.json(livestats, { status: 200 });
  } else {
    try {
      const graphqlQuery = {
        query: `
            query batch_scores {
                scores(
                    sport: "nfl"
                    season_type: "regular"
                    season: "${process.env.SEASON}"
                    week: ${week}
                ) {
                    
                    game_id
                    metadata 
                    status
                    start_time
                }
            }
            `,
      };

      const [livestats_updated, schedule_week, projectionsWeek_db] =
        await Promise.all([
          await axiosInstance.get(
            `https://api.sleeper.com/stats/nfl/${process.env.SEASON}/${week}?season_type=regular`
          ),
          await axiosInstance.post("https://sleeper.com/graphql", graphqlQuery),
          await pool.query("SELECT * FROM common WHERE name = $1;", [
            "projectionsweek",
          ]),
        ]);

      const teams_obj: {
        [team: string]: {
          opp: string;
          quarter_num: number;
          time_remaining: string;
          percent_game_remaining: number;
        };
      } = {};

      schedule_week.data.data.scores.forEach(
        (m: {
          game_id: string;
          metadata: {
            quarter_num: number;
            time_remaining: string;
            home_team: string;
            away_team: string;
          };
          status: string;
        }) => {
          const quarter_num =
            m.status === "pre_game"
              ? 1
              : m.status === "complete"
              ? 4
              : m.metadata.quarter_num;
          const time_remaining =
            m.status === "pre_game"
              ? "15:00"
              : m.status === "complete"
              ? "0:00"
              : m.metadata.time_remaining;

          const percent_game_remaining = getPercentGameRemaining(
            m.status,
            m.metadata.quarter_num,
            m.metadata.time_remaining
          );

          teams_obj[m.metadata.home_team] = {
            opp: `vs ${m.metadata.away_team}`,
            quarter_num,
            time_remaining,
            percent_game_remaining,
          };

          teams_obj[m.metadata.away_team] = {
            opp: `@ ${m.metadata.home_team}`,
            quarter_num,
            time_remaining,
            percent_game_remaining,
          };
        }
      );

      const player_ids = Array.from(
        new Set([
          ...livestats_updated.data.map(
            (player_stat: SleeperPlayerStat) => player_stat.player_id
          ),
          ...projectionsWeek_db.rows[0].data.projections.map(
            (player_stat: SleeperPlayerStat) => player_stat.player_id
          ),
        ])
      );

      const result = player_ids.map((player_id) => {
        const proj = projectionsWeek_db.rows[0].data.projections.find(
          (player_stat: SleeperPlayerStat) =>
            player_stat.player_id === player_id
        );

        const stats = livestats_updated.data.find(
          (player_stat: SleeperPlayerStat) =>
            player_stat.player_id === player_id
        );

        const proj_obj = proj?.stats || {};
        const stats_obj = stats?.stats || {};

        const team = stats?.team || proj?.team;

        const { opp, quarter_num, time_remaining, percent_game_remaining } =
          teams_obj[team] || {};

        const stat_cats = Array.from(
          new Set([...Object.keys(proj_obj), ...Object.keys(stats_obj)])
        );

        return {
          player_id,
          opp,
          quarter_num,
          time_remaining,
          percent_game_remaining,
          proj_obj: Object.fromEntries(
            stat_cats.map((cat) => [
              cat,
              (proj_obj[cat] || 0) * (percent_game_remaining || 0) +
                (stats_obj[cat] || 0),
            ])
          ),
          stats_obj,
          team,
        };
      });

      const response = NextResponse.json(result);
      response.headers.set(
        "Cache-Control",
        "s-maxage=30, stale-while-revalidate=30"
      );
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
        return NextResponse.json(err.message);
      } else {
        console.log({ err });
        return NextResponse.json("unkown error");
      }
    }
  }
}

const getPercentGameRemaining = (
  status: string,
  quarter_num: number,
  time_remaining: string
) => {
  if (status === "pre_game") return 1;

  if (status === "complete") return 0;

  const game_sec_before_qtr = (quarter_num - 1) * 15 * 60;

  const time_remaining_array = time_remaining?.split(":");

  const game_sec_qtr =
    15 * 60 -
    (parseInt(time_remaining_array?.[0]) * 60 +
      parseInt(time_remaining_array?.[1]));

  const game_sec_remaining_total = game_sec_before_qtr + game_sec_qtr;

  return (3600 - game_sec_remaining_total) / 3600;
};
