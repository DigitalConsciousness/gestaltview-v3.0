-- Insight-Bot is an integration surface, not a second source of truth.
-- Public channel data remains separate from private GestaltView memory.

create table if not exists public.insight_bot_conversations (
  id uuid primary key default gen_random_uuid(),
  installation_key text not null,
  channel text not null check (channel in ('reddit', 'discord', 'web', 'devvit', 'api')),
  external_conversation_id text,
  external_user_key_hash text,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'internal')),
  runtime_subject_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (installation_key, channel, external_conversation_id)
);

create table if not exists public.insight_bot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.insight_bot_conversations(id) on delete cascade,
  external_message_id text,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  source_request_id text,
  trace_id text,
  provider text,
  public_posting_allowed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.insight_bot_runtime_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.insight_bot_conversations(id) on delete set null,
  request_id text not null,
  event_kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists insight_bot_conversations_lookup_idx
  on public.insight_bot_conversations (installation_key, channel, external_user_key_hash);
create index if not exists insight_bot_messages_conversation_idx
  on public.insight_bot_messages (conversation_id, created_at);
create index if not exists insight_bot_events_request_idx
  on public.insight_bot_runtime_events (request_id);

alter table public.insight_bot_conversations enable row level security;
alter table public.insight_bot_messages enable row level security;
alter table public.insight_bot_runtime_events enable row level security;

revoke all on public.insight_bot_conversations from anon, authenticated;
revoke all on public.insight_bot_messages from anon, authenticated;
revoke all on public.insight_bot_runtime_events from anon, authenticated;

grant select, insert, update, delete on public.insight_bot_conversations to service_role;
grant select, insert, update, delete on public.insight_bot_messages to service_role;
grant select, insert, update, delete on public.insight_bot_runtime_events to service_role;
