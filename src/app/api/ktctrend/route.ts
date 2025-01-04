import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const trendDate1 = searchParams.get("trendDate1") as string;

  const trendDate2 = searchParams.get("trendDate2") as string;

  const ktc_dates_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["ktc_dates"]
  );

  const ktc_dates: { [date: string]: { [key: string]: number } } =
    ktc_dates_db.rows[0]?.data || {};

  const obj1 = ktc_dates[trendDate1];
  const obj2 = ktc_dates[trendDate2];

  const result = Object.fromEntries(
    Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)])).map(
      (player_id) => {
        return [player_id, (obj2[player_id] || 0) - (obj1[player_id] || 0)];
      }
    )
  );

  return NextResponse.json(
    {
      date1: trendDate1,
      date2: trendDate2,
      values: result,
    },
    { status: 200 }
  );
}
