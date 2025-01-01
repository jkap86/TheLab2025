import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";
import {
  SleeperPlayerStat,
  SleeperScheduleGame,
} from "@/lib/types/sleeperApiTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const week_param = searchParams.get("week") as string;

  const week = week_param;
  const season_type = parseInt(week) <= 18 ? "regular" : "post";

  const playoffs_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["playoffs"]
  );

  const playoffs = playoffs_db.rows[0] || {};

  if (playoffs?.data?.[week]?.updatenext === new Date().getTime()) {
    console.log("From DB");
    return NextResponse.json(playoffs.data);
  } else {
    console.log("Updating");
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

      const [schedule_week, projectionsweek_db, statsweek] = await Promise.all([
        await axiosInstance.post("https://sleeper.com/graphql", graphqlQuery),
        await pool.query("SELECT * FROM common WHERE name = $1;", [
          "projectionsweek",
        ]),
        await axiosInstance.get(
          `https://api.sleeper.com/stats/nfl/${process.env.SEASON}/${week}?season_type=${season_type}`
        ),
      ]);

      const projectionsweek = projectionsweek_db.rows[0].data.projections || [];

      let updatenext: number;

      if (
        schedule_week.data.data.scores.find((g: SleeperScheduleGame) =>
          g.status.includes("prog")
        )
      ) {
        updatenext = new Date().getTime() + 60000;
      } else if (
        schedule_week.data.data.scores.find(
          (g: SleeperScheduleGame) => g.status === "pre_game"
        )
      ) {
        const nextKickoff = Math.min(
          ...schedule_week.data.data.scores
            .filter((g: SleeperScheduleGame) => g.status === "pre_game")
            .map((g: SleeperScheduleGame) => g.start_time)
        );

        updatenext = new Date(nextKickoff).getTime();
      } else {
        updatenext = new Date().getTime() + 60 * 60 * 1000;
      }

      const teams_obj: {
        [team: string]: {
          opp: string;
          clock: string;
          percent_game_remaining: number;
        };
      } = {};

      schedule_week.data.data.scores.forEach((g: SleeperScheduleGame) => {
        const percent_game_remaining = getPercentGameRemaining(
          g.status,
          g.metadata.quarter_num,
          g.metadata.time_remaining
        );

        const clock =
          g.status === "complete"
            ? "FINAL"
            : g.status === "pre_game"
            ? new Date(g.start_time).toLocaleDateString() +
              " " +
              new Date().toLocaleTimeString()
            : `Q${g.metadata.quarter_num} ${g.metadata.time_remaining}`;

        teams_obj[g.metadata.home_team] = {
          opp: `vs ${g.metadata.away_team}`,
          clock,
          percent_game_remaining,
        };

        teams_obj[g.metadata.away_team] = {
          opp: `@ ${g.metadata.home_team}`,
          clock,
          percent_game_remaining,
        };
      });

      const player_ids = Array.from(
        new Set([
          ...projectionsweek.map((p: SleeperPlayerStat) => p.player_id),
          ...statsweek.data.map((s: SleeperPlayerStat) => s.player_id),
        ])
      );

      const players: {
        stats: { [cat: string]: number };
        live_proj: { [cat: string]: number };
      }[] = player_ids.map((player_id) => {
        const proj_obj =
          projectionsweek.find(
            (player_stat: SleeperPlayerStat) =>
              player_stat.player_id === player_id
          ) || {};

        const stat_obj =
          statsweek.data.find(
            (player_stat: SleeperPlayerStat) =>
              player_stat.player_id === player_id
          ) || {};

        const team = proj_obj.team || stat_obj.team;

        const cats = Array.from(
          new Set([
            ...Object.keys(proj_obj.stats || {}),
            ...Object.keys(stat_obj.stats || {}),
          ])
        );

        return {
          player_id,
          stats: stat_obj.stats || {},
          live_proj: Object.fromEntries(
            cats.map((cat) => [
              cat,
              (proj_obj.stats?.[cat] || 0) *
                (teams_obj[team]?.percent_game_remaining || 0) +
                (stat_obj.stats?.[cat] || 0),
            ])
          ),
          opp: teams_obj[team]?.opp,
          clock: teams_obj[team]?.clock,
          percent_game_remaining: teams_obj[team]?.percent_game_remaining,
        };
      });

      const data = {
        ...(playoffs.data || {}),
        [week]: {
          schedule: schedule_week.data.data.scores,
          players,
          updatenext,
        },
      };

      await pool.query(
        `
          INSERT INTO common (name, data, updatedat) 
          VALUES ($1, $2, $3)
          ON CONFLICT (name) 
          DO UPDATE SET 
            data = EXCLUDED.data,
            updatedat = EXCLUDED.updatedat
          RETURNING *;
        `,
        ["playoffs", data, new Date()]
      );

      return NextResponse.json(data);
    } catch (err: unknown) {
      if (err instanceof Error) return NextResponse.json(err.message);
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
