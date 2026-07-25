import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createTrainerExperimentReview,
  createTrainerPackagingCandidate,
  createTrainerPolicyFlag,
  extractTrainerRequestDiagnostics,
  listTrainerAgents,
  listTrainerConnectors,
  listTrainerMemorySurfaces,
  listTrainerPackagingCandidates,
  listTrainerSkills,
  parseTrainingRunMutationResponse,
  parseTrainingRunResponse,
  parseTrainingRunsResponse,
  resetTrainerAuthCircuitForTests,
  TrainerApiError,
  updateTrainerPackagingCandidate,
  updateTrainerPolicyFlag,
  uploadTrainerPackagingAttachment,
} from "../features/agent-trainer/lib/trainerApi";

function makeRun(overrides: Record<string, unknown> = {}) {
  return {
    runId: "run-1",
    agent: {
      slug: "agent-trainer-prototype",
      title: "Agent Trainer Prototype",
      domain: "operations",
      status: "draft",
      source: "supabase",
    },
    status: "queued",
    goal: "Test run",
    maxCycles: 3,
    qualityThreshold: 4,
    routingPolicy: {
      preferLocal: true,
      allowRemoteFallback: true,
      maxSchemaFailuresPerStage: 2,
      preferredProviders: {},
    },
    createdAt: "2026-04-01T00:00:00.000Z",
    startedAt: null,
    completedAt: null,
    requestedBy: null,
    approverUserId: null,
    baselineVersionId: null,
    latestVersion: null,
    steps: [],
    evalResults: [],
    approvals: [],
    artifacts: [],
    ...overrides,
  };
}

