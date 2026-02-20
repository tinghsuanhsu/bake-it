import { neon } from '@neondatabase/serverless';

// Singleton so we don't create a new connection on every request
let _sql;
export function getDb() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}
