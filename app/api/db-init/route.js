export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';

// GET /api/db-init  — run once to create tables
export async function GET() {
  const sql = getDb();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL DEFAULT '',
        data        JSONB NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bake_logs (
        id            TEXT PRIMARY KEY,
        recipe_id     TEXT,
        recipe_name   TEXT NOT NULL DEFAULT '',
        started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finished_at   TIMESTAMPTZ,
        duration_min  INTEGER,
        notes         TEXT DEFAULT '',
        data          JSONB NOT NULL DEFAULT '{}'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id          TEXT PRIMARY KEY,
        log_id      TEXT NOT NULL,
        step_id     TEXT,
        caption     TEXT DEFAULT '',
        image_data  TEXT NOT NULL,
        taken_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bake_logs_recipe_id ON bake_logs(recipe_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_photos_log_id ON photos(log_id);
    `;

    return Response.json({ ok: true, message: 'Tables created successfully' });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
