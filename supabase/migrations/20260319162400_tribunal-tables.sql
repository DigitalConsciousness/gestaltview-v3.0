-- Source: supabase_schema.zip/supabase/migrations/20260319162400_tribunal-tables.sql
-- Canonicalized filename: 20260319162400_tribunal-tables.sql

-- GestaltView v2 — Tribunal tables additive migration
-- © 2026 Keith Soyka / GestaltView
--
-- This migration ONLY adds what is new on top of 20260311162044_new-migration.sql:
--   • tribunal_events table
--   • tribunal_evidence table
--   • gen_random_uuid() defaults on processing_runs.run_id + documents.document_id
--   • indexes, RLS, and public-read policies for the two new tables
--
-- Safe to run against a live DB — all statements are additive / idempotent.
-- Does NOT introduce a gestaltview schema or change search_path.
-- Tables remain in public schema to match existing API RPC calls.

-- ─── Tribunal Events ─────────────────────────────────────────────────────────

create table if not exists tribunal_events (
  id              uuid        primary key default gen_random_uuid(),
  question        text        not null,
  candidate_answers jsonb     not null default '[]'::jsonb,
  winning_answer_id text,
  verdict_summary text,
  triggering_agent text,
  created_at      timestamptz not null default now()
);

-- ─── Tribunal Evidence ───────────────────────────────────────────────────────

create table if not exists tribunal_evidence (
  id                  uuid    primary key default gen_random_uuid(),
  tribunal_event_id   uuid    not null references tribunal_events(id) on delete cascade,
  document_id         uuid,
  fragment_id         uuid,
  weight              numeric(5,4) not null default 1.0,
  comment             text,
  created_at          timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists tribunal_events_created_idx
  on tribunal_events (created_at desc);

create index if not exists tribunal_evidence_event_idx
  on tribunal_evidence (tribunal_event_id);

-- ─── gen_random_uuid() defaults (safe — only applies if column has no default)
-- These are no-ops if the defaults are already set on the live DB.
-- Supabase does not error on ALTER COLUMN SET DEFAULT when the default already matches.

alter table processing_runs
  alter column run_id set default gen_random_uuid();

alter table documents
  alter column document_id set default gen_random_uuid();

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table tribunal_events  enable row level security;
alter table tribunal_evidence enable row level security;

-- ─── Policies ────────────────────────────────────────────────────────────────
-- Using the safe DO $$ if not exists pattern (matches existing migration style).

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tribunal_events'
      and policyname = 'Public read tribunal events'
  ) then
    create policy "Public read tribunal events"
      on tribunal_events
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tribunal_evidence'
      and policyname = 'Public read tribunal evidence'
  ) then
    create policy "Public read tribunal evidence"
      on tribunal_evidence
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tribunal_events'
      and policyname = 'Service role full access tribunal events'
  ) then
    create policy "Service role full access tribunal events"
      on tribunal_events
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tribunal_evidence'
      and policyname = 'Service role full access tribunal evidence'
  ) then
    create policy "Service role full access tribunal evidence"
      on tribunal_evidence
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;
