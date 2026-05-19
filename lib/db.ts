import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

type SqlTag = ReturnType<typeof neon>;
let _sql: SqlTag | null = null;

function getSql(): SqlTag {
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');
  if (!_sql) _sql = neon(databaseUrl);
  return _sql;
}

export const sql = ((...args: any[]) => getSql()(...(args as Parameters<SqlTag>))) as SqlTag;

export async function ensureSchema() {
  if (!databaseUrl) throw new Error('DATABASE_URL is missing');

  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    searches_remaining INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    input_excerpt TEXT,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;
}
