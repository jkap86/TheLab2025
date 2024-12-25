import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const formData = await req.json();

    const { league_ids, week } = formData;

    const getMatchupsQuery = `
        SELECT * 
        FROM matchups
        WHERE league_id = ANY($1)
            AND week = $2
    `;

    const result = await pool.query(getMatchupsQuery, [league_ids, week]);

    return NextResponse.json(result.rows, { status: 200 });
  }
}
