# Supabase Policy Model

Last reviewed: 2026-03-30

## Trainer tables

- `model_providers`
- `models`
- `agents`
- `agent_versions`
- `scenario_sets`
- `scenarios`
- `eval_rubrics`
- `training_runs`
- `training_steps`
- `eval_results`
- `approvals`
- `deployment_artifacts`
- `trainer_jobs`

## Intended posture

- Row Level Security is enabled on all trainer tables.
- Access is mediated through server-side trainer APIs and worker paths that use service-role credentials.
- The client should not talk directly to trainer tables.
- Explicit `service_role` policies are preferred so advisors reflect the intended model instead of reporting "RLS enabled, no policy" informational findings.

## Migrations to keep aligned

- `supabase/migrations/20260330115505_trainer_security_hardening.sql`
- `supabase/migrations/20260330120000_trainer_core.sql`
- `supabase/migrations/20260330120830_trainer_rls_policies.sql`

## Operational expectations

- New trainer tables should enable RLS in the core migration that creates them.
- Follow-up migrations should add explicit policies and any security-hardening required for views or functions.
- Supabase security advisors should be re-run after every trainer schema change.
- If a future trainer surface needs client access, add narrowly scoped policies instead of weakening the service-role-first default.
