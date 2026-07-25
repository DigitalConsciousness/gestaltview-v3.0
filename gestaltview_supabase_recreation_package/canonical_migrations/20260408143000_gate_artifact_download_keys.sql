-- Source: supabase_schema.zip/supabase/migrations/20260408143000_gate_artifact_download_keys.sql
-- Canonicalized filename: 20260408143000_gate_artifact_download_keys.sql

alter table if exists public.gate_artifacts
  add column if not exists download_token text not null default '';

create index if not exists gate_artifacts_download_token_idx
  on public.gate_artifacts (download_token);
