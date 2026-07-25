alter table public.tiers enable row level security;
alter table public.kit_users enable row level security;
alter table public.knowledge_fragments enable row level security;
alter table public.gravity_reports enable row level security;
alter table public.gravity_report_fragments enable row level security;
alter table public.skill_fragments enable row level security;
alter table public.memory_entries enable row level security;
alter table public.usage_events enable row level security;
alter table public.plk_profiles enable row level security;

drop policy if exists "tiers readable" on public.tiers;
create policy "tiers readable"
on public.tiers
for select
to authenticated
using (deleted_at is null);

drop policy if exists "service role full access tiers" on public.tiers;
create policy "service role full access tiers"
on public.tiers
for all
to service_role
using (true)
with check (true);

drop policy if exists "kit users own row" on public.kit_users;
create policy "kit users own row"
on public.kit_users
for select
to authenticated
using (auth_user_id = auth.uid() and deleted_at is null);

drop policy if exists "service role full access kit users" on public.kit_users;
create policy "service role full access kit users"
on public.kit_users
for all
to service_role
using (true)
with check (true);

drop policy if exists "knowledge fragments owner access" on public.knowledge_fragments;
create policy "knowledge fragments owner access"
on public.knowledge_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = knowledge_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = knowledge_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access knowledge fragments" on public.knowledge_fragments;
create policy "service role full access knowledge fragments"
on public.knowledge_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "gravity reports owner access" on public.gravity_reports;
create policy "gravity reports owner access"
on public.gravity_reports
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = gravity_reports.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = gravity_reports.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access gravity reports" on public.gravity_reports;
create policy "service role full access gravity reports"
on public.gravity_reports
for all
to service_role
using (true)
with check (true);

drop policy if exists "gravity report fragments owner access" on public.gravity_report_fragments;
create policy "gravity report fragments owner access"
on public.gravity_report_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = gravity_report_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = gravity_report_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access gravity report fragments" on public.gravity_report_fragments;
create policy "service role full access gravity report fragments"
on public.gravity_report_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "skill fragments owner access" on public.skill_fragments;
create policy "skill fragments owner access"
on public.skill_fragments
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = skill_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = skill_fragments.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access skill fragments" on public.skill_fragments;
create policy "service role full access skill fragments"
on public.skill_fragments
for all
to service_role
using (true)
with check (true);

drop policy if exists "memory entries owner access" on public.memory_entries;
create policy "memory entries owner access"
on public.memory_entries
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = memory_entries.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = memory_entries.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access memory entries" on public.memory_entries;
create policy "service role full access memory entries"
on public.memory_entries
for all
to service_role
using (true)
with check (true);

drop policy if exists "usage events owner read" on public.usage_events;
create policy "usage events owner read"
on public.usage_events
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = usage_events.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access usage events" on public.usage_events;
create policy "service role full access usage events"
on public.usage_events
for all
to service_role
using (true)
with check (true);

drop policy if exists "plk profiles owner access" on public.plk_profiles;
create policy "plk profiles owner access"
on public.plk_profiles
for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.kit_users ku
    where ku.id = plk_profiles.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.kit_users ku
    where ku.id = plk_profiles.user_id
      and ku.auth_user_id = auth.uid()
      and ku.deleted_at is null
  )
);

drop policy if exists "service role full access plk profiles" on public.plk_profiles;
create policy "service role full access plk profiles"
on public.plk_profiles
for all
to service_role
using (true)
with check (true);
