import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const trendDate =
    searchParams.get("trendDate") || new Date().toISOString().split("T")[0];

  const ktc_dates_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["ktc_dates"]
  );

  const ktc_dates: { [date: string]: { [key: string]: number } } =
    ktc_dates_db.rows[0]?.data || {};

  let current_values_obj = ktc_dates[trendDate];

  if (!current_values_obj) {
    current_values_obj =
      ktc_dates[
        new Date(new Date(trendDate).getUTCMilliseconds() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      ];
  }

  const current_values_array =
    (current_values_obj && Object.entries(current_values_obj)) || [];

  return NextResponse.json(
    {
      date: trendDate,
      values: current_values_array,
    },
    { status: 200 }
  );
}
