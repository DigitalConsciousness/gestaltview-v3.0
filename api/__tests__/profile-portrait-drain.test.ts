import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadProfilePortraitForUserMock: vi.fn(),
  loadLatestPortraitForUserMock: vi.fn(),
  listQueuedPortraitJobsMock: vi.fn(),
  claimPortraitQueueJobMock: vi.fn(),
  createPortraitInferenceRunMock: vi.fn(),
  persistPortraitArtifactMock: vi.fn(),
  updatePortraitInferenceRunMock: vi.fn(),
  updatePortraitQueueJobMock: vi.fn(),
  invokeRpcMock: vi.fn(),
}));

vi.mock("../_lib/profilePortrait", () => ({
  loadProfilePortraitForUser: mocks.loadProfilePortraitForUserMock,
  loadLatestPortraitForUser: mocks.loadLatestPortraitForUserMock,
}));

vi.mock("../_lib/profilePortraitPersistence", () => ({
  listQueuedPortraitJobs: mocks.listQueuedPortraitJobsMock,
  claimPortraitQueueJob: mocks.claimPortraitQueueJobMock,
  createPortraitInferenceRun: mocks.createPortraitInferenceRunMock,
  persistPortraitArtifact: mocks.persistPortraitArtifactMock,
  updatePortraitInferenceRun: mocks.updatePortraitInferenceRunMock,
  updatePortraitQueueJob: mocks.updatePortraitQueueJobMock,
  makePortraitInferenceRunId: vi.fn(() => "run-123"),
}));

vi.mock("../_lib/supabase", () => ({
  invokeRpc: mocks.invokeRpcMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string) => void;
  json: (value: unknown) => void;
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
    json(value: unknown) {
      this.body = value;
    },
  };
}

function makePortrait(version = 2, runId = "run-123") {
  return {
    userId: "user-1",
    version,
    portraitTitle: "The Living Portrait",
    tagline: "A portrait built from live evidence.",
    dimensions: [
      {
        kind: "cognitive_style" as const,
        label: "Cognitive style",
        summary: "Grounded and adaptive.",
        confidence: 0.72,
        evidenceCount: 3,
        signalSources: ["memory_entries"],
      },
    ],
    overallConfidence: 0.72,
    sourceWindowStart: "2026-06-01T00:00:00.000Z",
    sourceWindowEnd: "2026-06-17T00:00:00.000Z",
    totalSourceRecords: 18,
    inferenceTriggeredBy: "threshold" as const,
    inferenceRunId: runId,
  };
}

