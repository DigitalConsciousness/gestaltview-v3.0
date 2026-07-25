---
name: gestaltview-suite-orchestrator
description: Master coordinator for the GestaltView skill suite. Use when a task spans multiple GestaltView domains and the agent must select and sequence the right skills with clear repo boundaries and handoff logic.
description: Master coordinator for the GestaltView skill suite. Use when a task spans multiple GestaltView domains at once—context, product architecture, cross-repo planning, executive summary, revenue strategy, marketing, social media, timeline, diligence, Billy, or workflow orchestration—and the agent needs to choose and sequence the right GestaltView skills.
updated: 2026-03-24
---

# GestaltView Suite Orchestrator

Use this skill as the default entry point for multi-domain GestaltView work.

## Run order
Last reviewed: 2026-03-24

Use this skill as the entry point for multi-domain GestaltView work.

1. Read `references/repo-map.md`.
2. Classify the request into one or more domains.
3. Load only the smallest set of relevant skills/references.
4. State execution order when multiple skills are used.
5. Separate **verified reality** from **inference** from **recommended next step**.

## Domain router

- **Mission, invariants, runtime architecture, Billy, route surfaces** → `../01-context-architecture/SKILL.md`
- **Products, portfolio lanes, integrated repositories** → `../02-apps-portfolio/SKILL.md`
- **Executive framing, monetization, partner narratives** → `../03-strategy-executive/SKILL.md`
- **Brand voice, GTM messaging, social ops** → `../04-marketing-social/SKILL.md`
- **Resonance Loop, Tribunal, Bridgekeeper protocols** → `../05-digital-intelligence-collaboration/SKILL.md`
- **Timeline, evidence, diligence packaging** → `../06-timeline-diligence/SKILL.md`
- **Operational execution, validation, CurrentState, cross-repo handoff** → `../07-workflow-operations/SKILL.md`

## Mandatory operating rules

- Preserve exact source language when wording is semantically important.
- Prefer repo-evidenced claims over speculative synthesis.
- Call out when a sister repo is not present locally.
- Do not fabricate file-level certainty for unavailable repositories.

## Cross-repo boundary model

Treat GestaltView as an integrated ecosystem:

1. `gestaltview-v2` — public runtime/UI/API integration and Billy-facing surfaces.
2. `GestaltView-Official-Compendium` — canonical long-memory corpus and evidence archive.
3. `Insight-Bot`, `SymbioCoder`, `Resume Rockstar`, `GAICE` — integrated product lanes with their own implementation ownership.

When a request spans repos not available in the workspace, produce:

- assumptions,
- interface/contract proposal,
- handoff checklist,
- validation plan.

## Exit criteria

Before concluding orchestration:

- Skills selected and sequenced are explicit.
- Repo ownership boundaries are explicit.
- Validation and follow-up steps are explicit.
