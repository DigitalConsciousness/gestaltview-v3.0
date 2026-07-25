-- GestaltView Admin Seed
-- Run AFTER 001_rate_limits_and_users.sql
-- This seeds keithsoyka@gmail.com as the founder/admin with full enterprise access.
--
-- IMPORTANT: This only works if keithsoyka@gmail.com has already signed up via
-- Supabase Auth (email/password or magic link). If the auth.users record doesn't
-- exist yet, sign in once first, then run this.
--
-- To run: paste into Supabase SQL Editor and execute.

-- Upsert founder record into users table
-- Replace the UUID below with the actual UUID from auth.users for keithsoyka@gmail.com:
--   SELECT id FROM auth.users WHERE email = 'keithsoyka@gmail.com';

DO $$
DECLARE
  founder_id UUID;
BEGIN
  -- Look up the auth user ID dynamically
  SELECT id INTO founder_id
  FROM auth.users
  WHERE email = 'keithsoyka@gmail.com'
  LIMIT 1;

  IF founder_id IS NULL THEN
    RAISE NOTICE 'No auth user found for keithsoyka@gmail.com. Sign in once via the app first, then re-run this migration.';
  ELSE
    INSERT INTO public.users (
      id,
      email,
      tier,
      subscription_status,
      billy_query_count,
      created_at,
      updated_at
    )
    VALUES (
      founder_id,
      'keithsoyka@gmail.com',
      'enterprise',
      'active',
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      tier = 'enterprise',
      subscription_status = 'active',
      updated_at = NOW();

    RAISE NOTICE 'Founder keithsoyka@gmail.com seeded with enterprise tier. ID: %', founder_id;
  END IF;
 END;
$$;

-- Also add is_admin flag if you want a hard admin gate later
-- (run this separately after confirming the column doesn't already exist)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.users
SET is_admin = TRUE
WHERE email = 'keithsoyka@gmail.com';
