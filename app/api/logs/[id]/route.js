export const dynamic = 'force-dynamic';

import { getDb } from '../../../../lib/db';
import { errorResponse, isNonEmptyString, badRequest } from '../../../../lib/apiValidation';

// DELETE /api/logs/[id]
export async function DELETE(req, { params }) {
  const sql = getDb();
  try {
    if (!isNonEmptyString(params.id, 80)) throw badRequest('Invalid log id');
    await sql`DELETE FROM photos WHERE log_id = ${params.id}`;
    await sql`DELETE FROM bake_logs WHERE id = ${params.id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
