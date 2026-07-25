-- Source: runtime security alignment
-- Purpose: bring the collaborator family under explicit RLS coverage
-- so the schema matches the alignment reference and provisioning
-- continues to flow through service-role only server paths.

alter table if exists public.collaborators enable row level security;
alter table if exists public.collaborator_roles enable row level security;
alter table if exists public.collaborator_relationships enable row level security;
alter table if exists public.collaborator_permissions enable row level security;
alter table if exists public.collaborator_onboarding_events enable row level security;
alter table if exists public.collaborator_embodiment_links enable row level security;

do $$
declare
  secure_table text;
  policy_name text;
begin
  foreach secure_table in array array[
    'collaborators',
    'collaborator_roles',
    'collaborator_relationships',
    'collaborator_permissions',
    'collaborator_onboarding_events',
    'collaborator_embodiment_links'
  ] loop
    policy_name := format('Service role full access %s', secure_table);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = secure_table
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        secure_table
      );
    end if;
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborators'
      and policyname = 'collaborators insert'
  ) then
    create policy "collaborators insert"
      on public.collaborators
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborators'
      and policyname = 'collaborators read'
  ) then
    create policy "collaborators read"
      on public.collaborators
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_permissions'
      and policyname = 'cp_delete_own'
  ) then
    create policy "cp_delete_own"
      on public.collaborator_permissions
      for delete
      to authenticated
      using (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_permissions'
      and policyname = 'cp_insert_own'
  ) then
    create policy "cp_insert_own"
      on public.collaborator_permissions
      for insert
      to authenticated
      with check (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_permissions'
      and policyname = 'cp_select_own'
  ) then
    create policy "cp_select_own"
      on public.collaborator_permissions
      for select
      to authenticated
      using (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_permissions'
      and policyname = 'cp_update_own'
  ) then
    create policy "cp_update_own"
      on public.collaborator_permissions
      for update
      to authenticated
      using (collaborator_id = auth.uid())
      with check (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_relationships'
      and policyname = 'cr_select_if_user_owns_source_or_target'
  ) then
    create policy "cr_select_if_user_owns_source_or_target"
      on public.collaborator_relationships
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.collaborators c
          where c.collaborator_id = collaborator_relationships.source_collaborator_id
            and c.auth_user_id = auth.uid()
        )
        or exists (
          select 1
          from public.collaborators c
          where c.collaborator_id = collaborator_relationships.target_collaborator_id
            and c.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_onboarding_events'
      and policyname = 'insert own onboarding events'
  ) then
    create policy "insert own onboarding events"
      on public.collaborator_onboarding_events
      for insert
      to authenticated
      with check (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_onboarding_events'
      and policyname = 'select own onboarding events'
  ) then
    create policy "select own onboarding events"
      on public.collaborator_onboarding_events
      for select
      to authenticated
      using (collaborator_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'collaborator_embodiment_links'
      and policyname = 'read_own_rows'
  ) then
    create policy "read_own_rows"
      on public.collaborator_embodiment_links
      for select
      to authenticated
      using (collaborator_id = auth.uid());
  end if;
end
$$;
