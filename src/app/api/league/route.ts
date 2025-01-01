import axiosInstance from "@/lib/api/axiosInstance";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";
import { SleeperRoster, SleeperUser } from "@/lib/types/sleeperApiTypes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id");

  let league;
  try {
    const findLeagueQuery = `
      SELECT * FROM leagues WHERE league_id = $1;
    `;

    const league_db = await pool.query(findLeagueQuery, [league_id]);

    if (
      league_db.rows.length === 1 &&
      league_db.rows[0].updatedat >
        new Date(new Date().getTime() - 1 * 60 * 60 * 1000)
    ) {
      league = league_db.rows[0];
    } else {
      const [league_raw, rosters, users] = await Promise.all([
        await axiosInstance.get(
          `https://api.sleeper.app/v1/league/${league_id}`
        ),
        await axiosInstance.get(
          `https://api.sleeper.app/v1/league/${league_id}/rosters`
        ),
        await axiosInstance.get(
          `https://api.sleeper.app/v1/league/${league_id}/users`
        ),
      ]);

      league = {
        ...league_raw.data,
        rosters: rosters.data.map((r: SleeperRoster) => {
          const user = users.data.find(
            (u: SleeperUser) => u.user_id === r.owner_id
          );

          return {
            ...r,
            username: user?.display_name || "orphan",
            user_id: user?.user_id || r.owner_id,
            avatar: user?.avatar,
          };
        }),
      };

      const upsertLeaguesQuery = `
        INSERT INTO leagues (league_id, name, avatar, season, status, settings, scoring_settings, roster_positions, rosters, updatedat)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (league_id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        season = EXCLUDED.season,
        status = EXCLUDED.status,
        settings = EXCLUDED.settings,
        scoring_settings = EXCLUDED.scoring_settings,
        roster_positions = EXCLUDED.roster_positions,
        rosters = EXCLUDED.rosters,
        updatedat = EXCLUDED.updatedat;
    `;

      await pool.query(upsertLeaguesQuery, [
        league.league_id,
        league.name,
        league.avatar,
        league.season,
        league.status,
        JSON.stringify(league.settings),
        JSON.stringify(league.scoring_settings),
        JSON.stringify(league.roster_positions),
        JSON.stringify(league.rosters),
        new Date(),
      ]);
    }

    return NextResponse.json(league);
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);
    return NextResponse.json(err, { status: 500 });
  }
}
