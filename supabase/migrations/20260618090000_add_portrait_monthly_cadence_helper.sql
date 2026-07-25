create or replace function public.maybe_queue_portrait_cadence(
  p_user_id uuid,
  p_priority integer default 1
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
    and status <> 'archived'
  order by version desc
  limit 1;

  if v_last_portrait_created_at is null then
    return false;
  end if;

  if v_last_portrait_created_at >= date_trunc('month', now()) then
    return false;
  end if;

  insert into public.portrait_inference_queue (user_id, triggered_by, priority)
  values (p_user_id, 'cadence', greatest(coalesce(p_priority, 1), 1))
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;
  return v_rows_inserted > 0;
end;
$$;

grant execute on function public.maybe_queue_portrait_cadence(uuid, integer) to authenticated;
grant execute on function public.maybe_queue_portrait_cadence(uuid, integer) to service_role;
