---
name: gestaltview-agent-trainer
description: Build, operate, and extend the GestaltView agent trainer in `gestaltview-v2`. Use this skill for the `/agent-trainer` control plane, trainer APIs, worker execution, eval packs, compiled agent artifacts, and trainer-specific Supabase lineage.
---

# GestaltView Agent Trainer

Last reviewed: 2026-03-30

Use this skill when the work is specifically about the trainer slice added for `spec_1_gestalt_view_agent_trainer.md`. It is the canonical entrypoint for trainer runs, step lineage, scenario packs, eval scoring, approvals, deployments, and the `agents/generated/*.md` output path.

## Inspect first
- `spec_1_gestalt_view_agent_trainer.md`
- `client/src/features/agent-trainer/`
- `api/trainer/`
- `server/agent-trainer/`
- `shared/agent-trainer/`
- `worker/trainer/main.ts`
- `agents/generated/`
- `supabase/migrations/20260330115505_trainer_security_hardening.sql`
- `supabase/migrations/20260330120000_trainer_core.sql`
- `supabase/migrations/20260330120830_trainer_rls_policies.sql`

## Current integrations
- The trainer control plane is mounted from the live app and exposes admin-oriented run submission, lineage inspection, approval, and deployment flows.
- The runtime spans shared contracts, server orchestration, API routes, a queue-backed worker, and deterministic markdown compilation into `agents/generated/`.
- Trainer state lives in dedicated Supabase tables for providers, models, agents, versions, scenario sets, runs, steps, evals, approvals, deployment artifacts, and queued jobs.
- Provider selection, eval scoring, and packaging depend on existing GestaltView routing, Supabase, and evaluation patterns rather than a separate parallel stack.

## Workflow
1. Read the spec and the trainer runtime anchors before touching code or docs.
2. Determine whether the change belongs in the control plane UI, API contracts, orchestration runtime, worker path, eval/rubric flow, or generated artifact boundary.
3. Keep the shared schema, server orchestration, UI, and Supabase migrations aligned in the same change set when trainer behavior changes.
4. Prefer extending existing GestaltView skills for adjacent concerns instead of duplicating guidance inside the trainer slice.
5. Validate both local runtime behavior and Supabase posture whenever the change adds or mutates trainer tables, queue behavior, or approval/deploy semantics.

## Compose with
- `gestaltview-app-runtime`
- `gestaltview-schema-supabase`
- `gestaltview-ai-routing`
- `evaluation`
- `agent-development`
- `skills-keeper`

## References
- `references/runtime-map.md`
- `references/skill-composition.md`
- `references/supabase-policy-model.md`

## Done when
- The trainer flow is coherent from UI submission through worker execution, eval, approval, and deployment.
- `agents/generated/` output remains deterministic and traceable to trainer versions.
- Trainer tables, functions, and policies match the intended service-role-only access model.
- Catalog and CurrentState surfaces reflect the trainer as a first-class GestaltView capability.
