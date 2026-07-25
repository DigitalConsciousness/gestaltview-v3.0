-- Source: supabase_schema.zip/supabase/migrations/20260410_200000_resolve_legacy_tables_rls.sql
-- Canonicalized filename: 20260410200000_resolve_legacy_tables_rls.sql

-- ============================================================
-- GestaltView v2 — Migration
-- 20260410_200000_resolve_legacy_tables_rls.sql
--
-- 1. Safely deprecate legacy (non-gate_) commerce tables
-- 2. Enable RLS + add policies on all remaining tables
--
-- Run AFTER confirming no live production data in legacy tables.
-- Legacy tables are renamed to _deprecated_* (NOT dropped) so
-- you can verify and manually drop when ready.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION 1: DEPRECATE LEGACY COMMERCE TABLES
-- gate_* tables are canonical. Legacy tables are renamed.
-- ─────────────────────────────────────────────────────────────

do $$
declare
  legacy_buyers_count     integer;
  legacy_orders_count     integer;
  legacy_drafts_count     integer;
begin
  -- Count rows in legacy tables before renaming
  select count(*) into legacy_buyers_count     from public.buyers;
  select count(*) into legacy_orders_count     from public.orders;
  select count(*) into legacy_drafts_count     from public.package_drafts;

  if legacy_buyers_count > 0 or legacy_orders_count > 0 or legacy_drafts_count > 0 then
    raise notice '⚠️  Legacy commerce tables have rows: buyers=%, orders=%, package_drafts=%. '
                 'Review data before dropping. Tables will still be renamed.',
                 legacy_buyers_count, legacy_orders_count, legacy_drafts_count;
  else
    raise notice '✅ Legacy commerce tables are empty. Safe to rename.';
  end if;
end
$$;

-- Rename legacy commerce tables to _deprecated_ prefix
-- FK constraints referencing these tables are preserved on the renamed tables.
alter table if exists public.artifacts          rename to _deprecated_artifacts;
alter table if exists public.build_jobs         rename to _deprecated_build_jobs;
alter table if exists public.order_items        rename to _deprecated_order_items;
alter table if exists public.orders             rename to _deprecated_orders;
alter table if exists public.package_drafts     rename to _deprecated_package_drafts;
alter table if exists public.buyers             rename to _deprecated_buyers;
alter table if exists public.support_requests   rename to _deprecated_support_requests;


-- ─────────────────────────────────────────────────────────────
-- SECTION 2: ROW LEVEL SECURITY
-- Policy naming convention: "[role] [permission] [table]"
-- All API calls use service_role key — that role bypasses RLS
-- by default in Supabase, but we set explicit policies anyway
-- for clarity and forward-compatibility.
-- ─────────────────────────────────────────────────────────────

-- Helper: idempotent RLS enablement and policy creation
-- We use DO blocks per table group for clarity.


-- ── AGENT TRAINER CORE ───────────────────────────────────────

alter table public.agents                 enable row level security;
alter table public.agent_versions         enable row level security;
alter table public.training_runs          enable row level security;
alter table public.training_steps         enable row level security;
alter table public.trainer_jobs           enable row level security;
alter table public.approvals              enable row level security;
alter table public.deployment_artifacts   enable row level security;
alter table public.eval_results           enable row level security;
alter table public.eval_rubrics           enable row level security;
alter table public.scenario_sets          enable row level security;
alter table public.scenarios              enable row level security;
alter table public.model_providers        enable row level security;
alter table public.models                 enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'agents', 'agent_versions', 'training_runs', 'training_steps',
    'trainer_jobs', 'approvals', 'deployment_artifacts',
    'eval_results', 'eval_rubrics', 'scenario_sets', 'scenarios',
    'model_providers', 'models'
  ] loop
    -- Service role: full access
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = 'service_role full access ' || t
    ) then
      execute format(
        'create policy "service_role full access %I" on public.%I
         for all to service_role using (true) with check (true)',
        t, t
      );
    end if;
    -- Authenticated: read-only (admin/trainer surfaces)
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = 'authenticated read ' || t
    ) then
      execute format(
        'create policy "authenticated read %I" on public.%I
         for select to authenticated using (true)',
        t, t
      );
    end if;
  end loop;
end
$$;


-- ── USER IDENTITY TABLES ─────────────────────────────────────

alter table public.app_users      enable row level security;
alter table public.users          enable row level security;
alter table public.founder_context enable row level security;

-- app_users: service_role full + authenticated can read/insert own
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='app_users' and policyname='service_role full access app_users') then
    create policy "service_role full access app_users" on public.app_users
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='app_users' and policyname='authenticated manage own app_users') then
    create policy "authenticated manage own app_users" on public.app_users
      for all to authenticated
      using (id = auth.uid()::text)
      with check (id = auth.uid()::text);
  end if;
