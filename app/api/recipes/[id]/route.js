import { getDb } from '../../../../lib/db';

// GET /api/recipes/[id]
export async function GET(req, { params }) {
  const sql = getDb();
  try {
    const [row] = await sql`
      SELECT id, name, data FROM recipes WHERE id = ${params.id}
    `;
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ id: row.id, ...row.data, name: row.name });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/recipes/[id] — full update
export async function PUT(req, { params }) {
  const sql = getDb();
  try {
    const recipe = await req.json();
    const { name, ...rest } = recipe;
    await sql`
      UPDATE recipes
      SET name = ${name || 'Untitled'},
          data = ${JSON.stringify(rest)},
          updated_at = NOW()
      WHERE id = ${params.id}
    `;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/recipes/[id]
export async function DELETE(req, { params }) {
  const sql = getDb();
  try {
    await sql`DELETE FROM recipes WHERE id = ${params.id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
