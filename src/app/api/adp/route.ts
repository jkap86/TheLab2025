import { NextResponse } from "next/server";
import pool from "@/lib/api/pool";

export async function GET() {
  const query = `
    WITH recent_drafts AS (
    SELECT d.*
    FROM drafts d
    JOIN leagues l ON d.league_id = l.league_id
    WHERE TO_TIMESTAMP(last_picked / 1000) >= NOW() - INTERVAL '30 days'
        AND type = 'startup'
        AND d.status = 'complete'
        AND l.settings ->> 'type' = '2'
        AND (
          SELECT COUNT(*)
          FROM jsonb_array_elements_text(l.roster_positions) AS position
          WHERE position IN ('K')
        ) = 0
        AND (
          COALESCE(d.settings->>'slots_k', '0')::INT
        ) = 1
        AND (
          COALESCE(d.settings->>'slots_qb', '0')::INT +
          COALESCE(d.settings->>'slots_super_flex', '0')::INT
        ) = 2
        AND (
          COALESCE(d.settings->>'slots_dl', '0')::INT +
          COALESCE(d.settings->>'slots_lb', '0')::INT +
          COALESCE(d.settings->>'slots_db', '0')::INT +
          COALESCE(d.settings->>'slots_idp_flex', '0')::INT
        ) = 0

    ),
    expanded_picks AS (
    SELECT 
        key_value.key AS player_key,
        key_value.value AS player_value
    FROM recent_drafts,
    LATERAL jsonb_each_text(picks) AS key_value
    ),
    averaged_keys AS (
      SELECT
          player_key,
          AVG(CASE 
              WHEN player_value::NUMERIC IS NOT NULL THEN player_value::NUMERIC 
              ELSE 999 
          END) AS average_value
      FROM expanded_picks
      GROUP BY player_key
    ),
    draft_count AS (
      SELECT COUNT(*) AS total_drafts
      FROM recent_drafts
    )
    SELECT 
      a.player_key,
      a.average_value,
      c.total_drafts
    FROM averaged_keys a
    CROSS JOIN draft_count c;
  `;

  const adp = await pool.query(query);

  return NextResponse.json(adp.rows);
}
