//import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";
//import { SleeperPlayerStat } from "@/lib/types/sleeperApiTypes";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  /*
  const populateStats = async () => {
    const seasons = Array.from(Array(5).keys()).map((key) => key + 2020);
    const season_types = ["pre", "regular", "post"];

    const stats_array: {
      player_id: string;
      date: Date;
      season_type: string;
      stats: { [cat: string]: number };
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
                (stat_obj.stats.pts_ppr || stat_obj.stats.gp)
            )
            .forEach((stat_obj: SleeperPlayerStat) => {
              stats_array.push({
                player_id: stat_obj.player_id,
                date: new Date(stat_obj.date),
                season_type: season_type,
                stats: stat_obj.stats,
              });
            });
        }
      }
    }

    const insertQuery = `
        INSERT INTO playergamestats (player_id, date, season_type, stats)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (player_id, date) 
        DO UPDATE 
        SET 
          season_type = EXCLUDED.season_type,
          stats = EXCLUDED.stats;
        `;

    for (const stat of stats_array) {
      await pool.query(insertQuery, [
        stat.player_id,
        stat.date,
        stat.season_type,
        stat.stats,
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
          key,
          SUM(value::NUMERIC) AS total_value
      FROM 
          playergamestats,
          jsonb_each_text(stats) AS kv(key, value)
      WHERE 
          date BETWEEN $1 AND $2
          AND season_type = $3
          AND player_id = ANY($4)
      GROUP BY 
          player_id, key;
    `;

  const result = await pool.query(query, [
    trendDate1,
    trendDate2,
    season_type,
    player_ids,
  ]);

  const response: { [player_id: string]: { [cat: string]: number } } = {};

  result.rows.forEach((row) => {
    if (!response[row.player_id]) {
      response[row.player_id] = {};
    }

    response[row.player_id][row.key] = parseFloat(row.total_value);
  });

  return NextResponse.json(response);
}
