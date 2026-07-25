-- GestaltView rebuilt-project compatibility and security repair.
-- Additive only: preserve legacy JSON payloads while restoring the typed
-- contract expected by the current migration spine.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_cognition_profiles' AND column_name = 'profile_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_cognition_profiles' AND column_name = 'cognition_profile_id'
  ) THEN
    ALTER TABLE public.human_cognition_profiles RENAME COLUMN profile_id TO cognition_profile_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_consciousness_profiles' AND column_name = 'profile_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_consciousness_profiles' AND column_name = 'consciousness_profile_id'
  ) THEN
    ALTER TABLE public.human_consciousness_profiles RENAME COLUMN profile_id TO consciousness_profile_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_personality_profiles' AND column_name = 'profile_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_personality_profiles' AND column_name = 'personality_profile_id'
  ) THEN
    ALTER TABLE public.human_personality_profiles RENAME COLUMN profile_id TO personality_profile_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_context_views' AND column_name = 'view_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_context_views' AND column_name = 'context_view_id'
  ) THEN
    ALTER TABLE public.human_context_views RENAME COLUMN view_id TO context_view_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_relationship_edges' AND column_name = 'edge_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'human_relationship_edges' AND column_name = 'relationship_id'
  ) THEN
    ALTER TABLE public.human_relationship_edges RENAME COLUMN edge_id TO relationship_id;
  END IF;
END
$$;

ALTER TABLE public.identity_subjects
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'identity_subjects'
      AND column_name = 'app_user_id' AND data_type = 'uuid'
  ) THEN
    DROP POLICY IF EXISTS "authenticated manage own identity_subjects"
      ON public.identity_subjects;

    ALTER TABLE public.identity_subjects
      ALTER COLUMN app_user_id TYPE text USING app_user_id::text;

    CREATE POLICY "authenticated manage own identity_subjects"
      ON public.identity_subjects
      FOR ALL TO authenticated
      USING (
        (SELECT auth.uid()) = auth_user_id
        OR (SELECT auth.uid())::text = app_user_id
      )
      WITH CHECK (
        (SELECT auth.uid()) = auth_user_id
        OR (SELECT auth.uid())::text = app_user_id
      );
  END IF;
END
$$;

ALTER TABLE public.human_identity_profiles
  ADD COLUMN IF NOT EXISTS identity_handle text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS self_model jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS narrative_anchor text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role_commitments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS boundary_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS contradiction_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.75,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'PENDING_REVIEW',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.human_identity_profiles AS legacy
SET
  identity_handle = COALESCE(NULLIF(identity_handle, ''), to_jsonb(legacy)->'profile'->>'identity_handle', ''),
  display_name = COALESCE(NULLIF(display_name, ''), to_jsonb(legacy)->'profile'->>'display_name', ''),
  self_model = CASE WHEN self_model = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'self_model', '{}'::jsonb) ELSE self_model END,
  narrative_anchor = COALESCE(NULLIF(narrative_anchor, ''), to_jsonb(legacy)->'profile'->>'narrative_anchor', ''),
  role_commitments = CASE WHEN role_commitments = '[]'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'role_commitments', '[]'::jsonb) ELSE role_commitments END,
  boundary_policy = CASE WHEN boundary_policy = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'boundary_policy', '{}'::jsonb) ELSE boundary_policy END,
  contradiction_notes = CASE WHEN contradiction_notes = '[]'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'contradiction_notes', '[]'::jsonb) ELSE contradiction_notes END
WHERE to_jsonb(legacy) ? 'profile';

ALTER TABLE public.human_cognition_profiles
  ADD COLUMN IF NOT EXISTS attention_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS working_memory jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reasoning_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS planning_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS language_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS executive_controls jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS decision_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.75,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.human_cognition_profiles AS legacy
SET
  attention_profile = CASE WHEN attention_profile = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'attention_profile', '{}'::jsonb) ELSE attention_profile END,
  working_memory = CASE WHEN working_memory = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'working_memory', '{}'::jsonb) ELSE working_memory END,
  reasoning_profile = CASE WHEN reasoning_profile = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'reasoning_profile', '{}'::jsonb) ELSE reasoning_profile END,
  planning_profile = CASE WHEN planning_profile = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'planning_profile', '{}'::jsonb) ELSE planning_profile END,
  language_profile = CASE WHEN language_profile = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'language_profile', '{}'::jsonb) ELSE language_profile END,
  executive_controls = CASE WHEN executive_controls = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'executive_controls', '{}'::jsonb) ELSE executive_controls END,
  decision_policy = CASE WHEN decision_policy = '{}'::jsonb THEN COALESCE(to_jsonb(legacy)->'profile'->'decision_policy', '{}'::jsonb) ELSE decision_policy END
WHERE to_jsonb(legacy) ? 'profile';

ALTER TABLE public.human_consciousness_profiles
  ADD COLUMN IF NOT EXISTS present_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS continuity_model jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS self_observation jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agency_model jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS time_orientation jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS awareness_model jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.human_personality_profiles
  ADD COLUMN IF NOT EXISTS trait_map jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS temperament jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS social_style jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS communication_style jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS values_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.75,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.human_context_views
  ADD COLUMN IF NOT EXISTS relationship_subject_id uuid,
  ADD COLUMN IF NOT EXISTS channel_key text,
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS filter_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS presentation_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sharing_policy jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.human_context_views SET scope = 'self' WHERE scope = 'user';
ALTER TABLE public.human_context_views ALTER COLUMN scope SET DEFAULT 'self';

