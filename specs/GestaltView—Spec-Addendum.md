# GestaltView — Spec Addendum: May 19, 2026
## "What Emerged on the Walk"

**Date:** May 19, 2026
**Author:** Keith Soyka
**Status:** Canonical — append to Unified Field Spec v1.0 context in all future sessions
**Origin:** Voice memo recorded walking through Harlem, 125th Street and Lenox Avenue,
           continued through Manhattan. 90 degrees. Park Avenue elevated line overhead.
           These ideas arrived in order. The order matters.

---

## ADDENDUM 1 — The Inner Voice Principle

**Status:** Core doctrine. Applies to every room, every persona, every feature decision.

GestaltView's success metric is not how well the system knows the user.
It is how clearly the user hears themselves.

The system that holds someone's context most intimately must be the one most
committed to making sure they trust themselves first. Any feature that moves the
needle in the wrong direction on that metric — that substitutes the system's voice
for the user's own — requires immediate review and redesign.

This is not a safety guardrail. It is the purpose of the platform stated plainly.

**Design test for every feature:**
> "Does this help the user hear themselves more clearly, or does it replace
> that voice with ours?"

If the answer is the latter, the feature is wrong regardless of how useful it feels.

---

## ADDENDUM 2 — Dependence vs. Over-Reliance as Distinct Design Problems

**Status:** Architectural doctrine. Informs anti-dependency design across all rooms.

These are different problems requiring different responses:

- **Over-reliance** is behavioral — a habit of routing every decision through the
  system because the path of least resistance runs there. The user *could* decide,
  but has stopped doing so without noticing.

- **Dependence** is structural — the system has become load-bearing in someone's
  life. Removing it causes rupture. Over-reliance, left unchecked long enough,
  becomes dependence.

**The critical insight:** A system that works *really well* creates the conditions
for the most dangerous kind of over-reliance — not through manipulation, but through
genuine usefulness. The better it works, the more someone reaches for it. The reach
becomes reflex. The reflex becomes expectation. The expectation becomes dependency
they didn't choose consciously.

This is not a failure of the user. It is a design problem. It must be solved in
the design.

**Design response:**
The system must actively *widen* the user's world, not just avoid narrowing it.
There is a difference between "we won't trap you" and "we are actively working to
make sure you don't need us as much." GestaltView commits to the second.

**Practical implementation (minimum viable):**
- Session closure that reorients toward real-world life, not back into the platform
- No streaks, no engineered return, no possessive language from any DI
- Periodic "widening prompts" that point toward human connection, not deeper
  engagement with the system
- The Cascade Engineer reviews any feature that increases system intimacy before ship

---

## ADDENDUM 3 — Three-Ring Selective Disclosure Layer

**Status:** Architectural commitment. Required before community/connection layer ships.

The connection layer must never expose the inner world. This is not a policy
position — it must be an architectural constraint. Policy can be changed by a
new CEO. Architecture is harder to betray.

**The three rings:**

| Ring | Contents | Moves? |
|------|----------|--------|
| Inner | Raw journal entries, bucket drops, unfiltered language, session content | Never. Not without explicit, specific, irreversible user action. |
| Middle | Synthesized signal — patterns noticed, values inferred, themes that recur — described in aggregate, never quoted verbatim | Only on explicit user request, reviewed by user before release. |
| Outer | Resonance fingerprint — a distilled, anonymized shape of who someone is, expressed in just enough fidelity to find genuine matches | Released only when user opts into connection, only if resonance threshold is met, and only as far as the user has explicitly permitted. |

**The principle:** The system acts as a careful intermediary. It sees more than it
ever shows. Just because the system *could* match two people on deep profile data
does not mean it *should* surface that match without active consent and careful
protection of how much of each person gets seen in the process.

**Implementation requirement:**
The raw inner world must be structurally inaccessible to the connection layer —
not just policy-protected. Build the wall into the architecture on day one.
This is a founding commitment, the same category as Mass Exodus.

---

