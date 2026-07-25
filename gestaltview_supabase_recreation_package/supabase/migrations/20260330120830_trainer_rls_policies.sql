-- Source: supabase_schema.zip/supabase/migrations/20260330120830_trainer_rls_policies.sql
-- Canonicalized filename: 20260330120830_trainer_rls_policies.sql

do $$
declare
  trainer_table text;
  policy_name text;
begin
  foreach trainer_table in array array[
    'model_providers',
    'models',
    'agents',
    'agent_versions',
    'scenario_sets',
    'scenarios',
    'eval_rubrics',
    'training_runs',
    'training_steps',
    'eval_results',
    'approvals',
    'deployment_artifacts',
    'trainer_jobs'
  ]
  loop
    execute format('alter table public.%I enable row level security', trainer_table);

    policy_name := format('Service role full access %s', trainer_table);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = trainer_table
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        policy_name,
        trainer_table
      );
    end if;
  end loop;
end
$$;
