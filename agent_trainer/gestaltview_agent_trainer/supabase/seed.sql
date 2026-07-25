create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  features jsonb not null default '{}'::jsonb,
  price_monthly integer null,
  price_annual integer null,
  seat_limit integer null,
  fragment_limit integer null,
  memory_limit integer null,
  query_limit integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint tiers_name_check
    check (name in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE'))
);

create table if not exists public.kit_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique null references auth.users(id) on delete set null,
  email text not null,
  tier text not null default 'STUDIO',
  plk_profile_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint kit_users_tier_check
    check (tier in ('SOLO_SPARK', 'STUDIO', 'GROWTH', 'ENTERPRISE'))
);

create table if not exists public.knowledge_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  namespace text not null default 'knowledge',
  title text not null,
  content text not null,
  source_uri text null,
  source_type text null,
  chunk_index integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) null,
  search_document tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint knowledge_fragments_namespace_check
    check (namespace in ('knowledge', 'code', 'product', 'context'))
);

create table if not exists public.gravity_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  source_title text not null,
  source_uri text null,
  source_type text null,
  source_kind text null,
  source_fingerprint text not null,
  surface_map jsonb not null default '{}'::jsonb,
  gravity_report jsonb not null default '{}'::jsonb,
  signal_weight numeric(5,3) not null default 0,
  confidence text not null default 'noise',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint gravity_reports_confidence_check
    check (confidence in ('high', 'medium', 'low', 'noise')),
  constraint gravity_reports_signal_weight_check
    check (signal_weight >= 0 and signal_weight <= 1)
);

create table if not exists public.gravity_report_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  gravity_report_id uuid not null references public.gravity_reports(id) on delete cascade,
  knowledge_fragment_id uuid not null references public.knowledge_fragments(id) on delete cascade,
  chunk_index integer not null default 0,
  priority_rank integer not null default 0,
  signal_weight numeric(5,3) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint gravity_report_fragments_unique
    unique (gravity_report_id, knowledge_fragment_id),
  constraint gravity_report_fragments_signal_weight_check
    check (signal_weight >= 0 and signal_weight <= 1)
);

create table if not exists public.skill_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  name text not null,
  description text not null,
  domain text not null default 'general',
  instructions text null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint skill_fragments_domain_check
    check (domain in ('general', 'resume', 'adhd', 'creative', 'consulting', 'custom'))
);

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  session_id text not null,
  key text not null,
  value jsonb not null,
  importance smallint not null default 2,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint memory_entries_importance_check
    check (importance between 1 and 5)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.kit_users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.plk_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.kit_users(id) on delete cascade,
  vocabulary jsonb not null default '[]'::jsonb,
  tone text not null default 'clear',
  constraints jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table public.kit_users
  drop constraint if exists kit_users_plk_profile_id_fkey;

alter table public.kit_users
  add constraint kit_users_plk_profile_id_fkey
  foreign key (plk_profile_id)
  references public.plk_profiles(id)
  on delete set null;

create index if not exists knowledge_fragments_user_namespace_idx
  on public.knowledge_fragments(user_id, namespace, created_at desc)
  where deleted_at is null;

create index if not exists knowledge_fragments_search_document_idx
  on public.knowledge_fragments using gin (search_document);

create index if not exists knowledge_fragments_metadata_gin_idx
  on public.knowledge_fragments using gin (metadata jsonb_path_ops);

create index if not exists knowledge_fragments_embedding_idx
  on public.knowledge_fragments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists gravity_reports_user_created_idx
  on public.gravity_reports(user_id, created_at desc)
  where deleted_at is null;

create index if not exists gravity_reports_source_fingerprint_idx
  on public.gravity_reports(source_fingerprint)
  where deleted_at is null;

create index if not exists gravity_reports_confidence_idx
  on public.gravity_reports(confidence)
  where deleted_at is null;

create index if not exists gravity_reports_metadata_gin_idx
  on public.gravity_reports
  using gin (metadata jsonb_path_ops);

create index if not exists gravity_report_fragments_user_priority_idx
  on public.gravity_report_fragments(user_id, priority_rank, created_at desc)
  where deleted_at is null;

create index if not exists gravity_report_fragments_report_idx
  on public.gravity_report_fragments(gravity_report_id, priority_rank)
  where deleted_at is null;

