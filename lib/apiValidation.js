const MAX_RECIPE_BYTES = 120_000;
const MAX_LOG_BYTES = 250_000;
const MAX_IMAGE_DATA_BYTES = 1_500_000;

export function isNonEmptyString(value, max = 200) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

export function parseJsonWithLimit(payload, maxBytes, label) {
  const size = Buffer.byteLength(JSON.stringify(payload ?? {}), 'utf8');
  if (size > maxBytes) {
    const err = new Error(`${label} payload too large`);
    err.status = 413;
    throw err;
  }
  return payload;
}

export function validateRecipePayload(recipe) {
  if (!recipe || typeof recipe !== 'object') throw badRequest('Invalid recipe body');
  if (!isNonEmptyString(recipe.id, 80)) throw badRequest('Recipe id is required');
  if (recipe.name != null && typeof recipe.name !== 'string') throw badRequest('Recipe name must be a string');
  parseJsonWithLimit(recipe, MAX_RECIPE_BYTES, 'Recipe');
  return recipe;
}

export function validateLogPayload(log) {
  if (!log || typeof log !== 'object') throw badRequest('Invalid log body');
  if (!isNonEmptyString(log.id, 80)) throw badRequest('Log id is required');
  parseJsonWithLimit(log, MAX_LOG_BYTES, 'Log');
  return log;
}

export function validatePhotoPayload(photo) {
  if (!photo || typeof photo !== 'object') throw badRequest('Invalid photo body');
  if (!isNonEmptyString(photo.log_id, 80)) throw badRequest('log_id is required');
  if (!isNonEmptyString(photo.image_data, MAX_IMAGE_DATA_BYTES)) throw badRequest('image_data is required');
  if (Buffer.byteLength(photo.image_data, 'utf8') > MAX_IMAGE_DATA_BYTES) {
    const err = new Error('image_data exceeds 1.5MB limit');
    err.status = 413;
    throw err;
  }
  return photo;
}

export function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export function errorResponse(err) {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  return Response.json({ error: err.message || 'Unexpected error' }, { status });
}
