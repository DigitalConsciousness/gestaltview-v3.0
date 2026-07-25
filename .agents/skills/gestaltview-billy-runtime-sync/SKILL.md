---
name: gestaltview-billy-runtime-sync
description: Keep Billy's client, API, shared-module, and cross-repo boundaries in sync. Use this skill when the runtime contract is drifting between `shared/billy`, API handlers, frontend callers, and external corpus or context assumptions.
---

# GestaltView Billy Runtime Sync

Last reviewed: 2026-03-29

Use this when the problem is contract drift rather than a single bug. The current repo owns executable Billy modules, while sibling repos still own large parts of the source corpus and long-memory context.

## Inspect first
- `shared/billy/runtime.ts`
- `shared/billy/types.ts`
- `api/billy.ts`
- `client/src/lib/billyApi.ts`
- `tools/run_billy.ts`
- `docs/adr/002-billy-runtime-module.md`

## Current integrations
- Shared TypeScript modules synchronize Billy behavior across client and API surfaces.
- Supabase retrieval and `founder_context` form the live data boundary between stored context and runtime response assembly.
- Cross-repo sync matters because the runtime still references `GestaltView-Official-Compendium` and manifest-derived context in prompts and docs.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-billy-intelligence`
- `gestaltview-cross-repo-sync`
- `gestaltview-schema-contracts`

## Done when
- Client, API, and shared Billy contracts are explicit and consistent.
- Local runtime ownership and external corpus dependencies are both documented without blur.
