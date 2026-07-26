\set ON_ERROR_STOP on

do $$
begin
  if (select status <> 'completed' from public.render_jobs where graph_id = 'fixture-v1') then
    raise exception 'ready fixture job was not restored to completed';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'render_jobs'
      and column_name in (
        'source_family',
        'source_id',
        'targets',
        'idempotency_key',
        'request_version'
      )
  ) then
    raise exception 'v2 render job columns remain after recovery';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'render_artifacts'
      and column_name in (
        'mime_type',
        'storage_bucket',
        'storage_path',
        'byte_size',
        'content_hash',
        'target_status'
      )
  ) then
    raise exception 'v2 render artifact columns remain after recovery';
  end if;

  if not exists (
    select 1
    from public.inner_world_artifacts
    where id = '44444444-4444-4444-8444-444444444444'
  ) then
    raise exception 'legacy Inner World artifact was not preserved by recovery';
  end if;
end
$$;

select
  'render_pipeline_v2_recovery_passed' as result,
  (select count(*) from public.render_jobs) as preserved_jobs,
  (select count(*) from public.render_artifacts) as preserved_render_artifacts,
  (select count(*) from public.inner_world_artifacts) as preserved_inner_world_artifacts;
