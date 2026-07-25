---
name: gestaltview-codex
description: Analyze the live GestaltView codebase deeply and turn that analysis into a practical Codex workflow. Use this skill when you need system-level repo orientation, layer mapping, change-scope analysis, or a durable handoff grounded in current runtime truth.
---

# GestaltView Codex

Last reviewed: 2026-05-16

Use this skill when the task is not just "edit code" but "understand the repo well enough to choose the right edit, validation, and handoff path." This is the high-end analysis and operating lens for Codex inside GestaltView.

## Inspect first
- `README.md`
- `docs/CurrentState.md`
- `docs/ArchitecturalStructure.md`
- `docs/APIFlow.md`
- `docs/Manifest.md`
- `docs/Workflows.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `Tuesday.md`
- `client/src/App.tsx`
- `package.json`
- `.agents/skills/INDEX.md`
- `.agents/skills/manifest.json`
- `.agents/skills/agents/AGENTS.md`

## High-End Analysis
Read `references/codebase-analysis.md` when you need the full operating model. In short:

- `gestaltview-v2` is a production runtime and control plane, not just a UI repo.
- The real boundaries are client, API, shared runtime, Supabase, and adjacent workers/scripts.
- Docs and skills are part of the operating system, not decoration.
- The current issue queue lives in `Tuesday.md`; durable truth lives in `docs/CurrentState.md`.

## Workflow
1. Orient from the live repo map, current state, and issue queue before editing anything.
2. Classify the task by layer: UI, API, shared runtime, data, docs, catalog, or cross-repo handoff.
3. Verify live truth in the authoritative file before trusting generated docs or memory.
4. Make the smallest coherent change that matches the actual ownership boundary.
5. Validate the touched layer with the lightest meaningful check that proves the change.
6. Write the next-session handoff in `docs/CurrentState.md` and the relevant context-persistence surface.

## Operating Rules
- Trust live code over generated docs, and generated docs over memory.
- Keep code, docs, skills, and manifests aligned when a boundary changes.
- Use exact dates and exact file paths when recording verification or risk.
- Prefer a targeted fix over a broad refactor unless the analysis proves the broader change is the right one.

## Compose with
- `gestaltview-suite-orchestrator`
- `gestaltview-app-runtime`
- `gestaltview-workflow-operations`
- `gestaltview-current-state-maintenance`
- `gestaltview-context-architecture`
- `gestaltview-repo-onboarding`
- `gestaltview-schema-supabase`

## Done when
- The repo’s current architecture is explicit enough to choose the right next action.
- The task is routed to the correct layer without guesswork.
- The handoff is durable enough that the next session does not need to rediscover the same facts.