create index if not exists gravity_report_fragments_fragment_idx
  on public.gravity_report_fragments(knowledge_fragment_id)
  where deleted_at is null;

create index if not exists gravity_report_fragments_metadata_gin_idx
  on public.gravity_report_fragments
  using gin (metadata jsonb_path_ops);

create index if not exists skill_fragments_user_active_idx
  on public.skill_fragments(user_id, active, created_at desc)
  where deleted_at is null;

create index if not exists memory_entries_user_session_idx
  on public.memory_entries(user_id, session_id, created_at desc)
  where deleted_at is null;

create index if not exists usage_events_type_created_idx
  on public.usage_events(event_type, created_at desc)
  where deleted_at is null;

create index if not exists plk_profiles_user_idx
  on public.plk_profiles(user_id)
  where deleted_at is null;

drop trigger if exists set_tiers_updated_at on public.tiers;
create trigger set_tiers_updated_at before update on public.tiers
for each row execute function public.set_updated_at();

drop trigger if exists set_kit_users_updated_at on public.kit_users;
create trigger set_kit_users_updated_at before update on public.kit_users
for each row execute function public.set_updated_at();

drop trigger if exists set_knowledge_fragments_updated_at on public.knowledge_fragments;
create trigger set_knowledge_fragments_updated_at before update on public.knowledge_fragments
for each row execute function public.set_updated_at();

drop trigger if exists set_gravity_reports_updated_at on public.gravity_reports;
create trigger set_gravity_reports_updated_at before update on public.gravity_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_gravity_report_fragments_updated_at on public.gravity_report_fragments;
create trigger set_gravity_report_fragments_updated_at before update on public.gravity_report_fragments
for each row execute function public.set_updated_at();

drop trigger if exists set_skill_fragments_updated_at on public.skill_fragments;
create trigger set_skill_fragments_updated_at before update on public.skill_fragments
for each row execute function public.set_updated_at();

drop trigger if exists set_memory_entries_updated_at on public.memory_entries;
create trigger set_memory_entries_updated_at before update on public.memory_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_usage_events_updated_at on public.usage_events;
create trigger set_usage_events_updated_at before update on public.usage_events
for each row execute function public.set_updated_at();

drop trigger if exists set_plk_profiles_updated_at on public.plk_profiles;
create trigger set_plk_profiles_updated_at before update on public.plk_profiles
for each row execute function public.set_updated_at();

insert into public.tiers (
  name,
  features,
  price_monthly,
  price_annual,
  seat_limit,
  fragment_limit,
  memory_limit,
  query_limit
)
values
  ('SOLO_SPARK', '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": false, "memoryViewer": true, "multiUser": false, "customDomainPreset": false, "apiAccess": false}'::jsonb, null, 49, 1, 100, 50, 500),
  ('STUDIO', '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": false}'::jsonb, 149, 999, 5, 1000, 500, 5000),
  ('GROWTH', '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": true}'::jsonb, 449, 3499, 25, 10000, 5000, 50000),
  ('ENTERPRISE', '{"knowledgeManager": true, "skillsRegistry": true, "vocabularyProfile": true, "analyticsDashboard": true, "memoryViewer": true, "multiUser": true, "customDomainPreset": true, "apiAccess": true}'::jsonb, null, null, null, null, null, null)
on conflict (name) do update
set
  features = excluded.features,
  price_monthly = excluded.price_monthly,
  price_annual = excluded.price_annual,
  seat_limit = excluded.seat_limit,
  fragment_limit = excluded.fragment_limit,
  memory_limit = excluded.memory_limit,
  query_limit = excluded.query_limit,
  updated_at = now();

