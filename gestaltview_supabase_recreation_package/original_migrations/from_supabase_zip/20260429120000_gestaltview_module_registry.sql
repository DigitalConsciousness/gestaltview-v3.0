-- GestaltView module registry and profile persistence
-- Adds a normalized module catalog, canonical module keys, and
-- user-owned module profile storage for the module upsert API.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'gestaltview_module_scope') then
    create type public.gestaltview_module_scope as enum (
      'identity',
      'legacy',
      'recovery',
      'creation',
      'system',
      'reserved'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'gestaltview_module_profile_visibility') then
    create type public.gestaltview_module_profile_visibility as enum (
      'private',
      'shared_with_permission',
      'shared'
    );
  end if;
end
$$;

create table if not exists public.gestaltview_modules (
  module_id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  module_index integer not null unique,
  display_name text not null,
  summary text not null,
  operating_notes text not null default '',
  scope public.gestaltview_module_scope not null default 'system',
  canonical_table text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gestaltview_module_keys (
  module_key_id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.gestaltview_modules(module_id) on delete cascade,
  key_name text not null,
  key_kind text not null default 'semantic',
  key_value jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, key_name)
);

create table if not exists public.gestaltview_module_profiles (
  profile_id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.identity_subjects(subject_id) on delete cascade,
  auth_user_id uuid null references auth.users(id) on delete set null,
  module_id uuid not null references public.gestaltview_modules(module_id) on delete cascade,
  module_key text not null,
  payload jsonb not null default '{}'::jsonb,
  source_notes text[] not null default '{}'::text[],
  merge_strategy text not null default 'merge' check (merge_strategy in ('replace', 'merge', 'append')),
  visibility public.gestaltview_module_profile_visibility not null default 'private',
  consent_granted_at timestamptz null,
  last_affirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, module_key)
);

create index if not exists gestaltview_modules_scope_idx
  on public.gestaltview_modules (scope);

create index if not exists gestaltview_module_keys_module_id_idx
  on public.gestaltview_module_keys (module_id);

create index if not exists gestaltview_module_profiles_subject_id_idx
  on public.gestaltview_module_profiles (subject_id);

create index if not exists gestaltview_module_profiles_module_key_idx
  on public.gestaltview_module_profiles (module_key);

create index if not exists gestaltview_module_profiles_auth_user_id_idx
  on public.gestaltview_module_profiles (auth_user_id);

drop trigger if exists touch_gestaltview_modules_updated_at on public.gestaltview_modules;
create trigger touch_gestaltview_modules_updated_at
before update on public.gestaltview_modules
for each row execute function public.touch_updated_at();

drop trigger if exists touch_gestaltview_module_keys_updated_at on public.gestaltview_module_keys;
create trigger touch_gestaltview_module_keys_updated_at
before update on public.gestaltview_module_keys
for each row execute function public.touch_updated_at();

drop trigger if exists touch_gestaltview_module_profiles_updated_at on public.gestaltview_module_profiles;
create trigger touch_gestaltview_module_profiles_updated_at
before update on public.gestaltview_module_profiles
for each row execute function public.touch_updated_at();

