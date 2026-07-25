create extension if not exists pgcrypto;

create table if not exists public.profile_portraits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null default 1,
  portrait_title text not null,
  tagline text not null,
  overall_confidence numeric(4,3) not null default 0
    check (overall_confidence >= 0 and overall_confidence <= 1),
  source_window_start timestamptz not null,
  source_window_end timestamptz not null,
  total_source_records integer not null default 0,
  plk_resonance_score numeric(4,3)
    check (plk_resonance_score >= 0 and plk_resonance_score <= 1),
  delta_from_previous text,
  inference_triggered_by text not null default 'cadence'
    check (inference_triggered_by in ('cadence', 'threshold', 'manual')),
  inference_run_id uuid not null,
  status text not null default 'pending'
    check (status in ('pending', 'validated', 'rendered', 'archived')),
  room_slug text,
  validated_at timestamptz,
  rendered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, version)
);

create table if not exists public.portrait_dimensions (
  id uuid primary key default gen_random_uuid(),
  portrait_id uuid not null references public.profile_portraits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (
    kind in (
      'cognitive_style',
      'linguistic_signature',
      'energy_rhythm',
      'capture_behavior',
      'synthesis_readiness',
      'emotional_texture',
      'identity_anchors',
      'growth_edges',
      'relational_patterns',
      'creative_mode'
    )
  ),
  label text not null,
  summary text not null,
  confidence numeric(4,3) not null default 0
    check (confidence >= 0 and confidence <= 1),
  evidence_count integer not null default 0,
  signal_sources text[] not null default '{}'::text[],
  metaphor_family text[] not null default '{}'::text[],
  raw_quotes text[] not null default '{}'::text[],
  delta text,
  created_at timestamptz not null default now(),
  unique (portrait_id, kind)
);

create index if not exists profile_portraits_user_id_idx
  on public.profile_portraits (user_id);

create index if not exists profile_portraits_user_version_idx
  on public.profile_portraits (user_id, version desc);

create index if not exists profile_portraits_status_idx
  on public.profile_portraits (status);

create index if not exists profile_portraits_created_at_idx
  on public.profile_portraits (created_at desc);

create index if not exists portrait_dimensions_portrait_id_idx
  on public.portrait_dimensions (portrait_id);

create index if not exists portrait_dimensions_user_id_idx
  on public.portrait_dimensions (user_id);

create index if not exists portrait_dimensions_kind_idx
  on public.portrait_dimensions (kind);

alter table public.profile_portraits enable row level security;
alter table public.portrait_dimensions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_portraits'
      and policyname = 'Users can read own portraits'
  ) then
    create policy "Users can read own portraits"
      on public.profile_portraits
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_portraits'
      and policyname = 'Service role manages portraits'
  ) then
    create policy "Service role manages portraits"
      on public.profile_portraits
      for all
      to service_role
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_dimensions'
      and policyname = 'Users can read own portrait dimensions'
  ) then
    create policy "Users can read own portrait dimensions"
      on public.portrait_dimensions
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'portrait_dimensions'
      and policyname = 'Service role manages portrait dimensions'
  ) then
    create policy "Service role manages portrait dimensions"
      on public.portrait_dimensions
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create or replace function public.set_profile_portraits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profile_portraits_set_updated_at'
  ) then
    create trigger profile_portraits_set_updated_at
      before update on public.profile_portraits
      for each row execute function public.set_profile_portraits_updated_at();
  end if;
end
$$;
