import axiosInstance from "@/lib/api/axiosInstance";
import { NextRequest, NextResponse } from "next/server";
import { updateLeagues } from "../leagues/helpers/updateLeagues";
import pool from "@/lib/api/pool";
import { Roster } from "@/lib/types/userTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id");
  const userRoster_id = parseInt(searchParams.get("roster_id") || "0");

  const week = searchParams.get("week");

  try {
    const league = await axiosInstance.get(
      `https://api.sleeper.app/v1/league/${league_id}`
    );

    const updatedLeague = await updateLeagues([league.data], week, pool, [
      league_id || "",
    ]);

    const userRoster = updatedLeague[0].rosters.find(
      (roster: Roster) =>
        roster.roster_id === userRoster_id && (roster.players || []).length > 0
    );

    const league_to_send = {
      ...updatedLeague[0],
      userRoster,
    };

    return NextResponse.json(league_to_send, {
      status: 200,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json(err.message);
    } else {
      console.log({ err });
      return NextResponse.json("unkown error");
    }
  }
}
