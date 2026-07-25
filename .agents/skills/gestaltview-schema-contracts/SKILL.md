---
name: gestaltview-schema-contracts
description: Keep schema, shared types, API payloads, and runtime contracts aligned across `gestaltview-v2`. Use this skill when fields, RPC payloads, type exports, or contract tests need to stay in sync.
---

# GestaltView Schema Contracts

Last reviewed: 2026-03-29

Use this skill to prevent drift between code layers, not only to discuss database tables. The live contract spans shared TypeScript modules, API helpers, and Supabase-facing row shapes.

## Inspect first
- `shared/billy/types.ts`
- `shared/tribunal/types.ts`
- `supabase/types.ts`
- `api/_lib/supabase.ts`
- `api/__tests__`
- `docs/adr/001-manifest-schema-contract.md`

## Current integrations
- Shared TypeScript modules define runtime contracts between client and API layers.
- Supabase row and RPC shapes are mirrored in `api/_lib/supabase.ts` and `supabase/types.ts`.
- Tests and ADR docs should be updated whenever contract assumptions change.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-schema-supabase`
- `gestaltview-billy-api`
- `gestaltview-app-runtime`

## Done when
- Types, handlers, and docs describe the same fields and semantics.
- Any remaining drift is explicitly called out and scoped.
