import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const player_id1 = searchParams.get("player1");
  const player_id2 = searchParams.get("player2");
  const player_id3 = searchParams.get("player3");
  const player_id4 = searchParams.get("player4");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  /*
  const getPcTradesQuery = ` 
        SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
        FROM trades t
        JOIN leagues l ON t.league_id = l.league_id
        WHERE t.players @> $1
        ORDER BY t.status_updated DESC
        LIMIT $2 OFFSET $3
    `;

  const countPcTradesQuery = `
        SELECT COUNT(*) 
        FROM trades
        WHERE players @> $1
    `;

  const players = [player_id1];

  if (player_id2) {
    players.push(player_id2);
  }
*/

  const conditions = [`t.adds ? $1`];
  const values = [player_id1];

  if (player_id2) {
    conditions.push(`t.adds ? $${values.length + 1}`);
    conditions.push(`t.adds ->> $1 = t.adds ->> $${values.length + 1}`);
    values.push(player_id2);
  }

  if (player_id3) {
    conditions.push(`t.adds ? $${values.length + 1}`);
    conditions.push(`t.adds ->> $1 != t.adds ->> $${values.length + 1}`);
    values.push(player_id3);
  }

  if (player_id4) {
    conditions.push(`t.adds ? $${values.length + 1}`);
    conditions.push(`t.adds ->> $1 != t.adds ->> $${values.length + 1}`);
    conditions.push(
      `t.adds ->> $${values.length} = t.adds ->> $${values.length + 1}`
    );
    values.push(player_id4);
  }

  console.log({ values });

  const getPcTradesQuery = `
      SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions

      FROM trades t
      JOIN leagues l ON t.league_id = l.league_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.status_updated DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

  const countPcTradesQuery = `
      SELECT COUNT(*) 
      FROM trades t
      WHERE ${conditions.join(" AND ")}
    `;

  try {
    const result = await pool.query(getPcTradesQuery, [
      ...values,
      limit,
      offset,
    ]);

    const count = await pool.query(countPcTradesQuery, values);

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
