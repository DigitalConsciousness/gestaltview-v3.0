create or replace function public.get_current_portrait_version(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce(max(version), 0)
  from public.profile_portraits
  where user_id = p_user_id
    and status <> 'archived';
$$;

create or replace function public.get_portrait_signal_count(p_user_id uuid)
returns table (
  memory_entry_count integer,
  bucket_drop_count integer,
  fragment_count integer,
  gravity_report_count integer,
  agent_memory_count integer,
  total_count integer
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_fragment_count integer := 0;
  v_gravity_report_count integer := 0;
  v_agent_memory_count integer := 0;
  v_founder_context_count integer := 0;
begin
  select count(*)::integer
    into memory_entry_count
  from public.memory_entries
  where user_id = p_user_id::text;

  select count(*)::integer
    into bucket_drop_count
  from public.bucket_drops
  where user_id = p_user_id::text;

  if to_regclass('public.knowledge_fragments') is not null then
    select count(*)::integer
      into v_fragment_count
    from public.knowledge_fragments fragments
    where coalesce(
      to_jsonb(fragments)->>'created_by',
      to_jsonb(fragments)->>'auth_user_id',
      to_jsonb(fragments)->>'user_id'
    ) = p_user_id::text;
  end if;

  -- gravity_reports and agent_memories are not part of the canonical
  -- migration schema. Keep their contribution at zero until those tables
  -- receive explicit contracts and ownership columns.

  if to_regclass('public.founder_context') is not null then
    select count(*)::integer
      into v_founder_context_count
    from public.founder_context
    where user_id = p_user_id;
  end if;

  total_count :=
    memory_entry_count +
    bucket_drop_count +
    v_fragment_count +
    v_gravity_report_count +
    v_agent_memory_count +
    v_founder_context_count;

  fragment_count := v_fragment_count;
  gravity_report_count := v_gravity_report_count;
  agent_memory_count := v_agent_memory_count;

  return next;
end;
$$;

create or replace function public.maybe_queue_portrait_inference(
  p_user_id uuid,
  p_threshold integer default 50
)
returns boolean
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_existing_queue_count integer := 0;
  v_last_portrait_created_at timestamptz;
  v_records_since_last integer := 0;
  v_rows_inserted integer := 0;
begin
  if p_user_id is null then
    return false;
  end if;

  select count(*)::integer
    into v_existing_queue_count
  from public.portrait_inference_queue
  where user_id = p_user_id
    and status in ('queued', 'processing');

  if v_existing_queue_count > 0 then
    return false;
  end if;

  select created_at
    into v_last_portrait_created_at
  from public.profile_portraits
  where user_id = p_user_id
  order by version desc
  limit 1;

  select
    coalesce((
      select count(*)::integer
      from public.memory_entries
      where user_id = p_user_id::text
        and created_at > coalesce(v_last_portrait_created_at, timestamptz '1970-01-01')
    ), 0) +
    coalesce((
      select count(*)::integer
      from public.bucket_drops
      where user_id = p_user_id::text
        and created_at > coalesce(v_last_portrait_created_at, timestamptz '1970-01-01')
    ), 0)
    into v_records_since_last;

  if v_records_since_last < p_threshold then
    return false;
  end if;

  insert into public.portrait_inference_queue (user_id, triggered_by, priority)
  values (p_user_id, 'threshold', 5)
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;
  return v_rows_inserted > 0;
end;
$$;

grant execute on function public.get_current_portrait_version(uuid) to authenticated;
grant execute on function public.get_current_portrait_version(uuid) to service_role;
grant execute on function public.get_portrait_signal_count(uuid) to authenticated;
grant execute on function public.get_portrait_signal_count(uuid) to service_role;
grant execute on function public.maybe_queue_portrait_inference(uuid, integer) to authenticated;
grant execute on function public.maybe_queue_portrait_inference(uuid, integer) to service_role;
