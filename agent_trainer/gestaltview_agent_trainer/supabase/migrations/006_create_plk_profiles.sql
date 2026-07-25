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

create index if not exists plk_profiles_user_idx
  on public.plk_profiles(user_id)
  where deleted_at is null;

drop trigger if exists set_plk_profiles_updated_at on public.plk_profiles;
create trigger set_plk_profiles_updated_at
before update on public.plk_profiles
for each row execute function public.set_updated_at();

alter table public.kit_users
  drop constraint if exists kit_users_plk_profile_id_fkey;

alter table public.kit_users
  add constraint kit_users_plk_profile_id_fkey
  foreign key (plk_profile_id)
  references public.plk_profiles(id)
  on delete set null;
