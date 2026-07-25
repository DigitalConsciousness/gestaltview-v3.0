-- GestaltView founder admin bootstrap
-- Ensures the founder auth account is provisioned as enterprise/admin at the
-- database layer instead of relying on an app-side button only.

create or replace function public.is_founder_admin_email(candidate text)
returns boolean
language sql
immutable
as $$
  select lower(trim(coalesce(candidate, ''))) = any (
    array[
      'keithsoyka@gmail.com'
    ]
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  founder_admin boolean;
begin
  normalized_email := lower(trim(coalesce(NEW.email, concat(NEW.id::text, '@gestaltview.local'))));
  founder_admin := public.is_founder_admin_email(normalized_email);

  insert into public.users (
    id,
    email,
    tier,
    subscription_status,
    billing_period_start,
    billy_query_count,
    is_admin,
    grace_until,
    created_at,
    updated_at
  )
  values (
    NEW.id,
    normalized_email,
    case when founder_admin then 'enterprise' else 'free' end,
    case when founder_admin then 'active' else 'inactive' end,
    case when founder_admin then now() else null end,
    0,
    founder_admin,
    null,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    tier = case when founder_admin then 'enterprise' else public.users.tier end,
    subscription_status = case when founder_admin then 'active' else public.users.subscription_status end,
    billing_period_start = case
      when founder_admin then coalesce(public.users.billing_period_start, excluded.billing_period_start)
      else public.users.billing_period_start
    end,
    is_admin = case when founder_admin then true else public.users.is_admin end,
    updated_at = now();

  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.users (
  id,
  email,
  tier,
  subscription_status,
  billing_period_start,
  billy_query_count,
  is_admin,
  grace_until,
  created_at,
  updated_at
)
select
  auth_user.id,
  lower(trim(coalesce(auth_user.email, concat(auth_user.id::text, '@gestaltview.local')))),
  'enterprise',
  'active',
  coalesce(existing_user.billing_period_start, now()),
  coalesce(existing_user.billy_query_count, 0),
  true,
  null,
  coalesce(existing_user.created_at, now()),
  now()
from auth.users as auth_user
left join public.users as existing_user
  on existing_user.id = auth_user.id
where public.is_founder_admin_email(auth_user.email)
on conflict (id) do update set
  email = excluded.email,
  tier = 'enterprise',
  subscription_status = 'active',
  billing_period_start = coalesce(public.users.billing_period_start, excluded.billing_period_start),
  is_admin = true,
  updated_at = now();
