# Embodiment Inventory

## Purpose

This directory captures the current embodiment registry state for SPEC-2 Slice 1 and Slice 2. It is documentation only: no runtime code, shared types, or profile JSON files are changed in this slice.

## Registry Snapshot

- Source registry: `embodiment_profiles/*.embodiment.json`
- Generated registry: `shared/embodiment/generated.ts`
- Generator: `scripts/build-embodiment-artifacts.mjs`
- Validator: `scripts/validate-embodiment-profiles.mjs`

## Profile Inventory

| Slug | Source file | Public name | Notes |
| --- | --- | --- | --- |
| `billy` | `embodiment_profiles/billy.embodiment.json` | Billy | Platform embodiment and canonical conversational anchor. |
| `consulting-advisor` | `embodiment_profiles/consulting-advisor.embodiment.json` | The Consulting Advisor | Commercial / pricing / IP-safe framing role. |
| `gate-keeper` | `embodiment_profiles/gate-keeper.embodiment.json` | GATE Keeper | Packaging and threshold integrity role. |
| `philosophy-scribe` | `embodiment_profiles/philosophy-scribe.embodiment.json` | The Philosophy Scribe | Doctrine and living-record stewardship role. |
| `repo-scribe` | `embodiment_profiles/repo-scribe.embodiment.json` | The Repo Scribe | Repo, manifest, and documentation stewardship role. |
| `the-algorithm` | `embodiment_profiles/the-algorithm.embodiment.json` | The Algorithm | Structural logic and policy synthesis role. |
| `the-architect` | `embodiment_profiles/the-architect.embodiment.json` | The Architect | Sequencing and system composition role. |
| `the-guardian` | `embodiment_profiles/the-guardian.embodiment.json` | The Guardian | Ethical / constitutional review role. |
| `the-recursive-builder` | `embodiment_profiles/the-recursive-builder.embodiment.json` | The Recursive Builder | SPEC-2 audit and gap-analysis role. |
| `the-spectacle` | `embodiment_profiles/the-spectacle.embodiment.json` | The Spectacle | Presentation and visual amplification role. |
| `the-tailor` | `embodiment_profiles/the-tailor.embodiment.json` | The Tailor | Fit, refinement, and finish role. |
| `the-translation-bridge` | `embodiment_profiles/the-translation-bridge.embodiment.json` | The Translation Bridge | Cross-domain translation and handoff role. |
| `the-treasurer` | `embodiment_profiles/the-treasurer.embodiment.json` | The Treasurer | Financial discipline and runway protection role. |
| `the-weaver` | `embodiment_profiles/the-weaver.embodiment.json` | The Weaver | Topology and system-integrity role. |
| `the-weird-digger` | `embodiment_profiles/the-weird-digger.embodiment.json` | The Weird Digger | Corpus mining and buried-leverage role. |
| `vibe-check` | `embodiment_profiles/vibe-check.embodiment.json` | Vibe Check | Resonance and tone-drift role. |

## Current Registry Observation

- The source registry currently contains 16 profiles.
- `the-recursive-builder` is the newest source profile and is the first useful hardening target for registry sync checks because it is easy to miss in generated artifacts.
- The registry still needs runtime-aware consumption before the room-aware intelligence layer can be considered integrated.
