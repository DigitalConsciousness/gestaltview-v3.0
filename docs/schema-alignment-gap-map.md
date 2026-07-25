# Schema Alignment Gap Map

This note captures the live runtime split for the schema alignment package and anchors the first iterative slice.

The Billy prompt slice now has direct coverage in `api/__tests__/billy-memory-session-prompt.test.ts`, which verifies both the live context assembly path and the fallback when constitution or autobiography rows are absent.

## What the runtime actually uses

### Billy identity context

- `agent_constitutions`
- `agent_autobiographies`

These are read only today and are only consumed by `api/_lib/billyMemoryPipeline.ts`, which is called from `api/billy.ts` when Billy assembles a session prompt.

### Trainer runtime core

- `training_runs`
- `approvals`
- `scenarios`

These have the strongest end-to-end wiring. They are read and written across `server/agent-trainer/persistence.ts`, `server/agent-trainer/orchestrator.ts`, `client/src/features/agent-trainer/*`, `shared/agent-trainer/schemas.ts`, and related tests.

### Trainer personhood and manifest paths

- `agent_versions`
- `scenario_sets`
- `trainer_experiments`
- `knowledge_assets`
- `knowledge_interpretations`

The package labels most of these as schema-only, but the live code already uses them in `server/agent-trainer/personhood.ts`, `server/agent-trainer/persistence.ts`, and `server/trainer/experiment-repository.ts`.

### Tables with little or no runtime usage

- `concepts`
- `summaries`
- `tribunal_sessions`

These did not show meaningful runtime query paths in the code scan. `tribunal_sessions` appears in the shared Supabase helper table list, but not as an active feature path.

## First slice recommendation

The Billy identity context path is now the first verified slice:

1. `api/__tests__/billy-memory-session-prompt.test.ts` exercises `buildBillySessionSystemPrompt` against the live Supabase-backed prompt assembly path.
2. The test covers the context tables used today: `agents`, `embodiment_profiles`, `agent_constitutions`, `agent_memory_records`, `agent_memories`, `memory_entries`, `founder_context`, `agent_autobiographies`, and `identity_subjects`.
3. The fallback case now proves that Billy still assembles a usable prompt when constitution or autobiography rows are absent.

That slice is low risk, directly exercises the only live code path for the thin personhood tables, and gives us a stable base before we widen into trainer or manifest work.

## Next slices

1. Expand coverage around `training_runs`, `approvals`, and `scenarios` in the trainer persistence layer.
2. Reclassify the live trainer personhood tables in repo docs once the test coverage reflects current behavior.
3. Decide whether `concepts`, `summaries`, and `tribunal_sessions` need real runtime features or should remain dormant for now.