insert into public.gestaltview_modules (
  module_key,
  module_index,
  display_name,
  summary,
  operating_notes,
  scope,
  canonical_table,
  is_active
)
values
  ('module_0', 0, 'Basic Profile', 'Demographics, contact, and sovereign access basics.', 'Private by default. Capture the minimum needed to recognize the person without over-collecting.', 'identity', 'gestaltview_module_profiles', true),
  ('module_1', 1, 'Core Identity & Values', 'The why: values, commitments, and durable self-definitions.', 'Use for values, moral anchors, and the words that should remain load-bearing.', 'identity', 'gestaltview_module_profiles', true),
  ('module_2', 2, 'Experiences & Learnings', 'Timeline, lived experience, and formative lessons.', 'Keep chronology and lessons distinct so the thread stays readable.', 'identity', 'gestaltview_module_profiles', true),
  ('module_3', 3, 'Skills & Knowledge', 'Skills, expertise, and the Resume Rockstar lane.', 'Prefer evidence-backed skills and preserve the user’s phrasing.', 'creation', 'gestaltview_module_profiles', true),
  ('module_4', 4, 'Character Exploration', 'Personality, leadership, and how the person tends to show up.', 'Map recurring patterns without flattening nuance into a single trait.', 'identity', 'gestaltview_module_profiles', true),
  ('module_5', 5, 'Character in Action', 'Narrative therapy, trauma-as-strength, and lived response under pressure.', 'Hold paradox carefully. Do not turn survival into simplification.', 'legacy', 'gestaltview_module_profiles', true),
  ('module_6', 6, 'Aspirations & Goals', 'Future vision, goals, and becoming.', 'Use for what the person is moving toward and what would make progress feel real.', 'creation', 'gestaltview_module_profiles', true),
  ('module_7', 7, 'Relationships & Connections', 'The ecosystem of people, roles, and ties that matter.', 'Treat relationships as living context, not metadata only.', 'identity', 'gestaltview_module_profiles', true),
  ('module_8', 8, 'Perspectives & Insights', 'Reflections, interpretations, and worldview shifts.', 'Use when a user wants the system to keep track of what changed in how they see things.', 'system', 'gestaltview_module_profiles', true),
  ('module_9', 9, 'Little Nuances', 'Metaphor-first details, preferences, and the small things that carry meaning.', 'This is where the texture lives. Keep the nuance intact.', 'system', 'gestaltview_module_profiles', true),
  ('module_10', 10, 'Soundtrack of Life', 'Musical DNA, resonance, and emotional autobiography through song.', 'Treat music as meaning, memory, and regulation, not just preference.', 'legacy', 'gestaltview_module_profiles', true),
  ('module_11', 11, 'Language Key', 'PLK dictionary, user phrasing, and the exact words that should stay exact.', 'Protect the user’s language as proprietary to their voice. Do not paraphrase without permission.', 'system', 'gestaltview_module_profiles', true),
  ('module_12', 12, 'Reserved Expansion Slot', 'Reserved for future GestaltView module expansion.', 'This row exists so the public contract can support module_0 through module_12 without inventing an ungrounded label.', 'reserved', null, false)
on conflict (module_key) do update
set
  module_index = excluded.module_index,
  display_name = excluded.display_name,
  summary = excluded.summary,
  operating_notes = excluded.operating_notes,
  scope = excluded.scope,
  canonical_table = excluded.canonical_table,
  is_active = excluded.is_active,
  updated_at = now();

with module_seed(module_key, key_name, key_kind, key_value, is_primary) as (
  values
    ('module_0', 'basic_profile', 'semantic', '{"aliases":["demographics","contact","sovereign_access"]}'::jsonb, true),
    ('module_0', 'demographics', 'semantic', '{"notes":"Core identity shell"}'::jsonb, false),
    ('module_1', 'core_identity_values', 'semantic', '{"aliases":["why","foundational_values"]}'::jsonb, true),
    ('module_2', 'experiences_learnings', 'semantic', '{"aliases":["timeline","life_journey"]}'::jsonb, true),
    ('module_3', 'skills_knowledge', 'semantic', '{"aliases":["resume_rockstar_lane","competencies"]}'::jsonb, true),
    ('module_4', 'character_exploration', 'semantic', '{"aliases":["personality","leadership"]}'::jsonb, true),
    ('module_5', 'character_in_action', 'semantic', '{"aliases":["narrative_therapy","trauma_as_strength"]}'::jsonb, true),
    ('module_6', 'aspirations_goals', 'semantic', '{"aliases":["future_vision","becoming"]}'::jsonb, true),
    ('module_7', 'relationships_connections', 'semantic', '{"aliases":["ecosystem_of_people","relational_web"]}'::jsonb, true),
    ('module_8', 'perspectives_insights', 'semantic', '{"aliases":["insights","worldview"]}'::jsonb, true),
    ('module_9', 'little_nuances', 'semantic', '{"aliases":["metaphor_first","voice_to_text_acceptance"]}'::jsonb, true),
    ('module_10', 'soundtrack_of_life', 'semantic', '{"aliases":["musical_dna","emotional_themes"]}'::jsonb, true),
    ('module_11', 'language_key', 'semantic', '{"aliases":["plk_dictionary","lexicon"]}'::jsonb, true),
    ('module_12', 'reserved_expansion_slot', 'semantic', '{"aliases":["future_module"]}'::jsonb, true)
)
insert into public.gestaltview_module_keys (
  module_id,
  key_name,
  key_kind,
  key_value,
  is_primary
)
select
  m.module_id,
  s.key_name,
  s.key_kind,
  s.key_value,
  s.is_primary
from module_seed s
join public.gestaltview_modules m
  on m.module_key = s.module_key
on conflict (module_id, key_name) do update
set
  key_kind = excluded.key_kind,
  key_value = excluded.key_value,
  is_primary = excluded.is_primary,
  updated_at = now();

