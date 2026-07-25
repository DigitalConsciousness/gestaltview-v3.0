# Bugwalk Board

> Live triage board for bugwalk notes. Check this file and `docs/CurrentState.md` at the start of a session; update both at closeout when code or operating state changes.

## Active Bugwalks

| Date | Source | Status | Owner | Notes |
|---|---|---|---|---|
| 2026-04-21 | `BugWalk_4_21_26.md` | Closed locally | Codex | Runtime-layer pass completed for Billy intro/accessibility, Never Look Away wording, founder persistence, Agent Trainer degraded-source fallback, and Supabase workaround research handoff. |

## Closeout Protocol

1. Start by reading the active bugwalk note, this board, and the latest `docs/CurrentState.md` entry.
2. Convert observations into concrete tracks: runtime bug, UX copy/flow, persistence/API reliability, governance/docs, or follow-up decision.
3. Fix local code only where the repo gives enough evidence; record hosting, account-tier, or environment decisions as follow-up rather than guessing.
4. Run targeted tests for every touched surface and record any commands that could not run.
5. End by updating this board and appending `docs/CurrentState.md` with scope, changed files, validation, and remaining risks.
