export const dynamic = 'force-dynamic';

import { getDb } from '../../../../lib/db';
import { errorResponse, isNonEmptyString, badRequest } from '../../../../lib/apiValidation';

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
