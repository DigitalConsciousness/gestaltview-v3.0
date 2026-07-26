-- Emergency recovery for the exact schema produced by
-- 20260726132511_render_pipeline_v2_live_reconciliation.sql.
--
-- This is intentionally not part of migration history and must not be run
-- after v2 render data exists without an approved data-preservation plan.

begin;

drop index if exists public.inner_world_render_projection_uidx;
drop index if exists public.render_artifacts_user_target_created_idx;
drop index if exists public.render_artifacts_job_user_created_idx;
drop index if exists public.render_jobs_user_status_updated_idx;
drop index if exists public.render_jobs_user_idempotency_key_uidx;

alter table public.render_artifacts
  drop constraint if exists render_artifacts_target_status_check,
  drop column if exists target_status,
  drop column if exists content_hash,
  drop column if exists byte_size,
  drop column if exists storage_path,
  drop column if exists storage_bucket,
  drop column if exists mime_type;

alter table public.render_jobs
  drop constraint if exists render_jobs_targets_array_check,
  drop constraint if exists render_jobs_status_check;

update public.render_jobs
set status = 'completed'
where status = 'ready';

update public.render_jobs
set status = 'failed'
where status in ('validating', 'storing');

alter table public.render_jobs
  add constraint render_jobs_status_check
  check (
    status = any (
      array[
        'queued'::text,
        'rendering'::text,
        'completed'::text,
        'failed'::text,
        'cancelled'::text
      ]
    )
  ),
  drop column if exists request_version,
  drop column if exists idempotency_key,
  drop column if exists targets,
  drop column if exists source_id,
  drop column if exists source_family;

notify pgrst, 'reload schema';

commit;
