---
name: gestaltview-gpt-actions
description: Maintain the action-mode and OpenAPI contract surface that lives inside `gestaltview-v2`. Use this skill for `api/GPT/`, action package docs, `api/actions/[...path].ts`, and action-facing request or response behavior.
---

# GestaltView GPT Actions

Last reviewed: 2026-03-29

This is current runtime contract work, not a compendium-only spec folder. The action package, handler code, and tests in this repo should stay in sync.

## Inspect first
- `api/GPT/gestaltview_gpt_actions_package_v2`
- `api/actions/[...path].ts`
- `api/__tests__/actions.test.ts`
- `docs/APIFlow.md`

## Current integrations
- OpenAPI and example package files define external contract expectations for action consumers.
- Action requests currently route through the shared LLM router rather than Billy retrieval by default.
- Supabase only participates when an action explicitly touches stored data, auth, or retrieval-backed endpoints.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-ai-routing`
- `gestaltview-billy-api`
- `gestaltview-schema-contracts`

## Done when
- Spec files, examples, and handler behavior still agree.
- Any external-facing endpoint or payload name resolves to a current file and route.
