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

create index if not exists skill_fragments_user_active_idx
  on public.skill_fragments(user_id, active, created_at desc)
  where deleted_at is null;

create index if not exists skill_fragments_domain_idx
  on public.skill_fragments(domain)
  where deleted_at is null;

drop trigger if exists set_skill_fragments_updated_at on public.skill_fragments;
create trigger set_skill_fragments_updated_at
before update on public.skill_fragments
for each row execute function public.set_updated_at();
