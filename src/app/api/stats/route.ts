import pool from "@/lib/api/pool";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  /*
  const populateStats = async () => {
    const seasons = Array.from(Array(5).keys()).map((key) => key + 2020);
    const season_types = ["pre", "regular", "post"];

    const stats_array: {
      player_id: string;
      gms_active: number;
      gp: number;
      pts_ppr: number;
      date: Date;
      season_type: string;
    }[] = [];

    for await (let season of seasons) {
      for await (let season_type of season_types) {
        let weeks;

        if (season_type === "regular") {
          if (season < 2021) {
            weeks = 17;
          } else {
            weeks = 18;
          }
        } else if (season_type === "pre") {
          if (season === 2020) {
            weeks = 0;
          } else if (season > 2020) {
            weeks = 3;
          }
        } else if (season_type === "post") {
          weeks = 4;
        } else {
          weeks = 0;
        }

        const weeks_array = Array.from(Array(weeks).keys()).map(
          (key) => key + 1
        );

        for await (const week of weeks_array) {
          console.log({ season, season_type, week });

          const stats_week = await axiosInstance.get(
            `https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=${season_type}`
          );

          stats_week.data
            .filter(
              (stat_obj: SleeperPlayerStat) =>
                parseInt(stat_obj.player_id) &&
                (stat_obj.stats.pts_ppr ||
                  stat_obj.stats.gp ||
                  stat_obj.stats.gms_active)
            )
            .forEach((stat_obj: SleeperPlayerStat) => {
              stats_array.push({
                player_id: stat_obj.player_id,
                gms_active: stat_obj.stats.gms_active || 0,
                gp: stat_obj.stats.gp || 0,
                pts_ppr: stat_obj.stats.pts_ppr || 0,
                date: new Date(stat_obj.date),
                season_type: season_type,
              });
            });
        }
      }
    }

    const insertQuery = `
        INSERT INTO stats (player_id, gms_active, gp, pts_ppr, date, season_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (player_id, date) 
        DO UPDATE 
        SET 
          pts_ppr = EXCLUDED.pts_ppr,
          season_type = EXCLUDED.season_type;
        `;

    for (const stat of stats_array) {
      await pool.query(insertQuery, [
        stat.player_id,
        stat.gms_active,
        stat.gp,
        stat.pts_ppr,
        stat.date,
        stat.season_type,
      ]);
    }

    return stats_array;
  };

  const stats_array = populateStats();

  return NextResponse.json(stats_array);
  */

  const formData = await req.json();

  const { trendDate1, trendDate2, player_ids, season_type } = formData;

  const query = `
      SELECT 
          player_id,
          SUM(pts_ppr) AS total_pts_ppr,
          SUM(gms_active) AS total_gms_active,
          SUM(gp) AS total_gp
      FROM 
          stats
      WHERE 
          date BETWEEN $1 AND $2
          AND season_type = $3
          AND player_id = ANY($4)
      GROUP BY 
          player_id;
    `;

  const result = await pool.query(query, [
    trendDate1,
    trendDate2,
    season_type,
    player_ids,
  ]);

  const response = result.rows.map((row) => ({
    player_id: row.player_id,
    total_pts_ppr: parseFloat(row.total_pts_ppr),
    total_gms_active: parseInt(row.total_gms_active, 10),
    total_gp: parseInt(row.total_gp, 10),
  }));

  return NextResponse.json(response);
}
