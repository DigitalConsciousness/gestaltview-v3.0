---
name: gestaltview-current-state
description: Use this skill for compendium-facing or cross-repo state mirroring from `gestaltview-v2`. It should capture what changed locally, what evidence supports it, and what needs to be handed off beyond this repo.
---

# GestaltView Current State

Last reviewed: 2026-03-29

Keep this skill as the compendium-facing mirror skill. Inside `gestaltview-v2`, use it only when a change needs a state handoff outward to `GestaltView-Official-Compendium`; otherwise use `gestaltview-current-state-maintenance`.

## Inspect first
- `docs/CurrentState.md`
- `.agents/skills/CurrentState.md`
- `README.md`
- `docs/gestaltview-v2.manifest.md`

## Current integrations
- Runtime state lives in `docs/CurrentState.md` while skills-library state lives in `.agents/skills/CurrentState.md`.
- Manifest outputs and cross-repo notes provide the evidence for what should be mirrored outward.
- Supabase, API, and schema changes should be summarized in state language only after verifying the actual local files and validations.

## Workflow
1. Decide first whether the requested state update is local-only or needs a cross-repo mirror note.
2. Extract facts from live repo files, validation output, and manifests before writing any summary.
3. Separate confirmed local changes from recommendations for external repos.
4. Avoid claiming that a sibling repo changed unless that repo is mounted and inspected.

## Compose with
- `gestaltview-current-state-maintenance`
- `gestaltview-cross-repo-sync`
- `gestaltview-knowledge-curation`

## Done when
- State notes clearly separate local reality from cross-repo mirror recommendations.
- No unseen companion-repo files are treated as updated facts.
