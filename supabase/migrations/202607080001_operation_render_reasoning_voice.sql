-- Operation Render + Reasoning + Voice + Field Continuity
-- Date: 2026-07-07
-- Purpose: schema scaffold for runtime visual audits, embodiment reasoning/tool-use, visible reasoning traces, voice profiles, and mobile field continuity.

create extension if not exists vector with schema extensions;

create table if not exists public.operation_render_audits (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  component_path text,
  audit_kind text not null check (audit_kind in ('visual', 'accessibility', 'dependency', 'performance', 'render')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'passed', 'failed', 'waived')),
  findings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.embodiment_reasoning_policies (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null unique,
  default_depth text not null default 'standard' check (default_depth in ('quick', 'standard', 'deep', 'forensic')),
  can_browse boolean not null default false,
  can_use_repo_tools boolean not null default false,
  can_use_supabase_tools boolean not null default false,
  can_use_huggingface_tools boolean not null default false,
  tool_permission text not null default 'read_only'
    check (tool_permission in ('none', 'read_only', 'bounded_write', 'explicit_confirm_write')),
  citation_mode text not null default 'when_factual'
    check (citation_mode in ('none', 'when_factual', 'always_when_external')),
  uncertainty_mode text not null default 'explicit'
    check (uncertainty_mode in ('quiet', 'explicit', 'forensic')),
  safety_notes text[] not null default array[]::text[],
  room_context_biases text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reasoning_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_slug text,
  room_slug text,
  user_id uuid,
  request_kind text not null default 'chat',
  reasoning_depth text not null default 'standard',
  visible_summary text,
  assumptions jsonb not null default '[]'::jsonb,
  uncertainty jsonb not null default '[]'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_call_audit (
  id uuid primary key default gen_random_uuid(),
  reasoning_session_id uuid references public.reasoning_sessions(id) on delete set null,
  profile_slug text,
  tool_class text not null,
  tool_name text not null,
  permission_level text not null default 'read_only',
  input_summary text,
  output_summary text,
  source_refs jsonb not null default '[]'::jsonb,
  status text not null default 'success' check (status in ('success', 'failed', 'blocked', 'skipped')),
  error_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.visible_reasoning_cards (
  id uuid primary key default gen_random_uuid(),
  reasoning_session_id uuid not null references public.reasoning_sessions(id) on delete cascade,
  card_type text not null check (card_type in ('evidence', 'tool', 'assumption', 'uncertainty', 'redaction', 'visual')),
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null unique,
  display_name text not null,
  provider_preference text not null default 'local'
    check (provider_preference in ('local', 'hf', 'elevenlabs', 'browser')),
  tts_model text,
  stt_model text,
  speaker_id text,
  style_preset jsonb not null default '{"warmth":0.8,"pace":0.85,"humor":0.4,"energy":0.55,"clarity":0.9}'::jsonb,
  fallback_text_only boolean not null default true,
  consent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_session_audit (
  id uuid primary key default gen_random_uuid(),
  profile_slug text,
  user_id uuid,
  provider text,
  stt_model text,
  tts_model text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  interruption_count integer not null default 0,
  latency_ms integer,
  failed_stage text,
  user_visible_error text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.field_continuity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  device_label text,
  connectivity_state text not null default 'unknown'
    check (connectivity_state in ('unknown', 'online', 'wifi_only', 'degraded', 'offline', 'recovery')),
  event_kind text not null,
  local_event_id text,
  title text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  sync_status text not null default 'synced'
    check (sync_status in ('local', 'queued', 'syncing', 'synced', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.operation_render_audits enable row level security;
alter table public.embodiment_reasoning_policies enable row level security;
alter table public.reasoning_sessions enable row level security;
alter table public.tool_call_audit enable row level security;
alter table public.visible_reasoning_cards enable row level security;
alter table public.voice_profiles enable row level security;
alter table public.voice_session_audit enable row level security;
alter table public.field_continuity_events enable row level security;

-- Founder/admin/service-role policies should be adapted to existing auth model.
-- Conservative default: authenticated users can read their own user-scoped rows where user_id is present.
drop policy if exists "Users can read own reasoning sessions"
  on public.reasoning_sessions;
create policy "Users can read own reasoning sessions"
on public.reasoning_sessions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own voice sessions"
  on public.voice_session_audit;
create policy "Users can read own voice sessions"
on public.voice_session_audit for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own field continuity events"
  on public.field_continuity_events;
create policy "Users can read own field continuity events"
on public.field_continuity_events for select
to authenticated
using (user_id = auth.uid());

create index if not exists idx_tool_call_audit_session on public.tool_call_audit(reasoning_session_id);
create index if not exists idx_visible_reasoning_cards_session on public.visible_reasoning_cards(reasoning_session_id, sort_order);
create index if not exists idx_reasoning_sessions_profile on public.reasoning_sessions(profile_slug, created_at desc);
create index if not exists idx_voice_profiles_slug on public.voice_profiles(profile_slug);
create index if not exists idx_field_continuity_user_sync on public.field_continuity_events(user_id, sync_status, created_at desc);
