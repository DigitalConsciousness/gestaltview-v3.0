---
name: gestaltview-billy-api
description: Maintain Billy's live API contract in `gestaltview-v2`. Use this skill when working on chat, retrieval, bucket drops, health checks, session state, or the server-side message assembly that powers Billy.
---

# GestaltView Billy API

Last reviewed: 2026-03-29

This skill owns the HTTP-facing Billy contract. It should reflect the current Vercel handler files, shared runtime modules, and Supabase retrieval layer rather than older compendium-only descriptions.

## Inspect first
- `api/billy.ts`
- `api/billy-bucket-drop.ts`
- `api/billy-health.ts`
- `api/session/state.ts`
- `api/_lib/supabase.ts`
- `shared/billy/runtime.ts`

## Current integrations
- Billy API combines knowledge and skill fragment retrieval with routed LLM output before returning responses to the frontend.
- Anonymous and logged-in usage limits depend on Supabase-backed `session_rate_limits` and `users` records plus the rate-limit helper layer.
- Client callers and UI expectations live in `client/src/lib/billyApi.ts` and Billy-facing components, so contract drift here immediately shows up in the app.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-billy-intelligence`
- `gestaltview-ai-routing`
- `gestaltview-schema-supabase`

## Done when
- Request, response, retrieval, and rate-limit behavior match the current handlers.
- Supabase assumptions about fragments, founder context, and session tiers are accurate.
