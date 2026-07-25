-- =============================================================================
-- Migration: 20260531013000_masterclass_module_setup_and_progress_tracking.sql
-- Purpose  : Register the Masterclass module in gestaltview_modules, wire the
--            route embodiment assignment, and create masterclass_progress.
-- Table names verified live: gestaltview_modules, route_embodiment_assignments
-- Safe to re-run: all DDL guarded with IF NOT EXISTS / ON CONFLICT.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Register masterclass in gestaltview_modules
-- ---------------------------------------------------------------------------
INSERT INTO gestaltview_modules (
  module_key,
  module_index,
  display_name,
  summary,
  operating_notes,
  scope,
  is_active
)
VALUES (
  'masterclass',
  99,
  'Masterclass',
  'Guided exploration of all Digital Intelligence embodiment profiles',
  'Read-only exploration module. DI sessions wired through disessions and dimemoryevents.',
  'system',
  true
)
ON CONFLICT (module_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Register route embodiment assignment
-- ---------------------------------------------------------------------------
INSERT INTO route_embodiment_assignments (
  route_path,
  embodiment_profile_slug,
  display_label,
  description
)
VALUES (
  '/workspace/modules/masterclass',
  'billy',
  'Masterclass',
  'Default room guide — Billy orients, individual DI sessions launch per profile'
)
ON CONFLICT (route_path) DO UPDATE
  SET
    embodiment_profile_slug = EXCLUDED.embodiment_profile_slug,
    display_label           = EXCLUDED.display_label,
    description             = EXCLUDED.description;

-- ---------------------------------------------------------------------------
-- 3. masterclass_progress — per-user session tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS masterclass_progress (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  embodiment_slug  text        NOT NULL,
  first_visited_at timestamptz NOT NULL DEFAULT now(),
  session_count    integer     NOT NULL DEFAULT 0,
  last_session_at  timestamptz,
  UNIQUE (user_id, embodiment_slug)
);

ALTER TABLE masterclass_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own masterclass progress" ON masterclass_progress;
CREATE POLICY "users see own masterclass progress"
  ON masterclass_progress FOR ALL
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Index — fast per-user slug lookup
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_masterclass_progress_user_slug
  ON masterclass_progress (user_id, embodiment_slug);

CREATE INDEX IF NOT EXISTS idx_masterclass_progress_last_session
  ON masterclass_progress (user_id, last_session_at DESC NULLS LAST);

-- ---------------------------------------------------------------------------
-- 5. RPC: upsert_masterclass_session
--    Called from client after each completed session.
--    Increments session_count and stamps last_session_at.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upsert_masterclass_session(
  p_embodiment_slug text
)
RETURNS masterclass_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_row     masterclass_progress;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'upsert_masterclass_session: not authenticated';
  END IF;

  INSERT INTO masterclass_progress (user_id, embodiment_slug, session_count, last_session_at)
  VALUES (v_user_id, p_embodiment_slug, 1, now())
  ON CONFLICT (user_id, embodiment_slug) DO UPDATE
    SET
      session_count   = masterclass_progress.session_count + 1,
      last_session_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_masterclass_session(text) TO authenticated;

COMMENT ON TABLE masterclass_progress IS
  'Tracks per-user session count for each DI embodiment slug in the Masterclass module.';
