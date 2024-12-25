import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";
import axiosInstance from "@/lib/api/axiosInstance";
import { SleeperPlayerStat } from "@/lib/types/sleeperApiTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");

  const projectionsWeek_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["projectionsweek"]
  );

  const projectionsweek = projectionsWeek_db.rows[0];

  if (
    new Date().getTime() - projectionsweek?.updatedat < 1000 * 60 * 15 &&
    projectionsweek?.data?.week === week
  ) {
    return NextResponse.json(projectionsweek.data.projections, { status: 200 });
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
      const [projectionsweek_updated, schedule_week] = await Promise.all([
        await axiosInstance.get(
          `https://api.sleeper.com/projections/nfl/${process.env.SEASON}/${week}?season_type=regular`
        ),
        await axiosInstance.post("https://sleeper.com/graphql", graphqlQuery),
      ]);

      const teams_obj: {
        [team: string]: {
          opp: string;
          start_time: number;
          status: string;
        };
      } = {};

      schedule_week.data.data.scores.forEach(
        (m: {
          game_id: string;
          start_time: number;
          status: string;
          metadata: { home_team: string; away_team: string };
        }) => {
          teams_obj[m.metadata.home_team] = {
            opp: `vs ${m.metadata.away_team}`,
            start_time: m.start_time,
            status: m.status,
          };

          teams_obj[m.metadata.away_team] = {
            opp: `@ ${m.metadata.home_team}`,
            start_time: m.start_time,
            status: m.status,
          };
        }
      );

      const result = projectionsweek_updated.data
        .filter((player_stat: SleeperPlayerStat) => player_stat.stats.pts_ppr)
        .map((player_stat: SleeperPlayerStat) => {
          return {
            player_id: player_stat.player_id,
            stats: player_stat.stats,
            injury_status: player_stat.player.injury_status || "",
            kickoff: teams_obj[player_stat.team].start_time,
            status: teams_obj[player_stat.team].status,
            game_id: player_stat.game_id,
            team: player_stat.team,
          };
        });

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
        [
          "projectionsweek",
          { week, projections: result, teams_obj },
          new Date(),
        ]
      );

      return NextResponse.json(result);
    } catch (err: any) {
      console.log(err.message);
      return NextResponse.json(err, { status: 500 });
    }
  }
}
