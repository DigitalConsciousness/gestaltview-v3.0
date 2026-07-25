# Integrated Repositories

**Last updated:** 2026-03-24

## Ecosystem inventory

| Repository | Primary role | What it should publish back to shared context |
|---|---|---|
| `gestaltview-v2` | Public runtime, Billy surfaces, route/UI/API integration | Live state, integration contracts, runtime evidence |
| `GestaltView-Official-Compendium` | Canonical knowledge base and evidence corpus | Canonical narratives, source artifacts, long-memory structure |
| `Insight-Bot` | Insight-focused product/application lane | Product capabilities, API/schema contracts, surfaced outcomes |
| `SymbioCoder` | Coding companion lane | Workflow learnings, reusable dev patterns, integration hooks |
| `Resume Rockstar` | Career narrative/PLK lane | Voice-preserving profile logic and integration-ready artifacts |
| `GAICE` | Integrated full-stack lane in ecosystem operations | Shared contracts, cross-repo dependencies, status signals |

## Planning rules

1. Keep implementation in the owning repository whenever possible.
2. Mirror only the minimum data needed in `gestaltview-v2`:
   - navigation/context references,
   - thin integration adapters,
   - proof/evidence surfaces.
3. If source repo is absent locally, provide contract-level proposals instead of implementation claims.

## Safe language for absent repos

Use:

- “This repository is part of the GestaltView ecosystem but is not present in the current workspace.”
- “Here is the proposed integration contract and handoff plan.”

Avoid:

- claiming verified routes/APIs/tables/files in that repo without direct inspection.
