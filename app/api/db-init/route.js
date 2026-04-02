export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import { errorResponse } from '../../../lib/apiValidation';


function assertInitAccess(req) {
  if (process.env.NODE_ENV !== 'production') return;
  const configured = process.env.DB_INIT_TOKEN;
  const supplied = req.headers.get('x-admin-token');
  if (!configured || supplied !== configured) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
}

export async function POST(req) {
  assertInitAccess(req);
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

    // ── Photos table ────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        log_id TEXT NOT NULL,
        step_id TEXT,
        caption TEXT NOT NULL DEFAULT '',
        image_data TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_photos_log_id ON photos (log_id)`;

    return Response.json({ ok: true, message: 'Tables ready' });
  } catch (err) {
    return errorResponse(err);
  }
}
