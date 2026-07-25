# Playbook docs addendum

**Date:** 2026-03-30
**Repo:** `gestaltview-v2.0`
**Scope:** Added expanded operator-facing playbook documentation that complements `docs/PlaybookSpec.md` and uses the complete wiki as a terrain source while explicitly prioritizing live runtime files when drift exists.

## What was added

- `docs/PlaybookOperatorManual.md`
- `docs/PLAYBOOK_CHECKLIST.md`

## Why this pass happened

The repository already had a new playbook spec, but it still needed:
- a more official operator-manual surface,
- a faster neurodivergent-friendly checklist for real task execution,
- diagram-rich guidance that makes subsystem boundaries easier to see,
- explicit warnings about drift between runtime truth and higher-level prose.

## What this documentation pass emphasizes

- source-of-truth hierarchy
- subsystem playbooks for Billy, auth, exhibits, trainer, diligence, and docs/skills
- release and incident handling
- short-loop validation expectations
- cross-repo handoff discipline
- drift watch around provider posture, env-template assumptions, and wiki confidence

## Notes on source discipline

The new playbook docs were informed by the complete wiki, but they intentionally treat the wiki as a mapping surface rather than a final authority. When the wiki, older agent instructions, or repo prose conflict with current runtime behavior, the live code and current-state surfaces remain authoritative.

## Recommended next follow-up

When there is a natural repo-maintenance pass, fold the most important notes from this addendum into `docs/CurrentState.md` proper so the state log and the new playbook surfaces are visibly linked in one canonical location.

**© 2026 Keith Soyka / GestaltView — All Rights Reserved**
