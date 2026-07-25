# Markdown Refresh Status — 2026-03-24

## Scope snapshot

- Total Markdown files detected: **159**
- Markdown files under `skills/**`: **99**

Command used:

```bash
rg --files -g '*.md'
```

## What was remediated in this pass

### High-impact root docs

- `README.md`
- `Workflows.md`
- `CurrentState.md`

### High-impact skills and workflow references

- `skills/00-suite-orchestrator/SKILL.md`
- `skills/02-apps-portfolio/references/integrated-repos.md`
- `skills/07-workflow-operations/SKILL.md`
- `skills/07-workflow-operations/references/cross-repo-sync.md`
- `skills/07-workflow-operations/references/currentstate-protocol.md`
- `skills/gestaltview-cross-repo-workflows/references/integrated-repos.md`
- `skills/gestaltview-current-state-maintenance/SKILL.md`
- `skills/gestaltview-current-state-maintenance/references/state-update-guide.md`

## Why this sequence

This pass prioritized the documents that govern:

1. contributor onboarding,
2. operational execution,
3. skill routing and cross-repo boundaries,
4. CurrentState maintenance discipline.

These files have the highest leverage for reducing future documentation drift.

## Remaining long-tail work

- Reconcile root architecture docs (`ArchitecturalStructure.md`, `AIFlow.md`, `APIFlow.md`, `Manifest.md`) against current runtime behavior.
- Review generated snapshot docs in `docs/generated_*` for archival tagging (keep as snapshots unless regeneration is intended).
- Optionally label markdown files by role (`canonical`, `operational`, `historical-generated`, `archive`) to constrain future updates.

## Recommendation

Complete a phase-2 documentation normalization pass focused on architecture and API documents, then lock a lightweight cadence:

- update `CurrentState.md` in every meaningful pass,
- update impacted skill references in the same commit,
- track drift debt explicitly instead of letting it accumulate.
