export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import { validateLogPayload, errorResponse } from '../../../lib/apiValidation';

// GET /api/logs — list all bake sessions, most recent first
export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, data
      FROM bake_logs
      ORDER BY (data->>'startTime')::bigint DESC NULLS LAST
      LIMIT 100
    `;
    const logs = rows.map(r => ({ id: r.id, ...r.data }));
    return Response.json(logs);
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/logs — upsert a bake log (called on finish and on every edit)
export async function POST(req) {
  const sql = getDb();
  try {
    const log = validateLogPayload(await req.json());
    const { id, ...rest } = log;
    await sql`
      INSERT INTO bake_logs (id, data)
      VALUES (${id}, ${JSON.stringify(rest)})
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data
    `;
    return Response.json({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
