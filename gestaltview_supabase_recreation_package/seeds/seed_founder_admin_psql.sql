-- psql founder/admin seed.
-- Run:
--   psql "$DATABASE_URL" -v founder_email='founder@example.com' -f seeds/seed_founder_admin_psql.sql

\set ON_ERROR_STOP on
select set_config('app.seed_founder_email', :'founder_email', false);

do $$
declare
  founder_email text := current_setting('app.seed_founder_email', true);
  founder_auth_id uuid;
begin
  if founder_email is null or founder_email = '' then
    raise notice 'No founder_email psql variable supplied.';
    return;
  end if;

  select id into founder_auth_id
  from auth.users
  where lower(email) = lower(founder_email)
  limit 1;

  if founder_auth_id is null then
    raise notice 'No auth.users row found for %. Create the Auth user first, then rerun.', founder_email;
    return;
  end if;

  insert into public.users (id, email, tier, subscription_status, is_admin, created_at, updated_at)
  values (founder_auth_id, founder_email, 'enterprise', 'active', true, now(), now())
  on conflict (id) do update set
    email = excluded.email,
    tier = excluded.tier,
    subscription_status = excluded.subscription_status,
    is_admin = true,
    updated_at = now();
end $$;
