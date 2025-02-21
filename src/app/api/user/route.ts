import axiosInstance from "@/lib/api/axiosInstance";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const searched = searchParams.get("searched");

  try {
    const findUserQuery = `
      SELECT * FROM users WHERE username ILIKE $1;
    `;

    const result = await pool.query(findUserQuery, [searched]);

    if (
      !(
        result.rows[0]?.updatedat >
        new Date(new Date().getTime() - 1 * 60 * 60 * 1000)
      )
    ) {
      const user = await axiosInstance.get(
        `https://api.sleeper.app/v1/user/${searched}`
      );

      const user_id = user.data.user_id;
      const display_name = user.data.display_name;
      const avatar = user.data.avatar || null;

      const insertQuery = `
        INSERT INTO users (user_id, username, avatar, type, createdat, updatedat) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          avatar = EXCLUDED.avatar,
          type = EXCLUDED.type,
          updatedat = EXCLUDED.updatedat;
      `;

      const values = [
        user_id,
        display_name,
        avatar,
        "S",
        new Date(),
        new Date(),
      ];

      await pool.query(insertQuery, values);

      return NextResponse.json(
        { user_id, username: display_name, avatar },
        { status: 200 }
      );
    } else {
      return NextResponse.json(result.rows[0], { status: 200 });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json("Username not found", { status: 404 });
    }
  }
}
