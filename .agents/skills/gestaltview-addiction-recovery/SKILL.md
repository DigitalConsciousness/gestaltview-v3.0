---
name: gestaltview-addiction-recovery
description: Maintain GestaltView's current addiction-recovery lane in `gestaltview-v2`. Use this skill when working on the `/addiction-recovery` exhibit, adjacent recovery and legacy narrative surfaces, or recovery-aligned Billy and product flows.
---

# GestaltView Addiction Recovery

Last reviewed: 2026-03-29

Treat this as a runtime and product skill for `gestaltview-v2`, not an archive-only compendium skill. The current implementation is a public exhibit surface with adjacent Billy and narrative context rather than a standalone backend subsystem.

## Inspect first
- `client/src/App.tsx`
- `client/src/components/AddictionRecoveryExhibit.tsx`
- `client/src/components/AlzheimersLegacyExhibit.tsx`
- `docs/CurrentState.md`

## Current integrations
- React 19, Vite, and Wouter route wiring drive the live exhibit surface.
- Recovery language that affects Billy or bucket-drop behavior must stay aligned with `api/billy.ts` and `shared/billy/runtime.ts`.
- Supabase only becomes part of this lane when you add auth, persistence, or gating; verify `client/src/contexts/AuthContext.tsx` and `supabase/` before documenting stored state.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-app-runtime`
- `gestaltview-context-architecture`
- `gestaltview-workflow-operations`

## Done when
- The recovery lane matches the live route and component reality in `gestaltview-v2`.
- Any new Billy, auth, pricing, or Supabase dependency is explicitly wired and documented.