create or replace function public.match_knowledge(
  query_embedding vector(768),
  match_threshold real default 0.2,
  match_count integer default 8,
  requesting_user uuid default null,
  namespace_filter text default null
)
returns table (
  id uuid,
  title text,
  content text,
  namespace text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
set search_path to public
as $$
  select
    kf.id,
    kf.title,
    kf.content,
    kf.namespace,
    kf.metadata,
    1 - (kf.embedding <=> query_embedding) as similarity
  from public.knowledge_fragments kf
  where
    kf.deleted_at is null
    and kf.embedding is not null
    and (requesting_user is null or kf.user_id = requesting_user)
    and (namespace_filter is null or kf.namespace = namespace_filter)
    and 1 - (kf.embedding <=> query_embedding) >= match_threshold
  order by kf.embedding <=> query_embedding
  limit greatest(1, least(match_count, 50));
$$;

create or replace function public.search_knowledge(
  query_text text,
  requesting_user uuid default null,
  namespace_filter text default null,
  limit_count integer default 10
)
returns table (
  id uuid,
  title text,
  content text,
  namespace text,
  metadata jsonb,
  rank real
)
language sql
stable
set search_path to public
as $$
  select
    kf.id,
    kf.title,
    kf.content,
    kf.namespace,
    kf.metadata,
    ts_rank_cd(kf.search_document, websearch_to_tsquery('english', query_text)) as rank
  from public.knowledge_fragments kf
  where
    kf.deleted_at is null
    and (requesting_user is null or kf.user_id = requesting_user)
    and (namespace_filter is null or kf.namespace = namespace_filter)
    and kf.search_document @@ websearch_to_tsquery('english', query_text)
  order by rank desc, kf.created_at desc
  limit greatest(1, least(limit_count, 50));
$$;

grant execute on function public.match_knowledge(vector(768), real, integer, uuid, text)
to authenticated, service_role;

grant execute on function public.search_knowledge(text, uuid, text, integer)
to authenticated, service_role;

alter table public.tiers enable row level security;
alter table public.kit_users enable row level security;
alter table public.knowledge_fragments enable row level security;
alter table public.gravity_reports enable row level security;
alter table public.gravity_report_fragments enable row level security;
alter table public.skill_fragments enable row level security;
alter table public.memory_entries enable row level security;
alter table public.usage_events enable row level security;
alter table public.plk_profiles enable row level security;

drop policy if exists "tiers readable" on public.tiers;
create policy "tiers readable"
on public.tiers
for select
to authenticated
using (deleted_at is null);

drop policy if exists "service role full access tiers" on public.tiers;
create policy "service role full access tiers"
on public.tiers
for all
to service_role
using (true)
with check (true);

drop policy if exists "kit users own row" on public.kit_users;
create policy "kit users own row"
on public.kit_users
for select
to authenticated
using (auth_user_id = auth.uid() and deleted_at is null);

drop policy if exists "service role full access kit users" on public.kit_users;
create policy "service role full access kit users"
on public.kit_users
for all
to service_role
using (true)
with check (true);

drop policy if exists "knowledge fragments owner access" on public.knowledge_fragments;
create policy "knowledge fragments owner access"
on public.knowledge_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = knowledge_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = knowledge_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access knowledge fragments" on public.knowledge_fragments;
create policy "service role full access knowledge fragments"
on public.knowledge_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "gravity reports owner access" on public.gravity_reports;
create policy "gravity reports owner access"
on public.gravity_reports
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = gravity_reports.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = gravity_reports.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access gravity reports" on public.gravity_reports;
create policy "service role full access gravity reports"
on public.gravity_reports
for all
to service_role
using (true)
with check (true);

drop policy if exists "gravity report fragments owner access" on public.gravity_report_fragments;
create policy "gravity report fragments owner access"
on public.gravity_report_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = gravity_report_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = gravity_report_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access gravity report fragments" on public.gravity_report_fragments;
create policy "service role full access gravity report fragments"
on public.gravity_report_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "skill fragments owner access" on public.skill_fragments;
create policy "skill fragments owner access"
on public.skill_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = skill_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = skill_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access skill fragments" on public.skill_fragments;
create policy "service role full access skill fragments"
on public.skill_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "memory entries owner access" on public.memory_entries;
create policy "memory entries owner access"
on public.memory_entries
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = memory_entries.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = memory_entries.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access memory entries" on public.memory_entries;
create policy "service role full access memory entries"
on public.memory_entries
for all
to service_role
using (true)
with check (true);

drop policy if exists "usage events owner read" on public.usage_events;
create policy "usage events owner read"
on public.usage_events
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = usage_events.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access usage events" on public.usage_events;
create policy "service role full access usage events"
on public.usage_events
for all
to service_role
using (true)
with check (true);

drop policy if exists "plk profiles owner access" on public.plk_profiles;
create policy "plk profiles owner access"
on public.plk_profiles
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.kit_users ku
    where ku.id = plk_profiles.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1 from public.kit_users ku
    where ku.id = plk_profiles.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access plk profiles" on public.plk_profiles;
create policy "service role full access plk profiles"
on public.plk_profiles
for all
to service_role
using (true)
with check (true);
