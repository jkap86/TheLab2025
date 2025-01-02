import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const trendDate = searchParams.get("trendDate") || "0";

  const ktc_players_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["ktc_players"]
  );

  const ktc_players: {
    [player_id: string]: { values: { [date: string]: number } };
  } = ktc_players_db.rows[0]?.data || {};

  const max_values_obj: {
    [player_id: string]: { date: string; value: number };
  } = {};

  Object.keys(ktc_players).forEach((player_id) => {
    let date = trendDate;
    let value = 0;
    Object.entries(ktc_players[player_id].values)
      .filter(([d, v]) => new Date(d) >= new Date(trendDate) && v > value)
      .forEach(([d, v]: [string, number]) => {
        if (v >= value) {
          value = v;
          date = d;
        }
      });

    max_values_obj[player_id] = {
      date,
      value,
    };
  });

  return NextResponse.json(
    {
      date: trendDate,
      max_values_obj,
    },
    { status: 200 }
  );
}
