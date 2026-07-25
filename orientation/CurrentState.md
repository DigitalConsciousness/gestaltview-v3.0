# CurrentState — Orientation packet spine/delta/checkpoint scaffolding

**Last updated:** 2026-04-13
**Owner context:** GestaltView v2 runtime repository (`gestaltview-v2`)
**Scope of this pass:** Introduced a repo-local orientation packet structure built around a stable spine, a live delta, and a generated latest checkpoint so collaborators and future digital intelligence surfaces can reorient quickly without rereading the full repo state.

## Executive summary (2026-04-13)

- Added an orientation-layer structure under `orientation/` built around:
  - `orientation_spine.v2.json`
  - `orientation_delta.current.json`
  - `orientation_checkpoint.latest.json`
  - `build_orientation_checkpoint.py`
  - `5_invariants_for_digital_intelligences.json`
- Split orientation into three distinct roles:
  - **spine** for stable repo/system truths
  - **delta** for active blockers, changed assumptions, and current focus
  - **checkpoint** for fast re-absorption
- Defined `docs/gestaltview-v2.manifest.json`, `docs/gestaltview-v2.manifest.md`, `docs/CurrentState.md`, and `bugwalks/BugWalkBoard.md` as explicit source-of-truth surfaces inside the packet itself.
- Positioned the checkpoint layer as the future sync surface for `embodiment_profiles`, so fast reorientation can happen through a compact summary instead of repeated full-packet ingestion.

## What changed

- Added:
  - `orientation/orientation_spine.v2.json`
  - `orientation/orientation_delta.current.json`
  - `orientation/orientation_checkpoint.latest.json`
  - `orientation/build_orientation_checkpoint.py`
  - `orientation/5_invariants_for_digital_intelligences.json`
- Established packet rules that separate:
  - stable doctrine
  - live operational deltas
  - latest absorb-first checkpoint summaries
- Defined a first-pass knowledge distribution hub model with:
  - `global`
  - `domain`
  - `agent_specific`
  knowledge lanes and lifecycle states of:
  - `available`
  - `linked`
  - `interpreted`
  - `embodied`

## Why this was needed

- Repo orientation had become too heavy to keep rewriting as one monolithic artifact.
- The repo now has enough moving surfaces — manifest, CurrentState, BugWalk board, operator docs, trainer state, personhood state — that a collaborator or digital intelligence needs a compact way to distinguish stable structure from live change.
- A spine/delta/checkpoint model reduces reintroduction tax while preserving source-of-truth discipline instead of flattening everything into one giant summary file.
- This also creates a cleaner future handoff path into `embodiment_profiles`, where checkpoint summaries can be absorbed without duplicating the full underlying packet.

## Validation performed

- Checked packet references against the live repo source-of-truth surfaces:
  - `docs/gestaltview-v2.manifest.json`
  - `docs/gestaltview-v2.manifest.md`
  - `docs/CurrentState.md`
  - `bugwalks/BugWalkBoard.md`
- Verified the checkpoint generator logic is aligned with the intended spine + delta merge model.
- Confirmed the packet reflects the current live blocker emphasis around the trainer recommendations path rather than treating older orientation snapshots as authoritative.

## Current repo condition after this pass

1. The repo now has a machine-readable orientation layer that distinguishes stable structure from live operational change.
2. CurrentState remains the implementation-history ledger, while the orientation packet becomes the fast reorientation surface.
3. Checkpoint summaries can now become the preferred short-form ingest surface for embodiment and collaborator reentry.
4. Orientation drift risk is reduced because the packet explicitly points back to the repo manifest, CurrentState log, and BugWalk board as governing references.

## Remaining risks / next steps

1. Do not let `orientation_delta.current.json` drift from `docs/CurrentState.md` and `bugwalks/BugWalkBoard.md`; the delta only works if it stays live.
2. Add a lightweight regeneration habit or script hook so `orientation_checkpoint.latest.json` is rebuilt whenever the delta materially changes.
3. Decide when checkpoint summaries should be mirrored into `embodiment_profiles` and what the minimum approved absorption surface should be.
4. If the knowledge distribution hub becomes operational, formalize where those states live in runtime data instead of leaving them orientation-only.

## Overall repo state and recommendations

- The repo now has the beginnings of a real orientation system rather than a single ever-growing summary surface.
- Recommendation: treat the spine as slow-changing doctrine, the delta as live operational truth, and the checkpoint as the only absorb-first summary meant for fast collaborator recovery.
