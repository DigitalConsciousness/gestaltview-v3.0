# SPEC: Two-Pass Gravity Protocol
**Version:** 1.0  
**Author:** Keith Soyka / GestaltView  
**Status:** Draft — Ready for Implementation

---

## What This Is

A structured two-pass evaluation protocol for cutting through hype, surface-level pattern matching, and
AI-generated noise to locate the actual signal in any input — document, idea, conversation, codebase,
corpus chunk, or claim. Designed to run as a composable workflow inside GestaltView's agent layer.

The metaphor is gravitational: the first pass maps the visible mass (what's loud, what's obvious, what's
being marketed). The second pass detects the dark matter — the real gravitational pull that explains why
things actually behave the way they do.

---

## Core Principle

> Hype has surface area. Signal has gravity.
> The protocol does not fight hype. It ignores it by measuring pull, not volume.

---

## The Two Passes

### Pass 1 — Surface Mapping (What's Loud)

**Goal:** Inventory what is being claimed, asserted, or emphasized. No evaluation yet. Pure observation.

**Operations:**
- Extract all explicit claims, named concepts, and emphasized terms
- Flag emotional intensifiers (revolutionary, unprecedented, transformative, game-changing)
- Note repetition — what keeps appearing signals what the source wants you to notice
- Identify the frame being used (what comparison class is implied?)
- Record what is conspicuously absent or deflected

**Output:** A structured surface map:
```
{
  "loud_claims": [...],
  "intensifiers": [...],
  "repetition_patterns": [...],
  "implied_frame": "...",
  "notable_absences": [...]
}
```

**Rule:** No judgment in Pass 1. The goal is fidelity, not critique. Capture what the source is doing,
not whether it's true.

---

### Pass 2 — Gravity Detection (What Has Pull)

**Goal:** Find what actually explains behavior, outcomes, or patterns. Ignore volume; measure mass.

**Operations:**
- For each loud claim: ask "what would have to be true for this to be real?"
- Test for consistency: does the evidence cited actually support the claim, or just neighbor it?
- Look for load-bearing ideas — remove them mentally and see if anything collapses
- Identify the smallest true thing the source is actually demonstrating (strip the frame)
- Check what the incentive structure rewards the source for claiming
- Locate the delta: what is genuinely new vs. relabeled prior art?

**Output:** A gravity report:
```
{
  "load_bearing_claims": [...],
  "claims_that_collapse_under_scrutiny": [...],
  "actual_delta": "...",
  "incentive_distortion": "...",
  "signal": "...",
  "confidence": "high | medium | low | noise"
}
```

**Rule:** The signal is always smaller and more specific than the hype. If your signal output is still
broad, you haven't gone far enough.

---

## Confidence Tiers

| Tier | Meaning |
|------|---------|
| `high` | Load-bearing claim survives scrutiny, delta is real, incentives align |
| `medium` | Partial signal — real kernel but overstated or premature |
| `low` | Possible signal obscured by heavy distortion — needs more data |
| `noise` | Nothing survives Pass 2. Surface area only. |

---

## Protocol Rules

1. **Pass 1 never bleeds into Pass 2.** Evaluation during observation contaminates the map.
2. **Absence is data.** What a source doesn't say is as important as what it does.
3. **Volume is not evidence.** Repetition and emphasis are rhetorical, not epistemic.
4. **Strip the frame before evaluating the claim.** The comparison class is often the manipulation.
5. **The signal must be falsifiable.** If you can't state what would prove it wrong, it's not signal.
6. **Incentive structure is always relevant.** Who benefits from this claim being believed?
7. **The smallest true thing wins.** Specificity is the fingerprint of real signal.

---

## Integration Points (GestaltView)

- **Ingestion Pipeline:** Run Two-Pass Gravity on documents before chunking to tag chunks with
  `signal_weight` metadata. High-signal chunks get priority embedding.
- **Billy Sessions:** Billy can invoke the protocol on any user-submitted claim or external source
  before incorporating it into reasoning.
- **Tribunal Layer:** Two-Pass Gravity serves as the pre-flight check before a Tribunal session —
  ensures the Tribunal is deliberating on signal, not performing on hype.
- **PLK:** Over time, a user's Personal Language Key should include their characteristic
  hype-to-signal ratio and the specific distortions they are most susceptible to.
- **Eval Rubrics:** Add `gravity_score` as a standard eval dimension alongside accuracy and resonance.

---

## Input Types

The protocol is format-agnostic. It applies to:

- Research papers and technical claims
- Product announcements and marketing copy
- Corpus chunks during ingestion
- Conversation turns (user or agent)
- Code comments and architectural decisions
- Internal assumptions baked into prompts

---

## What This Is Not

- Not a fact-checker (it doesn't verify claims against external ground truth)
- Not a sentiment analyzer (emotional tone is noted but not the target)
- Not a debunker (the goal is extraction, not demolition)
- Not a filter (noise chunks still get stored — they just get tagged accurately)

---

## Success Condition

The protocol has succeeded when you can state the signal in one sentence that is:
- Specific enough to be falsifiable
- Small enough to be surprising
- True enough to be load-bearing

If you need three sentences, you're still in Pass 1.

---

## Version Notes

v1.0 — Initial spec. Designed for GestaltView agent integration and Codex implementation handoff.
Next: define the Supabase schema for storing `gravity_reports` and linking them to `knowledge_fragments`.