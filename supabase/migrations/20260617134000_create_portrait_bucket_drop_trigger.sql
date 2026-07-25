create or replace function public.check_portrait_threshold_on_bucket_drop()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.user_id is not null and new.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    perform public.maybe_queue_portrait_inference(new.user_id::uuid, 50);
  end if;

  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'bucket_drops'
  ) then
    drop trigger if exists portrait_threshold_check on public.bucket_drops;

    create trigger portrait_threshold_check
      after insert on public.bucket_drops
      for each row
      execute function public.check_portrait_threshold_on_bucket_drop();
  end if;
end
$$;
