import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadLatestPersistedPortraitRecordMock: vi.fn(),
  loadProfilePortraitForUserMock: vi.fn(),
  recordPortraitRenderEventMock: vi.fn(),
  invokeRpcMock: vi.fn(),
}));

vi.mock("../_lib/profilePortrait.js", () => ({
  loadLatestPersistedPortraitRecord: mocks.loadLatestPersistedPortraitRecordMock,
  loadProfilePortraitForUser: mocks.loadProfilePortraitForUserMock,
}));

vi.mock("../_lib/profilePortraitPersistence.js", () => ({
  recordPortraitRenderEvent: mocks.recordPortraitRenderEventMock,
}));

vi.mock("../_lib/supabase.js", () => ({
  invokeRpc: mocks.invokeRpcMock,
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

function makePortrait() {
  return {
    userId: "user-1",
    version: 4,
    portraitTitle: "The Living Portrait",
    tagline: "A portrait built from live evidence.",
    dimensions: [],
    overallConfidence: 0.82,
    sourceWindowStart: "2026-06-01T00:00:00.000Z",
    sourceWindowEnd: "2026-06-18T00:00:00.000Z",
    totalSourceRecords: 24,
    inferenceTriggeredBy: "cadence" as const,
    inferenceRunId: "run-123",
  };
}

describe("profile personality route", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("records a portrait render event when a persisted portrait is returned", async () => {
    mocks.invokeRpcMock.mockResolvedValue({
      dimensions: [],
      keyThemes: [],
      unresolvedTensions: [],
      coreNarrative: "",
    });
    mocks.loadLatestPersistedPortraitRecordMock.mockResolvedValue({
      id: "portrait-1",
      portrait: makePortrait(),
    });
    mocks.recordPortraitRenderEventMock.mockResolvedValue(true);

    const handlerModule = await import("../profile/personality");
    const res = createRes();

    await handlerModule.default(
      {
        method: "GET",
        headers: {
          authorization: "Bearer test-token",
        },
        query: {
          userId: "user-1",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      portrait: {
        userId: "user-1",
        version: 4,
        inferenceRunId: "run-123",
      },
    });
    expect(mocks.recordPortraitRenderEventMock).toHaveBeenCalledWith("user-1", "portrait-1", "view", {
      surface: "api/profile/personality",
    });
    expect(mocks.loadProfilePortraitForUserMock).not.toHaveBeenCalled();
  });
});
