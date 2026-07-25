create extension if not exists pgcrypto;

create table if not exists public.embodiment_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  public_name text not null,
  internal_designation text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'founder-only', 'experimental', 'archived')),
  visibility_scope text not null default 'founder-only'
    check (visibility_scope in ('public', 'founder-only', 'enterprise', 'experimental')),
  profile_json jsonb not null default '{}',
  readiness_score numeric(4,3) default 0,
  founder_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_embodiment_profiles_updated_at on public.embodiment_profiles;
create trigger set_embodiment_profiles_updated_at
  before update on public.embodiment_profiles
  for each row execute procedure public.set_updated_at();

alter table public.embodiment_profiles enable row level security;

create table if not exists public.embodiment_training_runs (
  id uuid primary key default gen_random_uuid(),
  embodiment_profile_id uuid not null references public.embodiment_profiles(id) on delete cascade,
  run_type text not null
    check (run_type in ('conversation', 'mutation_proposal', 'corpus_link', 'export', 'manual_edit')),
  input_snapshot jsonb,
  output_snapshot jsonb,
  accepted boolean default null,
  founder_notes text,
  created_at timestamptz not null default now()
);

alter table public.embodiment_training_runs enable row level security;
