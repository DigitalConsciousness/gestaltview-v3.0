import { beforeEach, describe, expect, it, vi } from "vitest";

const insertRowMock = vi.fn();

vi.mock("../_lib/supabase.js", () => ({
  insertRow: insertRowMock,
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
  return import("../orchestrator/decide");
}

describe("orchestrator decide route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    insertRowMock.mockReset();
  });

  it("persists structured orchestration decisions before returning the routing response", async () => {
    const module = await loadModule();
    insertRowMock.mockResolvedValue(true);

    const req = {
      method: "POST",
      headers: {},
      body: {
        trigger: "manual_synthesize",
        sourceRoom: "blackboard-room",
        text: "Please build a recap from this.",
        userId: "user-1",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(insertRowMock).toHaveBeenCalledWith(
      "orchestration_decisions",
      expect.objectContaining({
        decision_id: expect.stringMatching(/^orch-/),
        user_id: "user-1",
        trigger: "manual_synthesize",
        source_room: "blackboard-room",
        decision_payload: expect.objectContaining({
          trigger: "manual_synthesize",
        }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      diagnostics: {
        persisted: true,
        triggeredOnly: true,
        deterministic: true,
      },
      decision: {
        trigger: "manual_synthesize",
        diSelection: {
          category: "context_aware",
          execution_surface: "creation-corner",
        },
      },
      workerPlan: {
        spawnMode: "auto",
        workers: [],
      },
    });
  }, 10_000);

  it("fails open if persistence is unavailable", async () => {
    const module = await loadModule();
    insertRowMock.mockRejectedValueOnce(new Error("supabase offline"));

    const req = {
      method: "POST",
      headers: {},
      body: {
        trigger: "capture_saved",
        sourceRoom: "sanctuary",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      diagnostics: {
        persisted: false,
      },
      workerPlan: {
        spawnMode: "auto",
      },
    });
  });
});
