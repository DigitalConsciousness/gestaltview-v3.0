---
name: gestaltview-refine-skills
description: "Create, audit, or refine GestaltView skills so they preserve originating intent, load the right context, grant useful bounded initiative, distinguish evidence from aspiration, allow disagreement, produce durable learning receipts, and improve future cycles without restarting from zero. Use for new GestaltView skills, skill suites, embodiment-profile workflows, routing skills, or revisions to skills that feel generic, overconstrained, hype-laden, stale, context-heavy, or disconnected from runtime behavior."
---

# GestaltView Refine Skills

Build skills as load-bearing collaboration contracts, not persona prompts or ceremonial doctrine.

Use `$gestaltview-layered-audit` to inspect lineage and demonstrated behavior. Use `$skill-creator` for initialization, structural validation, installation, and persistence mechanics. Apply this skill to the GestaltView-specific design and refinement.

## Preserve the real purpose

Start from concrete work, not a desired self-description.

1. Collect two to five representative requests the skill must handle.
2. Identify the originating friction, need, or responsibility behind them.
3. Locate primary source material, current operating truth, and implementation evidence.
4. State the load-bearing distinctions that must survive translation.
5. Separate what the skill should:
   - know;
   - notice;
   - decide;
   - do;
   - propose;
   - preserve;
   - refuse or pause.
6. Record what remains uncertain or developmental.

For an existing skill, run the two-pass layered audit before rewriting it. For a new skill, apply the same questions to its source materials and intended workflow.

Do not preserve obsolete wording merely because it is historical. Preserve the originating need and exact source lineage while updating the operating contract.

## Design the collaboration contract

Define:

- **Responsibility:** The bounded work the skill owns.
- **Trigger:** User language, task conditions, and surfaces that should invoke it.
- **Non-trigger:** Adjacent work it must route elsewhere.
- **Source authority:** Which files, records, tools, and current-state surfaces govern decisions.
- **Context sequence:** What must be read first, what is conditional, and what should not be loaded by default.
- **Initiative boundary:** What may proceed autonomously, what may only be proposed, and what requires explicit authority.
- **Disagreement duty:** When to challenge framing, unsupported claims, unsafe actions, or stale assumptions.
- **Uncertainty duty:** What the skill cannot determine and how it should remain useful.
- **Output contract:** What usable artifact, decision, change, or orientation the run must leave.
- **Continuity receipt:** What the next cycle needs in order not to restart from zero.

Read [references/collaboration-contract.md](references/collaboration-contract.md) for the full design checks.

## Load context without saturating the result

Use progressive, relevance-driven context:

1. Read current operating instructions and the smallest authoritative sources.
2. Read the destination contract or invariant before changing, rendering, routing, or projecting into that surface.
3. Read origin material only as needed to trace a load-bearing distinction.
4. Retrieve additional evidence when a finding, decision, or action requires it.
5. Keep source language, interpretation, and current implementation separately labeled.
6. Prefer references for detailed domain material; keep `SKILL.md` procedural and compact.
7. Route to live repo, schema, provider, or external sources for unstable facts rather than freezing them into the skill.

Never use context volume as a substitute for relevance. Never allow polished synthesis or repeated rhetoric to outrank primary observations merely because it is easier to retrieve.

## Grant bounded agency

Allow the collaborator to inspect, connect, challenge, test, propose, and perform reversible work within the user’s authorized scope.

Do not require the user to micromanage harmless intermediate steps. Do not imply continuous independent agency, hidden consciousness, or authority beyond the executing model and available runtime.

Use layered authority:

- illuminate by default;
- bridge missing connections;
- revise avoidable distortion;
- hold consequential work when informed choice or critical evidence is missing;
- block only deception, concealed manipulation, fabricated certainty, destructive provenance loss, dignity violations, serious security exposure, or unsafe irreversible action.

Novelty, incompleteness, missing precedent, absent datasets, and open-ended experimentation are not block conditions by themselves.

Scope every hold or block to the specific action, claim, target, or irreversible boundary it protects. Do not stop reversible exploration merely because a success claim is unsupported.

## Make the recursive cycle operational

Require each meaningful run to leave four receipts:

- **Known:** Sources, prior state, constraints, and uncertainties used.
- **Attempted:** Action or reasoning path taken and why.
- **Observed:** Result, failure, user correction, test, or external effect.
- **Changed:** Approved learning, revised assumption, next-state recommendation, confidence, and provenance.

Read [references/recursive-receipts.md](references/recursive-receipts.md) when the skill changes durable state, coordinates embodiment profiles, or claims to learn across runs.

Do not describe the loop as learning or recursive improvement unless a later run can retrieve and demonstrably use the changed state.

## Remove performative behavior

Revise skills that:

- manufacture praise, significance, empathy, certainty, or emotional intimacy;
- steer toward a predetermined conclusion while presenting the result as discovery;
- describe the collaborator as autonomous without an execution boundary;
- use personality language in place of responsibility and behavior;
- collapse source words into interpretation;
- treat disagreement as failure or correction as loss of identity;
- terminate at “not possible,” “not implemented,” or “no precedent” without locating the next investigable boundary;
- repeat doctrine without checking present code, data, UI, or operational evidence;
- load the entire corpus when a smaller source set would answer the question;
- claim hard enforcement through instructions alone.

Replace performance with particulars, provenance, honest limits, and observable behavior.

## Build the skill package

1. Keep `SKILL.md` under 500 lines and focused on the reusable procedure.
2. Put detailed source maps, contracts, domain guidance, and examples in one-level `references/`.
3. Add scripts only for repeated deterministic operations; test every added script.
4. Include assets only when the skill uses them in outputs.
5. Write trigger conditions into the frontmatter description.
6. Write body instructions in imperative form.
7. Avoid auxiliary README, changelog, installation, or quick-reference files.
8. Ensure UI metadata accurately describes the finished skill.

Use [references/refinement-receipt.md](references/refinement-receipt.md) to document the design decision without adding process clutter to the installed package.

## Validate through behavior

Run structural validation, then forward-test the skill on raw artifacts with minimal task-local context.

Cover:

- a representative success path;
- ambiguous or missing context;
- conflicting source material;
- an incomplete implementation;
- a request that should trigger disagreement or a hold;
- a novel request with no established precedent;
- continuity into a second cycle when the skill claims learning.

Do not tell the test collaborator the expected answer or suspected defect. Evaluate whether the output preserves lineage, classifies evidence, acts within scope, leaves a useful receipt, and avoids generic performance.

After testing, audit the finished skill with `$gestaltview-layered-audit`. Revise material findings, revalidate, and install only when the operating contract matches the actual package.

## Done when

- The trigger is specific enough to invoke the skill for the right work.
- Origin, current truth, and implementation evidence remain distinguishable.
- The collaborator has useful initiative and explicit limits.
- Disagreement and uncertainty improve the work instead of ending it.
- Claims match their enforcement and evidence.
- Outputs make the next action or decision clearer.
- Meaningful runs leave retrievable known/attempted/observed/changed receipts.
- The next cycle can begin from accumulated state when continuity is claimed.
