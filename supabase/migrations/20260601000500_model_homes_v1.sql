-- Source: supabase_schema.zip/supabase/migrations/20260601000500_model_homes_v1.sql
-- Canonicalized filename: 20260601000500_model_homes_v1.sql

create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'model_providers' and column_name = 'kind'
  ) then
    alter table public.model_providers drop constraint if exists model_providers_kind_check;
    alter table public.model_providers
      add constraint model_providers_kind_check
      check (kind in ('ollama','groq','openai','gemini','huggingface','fal','local','openai_compatible'));
  end if;
end $$;

create table if not exists public.model_homes (
  model_home_id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  provider_slug text not null,
  model_slug text not null,
  ring text not null check (ring in ('inner_slm','outer_llm','adapter','embedding','judge')),
  modalities text[] not null default '{}'::text[],
  strengths text[] not null default '{}'::text[],
  limitations text[] not null default '{}'::text[],
  default_rooms text[] not null default '{}'::text[],
  privacy_tier text not null check (privacy_tier in ('local_only','private_cloud','external_api','restricted')),
  consent_required boolean not null default true,
  max_context_tokens integer null,
  cost_tier smallint not null default 1 check (cost_tier between 0 and 3),
  speed_tier smallint not null default 1 check (speed_tier between 0 and 3),
  supports_structured_output boolean not null default false,
  supports_tools boolean not null default false,
  supports_embeddings boolean not null default false,
  fallback_model_home_slug text null,
  governance jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','paused','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.model_homes
  add column if not exists model_home_id uuid not null default gen_random_uuid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'model_homes_model_home_id_key'
  ) then
    alter table public.model_homes
      add constraint model_homes_model_home_id_key unique (model_home_id);
  end if;
end
$$;

create table if not exists public.model_home_capabilities (
  capability_id uuid primary key default gen_random_uuid(),
  model_home_id uuid not null references public.model_homes(model_home_id) on delete cascade,
  capability_slug text not null,
  capability_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(model_home_id, capability_slug)
);

create table if not exists public.model_home_assignments (
  assignment_id uuid primary key default gen_random_uuid(),
  model_home_id uuid not null references public.model_homes(model_home_id) on delete cascade,
  room text not null,
  task_type text not null,
  consent_tier text not null default 'private_default',
  priority integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(room, task_type, consent_tier, model_home_id)
);

create table if not exists public.model_home_events (
  event_id uuid primary key default gen_random_uuid(),
  model_home_id uuid null references public.model_homes(model_home_id) on delete set null,
  event_type text not null,
  user_id uuid null references auth.users(id) on delete set null,
  subject_type text not null default 'model_home',
  subject_id text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.model_home_evaluations (
  evaluation_id uuid primary key default gen_random_uuid(),
  model_home_id uuid not null references public.model_homes(model_home_id) on delete cascade,
  rubric_slug text not null,
  score numeric null,
  passed boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.model_home_consent_grants (
  grant_id uuid primary key default gen_random_uuid(),
  model_home_id uuid not null references public.model_homes(model_home_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_tier text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null,
  unique(model_home_id, user_id, consent_tier)
);

create index if not exists model_homes_status_privacy_idx on public.model_homes(status, privacy_tier);
create index if not exists model_home_assignments_room_task_idx on public.model_home_assignments(room, task_type, active);
create index if not exists model_home_events_created_idx on public.model_home_events(created_at desc);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'model_homes'
      and column_name = 'slug'
  ) then
    insert into public.model_homes (
      slug,
      display_name,
      provider_slug,
      model_slug,
      ring,
      modalities,
      strengths,
      limitations,
      default_rooms,
      privacy_tier,
      consent_required,
      max_context_tokens,
      cost_tier,
      speed_tier,
      supports_structured_output,
      supports_tools,
      supports_embeddings,
      fallback_model_home_slug,
      governance,
      status
    ) values
      (
        'local-private-capture',
        'Local Private Capture',
        'local',
        'local-small-text',
        'inner_slm',
        array['text','file'],
        array['private capture','fast routing','low-cost summaries'],
        array['limited deep synthesis'],
        array['sanctuary','blackboard-room'],
        'local_only',
        false,
        8192,
        0,
        3,
        true,
        false,
        false,
        'groq-fast-structured',
        '{"allowedForIdentityClaims":false,"allowedForEmbodimentMutation":false,"allowedForTrainerJudging":false,"requiresFounderApproval":false}'::jsonb,
        'active'
      ),
      (
        'groq-fast-structured',
        'Groq Fast Structured',
        'groq',
        'llama-3.1-70b-versatile',
        'outer_llm',
        array['text'],
        array['structured synthesis','artifact compression'],
        array['external API boundary'],
        array['blackboard-room','external-scaffold','creation-corner'],
        'private_cloud',
        true,
        131072,
        1,
        3,
        true,
        true,
        false,
        null,
        '{"allowedForIdentityClaims":false,"allowedForEmbodimentMutation":false,"allowedForTrainerJudging":false,"requiresFounderApproval":false}'::jsonb,
        'active'
      )
    on conflict (slug) do update set
      display_name = excluded.display_name,
      provider_slug = excluded.provider_slug,
      model_slug = excluded.model_slug,
      ring = excluded.ring,
      modalities = excluded.modalities,
      strengths = excluded.strengths,
      limitations = excluded.limitations,
      default_rooms = excluded.default_rooms,
      privacy_tier = excluded.privacy_tier,
      consent_required = excluded.consent_required,
      max_context_tokens = excluded.max_context_tokens,
      cost_tier = excluded.cost_tier,
      speed_tier = excluded.speed_tier,
      supports_structured_output = excluded.supports_structured_output,
      supports_tools = excluded.supports_tools,
      supports_embeddings = excluded.supports_embeddings,
      fallback_model_home_slug = excluded.fallback_model_home_slug,
      governance = excluded.governance,
      status = excluded.status,
      updated_at = now();
  end if;
end $$;

update public.models
set metadata = metadata
  || jsonb_build_object(
    'privacy_tier', case when model_providers.local_first then 'local_only' else 'private_cloud' end,
    'allowed_pipeline_stages', array['capture','interpret','synthesize'],
    'default_rooms', array['blackboard-room','creation-corner']
  )
from public.model_providers
where public.models.provider_id = public.model_providers.provider_id
  and not (public.models.metadata ? 'privacy_tier');
