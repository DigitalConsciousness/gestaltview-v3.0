-- Source: live schema drift reconciliation
-- Purpose: Backfill runtime tables that the live DB contract report marked missing.
-- This migration is idempotent so it can be applied safely on branches that already
-- have the earlier source migrations.

-- ─────────────────────────────────────────────────────────────────────────────
-- Session rate limits
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.session_rate_limits (
  session_id text primary key,
  query_count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists session_rate_limits_window_start_idx
  on public.session_rate_limits (window_start);

alter table if exists public.session_rate_limits
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'session_rate_limits'
      and policyname = 'Service role full access session_rate_limits'
  ) then
    create policy "Service role full access session_rate_limits"
      on public.session_rate_limits
      for all to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists session_rate_limits_updated_at on public.session_rate_limits;
create trigger session_rate_limits_updated_at
  before update on public.session_rate_limits
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Legacy commerce leaf tables retained by the repo contract
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_notes_order_id_idx
  on public.order_notes (order_id);

alter table if exists public.order_notes
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_notes'
      and policyname = 'Service role full access order_notes'
  ) then
    create policy "Service role full access order_notes"
      on public.order_notes
      for all to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists uploads_order_id_idx
  on public.uploads (order_id);

alter table if exists public.uploads
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'uploads'
      and policyname = 'Service role full access uploads'
  ) then
    create policy "Service role full access uploads"
      on public.uploads
      for all to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  zip_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists deliverables_order_id_idx
  on public.deliverables (order_id);

alter table if exists public.deliverables
  enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deliverables'
      and policyname = 'Public read deliverables'
  ) then
    create policy "Public read deliverables"
      on public.deliverables
      for select to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deliverables'
      and policyname = 'Service role full access deliverables'
  ) then
    create policy "Service role full access deliverables"
      on public.deliverables
      for all to service_role
      using (true)
      with check (true);
  end if;
end
$$;
