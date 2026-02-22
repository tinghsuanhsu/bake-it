export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';

export async function GET() {
  const sql = getDb();
  try {
    // ── Recipes table ─────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL DEFAULT '',
        data       JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // ── Bake logs table ───────────────────────────────────────
    // Create fresh if doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS bake_logs (
        id         TEXT PRIMARY KEY,
        data       JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // ── Migration: if bake_logs has old columns, add data column and migrate ──
    // Check if 'data' column exists on bake_logs
    const logsCols = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'bake_logs' AND column_name = 'data'
    `;
    if (logsCols.length === 0) {
      // Old schema — add data column and migrate existing rows
      await sql`ALTER TABLE bake_logs ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'`;
      // Migrate old rows into the data blob
      await sql`
        UPDATE bake_logs SET data = jsonb_build_object(
          'recipeName',  COALESCE(recipe_name, ''),
          'recipeId',    COALESCE(recipe_id, ''),
          'startTime',   EXTRACT(EPOCH FROM COALESCE(started_at, NOW()))::bigint * 1000,
          'endTime',     EXTRACT(EPOCH FROM COALESCE(finished_at, NOW()))::bigint * 1000,
          'sessionNotes', COALESCE(notes, ''),
          'ingredients', '[]'::jsonb,
          'steps',       '[]'::jsonb,
          'stepNotes',   '{}'::jsonb,
          'stepPhotos',  '{}'::jsonb,
          'foldNotes',   '{}'::jsonb,
          'foldPhotos',  '{}'::jsonb,
          'review',      '{}'::jsonb
        ) || COALESCE(data, '{}')
        WHERE data = '{}'
      `;
    }

    // ── Migration: photos table may exist from old schema — OK to leave ──

    return Response.json({ ok: true, message: 'Tables ready' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
