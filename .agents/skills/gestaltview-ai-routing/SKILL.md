---
name: gestaltview-ai-routing
description: Maintain the live provider cascade, prompt-building path, and retrieval-aware routing flow in `gestaltview-v2`. Use this skill when working on Billy request flow, `routeLlm`, provider selection, or AI docs that need to match the current runtime.
---

# GestaltView AI Routing

Last reviewed: 2026-03-29

Use this for the actual LLM routing path, not for generic model-selection advice. Verify the cascade from source because some older docs still describe earlier provider orders and older client paths.

## Inspect first
- `api/_lib/llmRouter.ts`
- `client/src/lib/llmrouter.ts`
- `api/billy.ts`
- `shared/llm/plk.ts`
- `api/__tests__/llmRouter.test.ts`

## Current integrations
- The current provider cascade is defined in `api/_lib/llmRouter.ts` and presently prefers configured free or local options before paid fallbacks.
- Billy API flows layer Supabase retrieval and founder-context assembly on top of the router rather than bypassing it.
- Client code imports the router through `client/src/lib/llmrouter.ts`, so contract changes here ripple into both UI and API surfaces.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-billy-intelligence`
- `gestaltview-billy-api`
- `gestaltview-schema-contracts`

## Done when
- Provider order, prompt context, and fallback behavior match the live code.
- Docs distinguish router behavior from retrieval, voice, and pricing responsibilities.
