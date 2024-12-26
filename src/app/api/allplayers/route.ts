import { NextResponse } from "next/server";
import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";
import { Allplayer } from "@/lib/types/commonTypes";

export async function GET() {
  const allplayers_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["allplayers"]
  );

  const allplayers = allplayers_db.rows[0];

  if (new Date().getTime() - allplayers.updatedat < 1000 * 60 * 60 * 24) {
    return NextResponse.json(
      { ...allplayers, updatedat: allplayers.updatedat },
      { status: 200 }
    );
  } else {
    console.log("Updating ALLPLAYERS...");

    try {
      const allplayers_updated = await axiosInstance.get(
        "https://api.sleeper.app/v1/players/nfl"
      );

      const allplayers_array: Allplayer[] = [];

      Object.values(allplayers_updated.data).forEach((value) => {
        const player_obj = value as Allplayer;

        allplayers_array.push({
          player_id: player_obj.player_id,
          position: player_obj.position,
          team: player_obj.team || "FA",
          full_name:
            player_obj.position === "DEF"
              ? `${player_obj.player_id} DEF`
              : player_obj.full_name,
          age: player_obj.age,
          fantasy_positions: player_obj.fantasy_positions,
          years_exp: player_obj.years_exp,
        });
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
        ["allplayers", JSON.stringify(allplayers_array), new Date()]
      );

      return NextResponse.json(
        { data: allplayers_array, updatedat: new Date() },
        { status: 200 }
      );
    } catch (err: unknown) {
      if (err instanceof Error) console.log(err.message);
      return NextResponse.json(
        { ...allplayers, updatedat: allplayers.updatedat },
        { status: 200 }
      );
    }
  }
}
