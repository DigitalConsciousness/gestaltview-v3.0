---
name: gestaltview-adhd-power-up
description: Maintain GestaltView's ADHD Power Up and Brain Sparks surfaces in `gestaltview-v2`. Use this skill when working on the `/adhd-powerup`, `/brain-sparks`, `/brain-sparks-station`, or `/bucket-drops` lanes and their surrounding Billy or product behavior.
---

# GestaltView ADHD Power Up

Last reviewed: 2026-03-29

This skill now belongs to the live routed experience in `gestaltview-v2`. Treat older archive language as supporting context only after you have checked the current page and component files.

## Inspect first
- `client/src/App.tsx`
- `client/src/components/ADHDPowerUpStation.tsx`
- `client/src/pages/BrainSparksPage.tsx`
- `client/src/components/BrainSparksStation.tsx`
- `client/src/pages/BucketDropsPage.tsx`

## Current integrations
- The current ADHD lane is spread across routed React pages and exhibit-style components, not a separate product repo inside this workspace.
- Billy package inference and intent handling in `shared/billy/runtime.ts` already recognize ADHD, bucket drops, and Brain Sparks as first-class cues.
- Supabase matters when this lane stores user state, tier access, or retrieval-backed context; do not imply persistence unless you also touch `supabase/` and the relevant API or auth files.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-app-runtime`
- `gestaltview-billy-intelligence`
- `gestaltview-workflow-operations`

## Done when
- ADHD Power Up, Brain Sparks, and Bucket Drops references match the live route and component map.
- Any tiering, Billy behavior, or data-storage claim is supported by current code.