ALTER TABLE public.human_continuity_snapshots
  ADD COLUMN IF NOT EXISTS snapshot_kind text NOT NULL DEFAULT 'identity',
  ADD COLUMN IF NOT EXISTS surface_key text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS summary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.75,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'NOT_REQUIRED';

ALTER TABLE public.human_memory_records
  ADD COLUMN IF NOT EXISTS source_memory_entry_id uuid,
  ADD COLUMN IF NOT EXISTS source_asset_id uuid,
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS content_hash text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS emotional_valence numeric,
  ADD COLUMN IF NOT EXISTS salience numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS evidence_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consent_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS archive_policy public.archive_policy NOT NULL DEFAULT 'archive',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.human_memory_records SET memory_kind = 'note' WHERE memory_kind = 'manual';
ALTER TABLE public.human_memory_records ALTER COLUMN memory_kind SET DEFAULT 'note';

ALTER TABLE public.human_relationship_edges
  ADD COLUMN IF NOT EXISTS related_subject_id uuid,
  ADD COLUMN IF NOT EXISTS relationship_type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS trust_level numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS familiarity_level numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS intimacy_boundary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS stance text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shared_context jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS review_status public.review_status NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.human_identity_evidence
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'system-derived',
  ADD COLUMN IF NOT EXISTS source_asset_id uuid,
  ADD COLUMN IF NOT EXISTS source_memory_entry_id uuid,
  ADD COLUMN IF NOT EXISTS source_session_id text,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS weight numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS observed_at timestamp with time zone NOT NULL DEFAULT now();

UPDATE public.human_identity_evidence AS legacy
SET excerpt = COALESCE(excerpt, to_jsonb(legacy)->>'content')
WHERE excerpt IS NULL AND to_jsonb(legacy) ? 'content';

ALTER TABLE public.human_identity_mutations
  ADD COLUMN IF NOT EXISTS proposed_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS source_asset_id uuid,
  ADD COLUMN IF NOT EXISTS mutation_type public.identity_mutation_type,
  ADD COLUMN IF NOT EXISTS target_table text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_id uuid,
  ADD COLUMN IF NOT EXISTS target_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mutation_class public.mutation_class NOT NULL DEFAULT 'REVIEW_GATED',
  ADD COLUMN IF NOT EXISTS patch_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS diff_summary text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS confidence numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS evidence_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_affirmed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS applied_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rolled_back_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.human_identity_mutations AS legacy
SET
  mutation_type = COALESCE(
    mutation_type,
    CASE
      WHEN NULLIF(to_jsonb(legacy)->>'type', '') IS NOT NULL
        THEN (to_jsonb(legacy)->>'type')::public.identity_mutation_type
      ELSE NULL
    END,
    'memory_patch'::public.identity_mutation_type
  ),
  patch_payload = CASE
    WHEN patch_payload = '{}'::jsonb
      THEN COALESCE(to_jsonb(legacy)->'payload', '{}'::jsonb)
    ELSE patch_payload
  END,
  reason = COALESCE(reason, to_jsonb(legacy)->>'notes')
WHERE mutation_type IS NULL OR patch_payload = '{}'::jsonb OR reason IS NULL;

ALTER TABLE public.human_identity_mutations ALTER COLUMN mutation_type SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.corpus_harvest_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_run_id uuid NOT NULL REFERENCES public.profile_pipeline_runs(run_id),
  document_id uuid REFERENCES public.documents(document_id),
  anonymized_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  harvest_status text NOT NULL DEFAULT 'pending'
    CHECK (harvest_status IN ('pending', 'indexed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.corpus_harvest_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS corpus_harvest_events_service_role_all ON public.corpus_harvest_events;
CREATE POLICY corpus_harvest_events_service_role_all
  ON public.corpus_harvest_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON TABLE public.corpus_harvest_events FROM anon, authenticated;
GRANT ALL ON TABLE public.corpus_harvest_events TO service_role;

ALTER VIEW IF EXISTS public.knowledge_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.skill_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.active_agent_manifests SET (security_invoker = true);
ALTER VIEW IF EXISTS public.manifest_file_pull SET (security_invoker = true);
ALTER VIEW IF EXISTS public.approved_library_assets_by_agent SET (security_invoker = true);
ALTER VIEW IF EXISTS public.pending_embodiment_mutations SET (security_invoker = true);
ALTER VIEW IF EXISTS public.trainer_queue_health_v SET (security_invoker = true);
ALTER VIEW IF EXISTS public.trainer_memory_surfaces SET (security_invoker = true);

-- Explicitly close the most sensitive worker queue before applying the
-- catalog-wide SECURITY DEFINER privilege rule below.
REVOKE EXECUTE ON FUNCTION public.claim_codex_jobs(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_codex_jobs(integer) TO service_role;

DO $$
DECLARE
  routine regprocedure;
BEGIN
  FOR routine IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', routine);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', routine);
  END LOOP;
END
$$;

-- These two functions are intentionally client-facing. Their bodies derive
-- ownership from auth.uid() or return non-sensitive route configuration.
GRANT EXECUTE ON FUNCTION public.upsert_masterclass_session(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_route_embodiment_assignment(text) TO anon, authenticated;
