# BugWalk Board SOP

## Purpose

- `bugwalks/BugWalkBoard.md` is the lightweight, human-readable board for friction, regressions, and weird behavior found during walkthroughs.
- `docs/CurrentState.md` remains the canonical technical ledger for fixes that actually landed.
- Raw captures stay in `bugwalks/` as `.mht`, `.html`, screenshots, notes, or transcripts.

Think of the board as the fun front-end and `CurrentState.md` as the durable back-end.

## Standard Mode Of Operation

1. Save the raw capture in `bugwalks/`.
2. Distill the capture into individual board cards the same day.
3. Keep each card scoped to one bug, one friction point, or one follow-up.
4. When work starts, move the card into the active lane and name the owner plus the next verification step.
5. When a bug-fix pass starts, move the card to `In Flight` and note the intended verification step.
6. At the end of every attempted fix pass, update `bugwalks/BugWalkBoard.md` and `docs/CurrentState.md` in the same change.
7. When code lands and the bug appears fixed, move the card to `Shipped / Verify` and list the touched files plus the validation command.
8. If the bug still reproduces, do not mark it shipped. Keep it in `In Flight` or move it back to `Ready / Confirmed`, then record what was tried and what did not work in both the board card and `docs/CurrentState.md`.
9. When the fix is durable enough to count as repo state, summarize it in `docs/CurrentState.md`.
10. Do not let important issues live only in chat or only in a raw transcript.

## Dual-Log Closeout Protocol

Every bug-fix pass should leave two synchronized traces:

- `bugwalks/BugWalkBoard.md` answers: what bug was worked, what status is it in now, what was tried, and what should happen next.
- `docs/CurrentState.md` answers: what changed in the repo, what validation was run, and what did not work if the bug persisted.

Minimum rule:

1. Update both files in the same commit or PR whenever a bug-fix pass ends.
2. Include the BugWalk ID in the `CurrentState.md` entry.
3. Add an `Attempt log` line to the board card once code or configuration has been tried.
4. If the bug persists, explicitly record the failed attempt in `CurrentState.md` under a `What did not work / persistence signals` section.
5. A card should not sit in `Shipped / Verify` with `CurrentState link: pending` after the fix pass is complete.

## Required Card Fields

Every board card should include:

- `ID`: `BW-YYYY-MM-DD-##`
- `Status`
- `Surface`
- `Symptom`
- `Impact`
- `Source`
- `Owner`
- `Next move`
- `Evidence`

If the issue has been implemented, also add:

- `Validation`
- `CurrentState link` or `n/a` if it has not been written up yet

If code has been attempted, also add:

- `Attempt log`
- `Persistence note` when the bug still reproduces after the attempt

## Board Lanes

- `Fresh Sightings`: newly captured, not yet triaged
- `Ready / Confirmed`: real issue, ready to be picked up
- `In Flight`: actively being fixed
- `Shipped / Verify`: code changed, needs local or deployed verification
- `Watching / Deferred`: intentionally parked, blocked, or waiting on another system

## Naming Conventions

- Raw capture files should use `YYYY-MM-DD-<slug>` when possible.
- Keep one living `BugWalkBoard.md` for the current repo state rather than making a new board file for every walkthrough.
- If a walkthrough is especially large, keep the raw artifact separate and only pull the actionable issues onto the board.

## Update Cadence

- After every walkthrough: update `BugWalkBoard.md`
- After every bug-fix pass prompted by the board: update `BugWalkBoard.md` and `docs/CurrentState.md` in the same change
- After every durable fix or significant state change: make sure the board card and `CurrentState.md` entry still agree

## CLI Helper

Use the scaffold command when you want a fresh intake note plus a starter board card:

```bash
npm run bugwalk:new -- "short title"
npm run bugwalk:new -- "issued key validation fails" --owner "Backend / ops" --surface "GATE redeem flow"
```

What it does:

- creates a dated intake note in `bugwalks/`
- suggests the matching raw capture filename to save
- inserts a new card into the chosen board lane
- assigns the next `BW-YYYY-MM-DD-##` id automatically

Use the closeout scaffold when a bug-fix pass is ending and you need to update both the board and `CurrentState.md` together:

```bash
npm run bugwalk:close -- BW-2026-04-09-05 "package builder selections and inputs bounced"
```

What it does:

- creates a closeout scaffold note under `bugwalks/closeouts/`
- gives you a paired board-update block and `CurrentState.md` entry stub
- reminds you to capture both successful fixes and failed attempts
