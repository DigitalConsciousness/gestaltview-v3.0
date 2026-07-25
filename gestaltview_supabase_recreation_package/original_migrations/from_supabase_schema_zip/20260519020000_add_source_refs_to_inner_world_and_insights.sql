create extension if not exists pgcrypto;

alter table if exists public.user_files
  add column if not exists source_ref text;

alter table if exists public.inner_world_artifacts
  add column if not exists source_ref text,
  add column if not exists source_file_ref text;

alter table if exists public.insights
  add column if not exists source_ref text,
  add column if not exists title text not null default '',
  add column if not exists preview text not null default '',
  add column if not exists session_origin text,
  add column if not exists highlighted_text text,
  add column if not exists linked_orb_ids text[] not null default '{}'::text[],
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

update public.user_files
set source_ref = coalesce(source_ref, id::text)
where source_ref is null;

update public.inner_world_artifacts
set source_ref = coalesce(source_ref, id::text),
    source_file_ref = coalesce(source_file_ref, source_file_id::text)
where source_ref is null
   or source_file_ref is null;

update public.insights
set source_ref = coalesce(source_ref, id::text)
where source_ref is null;

create unique index if not exists user_files_source_ref_key
  on public.user_files (source_ref);
create unique index if not exists inner_world_artifacts_source_ref_key
  on public.inner_world_artifacts (source_ref);
create unique index if not exists insights_source_ref_key
  on public.insights (source_ref);

create index if not exists inner_world_artifacts_source_file_ref_idx
  on public.inner_world_artifacts (source_file_ref);
create index if not exists insights_user_id_updated_at_idx
  on public.insights (user_id, updated_at desc);
create index if not exists insights_status_updated_at_idx
  on public.insights (status, updated_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inner_world_artifacts_source_file_ref_fkey'
  ) then
    alter table public.inner_world_artifacts
      add constraint inner_world_artifacts_source_file_ref_fkey
      foreign key (source_file_ref)
      references public.user_files(source_ref)
      on delete set null;
  end if;
end $$;

drop trigger if exists trg_insights_set_updated_at on public.insights;
create trigger trg_insights_set_updated_at
before update on public.insights
for each row
execute function public.set_user_content_updated_at();
