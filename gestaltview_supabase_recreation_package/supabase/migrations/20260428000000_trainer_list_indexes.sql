-- Source: supabase_schema.zip/supabase/migrations/20260428000000_trainer_list_indexes.sql
-- Canonicalized filename: 20260428000000_trainer_list_indexes.sql

-- Fix: trainer list endpoints (GET /api/trainer/runs, /agents, /scenario-sets) returning
-- 500 due to Supabase 504 timeouts caused by full-table-scans on unindexed ORDER BY columns.
-- See: SENTRY-INDIGO-COGNITION-3

-- Speeds up: SELECT * FROM agents ORDER BY updated_at DESC LIMIT 50
create index if not exists agents_updated_at_idx
  on public.agents(updated_at desc);

-- Speeds up: SELECT * FROM training_runs ORDER BY created_at DESC LIMIT N
create index if not exists training_runs_created_at_idx
  on public.training_runs(created_at desc);

-- Speeds up: SELECT * FROM scenario_sets ORDER BY created_at DESC
create index if not exists scenario_sets_created_at_idx
  on public.scenario_sets(created_at desc);

-- Speeds up: bulk-fetch of latest job per run inside listRecentTrainingRuns
-- (SELECT * FROM trainer_jobs WHERE run_id = ANY(...) ORDER BY created_at DESC)
create index if not exists trainer_jobs_run_created_idx
  on public.trainer_jobs(run_id, created_at desc);

-- Speeds up: bulk-fetch of latest version per run inside listRecentTrainingRuns
-- (SELECT ... FROM agent_versions WHERE source_run_id = ANY(...) ORDER BY created_at DESC)
create index if not exists agent_versions_source_run_created_idx
  on public.agent_versions(source_run_id, created_at desc);