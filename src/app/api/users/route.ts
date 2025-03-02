import { NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET() {
  try {
    const users = await pool.query(
      `
           SELECT u.username, COUNT(*) AS count
            FROM users u
            JOIN (
              SELECT r ->> 'user_id' AS user_id
              FROM leagues l, LATERAL jsonb_array_elements(l.rosters) r
              WHERE jsonb_array_length((r ->> 'players')::jsonb) > 0
             ) league_users ON u.user_id = league_users.user_id
            WHERE u.type = 'S'
            GROUP BY u.user_id, u.username
            HAVING COUNT(*) >= 5
        `
    );

    return NextResponse.json(
      users.rows.map((user) => user.username).sort((a, b) => (a > b ? 1 : -1))
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json("Error fetching users...", { status: 500 });
    }
  }
}
