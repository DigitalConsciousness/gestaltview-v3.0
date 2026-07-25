alter table if exists public.user_preferences
  add column if not exists display_name text not null default '',
  add column if not exists avatar_url text not null default '',
  add column if not exists embodiment_profile_slug text not null default 'billy';

create index if not exists user_preferences_embodiment_profile_slug_idx
  on public.user_preferences (embodiment_profile_slug);
