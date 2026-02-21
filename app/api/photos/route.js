export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';

// POST /api/photos — save a photo attached to a log
export async function POST(req) {
  const sql = getDb();
  try {
    const { id, log_id, step_id, caption, image_data } = await req.json();
    if (!log_id || !image_data) {
      return Response.json({ error: 'log_id and image_data required' }, { status: 400 });
    }
    await sql`
      INSERT INTO photos (id, log_id, step_id, caption, image_data)
      VALUES (
        ${id || crypto.randomUUID()},
        ${log_id},
        ${step_id || null},
        ${caption || ''},
        ${image_data}
      )
      ON CONFLICT (id) DO UPDATE
      SET caption = EXCLUDED.caption
    `;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/photos?id=xxx
export async function DELETE(req) {
  const sql = getDb();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });
    await sql`DELETE FROM photos WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