describe("trainerApi run parsing", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      location: {
        origin: "https://gestaltview-digital-intelligence.vercel.app",
        pathname: "/agent-trainer/control-plane",
        search: "",
      },
    });
  });

  afterEach(() => {
    resetTrainerAuthCircuitForTests();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("filters malformed entries out of run lists", () => {
    const response = parseTrainingRunsResponse({
      runs: [makeRun({ runId: "run-1" }), undefined, { malformed: true }, makeRun({ runId: "run-2" })],
    });

    expect(response.runs.map((run) => run.runId)).toEqual(["run-1", "run-2"]);
  });

  test("throws for malformed single-run responses", () => {
    expect(() => parseTrainingRunResponse({})).toThrow(
      "Trainer API returned a malformed run response."
    );
  });

  test("parses mutation receipts around trainer runs", () => {
    const response = parseTrainingRunMutationResponse({
      ok: true,
      run: makeRun({ runId: "run-3", lastEventMessage: "Run queued and waiting for worker claim." }),
      deleted: false,
      runId: "run-3",
      receipt: {
        code: "run_queued",
        message: "Run queued and waiting for worker claim.",
        eventId: null,
        createdAt: "2026-04-01T00:00:00.000Z",
      },
      queue: {
        jobStatus: "queued",
        workerOnline: true,
        oldestQueuedAgeMs: 1200,
      },
      blocker: null,
    });

    expect(response.receipt?.code).toBe("run_queued");
    expect(response.run?.runId).toBe("run-3");
    expect(response.queue.jobStatus).toBe("queued");
  });

  test("wraps browser fetch failures with trainer diagnostics", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    let capturedError: unknown = null;

    try {
      await listTrainerAgents({ Authorization: "Bearer trainer-token" });
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).toBeInstanceOf(TrainerApiError);
    expect((capturedError as TrainerApiError).status).toBe(0);

    const diagnostics = extractTrainerRequestDiagnostics(
      (capturedError as TrainerApiError).payload
    );
    expect(diagnostics?.requestPath).toBe("/api/trainer/agents");
    expect(diagnostics?.method).toBe("GET");
    expect(diagnostics?.authHeaderPresent).toBe(true);
    expect((capturedError as TrainerApiError).message).toContain("/api/trainer/agents");
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test("retries trainer requests against the configured API origin after a relative fetch fails", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://trainer-api.example.com");

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          agents: [
            {
              slug: "agent-trainer-prototype",
              title: "Agent Trainer Prototype",
              domain: "operations",
              status: "draft",
              source: "supabase",
            },
          ],
        }),
      } as never);

    const response = await listTrainerAgents({
      Authorization: "Bearer trainer-token",
    });

    expect(response.agents).toHaveLength(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/trainer/agents",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer trainer-token",
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/trainer/agents",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer trainer-token",
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://trainer-api.example.com/api/trainer/agents",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer trainer-token",
        }),
      })
    );
  });

  test("opens an auth circuit after a trainer 401 without a refreshed token", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Authentication required" }),
    } as never);

    await expect(
      listTrainerAgents({ Authorization: "Bearer stale-token" })
    ).rejects.toMatchObject({
      status: 401,
      message: expect.stringContaining("Trainer auth expired or missing"),
    });

    await expect(
      listTrainerAgents({ Authorization: "Bearer stale-token" })
    ).rejects.toMatchObject({
      status: 401,
      payload: expect.objectContaining({
        error: "trainer_auth_circuit_open",
      }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("uses the live trainer governance route names", async () => {
    const experimentId = "11111111-1111-4111-8111-111111111111";
    const candidateId = "22222222-2222-4222-8222-222222222222";
    const flagId = "33333333-3333-4333-8333-333333333333";
    const candidate = {
      id: candidateId,
      experimentId,
      packageLabel: "Operator Kit",
      packageDescription: "A governed operator kit.",
      includedFiles: [],
      includedScenarios: [],
      includedConfigs: null,
      boundaryStatement: "Training bundle only; no transferable identity.",
      approvedBy: null,
      approvedAt: null,
      status: "candidate",
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      experiment: null,
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidate, candidates: [], experiment: {} }),
    } as never);
    const authHeaders = { Authorization: "Bearer trainer-token" };

    await listTrainerPackagingCandidates(authHeaders);
    await createTrainerPackagingCandidate({
      experimentId,
      packageLabel: "Operator Kit",
      packageDescription: "A governed operator kit.",
      includedFiles: [],
      includedScenarios: [],
      includedConfigs: null,
      boundaryStatement: "Training bundle only; no transferable identity.",
    }, authHeaders);
    await updateTrainerPackagingCandidate(candidateId, { status: "kit_approved" }, authHeaders);
    await uploadTrainerPackagingAttachment(candidateId, {
      fileName: "source.md",
      contentBase64: "c291cmNl",
      contentType: "text/markdown",
    }, authHeaders);
    await createTrainerExperimentReview(experimentId, {
      decision: "hold",
      notes: "Needs another pass.",
    }, authHeaders);
    await createTrainerPolicyFlag(experimentId, {
      flag: "scope-creep",
      severity: "advisory",
      notes: "Keep the package boundary explicit.",
    }, authHeaders);
    await updateTrainerPolicyFlag(experimentId, flagId, { resolved: true }, authHeaders);

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/trainer/packaging-candidates",
      "/api/trainer/packaging-candidates",
      `/api/trainer/packaging-candidates/${candidateId}`,
      `/api/trainer/packaging-candidates/${candidateId}/attachments`,
      `/api/trainer/experiments/${experimentId}/review`,
      `/api/trainer/experiments/${experimentId}/flag`,
      `/api/trainer/experiments/${experimentId}/flag/${flagId}`,
    ]);
  });

  test("routes hyperagent catalog calls through the shared trainer request path", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ connectors: [], skills: [], surfaces: [] }),
    } as never);
    const authHeaders = { Authorization: "Bearer trainer-token" };

    await listTrainerConnectors(authHeaders);
    await listTrainerSkills(authHeaders);
    await listTrainerMemorySurfaces(authHeaders);

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/trainer/connectors",
      "/api/trainer/skills",
      "/api/trainer/memory-surfaces",
    ]);
    expect(fetchMock.mock.calls.every((call) =>
      (call[1] as RequestInit).headers &&
      ((call[1] as RequestInit).headers as Record<string, string>).Authorization === "Bearer trainer-token"
    )).toBe(true);
  });
});
