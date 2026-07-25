-- Source: supabase_schema.zip/supabase/migrations/20260321104200_grace_period.sql
-- Canonicalized filename: 20260321104200_grace_period.sql

-- GestaltView — Grace period column + access function
-- Migration: 20260321104200_grace_period.sql
-- 2026 Keith Soyka · GestaltView. All Rights Reserved.
--
-- IMPORTANT: GestaltView does NOT have a separate `subscriptions` table.
-- Subscription state lives on the `users` table:
--   tier, subscription_status, stripe_subscription_id, billing_period_start
--
-- This migration adds grace_until to `users` and creates the
-- has_valid_subscription_access() RPC function against that table.

-- -----------------------------------------------------------------------
-- 1. Add grace_until to users table
-- -----------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS grace_until TIMESTAMPTZ DEFAULT NULL;

-- -----------------------------------------------------------------------
-- 2. Index for fast grace-period lookups (only indexes non-null rows)
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_grace_until
  ON users (grace_until)
  WHERE grace_until IS NOT NULL;

-- -----------------------------------------------------------------------
-- 3. RPC: has_valid_subscription_access(user_id UUID)
--    Returns true if the user has:
--      - an active subscription, OR
--      - a past_due subscription still within their grace period
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION has_valid_subscription_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_user_id
      AND (
        subscription_status = 'active'
        OR (
          subscription_status = 'past_due'
          AND grace_until IS NOT NULL
          AND grace_until > NOW()
        )
      )
  );
$$;

-- -----------------------------------------------------------------------
-- 4. Stamp the column
-- -----------------------------------------------------------------------
COMMENT ON COLUMN users.grace_until
  IS 'Grace period expiry for past_due subscriptions. NULL = no grace. 2026-03-21';
