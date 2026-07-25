---
name: python-code-style
description: Use the GestaltView CLI agent bundle for terminal workflows, local helper scripts, and the nested Python and deployment subskills shipped inside this folder. This skill should describe the current CLI bundle, not only generic Python style guidance.
---

# GestaltView CLI Agent

Last reviewed: 2026-03-29

This folder is an umbrella CLI and automation bundle inside the GestaltView suite, even though its declared name still tracks older `python-code-style` routing. Use it when the repo task centers on terminal workflows, helper scripts, or the nested subskills in this folder.

## Inspect first
- `skills/gestaltview-cli-agent/SKILL.md`
- `skills/gestaltview-cli-agent/scripts`
- `scripts/gv.sh`
- `scripts/gv-dev.sh`
- `scripts/gv-health-check.sh`
- `docs/Workflows.md`

## Current integrations
- Current CLI reality is the repo's shell helpers plus the nested Python and render skills shipped under this folder.
- Local Billy, Ollama, and environment-helper scripts live both in this bundle and under repo-root `scripts/`, so documentation should connect them instead of pretending they are separate systems.
- Supabase only enters CLI-agent work when a script touches migrations, ingestion, auth, or runtime validation against the database.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-workflow-operations`
- `gestaltview-repo-onboarding`
- `skill-creator`

## Done when
- The bundle description reflects current helper scripts and nested skills.
- The legacy name mismatch is acknowledged instead of silently ignored.
