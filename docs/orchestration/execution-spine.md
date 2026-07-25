# Orchestration Execution Spine

**Branch:** `codex/orchestration-execution-spine`  
**Date:** 2026-07-11

## Why this exists

The repository already had a deterministic orchestration decision layer and a worker-plan shape, but `/api/orchestrator/execute` only wrote queued descriptions into tables that were not present in the live Supabase project. No worker logic actually ran, and no presentation boundary prevented raw model-shaped output from reaching a visible room.

This slice turns that plan into an inspectable execution spine without introducing another model dependency.

## Implemented

- Decision-driven worker graphs instead of one static Creation Corner list.
- Deterministic worker execution with dependency handling and per-worker receipts.
- Optional profile-enrichment and scaffold-context branches.
- Artifact synthesis and rendering contracts that explicitly forbid raw model output from rendering directly.
- A presentation gate that rejects:
  - empty output;
  - raw JSON;
  - internal metadata leakage;
  - partial HTML previews;
  - severe repeated-content loops.
- A validation receipt that reports whether the run is safe to hand back to the room.
- Additive Supabase tables for run and worker evidence with user-scoped read policies.
- Client response contracts for status, receipts, presentation checks, and persisted diagnostics.
- Vitest coverage for artifact execution, presentation rejection, and conditional profile/scaffold branches.

## Worker graph

Every run begins with:

1. `intake` — preserves the source and establishes a canonical envelope.
2. `normalization` — creates a processing view without replacing the source.

The decision may then add:

- `profile_enrichment`
- `scaffold_context`
- `orb_generation`
- `synthesis`
- `rendering`

Every run closes through:

- `persistence`
- `presentation`
- `validation`

## Deployment boundary

The migration is committed but has **not** been applied to the production Supabase project. This is deliberate. The live project currently has `orchestration_decisions`, but not `orchestration_runs` or `orchestration_worker_runs`.

Apply the migration only after review:

```text
supabase/migrations/202607110001_orchestration_execution_spine.sql
```

Until that migration is applied, `/api/orchestrator/execute` will correctly fail persistence rather than pretending the run was recorded.

## Next adoption seam

Creation Corner already has the execution client surface in place through `client/src/lib/orchestratorClient.ts` and `client/src/hooks/useCreationCornerOrchestration.ts`, but the rail is still not mounted into the main workbench flow.

The next bounded slice should wire the workbench to call `/api/orchestrator/execute` with the finished artifact as `meta.presentationCandidate` immediately before `setResult(...)` or routing to Dynamic Inner World. A failed presentation gate should keep the artifact in the workshop and surface the concrete reasons.

That page-level change is intentionally separate from this execution-spine doc so the database contract, API behavior, and visual-flow adoption can each be reviewed without hiding one inside another.
