import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminMock = vi.fn();
const listOrchestrationDecisionsMock = vi.fn();

vi.mock("../_lib/auth.js", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("../_lib/supabase.js", () => ({
  listOrchestrationDecisions: listOrchestrationDecisionsMock,
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
  return import("../orchestrator/analytics");
}

describe("orchestrator analytics route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requireAdminMock.mockReset();
    listOrchestrationDecisionsMock.mockReset();
  });

  it("returns a summarized analytics payload for admins", async () => {
    const module = await loadModule();
    requireAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@gestaltview.ai",
      tier: "enterprise",
      isAdmin: true,
    });
    listOrchestrationDecisionsMock.mockResolvedValue([
      {
        id: "row-1",
        decision_id: "orch-1",
        triggered_at: "2026-06-20T10:00:00.000Z",
        user_id: "user-1",
        trigger: "manual_synthesize",
        source_room: "blackboard-room",
        detected_state: "active_creation",
        support_level: "none",
        content_kind: "session_recap",
        destination: "creation-corner",
        artifact_target_type: "session-recap",
        artifact_destination: "creation-corner",
        synthesis_style: "convergent",
        processors: ["state", "routing", "codex"],
        export_formats: ["markdown", "html"],
        next_action: "forge_artifact",
        should_forge_artifact: true,
        should_persist_signal: true,
        should_update_profile: false,
        should_update_scaffold: false,
        confidence: 0.83,
        user_facing_summary: "Forge a session recap artifact.",
        markers: ["active_creation"],
        context_clues: ["recap"],
        has_image: false,
        has_audio: false,
        has_video: false,
        has_file: false,
        input_payload: { textExcerpt: "Please build a recap from this." },
        decision_payload: {},
        internal_diagnostics: [],
        created_at: "2026-06-20T10:00:01.000Z",
      },
      {
        id: "row-2",
        decision_id: "orch-2",
        triggered_at: "2026-06-20T10:05:00.000Z",
        user_id: "user-2",
        trigger: "manual_synthesize",
        source_room: "sanctuary",
        detected_state: "processing_load",
        support_level: "elevated",
        content_kind: "raw_capture",
        destination: "creation-corner",
        artifact_target_type: null,
        artifact_destination: null,
        synthesis_style: "faithful",
        processors: ["state", "routing", "plk", "safety"],
        export_formats: ["markdown", "json"],
        next_action: "preserve_capture",
        should_forge_artifact: false,
        should_persist_signal: true,
        should_update_profile: false,
        should_update_scaffold: false,
        confidence: 0.61,
        user_facing_summary: "Preserve the capture and avoid aggressive synthesis.",
        markers: ["processing_load"],
        context_clues: ["overwhelmed"],
        has_image: false,
        has_audio: false,
        has_video: false,
        has_file: false,
        input_payload: { textExcerpt: "I feel overloaded." },
        decision_payload: {},
        internal_diagnostics: [],
        created_at: "2026-06-20T10:05:01.000Z",
      },
      {
        id: "row-3",
        decision_id: "orch-3",
        triggered_at: "2026-06-20T10:10:00.000Z",
        user_id: "user-3",
        trigger: "user_requested_profile",
        source_room: "sanctuary",
        detected_state: "steady_processing",
        support_level: "low",
        content_kind: "profile_signal",
        destination: "profile",
        artifact_target_type: null,
        artifact_destination: null,
        synthesis_style: "plk-resonant",
        processors: ["state", "routing", "tapestry"],
        export_formats: ["json"],
        next_action: "queue_profile_signal",
        should_forge_artifact: false,
        should_persist_signal: true,
        should_update_profile: true,
        should_update_scaffold: false,
        confidence: 0.74,
        user_facing_summary: "Queue a profile signal.",
        markers: ["steady_processing"],
        context_clues: ["identity"],
        has_image: false,
        has_audio: false,
        has_video: false,
        has_file: false,
        input_payload: { textExcerpt: "Tell me what this says about me." },
        decision_payload: {},
        internal_diagnostics: [],
        created_at: "2026-06-20T10:10:01.000Z",
      },
    ]);

    const req = {
      method: "GET",
      query: { limit: "2" },
      headers: {},
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      limit: 2,
      hasMore: true,
      summary: {
        totalDecisions: 2,
        artifactRate: 0.5,
        persistenceRate: 1,
        profileRate: 0,
        scaffoldRate: 0,
        elevatedSupportRate: 0.5,
        topTrigger: {
          label: "manual_synthesize",
          count: 2,
        },
        topDestination: {
          label: "creation-corner",
          count: 2,
        },
      },
    });
    expect((res.body as { decisions: Array<{ decision_id: string }> }).decisions).toHaveLength(2);
    expect((res.body as { decisions: Array<{ decision_id: string }> }).decisions).toEqual([
      expect.objectContaining({ decision_id: "orch-1" }),
      expect.objectContaining({ decision_id: "orch-2" }),
    ]);
  });
});
