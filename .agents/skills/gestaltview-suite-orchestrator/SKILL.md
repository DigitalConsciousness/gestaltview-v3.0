---
name: gestaltview-suite-orchestrator
description: Coordinate genuinely multi-domain GestaltView work across the live skill suite. Use this skill when the task already spans product, Billy, Supabase, evidence, strategy, and workflow concerns at the same time.
---

# GestaltView Suite Orchestrator

Last reviewed: 2026-06-01

Use this after routing, when the work already clearly spans multiple domains and needs sequencing across specialists. It should stay grounded in the current repo and its actual integrations.

## Inspect first
- `.agents/skills/INDEX.md`
- `GestaltView_Vision_Blueprint_Package/00_READ_FIRST/README.md`
- `README.md`
- `docs/CurrentState.md`
- `Tuesday.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `client/src/App.tsx`
- `supabase/config.toml`

## Current integrations
- Suite orchestration depends on knowing the live product surface, the active API and data layer, the Vision Blueprint Package, and the current skill catalog.
- Cross-repo coordination is common here but must be made explicit instead of being assumed.
- The current issue queue and context-persistence docs are part of the sequencing picture when multi-domain work spans more than one session.
- Supabase often makes a task truly cross-domain because it touches auth, retrieval, billing, and state at once.

## Workflow
1. Partition the request into concrete domains before editing anything.
2. Load or reference only the specialist skills that materially move the task forward.
3. Keep repo boundaries and Supabase side effects explicit when a change spans UI, API, schema, and docs.
4. Require a validation and handoff path, not just a conceptual plan.

## Compose with
- `gestaltview-ecosystem-orchestrator`
- `gestaltview-vision-blueprint`
- `gestaltview-workflow-operations`
- `gestaltview-cross-repo-workflows`

## Done when
- The task is decomposed across the correct specialist skills.
- Cross-domain dependencies, validation, and handoffs are all explicit.
