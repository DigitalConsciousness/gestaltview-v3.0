create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  features jsonb not null default '{}'::jsonb,
  price_monthly integer null,
  price_annual integer null,
  seat_limit integer null,
  fragment_limit integer null,
  memory_limit integer null,
  query_limit integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint tiers_name_check
    check (name in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE'))
);

create table if not exists public.kit_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique null references auth.users(id) on delete set null,
  email text not null,
  tier text not null default 'STUDIO',
  plk_profile_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint kit_users_tier_check
    check (tier in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE'))
);

create index if not exists kit_users_auth_user_id_idx
  on public.kit_users(auth_user_id)
  where deleted_at is null;

create index if not exists kit_users_tier_idx
  on public.kit_users(tier)
  where deleted_at is null;

drop trigger if exists set_tiers_updated_at on public.tiers;
create trigger set_tiers_updated_at
before update on public.tiers
for each row execute function public.set_updated_at();

drop trigger if exists set_kit_users_updated_at on public.kit_users;
create trigger set_kit_users_updated_at
before update on public.kit_users
for each row execute function public.set_updated_at();

insert into public.tiers (
  name,
  features,
  price_monthly,
  price_annual,
  seat_limit,
  fragment_limit,
  memory_limit,
  query_limit
)
values
  (
    'SOLO_SPARK',
    '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": false, "memoryViewer": true, "multiUser": false, "customDomainPreset": false, "apiAccess": false}'::jsonb,
    null,
    49,
    1,
    100,
    50,
    500
  ),
  (
    'STUDIO',
    '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": false}'::jsonb,
    149,
    999,
    5,
    1000,
    500,
    5000
  ),
  (
    'GROWTH',
    '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": true}'::jsonb,
    449,
    3499,
    25,
    10000,
    5000,
    50000
  ),
  (
    'ENTERPRISE',
    '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": true}'::jsonb,
    null,
    null,
    null,
    null,
    null,
    null
  )
on conflict (name) do update
set
  features = excluded.features,
  price_monthly = excluded.price_monthly,
  price_annual = excluded.price_annual,
  seat_limit = excluded.seat_limit,
  fragment_limit = excluded.fragment_limit,
  memory_limit = excluded.memory_limit,
  query_limit = excluded.query_limit,
  updated_at = now();
