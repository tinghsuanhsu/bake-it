export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';

export async function GET() {
  const sql = getDb();
  try {
    // Recipes table
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL DEFAULT '',
        data        JSONB NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Bake logs — store everything as JSONB for flexibility
    await sql`
      CREATE TABLE IF NOT EXISTS bake_logs (
        id          TEXT PRIMARY KEY,
        data        JSONB NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    return Response.json({ ok: true, message: 'Tables ready' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