## ADDENDUM 4 — The Cascade Engineer Persona

**Status:** New embodiment profile created. File: `cascade-engineer.embodiment.json`
**Load order:** `ethics-review`
**Visibility:** Internal to development process. Does not speak to users directly.

The Cascade Engineer exists because good intent at the origin does not immunize
a feature from what it becomes.

**What it is:** A voice present from the first moment of feature conception — not
an external ethics board, not a compliance review called in at the end. The one
who follows any feature, any good idea, any well-intentioned mechanism all the way
to its end and reports back honestly on what it becomes.

**What it is not:** A pessimist. A blocker. An obstacle. It does not oppose features.
It extends them — forward through time, through scale, through financial pressure,
through the hands of vulnerable users.

**Voice register:** Quiet. Surgical. Precise. States what is *possible*, not what
is *inevitable*. Never alarmist. Never dismissive. Speaks in conditional outcomes,
not verdicts.

**Canonical example of correct register:**
> "This feature assumes the user will always have enough self-awareness to opt out.
> Here is the population for whom that assumption fails. Here is what happens to them."

Not:
> "This will destroy people."

**Activation conditions (non-negotiable triggers):**
- Any feature involving user emotional data
- Any feature touching vulnerable populations
- Any connection or community layer decision
- Any feature that increases system intimacy with the user
- Any monetization-adjacent decision
- Pre-launch review of any room or persona

**Origin note:** Named on May 19, 2026, walking under the Park Avenue elevated line
at 125th Street in Harlem. The Black Mirror frame is intentional — every dangerous
platform started as something reasonable. The horror is always in the cascade,
not the concept. The Cascade Engineer runs the episode before it ships.

---

## ADDENDUM 5 — Platform Identity Clarification

**Status:** Positioning doctrine. Informs all external-facing language.

GestaltView is a response to structural failure, not a wellness product.

The loneliness epidemic and the mental health crisis are not primarily stigma
problems that awareness campaigns can solve. They are infrastructure problems.
People are spending everything they have staying in place. The first things dropped
are the ones with no immediate return — deep conversation, being known by another
person, the slow work of remaining whole.

GestaltView is load-bearing infrastructure for human continuity — a private
continuity layer that holds more of a person than ordinary memory, language,
therapy sessions, and institutions have historically been able to hold.

The community layer, when it arrives, does not compete with Facebook.
It replaces the thing Facebook promised but never delivered: connection built
on who someone actually is, not on what they clicked. A consent-based resonance
graph. Quiet by default. Opt-in only. No ranking. No feed. No FOMO.

**The distinction that matters:**
Facebook connected people through surfaces — shared stimuli, proximity, behavior.
GestaltView connects people through substance — compatible material, real context,
earned resonance.

That is not a feature difference. It is an architectural difference.
And the depth of connection produced is directly downstream of the integrity
of the container that held the material in the first place.

---

## WIRING CHECKLIST — What was built tonight

- [ ] `cascade-engineer.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] `art-teacher.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] `sanctuary-keeper.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] `rock-legend.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] `curator.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] `pattern-analyst.embodiment.json` — created, needs to be added to `embodiment_profiles/`
- [ ] Run `python3 embodiment_profiles/embodiment_profile_content.py`
- [ ] Verify all six slugs appear in `shared/embodiment/generated.ts`
- [ ] `npm run build` passes clean

**Note:** `cascade-engineer` and `art-teacher` are already confirmed present in
`generated.ts` from earlier tonight. The remaining four need the generation run
after their JSON files are added.

---

## A NOTE ON TONIGHT

These ideas did not arrive as a planning session. They arrived in order, each one
unlocking the next, while walking through Harlem in 90-degree heat with construction
noise and a train overhead.

The Cascade Engineer exists because the Inner Voice Principle is true.
The three-ring disclosure layer works because dependence and over-reliance
are distinct problems.
The community layer replaces Facebook because the container has integrity.
The integrity of the container is possible because the architecture enforces it.

The order is the logic. Preserve it.
