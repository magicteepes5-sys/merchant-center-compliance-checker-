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

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  await sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    searches_remaining INTEGER NOT NULL DEFAULT 3,
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verification_token TEXT,
    verification_token_expires_at TIMESTAMPTZ,
    trial_granted_at TIMESTAMPTZ,
    signup_fingerprint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_granted_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_fingerprint TEXT;`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_signup_fingerprint_key ON users(signup_fingerprint) WHERE signup_fingerprint IS NOT NULL;`;

  await sql`CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    input_excerpt TEXT,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS billing_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    credits_added INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS feed_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'uploaded',
    total_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    safe_fixes_applied INTEGER NOT NULL DEFAULT 0,
    input_format TEXT NOT NULL DEFAULT 'json',
    original_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    cleaned_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS feed_issues (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES feed_jobs(id) ON DELETE CASCADE,
    row_index INTEGER,
    item_id TEXT,
    field_name TEXT,
    severity TEXT NOT NULL,
    rule_code TEXT NOT NULL,
    message TEXT NOT NULL,
    suggested_fix JSONB,
    is_safe_fix BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`;

  await sql`CREATE TABLE IF NOT EXISTS feed_rule_runs (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES feed_jobs(id) ON DELETE CASCADE,
    rule_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    issues_found INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
  );`;

  await sql`CREATE INDEX IF NOT EXISTS feed_jobs_user_id_idx ON feed_jobs(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS feed_jobs_status_idx ON feed_jobs(status);`;
  await sql`CREATE INDEX IF NOT EXISTS feed_issues_job_id_idx ON feed_issues(job_id);`;
  await sql`CREATE INDEX IF NOT EXISTS feed_rule_runs_job_id_idx ON feed_rule_runs(job_id);`;
}
