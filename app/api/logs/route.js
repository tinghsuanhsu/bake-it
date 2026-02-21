export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';

// GET /api/logs — list all bake sessions, most recent first
export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        bl.id, bl.recipe_id, bl.recipe_name,
        bl.started_at, bl.finished_at, bl.duration_min,
        bl.notes, bl.data,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'step_id', p.step_id,
              'caption', p.caption,
              'image_data', p.image_data,
              'taken_at', p.taken_at
            ) ORDER BY p.taken_at
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as photos
      FROM bake_logs bl
      LEFT JOIN photos p ON p.log_id = bl.id
      GROUP BY bl.id
      ORDER BY bl.started_at DESC
      LIMIT 50
    `;
    const logs = rows.map(r => ({
      id: r.id,
      recipe_id: r.recipe_id,
      recipe_name: r.recipe_name,
      started_at: r.started_at,
      finished_at: r.finished_at,
      duration_min: r.duration_min,
      notes: r.notes,
      photos: r.photos,
      ...r.data,
    }));
    return Response.json(logs);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/logs — save a completed bake session
export async function POST(req) {
  const sql = getDb();
  try {
    const log = await req.json();
    const {
      id, recipe_id, recipe_name,
      started_at, finished_at, duration_min,
      notes, photos: _photos, // photos saved separately
      ...rest
    } = log;

    await sql`
      INSERT INTO bake_logs (id, recipe_id, recipe_name, started_at, finished_at, duration_min, notes, data)
      VALUES (
        ${id},
        ${recipe_id || null},
        ${recipe_name || ''},
        ${started_at || new Date().toISOString()},
        ${finished_at || null},
        ${duration_min || null},
        ${notes || ''},
        ${JSON.stringify(rest)}
      )
      ON CONFLICT (id) DO UPDATE
      SET finished_at   = EXCLUDED.finished_at,
          duration_min  = EXCLUDED.duration_min,
          notes         = EXCLUDED.notes,
          data          = EXCLUDED.data
    `;
    return Response.json({ ok: true, id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
