---
name: gestaltview-current-state-maintenance
description: Keep `docs/CurrentState.md` and adjacent repo-state surfaces synchronized with actual changes in `gestaltview-v2`. Use this skill whenever code, schema, docs, workflows, or validations change repository reality.
---

# GestaltView CurrentState Maintenance

Last reviewed: 2026-05-16

This is the active repo-state skill for `gestaltview-v2`. Use it whenever work changes runtime behavior, documentation truth, validation status, risks, or next actions.

## Inspect first
- `docs/CurrentState.md`
- `docs/ContinuityStack.md`
- `supabase/GestaltView_Schema_Alignment_Reference.md`
- `.agents/skills/CurrentState.md`
- `Tuesday.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `README.md`
- `docs/Workflows.md`
- `changed files`

## Current integrations
- `docs/CurrentState.md` is the runtime state log and `.agents/skills/CurrentState.md` is the skills-tree state log.
- `Tuesday.md` is the current issue queue when present, and the context-persistence docs keep the active working set from getting lost between sessions.
- Build, test, API, and Supabase validation commands should be cited only when they were actually run.
- Major route, schema, workflow, or catalog changes should update both code and state docs when relevant.
- When schema/security work changes the live contract, keep the migration spine, alignment reference, and current-state log in sync in the same pass when practical.

## Workflow
1. Capture what changed, why it changed, what was validated, and what risks or follow-ups remain.
2. Use exact commands and exact dates when recording verification or incidents.
3. Keep unrelated historical entries from obscuring the current pass; compress or separate old sections when needed.
4. Treat CurrentState as a factual operational log, not a marketing surface.

## Compose with
- `gestaltview-workflow-operations`
- `gestaltview-repo-map`
- `gestaltview-cross-repo-workflows`

## Done when
- CurrentState entries reflect the actual change set and validation status of the pass.
- Open risks and next steps are explicit instead of implied.
