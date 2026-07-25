-- Source: supabase_schema.zip/supabase/migrations/20260509000000_embodiment_governance_persistence.sql
-- Canonicalized filename: 20260509000000_embodiment_governance_persistence.sql

create extension if not exists pgcrypto;

create table if not exists public.embodiment_mutation_proposals (
  id uuid primary key default gen_random_uuid(),
  agent_slug text not null,
  target_path text not null,
  current_value jsonb not null default 'null'::jsonb,
  proposed_value jsonb not null default 'null'::jsonb,
  mutation_class text not null,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  status text not null default 'proposed' check (
    status in ('proposed', 'under_review', 'approved', 'rejected', 'applied', 'rolled_back')
  ),
  submitted_by uuid null references auth.users(id) on delete set null,
  reviewed_by uuid null references auth.users(id) on delete set null,
  review_notes text null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null
);

create table if not exists public.embodiment_review_log (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.embodiment_mutation_proposals(id) on delete cascade,
  agent_slug text not null,
  review_decision text not null check (review_decision in ('approved', 'rejected', 'needs_changes', 'rolled_back')),
  review_notes text null,
  reviewed_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.embodiment_readiness_scores (
  id uuid primary key default gen_random_uuid(),
  agent_slug text not null,
  readiness_score numeric(5,4) not null check (readiness_score >= 0 and readiness_score <= 1),
  readiness_source text not null default 'manual',
  readiness_rationale text null,
  recorded_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists embodiment_mutation_proposals_agent_slug_idx
  on public.embodiment_mutation_proposals (agent_slug, status, created_at desc);

create index if not exists embodiment_mutation_proposals_review_queue_idx
  on public.embodiment_mutation_proposals (status, risk_level, created_at desc);

create index if not exists embodiment_review_log_agent_slug_idx
  on public.embodiment_review_log (agent_slug, created_at desc);

create index if not exists embodiment_review_log_proposal_id_idx
  on public.embodiment_review_log (proposal_id, created_at desc);

create index if not exists embodiment_readiness_scores_agent_slug_idx
  on public.embodiment_readiness_scores (agent_slug, created_at desc);

alter table if exists public.embodiment_mutation_proposals enable row level security;
alter table if exists public.embodiment_review_log enable row level security;
alter table if exists public.embodiment_readiness_scores enable row level security;

create or replace function public.is_founder_admin_user(candidate uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = candidate
      and u.is_admin = true
  );
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_mutation_proposals'
      and policyname = 'service role full access embodiment_mutation_proposals'
  ) then
    create policy "service role full access embodiment_mutation_proposals"
      on public.embodiment_mutation_proposals
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_mutation_proposals'
      and policyname = 'authenticated review own embodiment_mutation_proposals'
  ) then
    create policy "authenticated review own embodiment_mutation_proposals"
      on public.embodiment_mutation_proposals
      for select
      to authenticated
      using (submitted_by = auth.uid() or public.is_founder_admin_user(auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_mutation_proposals'
      and policyname = 'authenticated submit embodiment_mutation_proposals'
  ) then
    create policy "authenticated submit embodiment_mutation_proposals"
      on public.embodiment_mutation_proposals
      for insert
      to authenticated
      with check (submitted_by = auth.uid() or submitted_by is null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_mutation_proposals'
      and policyname = 'founder review embodiment_mutation_proposals'
  ) then
    create policy "founder review embodiment_mutation_proposals"
      on public.embodiment_mutation_proposals
      for update
      to authenticated
      using (public.is_founder_admin_user(auth.uid()))
      with check (public.is_founder_admin_user(auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_review_log'
      and policyname = 'service role full access embodiment_review_log'
  ) then
    create policy "service role full access embodiment_review_log"
      on public.embodiment_review_log
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_review_log'
      and policyname = 'founder review embodiment_review_log'
  ) then
    create policy "founder review embodiment_review_log"
      on public.embodiment_review_log
      for all
      to authenticated
      using (public.is_founder_admin_user(auth.uid()))
      with check (public.is_founder_admin_user(auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_readiness_scores'
      and policyname = 'service role full access embodiment_readiness_scores'
  ) then
    create policy "service role full access embodiment_readiness_scores"
      on public.embodiment_readiness_scores
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'embodiment_readiness_scores'
      and policyname = 'authenticated manage embodiment_readiness_scores'
  ) then
    create policy "authenticated manage embodiment_readiness_scores"
      on public.embodiment_readiness_scores
      for all
      to authenticated
      using (recorded_by = auth.uid() or public.is_founder_admin_user(auth.uid()))
      with check (recorded_by = auth.uid() or public.is_founder_admin_user(auth.uid()));
  end if;
end $$;
