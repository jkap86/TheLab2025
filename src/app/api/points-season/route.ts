import { NextRequest, NextResponse } from "next/server";
import axiosInstance from "@/lib/api/axiosInstance";
import pool from "@/lib/api/pool";

export async function GET(req: NextRequest) {
  return NextResponse.json("");
}
