---
name: gestaltview-workflow-operations
description: Run the repo with current operational discipline. Use this skill for scripts, validation order, manifest sync, CurrentState updates, and routine execution hygiene in `gestaltview-v2`, including the current handoff and issue-tracking docs.
---

# GestaltView Workflow And Operations

Last reviewed: 2026-05-16

Use this skill for execution hygiene. It should point at the commands and files that actually exist today rather than at generic operating advice.

## Inspect first
- `package.json`
- `scripts/gv-health-check.sh`
- `scripts/run-comprehensive-tests.sh`
- `scripts/test-apis.sh`
- `docs/ContinuityStack.md`
- `docs/Workflows.md`
- `docs/CurrentState.md`
- `Tuesday.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`

## Current integrations
- Package scripts and shell helpers define the current operational workflow.
- CurrentState files capture why the repo is in its present condition and what changed most recently.
- `Tuesday.md` is the current issue queue when present, and the context-persistence docs keep session handoffs short and factual.
- Supabase-related validation lives in dedicated scripts and should be used when schema, auth, or retrieval changes are involved.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-repo-onboarding`
- `gestaltview-current-state-maintenance`
- `gestaltview-schema-supabase`

## Done when
- Operations guidance references real commands and files.
- Validation expectations match the touched subsystem instead of using a one-size-fits-all checklist.
