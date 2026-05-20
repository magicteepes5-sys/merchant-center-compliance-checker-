-- Run this once in your Vercel Postgres / Neon SQL console if you prefer manual setup
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  searches_remaining INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  input_excerpt TEXT,
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
);

CREATE TABLE IF NOT EXISTS feed_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES feed_jobs(id) ON DELETE CASCADE,
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
);

CREATE TABLE IF NOT EXISTS feed_rule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES feed_jobs(id) ON DELETE CASCADE,
  rule_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  issues_found INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS feed_jobs_user_id_idx ON feed_jobs(user_id);
CREATE INDEX IF NOT EXISTS feed_jobs_status_idx ON feed_jobs(status);
CREATE INDEX IF NOT EXISTS feed_issues_job_id_idx ON feed_issues(job_id);
CREATE INDEX IF NOT EXISTS feed_rule_runs_job_id_idx ON feed_rule_runs(job_id);
