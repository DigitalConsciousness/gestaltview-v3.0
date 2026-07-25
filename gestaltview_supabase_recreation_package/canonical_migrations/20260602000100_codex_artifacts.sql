-- Source: supabase_schema.zip/supabase/migrations/20260602000100_codex_artifacts.sql
-- Canonicalized filename: 20260602000100_codex_artifacts.sql

create table if not exists codex_artifacts (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'codex.v1',
  kind text not null,
  title text not null,
  slug text not null,
  user_id uuid not null references auth.users(id),
  workspace_id uuid,
  security_class text not null default 'private',
  template_key text not null,
  template_version text not null,
  body jsonb not null,
  provenance jsonb not null default '[]'::jsonb,
  source_ids jsonb not null default '[]'::jsonb,
  exports jsonb not null default '[]'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint codex_artifacts_contract_version_check check (contract_version = 'codex.v1'),
  constraint codex_artifacts_kind_check check (kind in (
    'session_recap',
    'blueprint',
    'report_document',
    'mind_map',
    'share_card',
    'code_module',
    'spatial_scene',
    'audio_narration'
  )),
  constraint codex_artifacts_security_class_check check (security_class in ('private', 'workspace', 'public')),
  constraint codex_artifacts_status_check check (status in ('draft', 'rendering', 'ready', 'failed', 'archived'))
);

create table if not exists codex_jobs (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references codex_artifacts(id) on delete cascade,
  format text not null,
  status text not null default 'pending',
  storage_path text,
  error text,
  retry_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint codex_jobs_format_check check (format in ('html', 'pdf', 'png', 'mp3', 'wav', 'gltf', 'json', 'zip')),
  constraint codex_jobs_status_check check (status in ('pending', 'running', 'ready', 'failed', 'pending_retry'))
);

create index if not exists codex_artifacts_user_created_idx
  on codex_artifacts (user_id, created_at desc);

create index if not exists codex_artifacts_workspace_created_idx
  on codex_artifacts (workspace_id, created_at desc)
  where workspace_id is not null;

create index if not exists codex_jobs_artifact_status_idx
  on codex_jobs (artifact_id, status, created_at desc);

alter table codex_artifacts enable row level security;
alter table codex_jobs enable row level security;

drop policy if exists "users_select_own_codex_artifacts" on codex_artifacts;
create policy "users_select_own_codex_artifacts"
  on codex_artifacts for select
  using ((select auth.uid()) = user_id);

drop policy if exists "users_insert_own_codex_artifacts" on codex_artifacts;
create policy "users_insert_own_codex_artifacts"
  on codex_artifacts for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "users_update_own_codex_artifacts" on codex_artifacts;
create policy "users_update_own_codex_artifacts"
  on codex_artifacts for update
  using ((select auth.uid()) = user_id);

drop policy if exists "users_select_own_codex_jobs" on codex_jobs;
create policy "users_select_own_codex_jobs"
  on codex_jobs for select
  using (
    exists (
      select 1
      from codex_artifacts
      where codex_artifacts.id = codex_jobs.artifact_id
        and codex_artifacts.user_id = (select auth.uid())
    )
  );
