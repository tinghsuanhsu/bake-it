export const dynamic = 'force-dynamic';

import { getDb } from '../../../../lib/db';
import { validateRecipePayload, errorResponse, isNonEmptyString, badRequest } from '../../../../lib/apiValidation';

// GET /api/recipes/[id]
export async function GET(req, context) {
  const sql = getDb();
  try {
    const { id } = await context.params;
    if (!isNonEmptyString(id, 80)) throw badRequest('Invalid recipe id');
    const [row] = await sql`
      SELECT id, name, data FROM recipes WHERE id = ${id}
    `;
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ id: row.id, ...row.data, name: row.name });
  } catch (err) {
    return errorResponse(err);
  }
}

// PUT /api/recipes/[id] — full update
export async function PUT(req, context) {
  const sql = getDb();
  try {
    const { id } = await context.params;
    if (!isNonEmptyString(id, 80)) throw badRequest('Invalid recipe id');
    const recipe = validateRecipePayload({ ...(await req.json()), id });
    const { name, ...rest } = recipe;
    await sql`
      UPDATE recipes
      SET name = ${name || 'Untitled'},
          data = ${JSON.stringify(rest)},
          updated_at = NOW()
      WHERE id = ${id}
    `;
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/recipes/[id]
export async function DELETE(req, context) {
  const sql = getDb();
  try {
    const { id } = await context.params;
    if (!isNonEmptyString(id, 80)) throw badRequest('Invalid recipe id');
    await sql`DELETE FROM recipes WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
