import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const formData = await req.json();

    const { leaguemate_ids, offset, limit, manager, player } = formData;

    if (manager || player) {
      if (manager && player) {
        const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE t.managers && $1
            AND t.players && $4
          ORDER BY t.status_updated DESC
          LIMIT $2 OFFSET $3
        `;

        const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades
            WHERE managers && $1 
              AND players && $2
          `;

        const result = await pool.query(getLmTradesQuery, [
          [manager],
          limit,
          offset,
          [player],
        ]);

        const count = await pool.query(countLmTradesQuery, [
          [manager],
          [player],
        ]);

        return NextResponse.json(
          {
            count: count.rows[0].count,
            rows: result.rows,
            manager,
            player,
          },
          { status: 200 }
        );
      } else if (manager && !player) {
        const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE t.managers && $1
          ORDER BY t.status_updated DESC
          LIMIT $2 OFFSET $3
        `;

        const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades
            WHERE managers && $1 
          `;

        const result = await pool.query(getLmTradesQuery, [
          [manager],
          limit,
          offset,
        ]);

        const count = await pool.query(countLmTradesQuery, [[manager]]);

        return NextResponse.json(
          {
            count: count.rows[0].count,
            rows: result.rows,
            manager,
            player,
          },
          { status: 200 }
        );
      } else if (!manager && player) {
        const getLmTradesQuery = ` 
          SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
          FROM trades t
          JOIN leagues l ON t.league_id = l.league_id
          WHERE t.managers && $1 
            AND t.players && $4
          ORDER BY t.status_updated DESC
          LIMIT $2 OFFSET $3
        `;

        const countLmTradesQuery = `
            SELECT COUNT(*) 
            FROM trades
            WHERE managers && $1
              AND players && $2
          `;

        const result = await pool.query(getLmTradesQuery, [
          [leaguemate_ids],
          limit,
          offset,
          [player],
        ]);

        const count = await pool.query(countLmTradesQuery, [
          [leaguemate_ids],
          [player],
        ]);

        return NextResponse.json(
          {
            count: count.rows[0].count,
            rows: result.rows,
            manager,
            player,
          },
          { status: 200 }
        );
      }
    } else {
      const getLmTradesQuery = ` 
        SELECT t.*, l.name, l.avatar, l.settings, l.scoring_settings, l.roster_positions
        FROM trades t
        JOIN leagues l ON t.league_id = l.league_id
        WHERE t.managers && $1
        ORDER BY t.status_updated DESC
        LIMIT $2 OFFSET $3
      `;

      const countLmTradesQuery = `
          SELECT COUNT(*) 
          FROM trades
          WHERE managers && $1
        `;

      const result = await pool.query(getLmTradesQuery, [
        leaguemate_ids,
        limit,
        offset,
      ]);

      const count = await pool.query(countLmTradesQuery, [leaguemate_ids]);

      return NextResponse.json(
        {
          count: count.rows[0].count,
          rows: result.rows,
        },
        { status: 200 }
      );
    }
  }
}
