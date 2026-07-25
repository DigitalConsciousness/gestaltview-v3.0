-- Source: supabase_schema.zip/supabase/migrations/20260601000200_profile_pipeline_v1_rls.sql
-- Canonicalized filename: 20260601000200_profile_pipeline_v1_rls.sql

alter table if exists public.capture_events enable row level security;
alter table if exists public.scaffold_nodes enable row level security;
alter table if exists public.artifacts enable row level security;
alter table if exists public.identity_claims enable row level security;
alter table if exists public.profile_pipeline_runs enable row level security;
alter table if exists public.profile_pipeline_run_links enable row level security;
alter table if exists public.provenance_envelopes enable row level security;
alter table if exists public.provenance_links enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'capture_events',
    'scaffold_nodes',
    'artifacts',
    'identity_claims'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'Users manage their own ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      'Users manage their own ' || table_name,
      table_name
    );
    execute format('drop policy if exists %I on public.%I', 'Service role manages ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      'Service role manages ' || table_name,
      table_name
    );
  end loop;
end $$;

drop policy if exists "Users read their own profile_pipeline_runs" on public.profile_pipeline_runs;
create policy "Users read their own profile_pipeline_runs"
on public.profile_pipeline_runs for select
using (user_id = auth.uid());

drop policy if exists "Service role manages profile_pipeline_runs" on public.profile_pipeline_runs;
create policy "Service role manages profile_pipeline_runs"
on public.profile_pipeline_runs for all to service_role
using (true) with check (true);

drop policy if exists "Users read linked objects for their runs" on public.profile_pipeline_run_links;
create policy "Users read linked objects for their runs"
on public.profile_pipeline_run_links for select
using (
  exists (
    select 1 from public.profile_pipeline_runs runs
    where runs.run_id = profile_pipeline_run_links.run_id
      and runs.user_id = auth.uid()
  )
);

drop policy if exists "Service role manages profile_pipeline_run_links" on public.profile_pipeline_run_links;
create policy "Service role manages profile_pipeline_run_links"
on public.profile_pipeline_run_links for all to service_role
using (true) with check (true);

drop policy if exists "Users read own provenance envelopes" on public.provenance_envelopes;
create policy "Users read own provenance envelopes"
on public.provenance_envelopes for select
using (
  exists (
    select 1 from public.capture_events capture
    where provenance_envelopes.subject_type = 'capture_event'
      and provenance_envelopes.subject_id = coalesce(to_jsonb(capture)->>'capture_id', to_jsonb(capture)->>'id')
      and capture.user_id = auth.uid()
  )
  or exists (
    select 1 from public.artifacts artifact
    where provenance_envelopes.subject_type = 'artifact'
      and provenance_envelopes.subject_id = coalesce(to_jsonb(artifact)->>'artifact_id', to_jsonb(artifact)->>'id')
      and artifact.user_id = auth.uid()
  )
  or exists (
    select 1 from public.scaffold_nodes node
    where provenance_envelopes.subject_type = 'scaffold_node'
      and provenance_envelopes.subject_id = coalesce(to_jsonb(node)->>'node_id', to_jsonb(node)->>'id')
      and node.user_id = auth.uid()
  )
);

drop policy if exists "Service role manages provenance_envelopes" on public.provenance_envelopes;
create policy "Service role manages provenance_envelopes"
on public.provenance_envelopes for all to service_role
using (true) with check (true);

drop policy if exists "Service role manages provenance_links" on public.provenance_links;
create policy "Service role manages provenance_links"
on public.provenance_links for all to service_role
using (true) with check (true);