describe("profile portrait drain cron", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCronSecret = process.env.CRON_SECRET;
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.CRON_SECRET = "cron-secret";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CRON_SECRET = originalCronSecret;
    process.env.SUPABASE_URL = originalSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    vi.unstubAllGlobals();
  });

  it("drains queued portrait work and persists the validated portrait", async () => {
    mocks.listQueuedPortraitJobsMock.mockResolvedValue([
      {
        id: "queue-1",
        user_id: "user-1",
        triggered_by: "threshold",
        priority: 5,
        status: "queued",
        queued_at: "2026-06-17T00:00:00.000Z",
        picked_up_at: null,
        completed_at: null,
        run_id: null,
      },
    ]);
    mocks.claimPortraitQueueJobMock.mockResolvedValue({
      id: "queue-1",
      user_id: "user-1",
      triggered_by: "threshold",
      priority: 5,
      status: "processing",
      queued_at: "2026-06-17T00:00:00.000Z",
      picked_up_at: "2026-06-17T00:01:00.000Z",
      completed_at: null,
      run_id: null,
    });
    mocks.createPortraitInferenceRunMock.mockResolvedValue({
      id: "run-123",
      user_id: "user-1",
      triggered_by: "threshold",
      status: "running",
      portrait_id: null,
      input_record_count: 0,
      input_window_start: null,
      input_window_end: null,
      llm_provider_used: "local-deterministic",
      llm_model_used: "profile-portrait-v1",
      prompt_tokens: null,
      completion_tokens: null,
      validation_passed: null,
      validation_errors: {},
      error_message: null,
      duration_ms: null,
      created_at: "2026-06-17T00:01:00.000Z",
      completed_at: null,
    });
    mocks.persistPortraitArtifactMock.mockResolvedValue({
      id: "portrait-1",
      user_id: "user-1",
      version: 2,
      portrait_title: "The Living Portrait",
      tagline: "A portrait built from live evidence.",
      overall_confidence: 0.72,
      source_window_start: "2026-06-01T00:00:00.000Z",
      source_window_end: "2026-06-17T00:00:00.000Z",
      total_source_records: 18,
      plk_resonance_score: null,
      delta_from_previous: null,
      inference_triggered_by: "threshold",
      inference_run_id: "run-123",
      status: "validated",
      room_slug: null,
      validated_at: "2026-06-17T00:01:00.000Z",
      rendered_at: null,
      created_at: "2026-06-17T00:01:00.000Z",
      updated_at: "2026-06-17T00:01:00.000Z",
    });
    mocks.updatePortraitInferenceRunMock.mockResolvedValue(true);
    mocks.updatePortraitQueueJobMock.mockResolvedValue(true);
    mocks.loadLatestPortraitForUserMock.mockResolvedValue(makePortrait(1, "previous-run"));
    mocks.loadProfilePortraitForUserMock.mockImplementation(async (_userId, _profile, triggeredBy, previousPortrait, inferenceRunId) => {
      const previousVersion = previousPortrait?.version ?? 0;
      return makePortrait(previousVersion + 1 || 1, inferenceRunId ?? "run-123");
    });
    mocks.invokeRpcMock.mockImplementation(async (fn: string) => {
      if (fn === "get_portrait_signal_count") {
        return [
          {
            memory_entry_count: 8,
            bucket_drop_count: 3,
            fragment_count: 2,
            gravity_report_count: 2,
            agent_memory_count: 3,
            total_count: 18,
          },
        ];
      }

      return {
        dimensions: [],
        keyThemes: [],
        unresolvedTensions: [],
        coreNarrative: "",
      };
    });

    const drainModule = await import("../cron/profile-portrait-drain");
    const res = createRes();

    await drainModule.default(
      {
        method: "GET",
        headers: { authorization: "Bearer cron-secret" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "drained",
      completed: 1,
      insufficientData: 0,
      failed: 0,
      skipped: 0,
    });
    expect(mocks.loadProfilePortraitForUserMock).toHaveBeenCalledWith(
      "user-1",
      undefined,
      "threshold",
      expect.objectContaining({ version: 1 }),
      "run-123",
    );
    expect(mocks.persistPortraitArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        inferenceRunId: "run-123",
        inferenceTriggeredBy: "threshold",
      }),
    );
  });

  it("records insufficient signal without persisting a portrait", async () => {
    mocks.listQueuedPortraitJobsMock.mockResolvedValue([
      {
        id: "queue-1",
        user_id: "user-1",
        triggered_by: "threshold",
        priority: 5,
        status: "queued",
        queued_at: "2026-06-17T00:00:00.000Z",
        picked_up_at: null,
        completed_at: null,
        run_id: null,
      },
    ]);
    mocks.claimPortraitQueueJobMock.mockResolvedValue({
      id: "queue-1",
      user_id: "user-1",
      triggered_by: "threshold",
      priority: 5,
      status: "processing",
      queued_at: "2026-06-17T00:00:00.000Z",
      picked_up_at: "2026-06-17T00:01:00.000Z",
      completed_at: null,
      run_id: null,
    });
    mocks.createPortraitInferenceRunMock.mockResolvedValue({
      id: "run-123",
      user_id: "user-1",
      triggered_by: "threshold",
      status: "running",
      portrait_id: null,
      input_record_count: 0,
      input_window_start: null,
      input_window_end: null,
      llm_provider_used: "local-deterministic",
      llm_model_used: "profile-portrait-v1",
      prompt_tokens: null,
      completion_tokens: null,
      validation_passed: null,
      validation_errors: {},
      error_message: null,
      duration_ms: null,
      created_at: "2026-06-17T00:01:00.000Z",
      completed_at: null,
    });
    mocks.updatePortraitInferenceRunMock.mockResolvedValue(true);
    mocks.updatePortraitQueueJobMock.mockResolvedValue(true);
    mocks.loadLatestPortraitForUserMock.mockResolvedValue(null);
    mocks.invokeRpcMock.mockResolvedValue([
      {
        memory_entry_count: 4,
        bucket_drop_count: 0,
        fragment_count: 2,
        gravity_report_count: 1,
        agent_memory_count: 3,
        total_count: 10,
      },
    ]);

    const drainModule = await import("../cron/profile-portrait-drain");
    const res = createRes();

    await drainModule.default(
      {
        method: "POST",
        headers: { authorization: "Bearer cron-secret" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "drained",
      completed: 0,
      insufficientData: 1,
      failed: 0,
    });
    expect(mocks.persistPortraitArtifactMock).not.toHaveBeenCalled();
    expect(mocks.loadProfilePortraitForUserMock).not.toHaveBeenCalled();
  });
});
