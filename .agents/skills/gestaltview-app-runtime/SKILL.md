---
name: gestaltview-app-runtime
description: Build, debug, and document the live GestaltView application in `gestaltview-v2`. Use this skill for routed UI work, component behavior, frontend to API wiring, auth-aware flows, and any change that touches the runtime surface.
---

# GestaltView App Runtime

Last reviewed: 2026-06-01

This is the primary skill for live product work in this repo. Prefer it whenever a task changes routed pages, user-visible behavior, or the contract between the frontend and the local API layer.

## Inspect first
- `client/src/App.tsx`
- `GestaltView_Vision_Blueprint_Package/05_IMPLEMENTATION/ACCEPTANCE_CHECKLIST.md`
- `client/src/pages`
- `client/src/components`
- `client/src/lib/billy-runtime-guide.ts`
- `client/src/lib/billy-system-prompt.ts`
- `client/src/contexts/AuthContext.tsx`
- `docs/CurrentState.md`
- `package.json`

## Current integrations
- The current app stack is React 19, Vite, Wouter, Framer Motion, Tailwind v4, and route-level components under `client/src/`; product-facing changes should also honor the Vision Blueprint room and module contracts.
- Billy, pricing, auth, diligence, and portfolio flows depend on API handlers under `api/` and shared runtime modules under `shared/`.
- Billy onboarding and live-response behavior are centralized through the shared runtime guide and system prompt helpers, so runtime updates should touch those files first.
- Supabase backs auth, profile reads, user tier state, and retrieval data consumed by Billy and other gated flows.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-context-architecture`
- `gestaltview-vision-blueprint`
- `gestaltview-billy-api`
- `gestaltview-workflow-operations`

## Done when
- Routes, components, and API wiring match the current source tree.
- Any auth, pricing, Billy, or Supabase impact is reflected in both code and docs.
