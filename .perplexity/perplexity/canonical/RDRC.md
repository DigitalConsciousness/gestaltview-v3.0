# Rough Draft Ratification Charter (RDRC)

> **Version:** 1.0
> **Last updated:** 2026-04-24
> **Status:** Canonical / active
> **Scope:** Rough-draft capture, doctrine ratification, and governance-state transitions across GestaltView repos

---

### *This charter formalizes GestaltView's rule that early insight must be preserved before it is polished, and that preservation must stay distinct from ratified standing. A rough draft is protected. It is not doctrine until it is named, placed, and connected to review or enforcement.*

## Purpose

The purpose of this charter is to close the gap between recognition and ratification.

GestaltView already treats Constitutional Invariants as first-class doctrine, uses manifest and orientation layers to preserve important context, and applies same-pass closeout habits when changes become durable repo state. This charter extends that pattern to strategy, principles, doctrine, and operating truths that are often spoken clearly before they are formally enacted.

Across GestaltView and its companion repos, the system should never confuse "this was seen vividly" with "this now has standing in the system."

## Core principle

A rough draft is not noise. A rough draft is protected pre-doctrine.

Bucket Drops were designed as low-friction capture for fleeting insight, and the broader GestaltView philosophy treats fragmented thought as meaningful raw material rather than evidence of disorder. Because of that, the system should preserve rough drafts immediately, but label them honestly. A protected rough draft is real, but it is not yet canonical, binding, or enforceable until it moves through an explicit ratification path.

## Status ladder

Every doctrine-like idea should move through a visible state model rather than living in ambiguous half-existence.

| Status | Meaning | System expectation |
|---|---|---|
| Captured | The idea exists as a protected record. | Preserve it, timestamp it, and prevent loss. |
| Candidate | The idea appears important, recurring, or structurally central. | Surface recurrence evidence and ask whether it deserves standing. |
| Drafted | The idea has a named object, working language, and proposed home. | Route it toward a canonical document, workflow, or runtime surface. |
| Ratified | The idea now has explicit standing. | Treat it as doctrine and cite it as a source of truth. |
| Enforced | The doctrine is connected to a check, gate, workflow, or runtime behavior. | Detect drift and fail loudly when violated. |
| Stale review needed | The doctrine exists but may no longer match reality. | Trigger review rather than letting doctrine decay silently. |

## Doctrine candidate object

The minimal unit for this workflow is a doctrine candidate. It should be small enough to create in rough-draft mode and structured enough to become real later.

A doctrine candidate should contain:

- title
- raw statement
- why it matters
- evidence of recurrence
- proposed home
- current status
- owner
- next ratification action
- linked source traces such as `docs/CurrentState.md`, canonical files, orientation references, or companion-repo artifacts

A useful framing sentence for the object is: "This truth has been noticed, but not yet granted standing."

## Dependabuddy behavior

The dependabuddy function should not act like a nagging task app. It should act like a governance witness that detects when an idea has been emotionally or architecturally recognized but not yet formalized.

Its core interventions should sound like this:

- This has now appeared multiple times and may deserve doctrine standing.
- This exists as a rough draft and is now safe, but it is not yet ratified.
- This was ratified in language but not yet connected to a runtime or review gate.
- This canonical document exists, but drift may be emerging between doctrine and practice.

The aim is not pressure for its own sake. The aim is to reduce the failure mode where vividness impersonates completion.

## Ratification rule

Nothing becomes doctrine because it was said beautifully. Nothing becomes canonical because it felt true in the moment. It becomes real when it is preserved, named, placed, and connected to a review or enforcement surface.

That rule matches existing repo behavior. The invariants became stronger when they were elevated into a canonical charter with explicit standing, bundled into canonical app context, and indexed by the manifest layer rather than left as an isolated draft.

## Initial operating rule

Effective immediately, any principle, doctrine, invariant, or recurring strategic truth that feels foundational should be captured as a protected rough draft first. The question is no longer whether it is polished enough. The question is whether it is important enough to deserve preservation.

Once captured, the system should explicitly ask one follow-up question: does this remain a protected rough draft, or should it advance to doctrine candidate status? That single threshold separates safe capture from premature canonization.

## First implementation target

The first feasible implementation is a repo-local Doctrine Inbox. It can sit beside existing orientation and closeout habits and store candidate objects in a lightweight, inspectable format, with recurrence evidence and next ratification action visible at a glance.

That makes the workflow concrete without overbuilding. GestaltView already has precedent for lightweight governance surfaces that become real through scripts, checks, and canonical docs rather than through abstract intention alone.
