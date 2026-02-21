import { getDb } from '../../../../lib/db';

// DELETE /api/logs/[id]
export async function DELETE(req, { params }) {
  const sql = getDb();
  try {
    await sql`DELETE FROM photos WHERE log_id = ${params.id}`;
    await sql`DELETE FROM bake_logs WHERE id = ${params.id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
