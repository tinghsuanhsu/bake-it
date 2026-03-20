export const dynamic = 'force-dynamic';

import { errorResponse, badRequest } from '../../../lib/apiValidation';

const PROMPT = `Extract the sourdough recipe from this image. Return ONLY a JSON object, no markdown, no explanation:
{
  "name": "recipe name",
  "loaves": "number of loaves as string",
  "loafG": "weight per loaf in grams as string",
  "ddt": "desired dough temperature in Celsius as string, or 26 if not shown",
  "notes": "any description or yield info",
  "ingredients": [{"label":"ingredient name","grams":"amount in grams as string","type":"flour or other"}],
  "steps": [{"name":"step name","durationMin":duration in minutes as integer}]
}
Rules:
- Convert all amounts to grams (e.g. 1 tsp salt ≈ 6g, 1 cup flour ≈ 120g)
- type is "flour" for any flour or grain, "other" for everything else
- Convert all durations to minutes (e.g. "1 hour" = 60, "overnight" = 720)
- If the image does not contain a recipe, return {"error":"No recipe found in image"}`;

// POST /api/scan-recipe
// Body: { image: base64string, mediaType: "image/jpeg"|"image/png"|etc }
export async function POST(req) {
  try {
    const body = await req.json();
    const { image, mediaType = 'image/jpeg' } = body;

    if (!image || typeof image !== 'string') throw badRequest('image is required');
    if (image.length > 10_000_000) throw badRequest('Image too large (max ~7.5MB)');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const err = new Error('ANTHROPIC_API_KEY not configured');
      err.status = 500;
      throw err;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text',  text: PROMPT },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const err = new Error(errBody?.error?.message || `Anthropic API error ${res.status}`);
      err.status = res.status === 429 ? 429 : 502;
      throw err;
    }

    const data   = await res.json();
    const text   = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return Response.json({ recipe: parsed });
  } catch (err) {
    return errorResponse(err);
  }
}
