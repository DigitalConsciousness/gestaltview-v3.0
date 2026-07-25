# Continuity Stack

This is the canonical map for reducing reintroduction tax in `gestaltview-v2`.

If a new session starts cold, this is the smallest set of surfaces that should rehydrate the working context:

1. `docs/CurrentState.md`
2. `docs/ContextPersistenceChecklist.md`
3. `docs/SessionHandoffPacket.md`
4. `docs/ContextPersistenceProtocol.md`
5. `docs/ContinuityStack.md`

For embodiment work, the same stack extends into:

6. `GestaltView-Collaboration-Onboarding-Packet/`
7. `embodiment_profiles/`
8. `scripts/validate-embodiment-profiles.mjs`
9. `scripts/build-embodiment-artifacts.mjs`
10. `scripts/sync-embodiment-profiles.ts`

## What each layer does

### Current State

`docs/CurrentState.md` is the durable operational log.

Use it for:
- what changed
- what was verified
- what is still risky
- what the next session should do

### Context Checklist

`docs/ContextPersistenceChecklist.md` is the fast closeout reminder.

Use it to decide whether a change must be preserved before a session ends.

### Session Handoff Packet

`docs/SessionHandoffPacket.md` is the copy-ready handoff format.

Use it when a session is ending and the next one needs a short, factual restart packet.
When you are packaging that handoff for later use, place the bundle in `artifacts/`.
If you need a fixed retrieval path, also copy or link it to `artifacts/latest.zip`.

### Protocol

`docs/ContextPersistenceProtocol.md` is the rulebook for what context gets rolled forward and what gets dropped.

Use it when deciding whether a detail belongs in durable docs or should stay ephemeral.

### Continuity Stack

This document ties the stack together and keeps the repo from drifting into multiple competing source-of-truth paths.
It also points handoff bundles to `artifacts/` so the export location stays stable.
The newest package should also be available as `artifacts/latest.zip`.

## Embodiment workflow

When the work is about `embodiment_profiles/`, use this order:

1. Read the continuity stack.
2. Read the onboarding packet.
3. Read the profile JSON files in scope.
4. Update the profile JSON first.
5. Validate the profile shape.
6. Regenerate `shared/embodiment/generated.ts` only if the profile set changed.
7. Sync to Supabase only when persistence is intended.

### Intended targets

The usual write targets are:
- `embodiment_profiles/*.embodiment.json`
- `shared/embodiment/generated.ts`
- `docs/embodiment/*`
- `scripts/sync-embodiment-profiles.ts`

The usual do-not-touch files unless explicitly requested are:
- `shared/embodiment/types.ts`
- `shared/embodiment/index.ts`
- generated artifacts that have not been intentionally regenerated

## Session handoff format

Use `docs/SessionHandoffPacket.md` for the exact one-page restart form.
Use this stack to decide what belongs in that packet before you write it down.

## Why this exists

The stack keeps the repo from relying on chat memory.

The goal is not to preserve everything.
The goal is to preserve the smallest useful amount of truth that lets the next session continue without rediscovering it.
