# Context Persistence Checklist

**Last updated:** 2026-04-19
**Use case:** Quick closeout checklist for preserving the useful context from a session without rereading the longer protocol.

---

## Before You End

- Did anything in the repo change in a way the next session must know?
- Did a live run, purge, deploy, or fix confirm a new truth?
- Did a schema, URL, env var, or route assumption change?
- Is there a blocker, degraded path, or compatibility caveat worth preserving?

If the answer to any of these is yes, write it down before you stop.

---

## What To Record

- exact current state
- exact verification result
- exact blocker or risk
- exact next action
- exact doc or file that now holds the durable truth

Keep it concrete. Keep it short.

---

## Where To Record It

- `docs/CurrentState.md` for operational truth
- `docs/ContinuityStack.md` when the continuity route itself changes
- `docs/Manifest.md` when the orientation map changes
- subsystem docs when the change is architectural or behavioral
- bug tracking docs when the issue needs board-level follow-up

Do not preserve this only in chat.

---

## The Minimum Handoff

Write one sentence for each:

1. What is true now.
2. What was verified.
3. What still needs attention.
4. What the next session should do.

Example:

> Trainer backlog is clear, the verification run is awaiting review, and the remaining risk is keeping job finalization aligned with the live Supabase schema.

---

## Do Not Carry Forward

- raw logs
- speculative theories
- redundant narration
- filler or praise
- IDs that no longer help the next step

If it does not affect the next decision, leave it out.

---

## Fast Exit Rule

If you only have time for one thing, update `docs/CurrentState.md` with the current state and next action.

That is enough to keep the work moving.

If the change affected the continuity workflow itself, also update `docs/ContinuityStack.md` and `docs/SessionHandoffPacket.md`.
