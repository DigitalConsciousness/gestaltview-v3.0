-- Source: supabase_schema.zip/supabase/migrations/001_rate_limits_and_users.sql
-- Canonicalized filename: 20260301000100_rate_limits_and_users.sql

-- GestaltView: Rate limiting and user tier tables
-- Run this in your Supabase SQL editor or migration runner

-- Session rate limits for anonymous users
CREATE TABLE IF NOT EXISTS session_rate_limits (
  session_id    TEXT PRIMARY KEY,
  query_count   INTEGER NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-clean sessions older than 7 days
CREATE INDEX IF NOT EXISTS idx_session_rate_limits_window 
  ON session_rate_limits (window_start);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT UNIQUE NOT NULL,
  tier                     TEXT NOT NULL DEFAULT 'free' 
                             CHECK (tier IN ('free', 'core', 'pro', 'enterprise')),
  stripe_customer_id       TEXT UNIQUE,
  stripe_subscription_id   TEXT,
  subscription_status      TEXT DEFAULT 'inactive'
                             CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
  billing_period_start     TIMESTAMPTZ,
  billy_query_count        INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users (tier);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only read their own record
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Service role (used by API) can do everything
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on session_rate_limits"
  ON session_rate_limits FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER session_rate_limits_updated_at
  BEFORE UPDATE ON session_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
