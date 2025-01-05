import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const ip = searchParams.get("ip");
  const route = searchParams.get("route");

  const insertLogQuery = `
    INSERT INTO logs(ip, route)
    VALUES ($1, $2);
  `;

  await pool.query(insertLogQuery, [ip, route]);

  return NextResponse.json("logged");
}
