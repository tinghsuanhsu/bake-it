export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import { validatePhotoPayload, errorResponse, isNonEmptyString, badRequest } from '../../../lib/apiValidation';

// GET /api/photos?log_id=xxx — fetch all photos for a log
export async function GET(req) {
  const sql = getDb();
  try {
    const { searchParams } = new URL(req.url);
    const log_id = searchParams.get('log_id');
    if (!isNonEmptyString(log_id, 80)) throw badRequest('log_id required');
    const rows = await sql`
      SELECT id, log_id, step_id, caption, image_data
      FROM photos
      WHERE log_id = ${log_id}
      ORDER BY created_at ASC
    `;
    return Response.json(rows);
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/photos — save a photo attached to a log
export async function POST(req) {
  const sql = getDb();
  try {
    const { id, log_id, step_id, caption, image_data } = validatePhotoPayload(await req.json());
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
    return errorResponse(err);
  }
}

// DELETE /api/photos?id=xxx
export async function DELETE(req) {
  const sql = getDb();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!isNonEmptyString(id, 80)) throw badRequest('id required');
    await sql`DELETE FROM photos WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
