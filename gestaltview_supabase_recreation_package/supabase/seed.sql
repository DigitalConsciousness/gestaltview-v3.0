-- GestaltView safe seed scaffold.
-- This file is intentionally idempotent and conservative.
-- It does not create auth.users rows. Create/sign in the founder account through Supabase Auth first.

-- Optional guest/fallback app user used by older corpus/search flows.
insert into public.app_users (id)
values ('guest-user')
on conflict (id) do nothing;

-- Optional: enable founder admin after the auth account exists.
-- Replace __FOUNDER_EMAIL__ in seeds/seed_founder_admin_template.sql, or run:
--   psql "$DATABASE_URL" -v founder_email='founder@example.com' -f seeds/seed_founder_admin_psql.sql
