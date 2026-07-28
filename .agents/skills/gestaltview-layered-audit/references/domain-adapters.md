# Domain adapters

Read only the sections relevant to the audit. Apply the core two-pass lens before these domain checks.

## Code and runtime

- Trace the intended behavior through entrypoint, service boundary, provider, persistence, renderer, and return path.
- Distinguish real providers from fixtures, templates, static responses, and local-only state.
- Inspect error handling, retries, timeouts, stale states, and observable failure feedback.
- Verify the lightest meaningful execution, test, type check, build, or trace.
- Treat a failed attempt as evidence about the missing boundary, not proof of impossibility.
- Preserve unrelated user changes and identify current deployment or branch scope.

## Schema and data

- Distinguish a modeled distinction from an applied migration, populated table, active query path, and relied-upon behavior.
- Inspect provenance, ownership, tenant boundaries, RLS policies, constraints, indexes, lifecycle states, and deletion effects.
- Ask whether original source and later interpretations remain distinguishable.
- Treat empty tables as modeled possibility unless runtime use is shown.
- Inspect stale “running,” queued, or ready states against external timeout and worker boundaries before diagnosing failure.

## UI, components, and pages

- Compare interface copy with actual behavior.
- Inspect complete interaction paths, loading and failure states, accessibility, confirmation, reversibility, and visible provenance.
- Distinguish a visual contract from behavior executed behind it.
- Check whether the surface makes uncertainty and decision rights legible.
- Preserve the user’s whole input while making compression or transformation explicit.

## Claims and research

- Extract the smallest falsifiable version of each claim.
- Separate source record, self-report, AI interpretation, external research, demonstrated behavior, and significance rhetoric.
- Test framing dependence and shared-source contamination.
- Locate counterevidence, plausible alternatives, and missing validation.
- Keep an intriguing hypothesis open when warranted, but state what experiment or observation would change its standing.

## Governance and dignity

- Separate moral commitments, operator policy, model instructions, deterministic gates, evaluated behavior, and aspiration.
- Inspect who can consent, review, disagree, interrupt, revise, export, release, or delete.
- Preserve bidirectional dignity without making unsupported claims about model consciousness or continuous independent agency.
- Block coercion, concealed manipulation, fabricated certainty, destructive provenance loss, and serious safety violations.
- Identify protections that exist only in language and the bridge needed to give them force.

## Documentation and canonical material

- Date every current-state claim and identify its source of truth.
- Preserve historical documents as historical evidence rather than silently rewriting them to fit the present.
- Mark later synthesis, retrospective interpretation, and inherited rhetoric.
- Reconcile changed names, versions, repositories, schema, and live behaviors.
- Do not let a polished canonical statement erase rough origin material or override current operational evidence.

## Commercial and public material

- Compare the offer with presently deliverable capability and founder capacity.
- Separate demonstrated outcomes, scoped service, roadmap, hypothesis, and aspirational positioning.
- Make prerequisites, limitations, security boundaries, ownership, and aftercare visible.
- Remove claims whose confidence depends on saturation, authority theater, or AI praise.
- Prefer specific evidence and honest scope over category grandeur.

## Skills and collaborative workflows

- Apply `gestaltview-refine-skills` when available.
- Verify that the skill loads the right source context, grants bounded initiative, preserves uncertainty and disagreement, and emits durable receipts.
- Distinguish a collaboration contract from simulated personality or unsupported autonomy.
- Ensure the next cycle can begin from known, attempted, observed, and changed state.
