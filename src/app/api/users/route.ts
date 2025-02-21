import { NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET() {
  try {
    const users = await pool.query(
      `
            SELECT username 
            FROM users
            WHERE type = 'S'
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
