/*
import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";
import { SleeperPlayerStat } from "@/lib/types/sleeperApiTypes";
import { PlayerStat } from "@/lib/types/userTypes";
*/
import { NextResponse } from "next/server";

export async function POST() {
  /*
  const populateStats = async () => {
    const seasons = Array.from(Array(5).keys()).map((key) => key + 2020);
    const season_types = ["pre", "regular", "post"];

    const stats_obj: {
      [player_id: string]: PlayerStat[];
    } = {};

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

          stats_week.data.forEach((stat_obj: SleeperPlayerStat) => {
            if (!stats_obj[stat_obj.player_id]) {
              stats_obj[stat_obj.player_id] = [];
            }

            stats_obj[stat_obj.player_id].push(stat_obj);
          });
        }
      }
    }

    await pool.query(
      `
          INSERT INTO common (name, data, updatedat) 
          VALUES ($1, $2, $3)
          ON CONFLICT (name) 
          DO UPDATE SET 
            data = EXCLUDED.data,
            updatedat = EXCLUDED.updatedat;
        `,
      ["stats", stats_obj, new Date()]
    );

    return stats_obj;
  };

  // const stats_obj = populateStats();

  //  return NextResponse.json(stats_obj);

  const formData = await req.json();

  const { trendDate1, trendDate2, player_ids } = formData;

  const stats_db = await pool.query("SELECT * FROM common WHERE name = $1;", [
    "stats",
  ]);

  const stats = stats_db.rows[0].data || [];

  const response: { player_id: string; pts_ppr: number; gms_active: number }[] =
    [];

  player_ids &&
    player_ids.forEach((player_id: string) => {
      let player_obj = {
        player_id,
        pts_ppr: 0,
        gms_active: 0,
      };

      (stats[player_id] || [])
        .filter(
          (g: PlayerStat) =>
            new Date(g.date) >= new Date(trendDate1) &&
            new Date(g.date) <= new Date(trendDate2)
        )
        .forEach((g: PlayerStat) => {
          player_obj.pts_ppr += g.stats.pts_ppr || 0;
          player_obj.gms_active += g.stats.gms_active || 0;
        });

      response.push(player_obj);
    });
  */
  return NextResponse.json("stats");
}
