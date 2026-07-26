-- Read-only verification for the render pipeline v2 persistence contract.
-- Run with psql against local, preview, or an explicitly approved production
-- connection. This script prints metadata and aggregate counts only.

begin transaction read only;

select
  'required_columns' as verification_section,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'render_jobs' and column_name in (
      'user_id',
      'source_family',
      'source_id',
      'targets',
      'idempotency_key',
      'request_version',
      'status'
    ))
    or
    (table_name = 'render_artifacts' and column_name in (
      'render_job_id',
      'user_id',
      'mime_type',
      'storage_bucket',
      'storage_path',
      'byte_size',
      'content_hash',
      'target_status'
    ))
    or
    (table_name = 'inner_world_artifacts' and column_name in (
      'user_id',
      'source_ref',
      'content_ref'
    ))
  )
order by table_name, ordinal_position;

select
  'status_constraint' as verification_section,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.render_jobs'::regclass
  and conname = 'render_jobs_status_check';

select
  'relevant_indexes' as verification_section,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
from pg_indexes
where schemaname = 'public'
  and tablename in ('render_jobs', 'render_artifacts', 'inner_world_artifacts')
  and (
    indexname like 'render_jobs_user_%'
    or indexname like 'render_artifacts_%'
    or indexname = 'inner_world_render_projection_uidx'
  )
order by tablename, indexname;

select
  'rls_and_policies' as verification_section,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  p.polname as policy_name,
  p.polcmd as policy_command,
  pg_get_expr(p.polqual, p.polrelid) as using_expression,
  pg_get_expr(p.polwithcheck, p.polrelid) as check_expression
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relname in ('render_jobs', 'render_artifacts', 'inner_world_artifacts')
order by c.relname, p.polname;

select
  'null_owners' as verification_section,
  'render_jobs' as table_name,
  count(*) filter (where user_id is null) as null_owner_count
from public.render_jobs
union all
select
  'null_owners',
  'render_artifacts',
  count(*) filter (where user_id is null)
from public.render_artifacts
union all
select
  'null_owners',
  'inner_world_artifacts',
  count(*) filter (where user_id is null)
from public.inner_world_artifacts;

with lifecycle(status) as (
  values
    ('validating'),
    ('queued'),
    ('rendering'),
    ('storing'),
    ('ready'),
    ('failed'),
    ('cancelled')
)
select
  'jobs_by_lifecycle' as verification_section,
  lifecycle.status,
  count(render_jobs.id) as job_count
from lifecycle
left join public.render_jobs on render_jobs.status = lifecycle.status
group by lifecycle.status
order by lifecycle.status;

select
  'incomplete_artifact_receipts' as verification_section,
  count(*) as artifact_count
from public.render_artifacts
where storage_bucket is null
  or storage_bucket = ''
  or storage_path is null
  or storage_path = ''
  or mime_type is null
  or mime_type = ''
  or byte_size is null
  or byte_size <= 0
  or content_hash is null
  or content_hash = '';

select
  'duplicate_render_projections' as verification_section,
  user_id,
  source_ref,
  count(*) as projection_count
from public.inner_world_artifacts
where source_ref like 'render-artifact:%'
group by user_id, source_ref
having count(*) > 1
order by source_ref;

select
  'private_storage_bucket' as verification_section,
  id as bucket_id,
  public as is_public,
  (not public) as is_private
from storage.buckets
where id = 'codex-exports';

commit;
