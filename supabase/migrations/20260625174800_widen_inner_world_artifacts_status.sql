-- Widen the inner_world_artifacts.status CHECK constraint to cover the Artifact
-- Gallery staging vocabulary. The original constraint only allowed
-- ('active', 'archived'), which caused POST /api/inner-world/artifacts to fail
-- with a Postgres check_violation (PostgREST 400 -> API 500) once the client
-- began sending statuses like 'ready', 'queued', 'rendering', 'failed', 'draft'.

alter table if exists public.inner_world_artifacts
  alter column status set default 'ready';

alter table if exists public.inner_world_artifacts
  drop constraint if exists inner_world_artifacts_status_check;

alter table if exists public.inner_world_artifacts
  add constraint inner_world_artifacts_status_check
  check (status in ('queued', 'rendering', 'ready', 'failed', 'draft', 'active', 'archived'));