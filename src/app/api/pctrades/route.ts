import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const player_id = searchParams.get("player");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const getPcTradesQuery = ` 
        SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
        FROM trades t
        JOIN leagues l ON t.league_id = l.league_id
        WHERE t.players && $1
        ORDER BY t.status_updated DESC
        LIMIT $2 OFFSET $3
    `;

  const countPcTradesQuery = `
        SELECT COUNT(*) 
        FROM trades
        WHERE price_check && $1
    `;

  try {
    const result = await pool.query(getPcTradesQuery, [
      [player_id],
      limit,
      offset,
    ]);

    const count = await pool.query(countPcTradesQuery, [[player_id]]);

    return NextResponse.json(
      {
        count: count.rows[0].count,
        rows: result.rows,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);

    return NextResponse.json(err);
  }
}
