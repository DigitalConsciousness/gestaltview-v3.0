-- GestaltView Supabase + Repo Alignment Layer
-- Date: 2026-06-28
-- Style: additive, non-destructive, roll-forward only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.gsvw_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.gsvw_ingestion_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_label TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'partial', 'error', 'dry_run')),
  source_repos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  source_branch TEXT,
  operator_notes TEXT,
  dry_run BOOLEAN NOT NULL DEFAULT false,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS gsvw_ingestion_runs_updated_at ON public.gsvw_ingestion_runs;
CREATE TRIGGER gsvw_ingestion_runs_updated_at
BEFORE UPDATE ON public.gsvw_ingestion_runs
FOR EACH ROW EXECUTE FUNCTION public.gsvw_set_updated_at();

CREATE TABLE IF NOT EXISTS public.gsvw_ingestion_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.gsvw_ingestion_runs(run_id) ON DELETE SET NULL,
  source_repo TEXT NOT NULL,
  source_label TEXT,
  source_branch TEXT,
  source_commit TEXT,
  source_path TEXT NOT NULL,
  source_url TEXT,
  lane TEXT NOT NULL DEFAULT 'corpus',
  document_type TEXT NOT NULL DEFAULT 'general',
  title TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  char_count INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  raw_text TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'dormant_candidate', 'dormant', 'archived', 'user_removed')),
  supersedes_document_id UUID REFERENCES public.gsvw_ingestion_documents(document_id) ON DELETE SET NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_repo, source_path, content_hash)
);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_documents_repo_path_idx
  ON public.gsvw_ingestion_documents(source_repo, source_path);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_documents_status_idx
  ON public.gsvw_ingestion_documents(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_documents_tags_gin_idx
  ON public.gsvw_ingestion_documents USING GIN(tags);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_documents_metadata_gin_idx
  ON public.gsvw_ingestion_documents USING GIN(metadata);

DROP TRIGGER IF EXISTS gsvw_ingestion_documents_updated_at ON public.gsvw_ingestion_documents;
CREATE TRIGGER gsvw_ingestion_documents_updated_at
BEFORE UPDATE ON public.gsvw_ingestion_documents
FOR EACH ROW EXECUTE FUNCTION public.gsvw_set_updated_at();

CREATE TABLE IF NOT EXISTS public.gsvw_ingestion_chunks (
  chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.gsvw_ingestion_documents(document_id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.gsvw_ingestion_runs(run_id) ON DELETE SET NULL,
  source_repo TEXT NOT NULL,
  source_path TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  total_chunks INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  char_count INTEGER NOT NULL DEFAULT 0,
  token_estimate INTEGER NOT NULL DEFAULT 0,
  embedding JSONB,
  embedding_model TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index),
  UNIQUE (source_repo, source_path, content_hash)
);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_chunks_doc_idx
  ON public.gsvw_ingestion_chunks(document_id, chunk_index);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_chunks_content_hash_idx
  ON public.gsvw_ingestion_chunks(content_hash);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_chunks_tags_gin_idx
  ON public.gsvw_ingestion_chunks USING GIN(tags);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_chunks_metadata_gin_idx
  ON public.gsvw_ingestion_chunks USING GIN(metadata);

CREATE TABLE IF NOT EXISTS public.gsvw_ingestion_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.gsvw_ingestion_runs(run_id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.gsvw_ingestion_documents(document_id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error')),
  message TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gsvw_ingestion_events_run_idx
  ON public.gsvw_ingestion_events(run_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.gsvw_repo_alignment_snapshots (
  snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_repo TEXT NOT NULL,
  source_branch TEXT,
  source_commit TEXT,
  manifest_hash TEXT NOT NULL,
  manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
  counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_repo, source_branch, manifest_hash)
);

CREATE TABLE IF NOT EXISTS public.gsvw_runtime_capture_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  module_key TEXT NOT NULL,
  action TEXT NOT NULL,
  source_surface TEXT,
  original_text TEXT,
  original_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'queued', 'approved', 'rejected', 'archived', 'user_removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gsvw_runtime_capture_events_user_created_idx
  ON public.gsvw_runtime_capture_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gsvw_runtime_capture_events_module_idx
  ON public.gsvw_runtime_capture_events(module_key, created_at DESC);

CREATE INDEX IF NOT EXISTS gsvw_runtime_capture_events_metadata_gin_idx
  ON public.gsvw_runtime_capture_events USING GIN(metadata);

DROP TRIGGER IF EXISTS gsvw_runtime_capture_events_updated_at ON public.gsvw_runtime_capture_events;
CREATE TRIGGER gsvw_runtime_capture_events_updated_at
BEFORE UPDATE ON public.gsvw_runtime_capture_events
FOR EACH ROW EXECUTE FUNCTION public.gsvw_set_updated_at();

CREATE TABLE IF NOT EXISTS public.gsvw_dormancy_review_items (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.gsvw_ingestion_documents(document_id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES public.gsvw_ingestion_chunks(chunk_id) ON DELETE CASCADE,
  proposed_reason TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'restored', 'accepted_dormant', 'archived', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gsvw_dormancy_review_items_status_idx
  ON public.gsvw_dormancy_review_items(status, created_at DESC);

DROP TRIGGER IF EXISTS gsvw_dormancy_review_items_updated_at ON public.gsvw_dormancy_review_items;
CREATE TRIGGER gsvw_dormancy_review_items_updated_at
BEFORE UPDATE ON public.gsvw_dormancy_review_items
FOR EACH ROW EXECUTE FUNCTION public.gsvw_set_updated_at();

CREATE OR REPLACE VIEW public.gsvw_current_ingestion_documents
WITH (security_invoker = true) AS
SELECT DISTINCT ON (source_repo, source_path)
  *
FROM public.gsvw_ingestion_documents
WHERE status IN ('active', 'dormant_candidate', 'dormant')
ORDER BY source_repo, source_path, last_seen_at DESC, created_at DESC;

CREATE OR REPLACE FUNCTION public.gsvw_mark_document_seen(
  p_source_repo TEXT,
  p_source_path TEXT,
  p_content_hash TEXT,
  p_run_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_document_id UUID;
BEGIN
  SELECT document_id INTO v_document_id
  FROM public.gsvw_ingestion_documents
  WHERE source_repo = p_source_repo
    AND source_path = p_source_path
    AND content_hash = p_content_hash
  LIMIT 1;

  IF v_document_id IS NOT NULL THEN
    UPDATE public.gsvw_ingestion_documents
    SET last_seen_at = now(), run_id = COALESCE(p_run_id, run_id)
    WHERE document_id = v_document_id;
  END IF;

  RETURN v_document_id;
END;
$$;

REVOKE ALL ON FUNCTION public.gsvw_mark_document_seen(TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gsvw_mark_document_seen(TEXT, TEXT, TEXT, UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gsvw_mark_document_seen(TEXT, TEXT, TEXT, UUID) TO service_role;

ALTER TABLE public.gsvw_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_ingestion_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_ingestion_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_ingestion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_repo_alignment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_runtime_capture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsvw_dormancy_review_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gsvw_runtime_capture_events'
      AND policyname = 'authenticated_users_insert_own_runtime_captures'
  ) THEN
    CREATE POLICY authenticated_users_insert_own_runtime_captures
      ON public.gsvw_runtime_capture_events
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id IS NULL OR user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gsvw_runtime_capture_events'
      AND policyname = 'authenticated_users_select_own_runtime_captures'
  ) THEN
    CREATE POLICY authenticated_users_select_own_runtime_captures
      ON public.gsvw_runtime_capture_events
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END;
$$;

-- New Supabase projects no longer auto-expose public objects. Keep the
-- service-role ingestion lane private and grant the signed-in capture lane
-- only the operations its RLS policies authorize.
REVOKE ALL ON TABLE
  public.gsvw_ingestion_runs,
  public.gsvw_ingestion_documents,
  public.gsvw_ingestion_chunks,
  public.gsvw_ingestion_events,
  public.gsvw_repo_alignment_snapshots,
  public.gsvw_runtime_capture_events,
  public.gsvw_dormancy_review_items
FROM anon, authenticated;

GRANT ALL ON TABLE
  public.gsvw_ingestion_runs,
  public.gsvw_ingestion_documents,
  public.gsvw_ingestion_chunks,
  public.gsvw_ingestion_events,
  public.gsvw_repo_alignment_snapshots,
  public.gsvw_runtime_capture_events,
  public.gsvw_dormancy_review_items
TO service_role;

GRANT INSERT, SELECT ON TABLE public.gsvw_runtime_capture_events TO authenticated;
REVOKE ALL ON TABLE public.gsvw_current_ingestion_documents FROM anon, authenticated;
GRANT SELECT ON TABLE public.gsvw_current_ingestion_documents TO service_role;

COMMENT ON TABLE public.gsvw_ingestion_documents IS
  'Additive source document ledger for repo/corpus ingestion. Never silently deletes; changed content rolls forward as a new hash.';

COMMENT ON TABLE public.gsvw_runtime_capture_events IS
  'Runtime capture event bridge for Blackboard/Sanctuary/Dynamic Inner World/External Scaffold dual-write persistence.';

COMMENT ON TABLE public.gsvw_dormancy_review_items IS
  'Review queue for fall-away-but-not-lost dormancy proposals. No automatic deletion.';