create or replace function public.gestaltview_upsert_module_profile(
  p_subject_id uuid,
  p_auth_user_id uuid,
  p_module_key text,
  p_payload jsonb,
  p_source_notes text[] default '{}'::text[],
  p_merge_strategy text default 'merge',
  p_visibility public.gestaltview_module_profile_visibility default 'private'
)
returns public.gestaltview_module_profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_module public.gestaltview_modules%rowtype;
  v_existing public.gestaltview_module_profiles%rowtype;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
begin
  select *
  into v_module
  from public.gestaltview_modules
  where module_key = p_module_key
  limit 1;

  if not found then
    raise exception 'Unknown GestaltView module key: %', p_module_key using errcode = 'P0001';
  end if;

  if p_merge_strategy not in ('replace', 'merge', 'append') then
    raise exception 'Unsupported merge strategy: %', p_merge_strategy using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.gestaltview_module_profiles
  where subject_id = p_subject_id
    and module_key = p_module_key
  limit 1;

  if found and p_merge_strategy = 'merge' then
    v_payload := coalesce(v_existing.payload, '{}'::jsonb) || v_payload;
  elsif found and p_merge_strategy = 'append' then
    v_payload := jsonb_build_object(
      'previous', coalesce(v_existing.payload, '{}'::jsonb),
      'current', v_payload
    );
  end if;

  insert into public.gestaltview_module_profiles (
    subject_id,
    auth_user_id,
    module_id,
    module_key,
    payload,
    source_notes,
    merge_strategy,
    visibility,
    consent_granted_at,
    last_affirmed_at
  )
  values (
    p_subject_id,
    p_auth_user_id,
    v_module.module_id,
    p_module_key,
    v_payload,
    coalesce(p_source_notes, '{}'::text[]),
    p_merge_strategy,
    coalesce(p_visibility, 'private'),
    case when p_visibility = 'shared' then now() else null end,
    now()
  )
  on conflict (subject_id, module_key) do update
  set
    auth_user_id = excluded.auth_user_id,
    module_id = excluded.module_id,
    payload = excluded.payload,
    source_notes = case
      when excluded.source_notes <> '{}'::text[] then excluded.source_notes
      else public.gestaltview_module_profiles.source_notes
    end,
    merge_strategy = excluded.merge_strategy,
    visibility = excluded.visibility,
    consent_granted_at = case
      when excluded.visibility = 'shared' then coalesce(public.gestaltview_module_profiles.consent_granted_at, now())
      else public.gestaltview_module_profiles.consent_granted_at
    end,
    last_affirmed_at = now(),
    updated_at = now()
  returning * into v_existing;

  return v_existing;
end;
$$;

create or replace function public.gestaltview_get_module_profile(
  p_subject_id uuid,
  p_module_key text
)
returns public.gestaltview_module_profiles
language sql
stable
set search_path = public
as $$
  select *
  from public.gestaltview_module_profiles
  where subject_id = p_subject_id
    and module_key = p_module_key
  limit 1;
$$;

alter table public.gestaltview_modules enable row level security;
alter table public.gestaltview_module_keys enable row level security;
alter table public.gestaltview_module_profiles enable row level security;

drop policy if exists "gestaltview_modules_read" on public.gestaltview_modules;
create policy "gestaltview_modules_read"
on public.gestaltview_modules
for select
to authenticated
using (true);

drop policy if exists "gestaltview_module_keys_read" on public.gestaltview_module_keys;
create policy "gestaltview_module_keys_read"
on public.gestaltview_module_keys
for select
to authenticated
using (true);

drop policy if exists "gestaltview_module_profiles_select_own" on public.gestaltview_module_profiles;
create policy "gestaltview_module_profiles_select_own"
on public.gestaltview_module_profiles
for select
to authenticated
using (auth_user_id = auth.uid() or visibility in ('shared_with_permission', 'shared'));

drop policy if exists "gestaltview_module_profiles_insert_own" on public.gestaltview_module_profiles;
create policy "gestaltview_module_profiles_insert_own"
on public.gestaltview_module_profiles
for insert
to authenticated
with check (auth_user_id = auth.uid());

drop policy if exists "gestaltview_module_profiles_update_own" on public.gestaltview_module_profiles;
create policy "gestaltview_module_profiles_update_own"
on public.gestaltview_module_profiles
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists "gestaltview_module_profiles_delete_own" on public.gestaltview_module_profiles;
create policy "gestaltview_module_profiles_delete_own"
on public.gestaltview_module_profiles
for delete
to authenticated
using (auth_user_id = auth.uid());
