# Session Handoff Packet

**Last updated:** 2026-04-19
**Purpose:** A copy-ready packet for ending one session and starting the next with minimal re-reading.

Use this together with [ContinuityStack.md](./ContinuityStack.md). The continuity stack is the canonical routing layer; this file is the handoff form.

---

## Use When

- ending a fix
- pausing a long investigation
- handing work across sessions
- needing a clean restart packet after context drift

---

## Fill This In

```md
**Current state**
- ...

**What was verified**
- ...

**What changed**
- ...

**What still needs attention**
- ...

**Next action**
- ...

**Important files**
- [path](/absolute/path/to/file)

**Important commands**
- `command here`
```

---

## Short Version

If you only have room for one line, write:

> Current state, verification result, remaining risk, next action.

---

## Example

> Trainer backlog is clear, the verification run is awaiting review, and the only remaining risk is keeping job finalization aligned with the live Supabase schema.

---

## Notes

- Keep it factual.
- Use exact dates and exact run IDs when they still matter.
- Link files with absolute paths.
- Leave out chatty narration.

## Default order

1. Write the current state to `docs/CurrentState.md`.
2. Keep the short restart packet in this file or in the current closeout note.
3. Update `docs/ContinuityStack.md` if the workflow itself changed.
4. Update the touched subsystem docs if the change affects more than one surface.
5. Copy the packaged bundle into `artifacts/` when you want a durable handoff archive.
6. Copy or link the newest bundle to `artifacts/latest.zip` when you want a stable retrieval path.
