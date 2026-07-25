---
name: gestaltview-ecosystem-orchestrator
description: Route multi-domain GestaltView work to the right specialist skill and repo boundary. Use this skill when the first task is deciding whether the request is about runtime, Billy, data, evidence, strategy, workflow, or cross-repo coordination.
---

# GestaltView Ecosystem Orchestrator

Last reviewed: 2026-06-01

Start here when the request spans multiple GestaltView domains and you need to choose the next specialist. This skill is the router, not the deep specialist.

## Inspect first
- `.agents/skills/INDEX.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/ONE_PAGE_NORTH_STAR.md`
- `README.md`
- `client/src/App.tsx`
- `docs/CurrentState.md`
- `package.json`

## Current integrations
- Route inventory, docs, the Vision Blueprint Package, and the live skill catalog together define the current ecosystem shape.
- Sibling repo references must be framed as integrations or handoffs rather than local certainty.
- Supabase touches multiple domains, so data-heavy work should be routed quickly into schema, Billy, or pricing specialists instead of being flattened here.

## Workflow
1. Classify the request among runtime, Billy, schema, evidence, strategy, workflow, or cross-repo ownership first.
2. Open only the specialist skills needed for the next concrete step.
3. State repo and Supabase boundaries explicitly whenever the request crosses them.
4. Return a clear handoff or execution plan instead of keeping work in the router longer than necessary.

## Compose with
- `gestaltview-suite-orchestrator`
- `gestaltview-vision-blueprint`
- `gestaltview-repo-onboarding`
- `gestaltview-cross-repo-workflows`

## Done when
- The correct specialist skill and repo boundary are chosen for the task.
- Cross-domain work is decomposed without losing the user-visible goal.
