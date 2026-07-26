\set ON_ERROR_STOP on

do $$
begin
  if (select status <> 'ready' from public.render_jobs where graph_id = 'fixture-v1') then
    raise exception 'completed fixture job was not mapped to ready';
  end if;

  if (
    select
      mime_type <> 'text/html; charset=utf-8'
      or byte_size <> 12
      or storage_bucket <> 'codex-exports'
      or target_status <> 'success'
    from public.render_artifacts
    where id = '33333333-3333-4333-8333-333333333333'
  ) then
    raise exception 'legacy artifact receipt fields were not reconciled';
  end if;

  if not exists (
    select 1
    from public.inner_world_artifacts
    where id = '44444444-4444-4444-8444-444444444444'
      and source_ref = 'legacy:fixture'
  ) then
    raise exception 'legacy Inner World artifact was not preserved';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'render_jobs_user_idempotency_key_uidx'
      and indexdef like 'CREATE UNIQUE INDEX%'
  ) then
    raise exception 'render job idempotency index is absent or not unique';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'inner_world_render_projection_uidx'
      and indexdef like 'CREATE UNIQUE INDEX%'
  ) then
    raise exception 'render projection idempotency index is absent or not unique';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('render_jobs', 'render_artifacts', 'inner_world_artifacts')
      and not c.relrowsecurity
  ) then
    raise exception 'RLS was disabled on a protected table';
  end if;

  if (select public from storage.buckets where id = 'codex-exports') then
    raise exception 'codex-exports became public';
  end if;
end
$$;

select
  'render_pipeline_v2_reconciliation_passed' as result,
  (select count(*) from public.render_jobs) as preserved_jobs,
  (select count(*) from public.render_artifacts) as preserved_render_artifacts,
  (select count(*) from public.inner_world_artifacts) as preserved_inner_world_artifacts;
