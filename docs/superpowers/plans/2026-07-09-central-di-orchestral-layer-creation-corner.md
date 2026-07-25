# Central DI Orchestral Layer and Creation Corner Worker Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a recursive, task-scoped DI orchestration layer that can auto-spawn specialist sub-agents for Creation Corner seams while keeping stable GestaltView runtime and Supabase-backed storage intact.

**Architecture:** The current `shared/orchestration` package remains the routing brain, but it gains an explicit worker contract, a gateable spawn policy, and run/result schemas for task-scoped sub-agents. The server exposes a new orchestration execution route that fans out to specialist workers, persists run state in Supabase, and returns structured results for the Creation Corner UI to present. The client keeps existing stable creation and rendering flows, but adds an orchestration rail that shows worker status, results, and future gate state without replacing any working module.

**Tech Stack:** TypeScript, React 19, Vercel serverless handlers, Supabase, Vitest, existing `shared/orchestration`, existing Creation Corner and rendering helpers.

---

### Task 1: Add worker contracts and gateable spawn policy to shared/orchestration

**Files:**
- Create: `shared/orchestration/workers.ts`
- Modify: `shared/orchestration/types.ts`
- Modify: `shared/orchestration/index.ts`
- Modify: `shared/orchestration/skillRouter.ts`
- Create: `shared/orchestration/workers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildWorkerPlan } from "./workers";

describe("worker plan", () => {
  it("auto-spawns Creation Corner specialists by default", () => {
    const plan = buildWorkerPlan({
      sourceRoom: "creation-corner",
      trigger: "manual_synthesize",
      contentKind: "report_document",
      autoSpawn: true,
    });

    expect(plan.spawnMode).toBe("auto");
    expect(plan.workers.map((worker) => worker.id)).toEqual(
      expect.arrayContaining([
        "intake",
        "normalization",
        "synthesis",
        "rendering",
        "persistence",
        "presentation",
        "validation",
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run shared/orchestration/workers.test.ts -v`

Expected: fail because `buildWorkerPlan` and the worker contract do not exist yet.

- [ ] **Step 3: Implement the minimal shared contract**

```ts
export type WorkerSpawnMode = "auto" | "approval";
export type OrchestralWorkerId =
  | "intake"
  | "normalization"
  | "synthesis"
  | "rendering"
  | "persistence"
  | "presentation"
  | "validation";
```

