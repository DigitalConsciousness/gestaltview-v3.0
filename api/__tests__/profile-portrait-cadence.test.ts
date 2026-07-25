import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listMonthlyPortraitCadenceCandidatesMock: vi.fn(),
  invokeRpcMock: vi.fn(),
}));

vi.mock("../_lib/profilePortraitPersistence", () => ({
  listMonthlyPortraitCadenceCandidates: mocks.listMonthlyPortraitCadenceCandidatesMock,
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

describe("profile portrait cadence cron", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCronSecret = process.env.CRON_SECRET;
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T12:00:00.000Z"));
    process.env.NODE_ENV = "test";
    process.env.CRON_SECRET = "cron-secret";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CRON_SECRET = originalCronSecret;
    process.env.SUPABASE_URL = originalSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    vi.unstubAllGlobals();
  });

  it("queues cadence refreshes for portraits older than the current month", async () => {
    mocks.listMonthlyPortraitCadenceCandidatesMock.mockResolvedValue([
      {
        id: "portrait-old",
        user_id: "user-old",
        version: 4,
        created_at: "2026-05-10T00:00:00.000Z",
        status: "validated",
      },
      {
        id: "portrait-old-duplicate",
        user_id: "user-old",
        version: 3,
        created_at: "2026-04-10T00:00:00.000Z",
        status: "validated",
      },
      {
        id: "portrait-fresh",
        user_id: "user-fresh",
        version: 2,
        created_at: "2026-06-10T00:00:00.000Z",
        status: "validated",
      },
    ]);
    mocks.invokeRpcMock.mockResolvedValue(true);

    const cadenceModule = await import("../cron/profile-portrait-cadence");
    const res = createRes();

    await cadenceModule.default(
      {
        method: "GET",
        headers: { authorization: "Bearer cron-secret" },
      } as never,
      res as never,
    );

    expect(mocks.invokeRpcMock).toHaveBeenCalledTimes(1);
    expect(mocks.invokeRpcMock).toHaveBeenCalledWith("maybe_queue_portrait_cadence", {
      p_user_id: "user-old",
      p_priority: 1,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "scheduled",
      queued: 1,
      skipped: 1,
      failed: 0,
    });
  });
});
