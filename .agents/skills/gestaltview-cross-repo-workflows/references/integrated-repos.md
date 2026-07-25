# Integrated Repos

**Last updated:** 2026-03-24

## Ecosystem roles

| Repo | Role in ecosystem | Typical outputs consumed by other repos |
|---|---|---|
| `gestaltview-v2` | Public runtime and integration surface | UI/API integrations, public demos, operational state |
| `GestaltView-Official-Compendium` | Canonical long-memory and evidence corpus | Canonical source material, curated evidence, context spine |
| `Insight-Bot` | Insight application lane | Insight workflows, integration/API touchpoints |
| `SymbioCoder` | Developer/coding companion lane | Build workflows, agent patterns, coding artifacts |
| `Resume Rockstar` | Career narrative lane | PLK-preserving profile outputs, user-facing artifacts |
| `GAICE` | Integrated ecosystem lane | Shared contracts and cross-repo dependency signals |

## Coordination principle

For each repo, always state:

1. what it owns,
2. what it consumes,
3. what it should publish back.

## Execution rule

When a repo is not present locally, provide handoff-ready contracts and next actions; do not claim verified implementation details.