Add a `buildWorkerPlan()` helper that:
- returns the Creation Corner worker set when `sourceRoom === "creation-corner"`
- falls back to an empty plan for other rooms
- reads a gate override from an env-backed or input-backed toggle
- keeps the current routing decisions untouched unless the new plan is explicitly requested

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run shared/orchestration/workers.test.ts -v`

Expected: pass with the Creation Corner worker set and default `auto` spawn mode.

- [ ] **Step 5: Commit**

```bash
git add shared/orchestration/types.ts shared/orchestration/index.ts shared/orchestration/skillRouter.ts shared/orchestration/workers.ts shared/orchestration/workers.test.ts
git commit -m "feat: add orchestral worker contracts"
```

### Task 2: Persist orchestration runs in Supabase and expose a worker execution route

**Files:**
- Create: `supabase/migrations/20260709000000_create_orchestration_runs.sql`
- Create: `api/orchestrator/execute.ts`
- Modify: `api/orchestrator/decide.ts`
- Modify: `api/_lib/supabase.ts`
- Create: `api/__tests__/orchestrator-execute.test.ts`
- Modify: `api/__tests__/orchestrator-decide.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("returns a worker run plan and persists the orchestration run", async () => {
  const res = createRes();
  await executeHandler(
    {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: {
        sourceRoom: "creation-corner",
        trigger: "manual_synthesize",
        text: "Shape this into a publishable blueprint.",
      },
    } as never,
    res as never,
  );

  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({
    spawnMode: "auto",
    workers: expect.arrayContaining([{ id: "presentation" }]),
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run api/__tests__/orchestrator-execute.test.ts -v`

Expected: fail because the route, persistence helpers, and worker run table do not exist yet.

- [ ] **Step 3: Add the Supabase schema and server route**

Create a new migration for orchestration runs and worker runs with service-role-only access, mirroring the existing `orchestration_decisions` pattern. Keep the existing decisions table as analytics history and add run tables for:
- the top-level orchestration run
- one row per spawned worker
- the current gate state for auto vs approval mode

Implement `api/orchestrator/execute.ts` so it:
- validates the orchestration request
- calls `decideOrchestration()` and `buildWorkerPlan()`
- persists the run and each worker row via the Supabase helper layer
- returns structured worker statuses and the gate state to the client

Extend `api/orchestrator/decide.ts` only where needed to include worker-plan metadata in the response payload, without changing the existing routing decision behavior.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run api/__tests__/orchestrator-execute.test.ts api/__tests__/orchestrator-decide.test.ts -v`

Expected: pass with persisted run records and a worker plan in the response.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260709000000_create_orchestration_runs.sql api/orchestrator/execute.ts api/orchestrator/decide.ts api/_lib/supabase.ts api/__tests__/orchestrator-execute.test.ts api/__tests__/orchestrator-decide.test.ts
git commit -m "feat: persist orchestral runs in supabase"
```

### Task 3: Add Creation Corner orchestration presentation and worker status UI

**Files:**
- Create: `client/src/components/creation-corner/OrchestrationRail.tsx`
- Create: `client/src/components/creation-corner/WorkerStatusCard.tsx`
- Create: `client/src/hooks/useCreationCornerOrchestration.ts`
- Modify: `client/src/components/BlueprintGenerativeWorkbench.tsx`
- Modify: `client/src/lib/orchestratorClient.ts`
- Create: `client/src/tests/creation-corner-orchestration.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OrchestrationRail } from "@/components/creation-corner/OrchestrationRail";

describe("Creation Corner orchestration rail", () => {
  it("renders worker status cards and the gate state", () => {
    const markup = renderToStaticMarkup(
      <OrchestrationRail
        gateState="auto"
        workers={[
          { id: "intake", status: "done", label: "Intake" },
          { id: "presentation", status: "running", label: "Presentation" },
        ]}
      />,
    );

    expect(markup).toContain("Intake");
    expect(markup).toContain("Presentation");
    expect(markup).toContain("auto");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run client/src/tests/creation-corner-orchestration.test.tsx -v`

Expected: fail because the new presentation components and hook do not exist yet.

- [ ] **Step 3: Implement the client orchestration layer**

Create a hook that:
- calls the new orchestration execution route
- stores worker progress locally for the current Creation Corner session
- exposes a `gateState` toggle for the future approval mode

Build the new presentation pieces so the Creation Corner workbench can show:
- the current gate state
- each worker’s status
- a compact result summary for the latest run
- a presentation section that appears only when the worker outputs are ready

Keep the existing blueprint library, synthesis controls, and export flows intact. The new rail should augment the current workbench rather than replace it.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run client/src/tests/creation-corner-orchestration.test.tsx client/src/tests/creation-corner-intake-controls.test.tsx client/src/tests/creation-corner-freeform.test.ts client/src/tests/creation-corner-artifacts.test.ts -v`

Expected: all Creation Corner tests pass, including the existing intake, freeform, and packaging coverage.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/creation-corner/OrchestrationRail.tsx client/src/components/creation-corner/WorkerStatusCard.tsx client/src/hooks/useCreationCornerOrchestration.ts client/src/components/BlueprintGenerativeWorkbench.tsx client/src/lib/orchestratorClient.ts client/src/tests/creation-corner-orchestration.test.tsx
git commit -m "feat: add creation corner orchestration presentation"
```

### Task 4: Update operator docs and verify the full orchestration slice

**Files:**
- Modify: `docs/CurrentState.md`
- Modify: `docs/AIFlow.md`
- Modify: `docs/APIFlow.md`
- Modify: `docs/Workflows.md`

- [ ] **Step 1: Write the documentation and state updates**

Document:
- the new central DI orchestral layer
- the auto-spawn default and future approval gate
- the new orchestration execution endpoint
- the Creation Corner worker presentation rail
- the fact that Supabase remains the persistence layer

- [ ] **Step 2: Run the targeted verification set**

Run:
```bash
pnpm vitest run shared/orchestration/workers.test.ts api/__tests__/orchestrator-decide.test.ts api/__tests__/orchestrator-execute.test.ts client/src/tests/creation-corner-orchestration.test.tsx -v
pnpm exec tsc --noEmit
```

Expected: tests pass and TypeScript stays clean.

- [ ] **Step 3: Commit**

```bash
git add docs/CurrentState.md docs/AIFlow.md docs/APIFlow.md docs/Workflows.md
git commit -m "docs: record orchestral layer worker coverage"
```
