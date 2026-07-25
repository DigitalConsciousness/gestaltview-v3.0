# GestaltView Codex Codebase Analysis

## Repo Thesis

`gestaltview-v2` is the production-facing runtime for the GestaltView ecosystem. It is not a single-purpose app repo. It is a layered operating environment:

- public runtime and routed UI
- Vercel API layer
- shared runtime logic
- Supabase-backed state
- trainer/control-plane surfaces
- repo-local docs, skills, manifests, and validation scripts

The codebase should be analyzed as a system of collaborating planes, not as isolated folders.

## Core Planes

### 1. Client Runtime

Primary anchors:

- `client/src/App.tsx`
- `client/src/pages/**`
- `client/src/components/**`
- `client/src/features/**`
- `client/src/contexts/**`
- `client/src/lib/**`

What it owns:

- route inventory
- user-visible behavior
- Billy UI and room surfaces
- auth-aware flows
- pricing and dashboard flows
- exhibit and trainer entrypoints

### 2. API Runtime

Primary anchors:

- `api/**`
- `api/_lib/**`

What it owns:

- Billy bootstrap, retrieval, memory, and health
- session state and control-plane endpoints
- pricing, checkout, and webhook flows
- gate, workbook, workspaces, documents, and consciousness routes
- trainer APIs
- voice proxying

### 3. Shared Runtime

Primary anchors:

- `shared/billy/**`
- `shared/agent-trainer/**`
- `shared/llm/plk.ts`
- `shared/tribunal/**`

What it owns:

- shared prompt logic
- shared response and diagnostic types
- routing and evaluation helpers
- trainer contracts and policy logic

### 4. Data Plane

Primary anchors:

- `supabase/schema.sql`
- `supabase/migrations/**`
- `api/_lib/supabase.ts`

What it owns:

- auth and profile state
- founder continuity
- Billy session logging
- persistent memory
- retrieval fragments
- gate and workbook persistence
- trainer persistence

### 5. Operations And Memory Plane

Primary anchors:

- `docs/CurrentState.md`
- `docs/Workflows.md`
- `docs/ArchitecturalStructure.md`
- `docs/APIFlow.md`
- `docs/Manifest.md`
- `docs/ContextPersistenceChecklist.md`
- `docs/SessionHandoffPacket.md`
- `docs/ContextPersistenceProtocol.md`
- `skills/INDEX.md`
- `skills/manifest.json`
- `skills/CurrentState.md`
- `Tuesday.md`

What it owns:

- current operational truth
- issue queue
- session continuity
- catalog routing
- repo-wide coordination heuristics

## Decision Tree

When analyzing a request:

1. Locate the owning plane.
2. Read the live anchor file for that plane.
3. Identify the smallest coherent change surface.
4. Check whether the change crosses plane boundaries.
5. If it does, plan the doc/state/skill updates before editing.

## Validation Ladder

Use the lightest check that proves the change:

- docs only: direct file inspection plus diff sanity
- UI/runtime: `npm run build`
- repo health: `npm run health`
- catalog or routing changes: `npm run manifest`
- orientation or handoff changes: `npm run orientation:check`
- API-specific changes: targeted route tests or focused validation scripts

## Handoff Rule

Always leave the next session with:

- what is true now
- what was verified
- what remains risky
- what the next action should be

If that cannot fit in chat, write it to `docs/CurrentState.md` and the relevant context surface.
