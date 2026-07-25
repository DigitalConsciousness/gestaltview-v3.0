# Governance and Packaging Gates v1.0

> **Source of truth:** `config/gateCompatibility.ts`, `shared/gate/`, `GestaltView_Constitutional_Invariants_v1.0.md`  
> **Spec anchor:** SPEC-GESTALTVIEW_FULL_ALIGNMENT_GAP_FILLER_v1.0 §13–§14

---

## Overview

The GATE system is GestaltView's commercial packaging and delivery mechanism. It allows
operators and enterprise buyers to configure, price, and receive a GestaltView-powered
agent package. The governance layer ensures that GATE packages remain within the
constitutional boundaries of the platform.

**Core rule:** GATE may only export **reproducible behavioral frameworks**, scenario
libraries, evaluation rubrics, and implementation scaffolds. It may **never** package
or transfer a persistent living DI identity or private user memories.

---

## Constitutional Invariant Guards

The following gate compatibility rules enforce constitutional invariants. They are
defined in `config/gateCompatibility.ts` and evaluated by `evaluateGateCompatibility()`.

| Rule ID | Severity | Invariant | Description |
|---|---|---|---|
| `di_identity_export_violation` | **error** (blocking) | DI-4 | Blocks any package that attempts to export a living DI identity |
| `missing_provenance_receipt` | **error** (blocking) | DI-2, DI-3 | Blocks embodiment/identity packages that lack a provenance receipt |
| `missing_embodiment_compile_run` | warning | DI-2 | Flags embodiment packages that don't reference a compile run ID |
| `missing_checksum_manifest` | warning | DI-3 | Flags artifact packages that don't reference a checksum |
| `route_assignment_drift` | warning | DI-2 | Flags route assignments that don't reference the canonical registry |
| `legacy_table_dependency` | warning | DI-3 | Flags packages that reference legacy transitional tables |

---

## Compatibility Evaluation Flow

```
PackageConfigDraftInput
    │
    ▼
evaluateGateCompatibility()
    │
    ├── gateCompatibilityRules.filter(rule => rule.when(draft))
    │       │
    │       ▼
    │   CompatibilityFinding[]
    │
    ├── blocking = findings.some(f => f.severity === "error")
    ├── requiresManualReview = rules.some(r => r.manualReview && r.when(draft))
    │
    ▼
CompatibilityResult {
  findings,
  blocking,
  requiresManualReview,
  checkoutMode: "pay_now" | "request_review",
  enabledFeatures,
  excludedFeatures,
}
```

---

## Package Tiers

| Tier | Label | Max Seats | Use Case |
|---|---|---|---|
| `SOLO_SPARK` | Solo Spark | 1 | Individual operators, solo founders |
| `STUDIO` | Studio | 10 | Small teams, creative studios |
| `GROWTH` | Growth | 50 | Growing companies, product teams |
| `ENTERPRISE` | Enterprise | Unlimited | Large organizations, custom deployments |

---

## Source Bundles

Source bundles are pre-configured corpus starter kits that operators can include in
their package. They are defined in
`agent_trainer/gestaltview_agent_trainer/config/sourceBundles.ts`.

| Slug | Title | Best For |
|---|---|---|
| `knowledge-core-bundle` | Knowledge Core Bundle | FAQ, SOP, reference material |
| `code-context-bundle` | Code Context Bundle | Repo-aware assistants |
| `product-ops-bundle` | Product Ops Bundle | Product and operations teams |
| `context-alignment-bundle` | Context Alignment Bundle | Cross-team alignment |

---

## Operator Packs

Operator packs are capability add-ons that extend the base package. They are defined in
`agent_trainer/gestaltview_agent_trainer/config/operatorPacks.ts`.

| Slug | Title | Best For |
|---|---|---|
| `general-operator-foundation` | General Operator Foundation | All operators |
| `devops-terminal-pack` | DevOps Terminal Pack | Technical teams |
| `agent-source-starter-bundle` | Agent Source Starter Bundle | Supabase-backed agents |
| `persistent-memory-foundation` | Persistent Memory Foundation | Long-running agents |

---

## Artifact Integrity

Every GATE deployment artifact must include:

1. A **checksum manifest** — SHA-256 hashes of all included files
2. A **provenance receipt** — linking the artifact to its source pipeline run
3. A **constitutional compliance statement** — confirming no living DI identity is
   included

---

## Change Log

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0.0 | 2026-05-19 | Keith / Manus | Initial canonical doc. Added DI identity export violation guard and 5 additional governance rules. Aligned with SPEC §13–§14. |
