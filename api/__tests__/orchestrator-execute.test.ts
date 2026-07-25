import { beforeEach, describe, expect, it, vi } from "vitest";

const insertRowMock = vi.fn();
const decideOrchestrationMock = vi.fn();
const buildWorkerPlanMock = vi.fn();

vi.mock("../_lib/supabase.js", () => ({
  insertRow: insertRowMock,
}));

vi.mock("../../shared/orchestration/index.js", () => ({
  decideOrchestration: decideOrchestrationMock,
  buildWorkerPlan: buildWorkerPlanMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

async function loadModule() {
  vi.resetModules();
  return import("../orchestrator/execute");
}

describe("orchestrator execute route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    insertRowMock.mockReset();
    decideOrchestrationMock.mockReset();
    buildWorkerPlanMock.mockReset();

    decideOrchestrationMock.mockReturnValue({
      decisionId: "orch-123",
      triggeredAt: "2026-07-09T00:00:00.000Z",
      trigger: "manual_synthesize",
      sourceRoom: "creation-corner",
      detectedState: "active_creation",
      supportLevel: "low",
      contentKind: "report_document",
      destination: "creation-corner",
      synthesisStyle: "gentle-reflective",
      processors: ["state", "routing", "codex"],
      exportFormats: ["markdown", "html"],
      nextAction: "forge_artifact",
      shouldForgeArtifact: true,
      shouldPersistSignal: true,
      shouldUpdateProfile: false,
      shouldUpdateScaffold: false,
      confidence: 0.91,
      userFacingSummary: "Ready to spin up creation workers.",
      internalDiagnostics: [],
    });

    buildWorkerPlanMock.mockReturnValue({
      sourceRoom: "creation-corner",
      trigger: "manual_synthesize",
      contentKind: "report_document",
      spawnMode: "auto",
      workers: [
        {
          id: "intake",
          label: "Intake",
          status: "queued",
          summary: "Normalize the incoming source.",
          dependsOn: [],
        },
        {
          id: "presentation",
          label: "Presentation",
          status: "queued",
          summary: "Package the result for the Creation Corner surface.",
          dependsOn: ["intake"],
        },
      ],
    });

    insertRowMock.mockResolvedValue(true);
  });

  it("persists the run and returns the worker plan", async () => {
    const module = await loadModule();
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          trigger: "manual_synthesize",
          sourceRoom: "creation-corner",
          text: "Shape this into a publishable blueprint.",
          autoSpawn: true,
        },
      } as never,
      res as never,
    );

    expect(insertRowMock).toHaveBeenCalledWith(
      "orchestration_runs",
      expect.objectContaining({
        run_id: "orch-run-orch-123",
        decision_id: "orch-123",
        worker_count: 2,
        spawn_mode: "auto",
      }),
    );
    expect(insertRowMock).toHaveBeenCalledWith(
      "orchestration_worker_runs",
      expect.objectContaining({
        run_id: "orch-run-orch-123",
        worker_id: "presentation",
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      runId: "orch-run-orch-123",
      spawnMode: "auto",
      workers: expect.arrayContaining([
        expect.objectContaining({ id: "presentation" }),
      ]),
      diagnostics: {
        route: "/api/orchestrator/execute",
        persisted: true,
        deterministic: true,
      },
    });
  }, 10_000);
});
