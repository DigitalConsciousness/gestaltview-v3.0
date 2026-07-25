# State Update Guide

## Primary files to check

- `CurrentState.md`
- `README.md`
- `Workflows.md`
- `ArchitecturalStructure.md`
- `AIFlow.md`
- `APIFlow.md`
- `Manifest.md`

## What should trigger a state update

- New or changed skills/documentation affecting agent behavior.
- Runtime/API/script changes affecting contributor workflows.
- Schema/ingestion/manifest contract changes.
- Cross-repo integration or ownership shifts.
- New risks, blockers, or verified completions.

## Reasoning sequence

1. Inspect the actual diff.
2. Identify user-visible or contributor-visible impact.
3. Decide whether the impact is operational, architectural, or informational.
4. Update `CurrentState.md` first, then align adjacent docs.

## Common failure modes

- Leaving completed tasks listed as pending.
- Presenting assumptions as verified fact.
- Omitting validation commands.
- Updating implementation docs without refreshing onboarding docs.
- Using inconsistent names for integrated repositories.
