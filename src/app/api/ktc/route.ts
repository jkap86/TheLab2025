import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const days = searchParams.get("days") || "0";

  const ktc_dates_db = await pool.query(
    "SELECT * FROM common WHERE name = $1;",
    ["ktc_dates"]
  );

  const ktc_dates: { [date: string]: { [key: string]: number } } =
    ktc_dates_db.rows[0]?.data || {};

  const current_date = Object.keys(ktc_dates).sort(
    (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime()
  )[parseInt(days)];

  const current_values_obj = ktc_dates[current_date];

  const current_values_array =
    (current_values_obj && Object.entries(current_values_obj)) || [];

  return NextResponse.json(
    {
      date: current_date,
      values: current_values_array,
    },
    { status: 200 }
  );
}
