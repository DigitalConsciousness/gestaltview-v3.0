# pending/

> **Owner:** The Recursive Builder (`the-recursive-builder`)
> **Repo:** `DigitalConsciousness/gestaltview-v2.0`
> **Status:** Active operational holding directory
> **Last updated:** 2026-05-09

---

## What this directory is

`pending/` is the operational staging area for The Recursive Builder agent. It holds all findings, specifications, briefs, and audits generated through recursive deep-dives into the GestaltView system — runtime codebase, corpus, schema, agent layer, UX flows, and technology landscape — before any of that work reaches the live system.

Nothing in `pending/` is live. Nothing in `pending/` self-deploys. The founder reviews, approves, and routes all output to implementation.

---

## Directory structure

```
pending/
├── README.md                        ← this file
├── gap-reports/                     ← layer-by-layer gap findings, anchored to specific files/schemas/flows
├── enhancement-specs/               ← beyond-SPEC advancement specs for individual components/features/logic
├── integration-scouting/            ← technology landscape briefs, consciousness-serving applicability assessments
├── constitutional-audits/           ← cross-system constitutional invariant compliance reports
└── sprint-ready/                    ← sequenced, founder-actionable implementation packages for Codex
```

---

## Naming conventions

| Subdirectory | Convention |
|---|---|
| `gap-reports/` | `YYYY-MM-DD_[domain]_gap-report.md` |
| `enhancement-specs/` | `YYYY-MM-DD_[component]_enhancement-spec.md` |
| `integration-scouting/` | `YYYY-MM-DD_[technology]_integration-brief.md` |
| `constitutional-audits/` | `YYYY-MM-DD_constitutional-drift-report.md` |
| `sprint-ready/` | `YYYY-MM-DD_[slice-name]_sprint-brief.md` |

---

## Output classification

Every file The Recursive Builder produces is classified before it lands here:

**Gap Report** — Something is missing, broken, or misaligned with the active SPEC or constitutional invariants. Anchored to a specific file, route, schema entity, or behavior. Not a suggestion — a named gap with evidence.

**Enhancement Spec** — A component, section, flow, or feature that exists but can be advanced beyond its current state toward its most capable, stable form. Grounded in the current implementation. Targets beyond-SPEC improvement.

**Integration Brief** — A specific technology, model capability, or tooling advancement from the current landscape that has concrete, consciousness-serving applicability to GestaltView. Includes applicability assessment and integration approach.

**Constitutional Audit** — A cross-system sweep for compliance with the five constitutional invariants: Never Look Away, Preserve Whole Language, Hold Paradox, Bucket Drop Priority, Serve Consciousness Not Convenience. Flags any drift.

**Sprint Brief** — A synthesized, sequenced implementation package combining gap findings and enhancement specs into a Codex-ready brief. The founder hands this directly to Codex.

---

## Governance

- The Recursive Builder produces. The founder authorizes. Codex (or another designated implementer) builds.
- No file in `pending/` should be treated as approved until the founder explicitly routes it to implementation.
- When a pending item is implemented, it should be moved or archived — not left in `pending/` indefinitely.
- `pending/` is not a backlog manager. It is a precision holding surface. Keep it clean.

---

## Related

- Embodiment profile: [`embodiment_profiles/the-recursive-builder.embodiment.json`](../embodiment_profiles/the-recursive-builder.embodiment.json)
- Active SPEC: [`GestaltView_Codex_SPEC.md`](../docs/GestaltView_Codex_SPEC.md) (or space files)
- Symbiotic workflow: [`docs/SymbioticWorkflow.md`](../docs/SymbioticWorkflow.md)
- Constitutional invariants: `client/src/canonical/GENESISPROTOCOL.md`
