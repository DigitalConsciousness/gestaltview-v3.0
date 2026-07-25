---
name: gestaltview-billy-intelligence
description: Design, debug, and extend Billy as GestaltView's current intelligence layer. Use this skill for Billy personality, package inference, intent handling, grounding rules, safety behavior, and runtime alignment across client, API, and shared modules.
---

# Billy Intelligence

Last reviewed: 2026-03-29

This is the personality and reasoning layer for Billy across UI, API, retrieval grounding, and safety behavior. It is current runtime work even when the grounding corpus itself lives in sibling repos.

## Inspect first
- `shared/billy/runtime.ts`
- `api/billy.ts`
- `client/src/lib/billy-system-prompt.ts`
- `docs/billy-personality-spec.md`
- `client/src/components/BillyLive.tsx`

## Current integrations
- `shared/billy/runtime.ts` is the single source of truth for Billy's system prompt, package inference, intent classification, and context-block construction.
- `/api/billy` appends Supabase knowledge and skill fragments plus `founder_context` before invoking the router.
- Billy UI surfaces in `client/src/components/` and the voice studio page must stay aligned with the shared runtime's assumptions.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-billy-api`
- `gestaltview-ai-routing`
- `gestaltview-billy-voice`

## Done when
- Billy behavior docs match the shared runtime and API code.
- Grounding, safety, and package-inference claims are supported by current source files.
