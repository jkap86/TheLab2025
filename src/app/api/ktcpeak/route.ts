import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const trendDate1 = searchParams.get("trendDate1") as string;
  const trendDate2 = searchParams.get("trendDate2") as string;

  const ktc_players_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["ktc_players"]
  );

  const ktc_players: {
    [player_id: string]: { values: { [date: string]: number } };
  } = ktc_players_db.rows[0]?.data || {};

  const max_values_obj: {
    [player_id: string]: { date: string; value: number | string };
  } = {};

  const min_values_obj: {
    [player_id: string]: { date: string; value: number | string };
  } = {};

  Object.keys(ktc_players).forEach((player_id) => {
    let max_date = trendDate1;
    let max_value = 0;

    let min_date = trendDate1;
    let min_value =
      Object.entries(ktc_players[player_id].values)
        .filter(
          ([d]) =>
            new Date(d) > new Date(trendDate1) &&
            new Date(d) < new Date(trendDate2)
        )
        .sort(
          (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
        )?.[0]?.[1] || "-";

    Object.entries(ktc_players[player_id].values)
      .filter(
        ([d]) =>
          new Date(d) > new Date(trendDate1) &&
          new Date(d) < new Date(trendDate2)
      )
      .forEach(([d, v]: [string, number]) => {
        if (v >= max_value) {
          max_value = v;
          max_date = d;
        }

        if (typeof min_value === "number" && v <= min_value) {
          min_value = v;
          min_date = d;
        }
      });

    max_values_obj[player_id] = {
      date: max_date,
      value: max_value,
    };

    min_values_obj[player_id] = {
      date: min_date,
      value: min_value,
    };
  });

  return NextResponse.json(
    {
      max_values: max_values_obj,
      min_values: min_values_obj,
    },
    { status: 200 }
  );
}
