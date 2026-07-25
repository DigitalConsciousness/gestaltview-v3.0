-- Source: supabase_schema.zip/supabase/migrations/20260609000300_artifact_query_indexes.sql
-- Canonicalized filename: 20260609000300_artifact_query_indexes.sql

-- Performance hardening for Dynamic Inner World artifact and Codex drain reads.
CREATE INDEX IF NOT EXISTS idx_inner_world_artifacts_user_id
  ON inner_world_artifacts(user_id);

CREATE INDEX IF NOT EXISTS idx_inner_world_artifacts_user_created
  ON inner_world_artifacts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_artifact_id
  ON codex_jobs(artifact_id);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_status
  ON codex_jobs(status);

CREATE INDEX IF NOT EXISTS idx_codex_jobs_status_created
  ON codex_jobs(status, created_at ASC);
