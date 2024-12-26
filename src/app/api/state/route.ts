import { NextResponse } from "next/server";
import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";

export async function GET() {
  const state_db = await pool.query("SELECT * FROM common WHERE name = $1;", [
    "state",
  ]);

  const state = state_db.rows[0];

  if (new Date().getTime() - state?.updatedat < 1000 * 60 * 60) {
    return NextResponse.json(
      { ...state, updatedat: state.updatedat },
      { status: 200 }
    );
  } else {
    console.log("Updating STATE...");

    try {
      const state_updated = await axiosInstance.get(
        "https://api.sleeper.app/v1/state/nfl"
      );

      await pool.query(
        `
          INSERT INTO common (name, data, updatedat) 
          VALUES ($1, $2, $3)
          ON CONFLICT (name) 
          DO UPDATE SET 
            data = EXCLUDED.data,
            updatedat = EXCLUDED.updatedat
          RETURNING *;
        `,
        ["state", state_updated.data, new Date()]
      );

      return NextResponse.json(
        { ...state, updatedat: new Date() },
        { status: 200 }
      );
    } catch (err: unknown) {
      if (err instanceof Error) console.log(err.message);
      return NextResponse.json(
        { ...state, updatedat: state.updatedat },
        { status: 200 }
      );
    }
  }
}
