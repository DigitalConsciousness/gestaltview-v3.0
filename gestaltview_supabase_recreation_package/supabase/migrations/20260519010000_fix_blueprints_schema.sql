-- Source: supabase_schema.zip/supabase/migrations/20260519010000_fix_blueprints_schema.sql
-- Canonicalized filename: 20260519010000_fix_blueprints_schema.sql

create extension if not exists pgcrypto;

alter table if exists public.blueprints
  add column if not exists updated_at timestamptz not null default now();

update public.blueprints
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

do $$
declare
  constraint_name text;
begin
  select c.conname
  into constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'blueprints'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%status%'
    and pg_get_constraintdef(c.oid) ilike '%pending%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.blueprints drop constraint %I', constraint_name);
  end if;
end $$;

alter table if exists public.blueprints
  alter column status set default 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'blueprints'
      and c.conname = 'blueprints_status_check'
  ) then
    alter table public.blueprints
      add constraint blueprints_status_check
      check (status in ('draft', 'ready', 'exported'));
  end if;
end $$;

drop trigger if exists trg_blueprints_set_updated_at on public.blueprints;
create trigger trg_blueprints_set_updated_at
before update on public.blueprints
for each row
execute function public.set_user_content_updated_at();
