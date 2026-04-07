export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import { validateLogPayload, errorResponse } from '../../../lib/apiValidation';

// GET /api/logs — list all bake sessions, most recent first
// Strips base64 photo data from the list response for performance.
// Photos are still available when loading individual logs via their full data.
export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      (SELECT id, data FROM bake_logs WHERE id = '__active_bake__')
      UNION ALL
      (SELECT id, data FROM bake_logs WHERE id != '__active_bake__'
       ORDER BY (data->>'startTime')::bigint DESC NULLS LAST
       LIMIT 100)
    `;
    const logs = rows.map(r => {
      const log = { id: r.id, ...r.data };
      // Strip heavy photo data from list view — keep everything else
      if (log.stepPhotos) {
        const stripped = {};
        Object.entries(log.stepPhotos).forEach(([k, photos]) => {
          if (Array.isArray(photos)) {
            stripped[k] = photos.map(p => ({ ts: p.ts, hasPhoto: true }));
          }
        });
        log.stepPhotos = stripped;
      }
      if (log.foldPhotos) {
        const stripped = {};
        Object.entries(log.foldPhotos).forEach(([k, v]) => {
          if (v) stripped[k] = '__has_photo__';
        });
        log.foldPhotos = stripped;
      }
      // Keep review photos as-is since they're shown in the gallery and are
      // typically only 1-3 images per log
      return log;
    });
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
