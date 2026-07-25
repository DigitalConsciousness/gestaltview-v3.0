-- Source: supabase_schema.zip/supabase/migrations/20260604_codex_artifact_tables.sql
-- Canonicalized filename: 20260604000100_codex_artifact_tables.sql

-- Migration: codex_artifact_tables
-- Creates created_artifacts and artifact_provenance_envelopes if not present

CREATE TABLE IF NOT EXISTS public.created_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid uuid,
  title text NOT NULL,
  artifacttype text NOT NULL,
  contentformat text NOT NULL,
  content text NOT NULL,
  sourcecaptureids uuid[] DEFAULT '{}',
  sourceartifactids uuid[] DEFAULT '{}',
  destination text NOT NULL DEFAULT 'download-only',
  metadata jsonb DEFAULT '{}',
  createdat timestamptz DEFAULT now(),
  deletedat timestamptz
);

CREATE TABLE IF NOT EXISTS public.artifact_provenance_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifactid uuid REFERENCES public.created_artifacts(id) ON DELETE CASCADE,
  sourcehashes jsonb NOT NULL DEFAULT '[]',
  artifacthash text NOT NULL,
  transformtype text NOT NULL,
  engineversion text NOT NULL,
  modelprovider text,
  modelname text,
  createdat timestamptz DEFAULT now()
);

ALTER TABLE public.created_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_provenance_envelopes ENABLE ROW LEVEL SECURITY;

-- Service-role bypass policies (app writes via service key, reads scoped by RLS)
DROP POLICY IF EXISTS "service_role_full_access_artifacts" ON public.created_artifacts;
CREATE POLICY "service_role_full_access_artifacts"
  ON public.created_artifacts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_access_provenance" ON public.artifact_provenance_envelopes;
CREATE POLICY "service_role_full_access_provenance"
  ON public.artifact_provenance_envelopes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
