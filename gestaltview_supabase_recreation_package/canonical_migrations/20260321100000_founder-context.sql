-- Source: supabase_schema.zip/supabase/migrations/20260321100000_founder-context.sql
-- Canonicalized filename: 20260321100000_founder-context.sql

-- GestaltView v2 — Founder session continuity migration
-- © 2026 Keith Soyka / GestaltView
--
-- Adds a founder_context table so Billy can recognize Keith across sessions,
-- preserve mode preference, hold a continuity thread, and keep the highest-
-- fidelity founder PLK snapshot available at bootstrap.

create table if not exists founder_context (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plk_snapshot jsonb not null default '{}'::jsonb,
  current_state text,
  mode_preference text not null default 'synthesis' check (mode_preference in ('synthesis', 'chat')),
  last_session_at timestamptz,
  session_thread text,
  confirmed_adult boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists founder_context_last_session_idx on founder_context (last_session_at desc);

alter table founder_context enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'founder_context' and policyname = 'Service role full access founder_context'
  ) then
    create policy "Service role full access founder_context"
      on founder_context for all to service_role
      using (true) with check (true);
  end if;
end $$;
