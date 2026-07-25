-- Founder/admin seed template for Supabase SQL Editor or psql.
-- 1. Create/sign in the founder user through Supabase Auth first.
-- 2. Replace __FOUNDER_EMAIL__ with the founder auth email.
-- 3. Run this script.

do $$
declare
  founder_email text := '__FOUNDER_EMAIL__';
  founder_auth_id uuid;
begin
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
