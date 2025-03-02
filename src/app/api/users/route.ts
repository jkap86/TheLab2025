import { NextResponse } from "next/server";
import pool from "@/lib/api/pool";
import fs from "fs";

export async function GET() {
  const users_string = fs.readFileSync("./USERS.json", "utf-8");
  const users_obj = JSON.parse(users_string);

  if (new Date().getTime() - users_obj?.updatedAt < 1 * 60 * 60 * 1000) {
    return NextResponse.json(users_obj.data);
  } else {
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
            HAVING COUNT(*) >= 1
        `
      );

      fs.writeFileSync(
        "./USERS.json",
        JSON.stringify({
          data: users.rows,
          updatedAt: new Date().getTime(),
        })
      );

      return NextResponse.json(users.rows);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
        return NextResponse.json("Error fetching users...", { status: 500 });
      }
    }
  }
}
