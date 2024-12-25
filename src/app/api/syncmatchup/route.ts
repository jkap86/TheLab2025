import axiosInstance from "@/lib/api/axiosInstance";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";
import { Matchup } from "@/lib/types/userTypes";
import { SleeperWinnersBracket } from "@/lib/types/sleeperApiTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id");
  const week = searchParams.get("week");
  const playoff_week_start = searchParams.get("playoff_week_start");

  try {
    const matchups: { data: Matchup[] } = await axiosInstance.get(
      `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`,
      {
        params: {
          t: new Date().getTime(),
        },
      }
    );

    let playoffs_alive: number[];

    if (
      playoff_week_start &&
      week &&
      parseInt(playoff_week_start) <= parseInt(week)
    ) {
      const winners_bracket: {
        data: SleeperWinnersBracket;
      } = await axiosInstance.get(
        `https://api.sleeper.app/v1/league/${league_id}/winners_bracket`
      );

      const roster_ids_playing = Array.from(
        new Set(
          [
            ...winners_bracket.data.map((m) => m.t1),
            ...winners_bracket.data.map((m) => m.t2),
          ].filter((m) => typeof m === "number")
        )
      );

      playoffs_alive = roster_ids_playing.filter(
        (r_id) => !winners_bracket.data.find((m) => m.l === r_id)
      );
    }

    const upsertMatchupQuery = `
        INSERT INTO matchups (week, matchup_id, roster_id, players, starters, league_id, updatedat, playoffs_alive)
        VALUES ${matchups.data
          .map(
            (_: any, i: number) =>
              `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${
                i * 8 + 5
              }, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
          )
          .join(", ")}
        ON CONFLICT (week, roster_id, league_id) DO UPDATE SET
            matchup_id = EXCLUDED.matchup_id,
            players = EXCLUDED.players,
            starters = EXCLUDED.starters,
            updatedat = EXCLUDED.updatedat,
            playoffs_alive = EXCLUDED.playoffs_alive
    `;

    const values = matchups.data.flatMap((matchup: Matchup) => [
      week,
      matchup.matchup_id,
      matchup.roster_id,
      matchup.players,
      matchup.starters,
      league_id,
      new Date(),
      playoffs_alive,
    ]);

    await pool.query(upsertMatchupQuery, values);

    return NextResponse.json(
      matchups.data.map((m) => ({
        ...m,
        playoffs_alive,
      })),
      { status: 200 }
    );
  } catch (err: any) {
    console.log(err.message);
    return NextResponse.json(err.message);
  }
}
