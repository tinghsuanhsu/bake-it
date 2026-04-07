export const dynamic = 'force-dynamic';

import { getDb } from '../../../../lib/db';
import { errorResponse, isNonEmptyString, badRequest } from '../../../../lib/apiValidation';

// GET /api/logs/[id] — fetch a single log with full data (including photos)
export async function GET(req, context) {
  const sql = getDb();
  try {
    const { id } = await context.params;
    if (!isNonEmptyString(id, 80)) throw badRequest('Invalid log id');
    const [row] = await sql`
      SELECT id, data FROM bake_logs WHERE id = ${id}
    `;
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ id: row.id, ...row.data });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/logs/[id]
export async function DELETE(req, context) {
  const sql = getDb();
  try {
    const { id } = await context.params;
    if (!isNonEmptyString(id, 80)) throw badRequest('Invalid log id');
    // Delete photos if the table exists — ignore error if it doesn't
    try { await sql`DELETE FROM photos WHERE log_id = ${id}`; } catch {}
    await sql`DELETE FROM bake_logs WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
