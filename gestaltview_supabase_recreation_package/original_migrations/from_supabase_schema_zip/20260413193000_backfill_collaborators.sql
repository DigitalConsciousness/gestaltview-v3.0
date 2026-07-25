begin;

-- -------------------------------------------------------------------
-- Backfill existing agents into public.collaborators
-- Assumes 20260413190000_add_collaborator_system.sql has already run.
-- -------------------------------------------------------------------

insert into public.collaborators (
  collaborator_key,
  display_name,
  collaborator_type,
  entity_class,
  status,
  orientation_variant,
  continuity_level,
  embodiment_profile_slug,
  origin_surface,
  external_provider,
  external_reference,
  auth_user_id,
  app_user_id,
  agent_id,
  metadata
)
select
  'agent:' || a.slug as collaborator_key,
  coalesce(a.public_name, a.title, a.slug) as display_name,
  case
    when a.origin_context ilike '%external%' then 'digital_intelligence_external'
    else 'agent_runtime_entity'
  end as collaborator_type,
  'agent' as entity_class,
  case
    when a.status in ('approved', 'deployed', 'reviewed') then 'active'
    when a.status = 'archived' then 'archived'
    else 'pending_provisioning'
  end as status,
  'internal_agent' as orientation_variant,
  'standard' as continuity_level,
  a.slug as embodiment_profile_slug,
  coalesce(a.origin_context, 'agents') as origin_surface,
  null as external_provider,
  null as external_reference,
  a.owner_user_id as auth_user_id,
  null as app_user_id,
  a.agent_id,
  jsonb_build_object(
    'backfill_source', 'agents',
    'agent_status', a.status,
    'domain', a.domain,
    'title', a.title,
    'internal_designation', a.internal_designation
  ) as metadata
from public.agents a
left join public.collaborators c
  on c.agent_id = a.agent_id
where c.collaborator_id is null;

-- Sync agents.collaborator_id for any rows that were backfilled
update public.agents a
set collaborator_id = c.collaborator_id
from public.collaborators c
where c.agent_id = a.agent_id
  and a.collaborator_id is distinct from c.collaborator_id;

-- Ensure each agent-backed collaborator has at least one primary role
insert into public.collaborator_roles (
  collaborator_id,
  role_key,
  role_name,
  role_scope,
  is_primary,
  status,
  metadata
)
select
  c.collaborator_id,
  'agent_runtime',
  'Agent Runtime Entity',
  coalesce(a.domain, 'general'),
  true,
  'active',
  jsonb_build_object(
    'backfill_source', 'agents',
    'agent_slug', a.slug
  )
from public.collaborators c
join public.agents a
  on a.agent_id = c.agent_id
left join public.collaborator_roles r
  on r.collaborator_id = c.collaborator_id
 and r.is_primary = true
where r.role_id is null;

-- Ensure each agent-backed collaborator has an embodiment link
insert into public.collaborator_embodiment_links (
  collaborator_id,
  embodiment_profile_slug,
  embodiment_profile_id,
  link_status,
  is_primary,
  metadata
)
select
  c.collaborator_id,
  coalesce(c.embodiment_profile_slug, a.slug) as embodiment_profile_slug,
  null as embodiment_profile_id,
  'active',
  true,
  jsonb_build_object(
    'backfill_source', 'agents',
    'agent_slug', a.slug
  )
from public.collaborators c
join public.agents a
  on a.agent_id = c.agent_id
left join public.collaborator_embodiment_links l
  on l.collaborator_id = c.collaborator_id
 and l.is_primary = true
where l.embodiment_link_id is null;

-- Ensure each agent-backed collaborator has an onboarding event
insert into public.collaborator_onboarding_events (
  collaborator_id,
  event_type,
  event_status,
  onboarding_packet_version,
  orientation_variant,
  embodiment_profile_created,
  supabase_provisioned,
  notes,
  metadata,
  completed_at
)
select
  c.collaborator_id,
  'migration',
  'completed',
  '1.0.0',
  coalesce(c.orientation_variant, 'internal_agent'),
  true,
  true,
  'Backfilled from existing public.agents rows.',
  jsonb_build_object(
    'backfill_source', 'agents',
    'agent_slug', a.slug
  ),
  now()
from public.collaborators c
join public.agents a
  on a.agent_id = c.agent_id
left join public.collaborator_onboarding_events e
  on e.collaborator_id = c.collaborator_id
 and e.event_type = 'migration'
where e.onboarding_event_id is null;

-- Optional: create collaborator rows for admin auth users who are not yet represented.
-- This is intentionally conservative: only admins are auto-backfilled here.
insert into public.collaborators (
  collaborator_key,
  display_name,
  collaborator_type,
  entity_class,
  status,
  orientation_variant,
  continuity_level,
  embodiment_profile_slug,
  origin_surface,
  external_provider,
  external_reference,
  auth_user_id,
  app_user_id,
  agent_id,
  metadata
)
select
  'user:' || u.id::text as collaborator_key,
  split_part(u.email, '@', 1) as display_name,
  case
    when u.is_admin then 'operator'
    else 'human_colleague'
  end as collaborator_type,
  'human' as entity_class,
  'active' as status,
  'human' as orientation_variant,
  'standard' as continuity_level,
  null as embodiment_profile_slug,
  'users' as origin_surface,
  null as external_provider,
  null as external_reference,
  u.id as auth_user_id,
  null as app_user_id,
  null as agent_id,
  jsonb_build_object(
    'backfill_source', 'users',
    'email', u.email,
    'tier', u.tier,
    'is_admin', u.is_admin
  ) as metadata
from public.users u
left join public.collaborators c
  on c.auth_user_id = u.id
where c.collaborator_id is null
  and u.is_admin = true;

-- Add primary roles for those admin collaborators
insert into public.collaborator_roles (
  collaborator_id,
  role_key,
  role_name,
  role_scope,
  is_primary,
  status,
  metadata
)
select
  c.collaborator_id,
  'operator',
  'Operator',
  'gestaltview',
  true,
  'active',
  jsonb_build_object(
    'backfill_source', 'users'
  )
from public.collaborators c
left join public.collaborator_roles r
  on r.collaborator_id = c.collaborator_id
 and r.is_primary = true
where c.auth_user_id is not null
  and c.agent_id is null
  and r.role_id is null;

insert into public.collaborator_onboarding_events (
  collaborator_id,
  event_type,
  event_status,
  onboarding_packet_version,
  orientation_variant,
  embodiment_profile_created,
  supabase_provisioned,
  notes,
  metadata,
  completed_at
)
select
  c.collaborator_id,
  'migration',
  'completed',
  '1.0.0',
  coalesce(c.orientation_variant, 'human'),
  false,
  true,
  'Backfilled conservatively from existing public.users rows.',
  jsonb_build_object(
    'backfill_source', 'users'
  ),
  now()
from public.collaborators c
left join public.collaborator_onboarding_events e
  on e.collaborator_id = c.collaborator_id
 and e.event_type = 'migration'
where c.auth_user_id is not null
  and c.agent_id is null
  and e.onboarding_event_id is null;

commit;