end
$$;

-- users: service_role full + authenticated can read/update own profile
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='service_role full access users') then
    create policy "service_role full access users" on public.users
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='authenticated read own users') then
    create policy "authenticated read own users" on public.users
      for select to authenticated using (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='authenticated update own users') then
    create policy "authenticated update own users" on public.users
      for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
  end if;
end
$$;

-- founder_context: service_role full + authenticated manage own
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='founder_context' and policyname='service_role full access founder_context') then
    create policy "service_role full access founder_context" on public.founder_context
      for all to service_role using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='founder_context' and policyname='authenticated manage own founder_context') then
    create policy "authenticated manage own founder_context" on public.founder_context
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$$;


-- ── USER-FACING ACTIVITY TABLES ──────────────────────────────
-- All use user_id text referencing app_users.id

alter table public.billy_sessions         enable row level security;
alter table public.bucket_drops           enable row level security;
alter table public.consciousness_profiles enable row level security;
alter table public.musical_dna_analyses   enable row level security;
alter table public.tribunal_sessions      enable row level security;
alter table public.memory_entries         enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'billy_sessions', 'bucket_drops', 'consciousness_profiles',
    'musical_dna_analyses', 'tribunal_sessions', 'memory_entries'
  ] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = 'service_role full access ' || t
    ) then
      execute format(
        'create policy "service_role full access %I" on public.%I
         for all to service_role using (true) with check (true)',
        t, t
      );
    end if;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = 'authenticated manage own ' || t
    ) then
      execute format(
        'create policy "authenticated manage own %I" on public.%I
         for all to authenticated
         using (user_id = auth.uid()::text)
         with check (user_id = auth.uid()::text)',
        t, t
      );
    end if;
  end loop;
end
$$;


-- ── TRIBUNAL (shared/public read) ────────────────────────────

alter table public.tribunal_events   enable row level security;
alter table public.tribunal_evidence enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['tribunal_events', 'tribunal_evidence'] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='service_role full access ' || t) then
      execute format('create policy "service_role full access %I" on public.%I for all to service_role using (true) with check (true)', t, t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='authenticated read ' || t) then
      execute format('create policy "authenticated read %I" on public.%I for select to authenticated using (true)', t, t);
    end if;
  end loop;
end
$$;


-- ── KNOWLEDGE / CORPUS TABLES ────────────────────────────────

alter table public.knowledge_fragments  enable row level security;
alter table public.skill_fragments      enable row level security;
alter table public.skills               enable row level security;
alter table public.processing_runs      enable row level security;
alter table public.documents            enable row level security;
alter table public.embeddings           enable row level security;
alter table public.summaries            enable row level security;
alter table public.loom_annotations     enable row level security;
alter table public.concepts             enable row level security;
alter table public.document_concepts    enable row level security;
alter table public.annotation_concepts  enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_fragments', 'skill_fragments', 'skills',
    'processing_runs', 'documents', 'embeddings', 'summaries',
    'loom_annotations', 'concepts', 'document_concepts', 'annotation_concepts'
  ] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='service_role full access ' || t) then
      execute format('create policy "service_role full access %I" on public.%I for all to service_role using (true) with check (true)', t, t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='authenticated read ' || t) then
      execute format('create policy "authenticated read %I" on public.%I for select to authenticated using (true)', t, t);
    end if;
  end loop;
end
$$;


-- ── GATE COMMERCE TABLES ─────────────────────────────────────
-- All write operations are API-driven (service_role).
-- Authenticated users can read their own orders by email match.

alter table public.gate_buyers           enable row level security;
alter table public.gate_package_drafts   enable row level security;
alter table public.gate_orders           enable row level security;
alter table public.gate_order_items      enable row level security;
alter table public.gate_build_jobs       enable row level security;
alter table public.gate_artifacts        enable row level security;
alter table public.gate_support_requests enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'gate_buyers', 'gate_package_drafts', 'gate_orders',
    'gate_order_items', 'gate_build_jobs', 'gate_artifacts',
    'gate_support_requests'
  ] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='service_role full access ' || t) then
      execute format('create policy "service_role full access %I" on public.%I for all to service_role using (true) with check (true)', t, t);
    end if;
  end loop;
end
$$;

-- Authenticated buyers can read their own orders (by email)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gate_orders' and policyname='authenticated read own gate_orders') then
    create policy "authenticated read own gate_orders" on public.gate_orders
      for select to authenticated
      using (customer_email = (select email from public.users where id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='gate_package_drafts' and policyname='authenticated read own gate_package_drafts') then
    create policy "authenticated read own gate_package_drafts" on public.gate_package_drafts
      for select to authenticated
      using (buyer_email = (select email from public.users where id = auth.uid()));
  end if;
end
$$;
