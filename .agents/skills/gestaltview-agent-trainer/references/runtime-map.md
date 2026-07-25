# Runtime Map

Last reviewed: 2026-03-30

## Core surfaces

- `spec_1_gestalt_view_agent_trainer.md`: product and implementation spec for the trainer slice
- `client/src/features/agent-trainer/`: internal control-plane UI
- `api/trainer/`: admin-facing trainer endpoints
- `server/agent-trainer/`: orchestration, persistence, and provider runtime
- `shared/agent-trainer/`: shared contracts, compiler, and policies
- `worker/trainer/main.ts`: queue-backed execution loop
- `agents/generated/`: compiled trainer output artifacts
- `supabase/migrations/20260330115505_trainer_security_hardening.sql`: hardening for trainer function/view posture
- `supabase/migrations/20260330120000_trainer_core.sql`: trainer schema, seeds, queue function, and RLS enablement
- `supabase/migrations/20260330120830_trainer_rls_policies.sql`: explicit service-role policies for trainer tables

## End-to-end flow

1. An admin submits or manages a training run from `/agent-trainer`.
2. API routes validate inputs and hand work to the server trainer runtime.
3. The runtime persists runs, steps, eval results, approvals, and deployment artifacts in Supabase.
4. Queue-backed execution claims jobs through `claim_trainer_job`, runs cycles, and records lineage step by step.
5. The compiler emits deterministic markdown artifacts into `agents/generated/<slug>.md`.
6. Approval and deployment actions move candidate versions toward active runtime usage.

## Deterministic boundaries

- Shared trainer schemas are the contract between UI, APIs, orchestrator, worker, and persistence.
- Compilation should be deterministic for the same canonical spec and checksum inputs.
- Eval results should remain traceable to scenario sets, rubric versions, judge provider/model choice, and run lineage.
- Deployment artifacts should always point back to a specific trainer-produced version.

## Validation surfaces

- `pnpm exec tsc --noEmit`
- trainer API route behavior
- worker queue claim path
- generated `agents/generated/*.md` output
- Supabase migrations and security advisors
