---
name: gestaltview-agents-context
description: Load and apply the current operating context for work inside `gestaltview-v2`. Use this skill when tasks depend on repo instructions, founder tone, coding constraints, or execution rules captured at the repo root and in the live skills catalog.
---

# GestaltView Agents Context

Last reviewed: 2026-03-29

Start here when the question is about how work should be done in this repository. The canonical operating context is in the root docs and live repo conventions, not in older archive-era assumptions.

## Inspect first
- `CLAUDE.md`
- `COLAB.md`
- `README.md`
- `docs/CurrentState.md`
- `.agents/skills/INDEX.md`

## Current integrations
- Root instructions, workflow docs, and the skill index jointly define the current execution environment.
- Package scripts and repo structure in `package.json`, `client/`, `api/`, `scripts/`, and `supabase/` should be used to verify what is actually possible before giving guidance.
- Supabase, Billy, and deployment rules belong to their real local files; this skill should route into them rather than summarize from memory.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-repo-onboarding`
- `gestaltview-repo-map`
- `gestaltview-workflow-operations`

## Done when
- Guidance matches the root repo instructions and current layout.
- No nonexistent AGENTS, archive folders, or unseen companion-repo files are treated as local facts.
