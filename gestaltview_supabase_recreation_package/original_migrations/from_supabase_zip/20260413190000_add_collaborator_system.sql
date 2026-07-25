-- GestaltView collaborator system migration
-- Adds a universal collaborator substrate above users/app_users/agents
-- Safe to review and adapt before applying in Supabase.

begin;

create table if not exists public.collaborators (
  collaborator_id uuid primary key default gen_random_uuid(),
  collaborator_key text not null unique,
  display_name text not null,
  collaborator_type text not null,
  entity_class text not null,
  status text not null default 'pending_provisioning',
  orientation_variant text,
  continuity_level text not null default 'standard',
  embodiment_profile_slug text,
  origin_surface text,
  external_provider text,
  external_reference text,
  auth_user_id uuid references auth.users(id),
  app_user_id text references public.app_users(id),
  agent_id uuid unique references public.agents(agent_id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collaborators_type_check check (
    collaborator_type = any (array[
      'human_hire',
      'human_colleague',
      'human_partner',
      'advisor',
      'operator',
      'reviewer',
      'digital_intelligence_internal',
      'digital_intelligence_external',
      'agent_runtime_entity'
    ])
  ),

  constraint collaborators_entity_class_check check (
    entity_class = any (array[
      'human',
      'digital_intelligence',
      'agent',
      'hybrid'
    ])
  ),

  constraint collaborators_status_check check (
    status = any (array[
      'proposed',
      'pending_provisioning',
      'active',
      'inactive',
      'suspended',
      'archived'
    ])
  ),

  constraint collaborators_bridge_presence_check check (
    auth_user_id is not null
    or app_user_id is not null
    or agent_id is not null
    or external_provider is not null
    or origin_surface is not null
  )
);

create table if not exists public.collaborator_roles (
  role_id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  role_key text not null,
  role_name text not null,
  role_scope text,
  is_primary boolean not null default false,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collaborator_roles_status_check check (
    status = any (array['active','inactive','archived'])
  )
);

create unique index if not exists idx_collaborator_roles_one_primary
  on public.collaborator_roles(collaborator_id)
  where is_primary = true and status = 'active';

create table if not exists public.collaborator_relationships (
  relationship_id uuid primary key default gen_random_uuid(),
  source_collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  target_collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  relationship_type text not null,
  relationship_status text not null default 'active',
  trust_level numeric,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collaborator_relationships_status_check check (
    relationship_status = any (array['active','inactive','archived'])
  ),
  constraint collaborator_relationships_not_self check (
    source_collaborator_id <> target_collaborator_id
  ),
  constraint collaborator_relationships_trust_check check (
    trust_level is null or (trust_level >= 0 and trust_level <= 1)
  )
);

create table if not exists public.collaborator_permissions (
  permission_id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  permission_key text not null,
  permission_scope text,
  granted_by_collaborator_id uuid references public.collaborators(collaborator_id),
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collaborator_permissions_status_check check (
    status = any (array['active','revoked','archived'])
  )
);

create table if not exists public.collaborator_onboarding_events (
  onboarding_event_id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  event_type text not null,
  event_status text not null,
  onboarding_packet_version text,
  orientation_variant text,
  embodiment_profile_created boolean not null default false,
  supabase_provisioned boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,

  constraint collaborator_onboarding_events_type_check check (
    event_type = any (array[
      'initial_onboarding',
      'reprovision',
      'reactivation',
      'migration',
      'deactivation'
    ])
  ),
  constraint collaborator_onboarding_events_status_check check (
    event_status = any (array[
      'started',
      'in_progress',
      'completed',
      'failed',
      'rolled_back'
    ])
  )
);

create table if not exists public.collaborator_embodiment_links (
  embodiment_link_id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.collaborators(collaborator_id) on delete cascade,
  embodiment_profile_slug text not null,
  embodiment_profile_id uuid,
  link_status text not null default 'active',
  is_primary boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint collaborator_embodiment_links_status_check check (
    link_status = any (array['active','superseded','revoked','archived'])
  )
);

create unique index if not exists idx_collaborator_embodiment_links_one_primary
  on public.collaborator_embodiment_links(collaborator_id)
  where is_primary = true and link_status = 'active';

alter table public.agents
  add column if not exists collaborator_id uuid references public.collaborators(collaborator_id);

create unique index if not exists idx_agents_collaborator_id_unique
  on public.agents(collaborator_id)
  where collaborator_id is not null;

create index if not exists idx_collaborators_auth_user_id on public.collaborators(auth_user_id);
create index if not exists idx_collaborators_app_user_id on public.collaborators(app_user_id);
create index if not exists idx_collaborators_agent_id on public.collaborators(agent_id);
create index if not exists idx_collaborator_roles_collaborator_id on public.collaborator_roles(collaborator_id);
create index if not exists idx_collaborator_relationships_source on public.collaborator_relationships(source_collaborator_id);
create index if not exists idx_collaborator_relationships_target on public.collaborator_relationships(target_collaborator_id);
create index if not exists idx_collaborator_permissions_collaborator_id on public.collaborator_permissions(collaborator_id);
create index if not exists idx_collaborator_onboarding_events_collaborator_id on public.collaborator_onboarding_events(collaborator_id);
create index if not exists idx_collaborator_embodiment_links_collaborator_id on public.collaborator_embodiment_links(collaborator_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_collaborators_updated_at on public.collaborators;
create trigger trg_collaborators_updated_at
before update on public.collaborators
for each row execute function public.set_updated_at();

drop trigger if exists trg_collaborator_roles_updated_at on public.collaborator_roles;
create trigger trg_collaborator_roles_updated_at
before update on public.collaborator_roles
for each row execute function public.set_updated_at();

drop trigger if exists trg_collaborator_relationships_updated_at on public.collaborator_relationships;
create trigger trg_collaborator_relationships_updated_at
before update on public.collaborator_relationships
for each row execute function public.set_updated_at();

drop trigger if exists trg_collaborator_permissions_updated_at on public.collaborator_permissions;
create trigger trg_collaborator_permissions_updated_at
before update on public.collaborator_permissions
for each row execute function public.set_updated_at();

drop trigger if exists trg_collaborator_embodiment_links_updated_at on public.collaborator_embodiment_links;
create trigger trg_collaborator_embodiment_links_updated_at
before update on public.collaborator_embodiment_links
for each row execute function public.set_updated_at();

comment on table public.collaborators is 'Universal top-level continuity surface for all formal GestaltView collaborators, human or digital.';
comment on table public.collaborator_onboarding_events is 'Durable provisioning log for collaborator onboarding, reprovisioning, and lifecycle changes.';
comment on column public.agents.collaborator_id is 'Optional bridge from specialized agent runtime record to top-level collaborator identity.';

commit;
