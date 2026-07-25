-- Source: supabase_schema.zip/supabase/migrations/20260610000100_transcriptory_sessions_and_sources.sql
-- Canonicalized filename: 20260610000100_transcriptory_sessions_and_sources.sql

begin;

create table if not exists public.transcriptory_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  origin text not null default 'transcriptory' check (origin in ('transcriptory','blackboard','creation_corner','journal','universal_capture','import','api')),
  status text not null default 'active' check (status in ('active','archived','merged')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcriptory_sessions_user_created_idx
  on public.transcriptory_sessions (user_id, created_at desc);

alter table public.transcriptory_captures
  add column if not exists session_id uuid references public.transcriptory_sessions(id) on delete set null,
  add column if not exists transcript_text text,
  add column if not exists transcript_language text,
  add column if not exists source_kind text not null default 'audio' check (source_kind in ('audio','text','imported_audio','imported_text','derived')),
  add column if not exists source_label text,
  add column if not exists processing_provider text,
  add column if not exists transcript_status text not null default 'pending' check (transcript_status in ('pending','processing','ready','failed')),
  add column if not exists error_message text,
  add column if not exists token_estimate integer,
  add column if not exists last_accessed_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.transcriptory_captures
set transcript_text = coalesce(transcript_text, raw_transcript)
where transcript_text is null and raw_transcript is not null;

update public.transcriptory_captures
set transcript_status = case
  when status in ('ready','completed') then 'ready'
  when status in ('failed','error') then 'failed'
  when status in ('processing','queued','pending','transcribing') then 'processing'
  else transcript_status
end
where transcript_status = 'pending' and status is not null;

create table if not exists public.transcriptory_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capture_id uuid not null references public.transcriptory_captures(id) on delete cascade,
  source_type text not null check (source_type in ('upload','recording','blackboard_handoff','creation_corner_seed','journal_entry','universal_capture','api_import','manual_text')),
  source_ref text,
  source_page text,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transcriptory_sources_user_capture_idx
  on public.transcriptory_sources (user_id, capture_id, created_at desc);

create index if not exists transcriptory_captures_user_created_idx
  on public.transcriptory_captures (user_id, created_at desc);

create index if not exists transcriptory_captures_user_session_idx
  on public.transcriptory_captures (user_id, session_id, created_at desc);

create index if not exists transcriptory_captures_transcript_status_idx
  on public.transcriptory_captures (transcript_status, created_at desc);

commit;
