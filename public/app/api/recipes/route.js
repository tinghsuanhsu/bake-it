import { getDb } from '../../../lib/db';

// GET /api/recipes — list all recipes
export async function GET() {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, name, data, created_at, updated_at
      FROM recipes
      ORDER BY updated_at DESC
    `;
    // Merge top-level fields back into data for the frontend
    const recipes = rows.map(r => ({ id: r.id, ...r.data, name: r.name }));
    return Response.json(recipes);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/recipes — create a new recipe
export async function POST(req) {
  const sql = getDb();
  try {
    const recipe = await req.json();
    const { id, name, ...rest } = recipe;
    await sql`
      INSERT INTO recipes (id, name, data)
      VALUES (${id}, ${name || 'Untitled'}, ${JSON.stringify(rest)})
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          data = EXCLUDED.data,
          updated_at = NOW()
    `;
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
