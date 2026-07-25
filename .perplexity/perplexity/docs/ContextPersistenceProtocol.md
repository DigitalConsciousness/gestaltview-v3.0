# Context Persistence Protocol

**Last updated:** 2026-04-19
**Purpose:** Define what context should be rolled forward between sessions, where it should live, and what should be left behind.

---

## 1. Purpose

This repository keeps durable context in docs instead of chat.

Use this protocol when a task produces knowledge that matters after the current session ends:

- a live bug was fixed or partially fixed
- a runtime schema or environment assumption changed
- a verification run proved or disproved an end-to-end flow
- a new canonical host, path, or workflow became the active truth
- a blocker or risk should be visible to the next agent

The goal is not to preserve everything. The goal is to preserve the smallest useful amount of truth that lets the next session continue without rediscovering the same facts.

---

## 2. Canonical Surfaces

When context must be preserved, write it to the right surface:

- `docs/CurrentState.md` for durable operational truth and verified repo state
- `docs/ContinuityStack.md` for the canonical routing path between state, handoff, onboarding, and memory sync
- `bugwalks/BugWalkBoard.md` for bug tracking and closeout flow
- subsystem-specific docs when the change is architectural or behavioral, not just operational
- `docs/Manifest.md` when the document inventory or orientation map needs to point at a new canonical file

Do not rely on chat history as a source of record.

---

## 3. What Gets Rolled Forward

Carry forward facts that matter to the next execution:

- the exact runtime state that was verified
- the last known good values for canonical URLs, env vars, and service surfaces
- active blockers, degraded paths, and schema mismatches
- run IDs, commit SHAs, or job IDs only when they are still operationally relevant
- the exact tests or commands that proved the current state
- anything that would change the next debugging decision

If a session ends while work is incomplete, include the next best continuation point.

---

## 4. What Does Not Get Rolled Forward

Do not preserve:

- raw tool output unless it contains a concrete failure detail worth quoting
- speculative theories without evidence
- redundant step-by-step logs
- ephemeral IDs that are no longer needed to resume work
- conversational filler or praise

If a detail does not help the next session decide what to do, leave it out.

---

## 5. Roll-Forward Format

When you update `docs/CurrentState.md`, use a compact structure:

1. `What changed`
2. `What was verified`
3. `What remains risky`
4. `What the next session should do`

Prefer exact dates and explicit names over relative wording.

Example:

- `2026-04-19: Purged stale trainer runs, verified a fresh run to awaiting_review, and patched trainer job settlement for the live schema shape.`

---

## 6. Session Closeout Rule

Before ending a session, ask:

- Did I change live behavior or assumptions?
- Would the next session need this fact to avoid repeating work?
- Is there a better place than chat to store it?

If the answer is yes, update the appropriate doc in the same pass.

---

## 7. Continuity Seed Rule

Every meaningful handoff should leave one short continuity seed:

- the current status in one sentence
- the next action in one sentence
- the active risk in one sentence if needed

This is the minimum useful context to resume without rereading the whole session.

Example:

> Trainer backlog is clear, the verification run is awaiting review, and the only remaining risk is keeping job finalization aligned with the live Supabase schema.

---

## 8. Suggested Reading Order for a Returning Agent

1. `docs/CurrentState.md`
2. `docs/ContextPersistenceChecklist.md`
3. `docs/SessionHandoffPacket.md`
4. `docs/ContextPersistenceProtocol.md`
5. `docs/ContinuityStack.md`
6. Any subsystem doc named in the current state entry
7. The live code paths tied to the current issue

---

## 9. Maintenance Rule

If this protocol becomes stale, update it the same way you would update operational state:

- keep it short
- keep it concrete
- keep it tied to the current repo reality

---

## 10. Intended Use

This document is for rolling context forward, not for archiving every thought.

If a future session needs to continue work, this protocol should tell it:

- where to look
- what to trust
- what to ignore
- what to do next
