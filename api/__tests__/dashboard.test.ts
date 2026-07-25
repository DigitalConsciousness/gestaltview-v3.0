import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const invalidateAuthUserProfileCacheMock = vi.fn();
const getUserAccountMock = vi.fn();
const listUserAccountsMock = vi.fn();
const getFounderContextMock = vi.fn();
const upsertFounderContextMock = vi.fn();
const upsertUserAccountMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  invalidateAuthUserProfileCache: invalidateAuthUserProfileCacheMock,
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/supabase", () => ({
  getUserAccount: getUserAccountMock,
  listUserAccounts: listUserAccountsMock,
  getFounderContext: getFounderContextMock,
  upsertFounderContext: upsertFounderContextMock,
  upsertUserAccount: upsertUserAccountMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  getHeader: (key: string) => string | undefined;
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
    getHeader(key: string) {
      return this.headers[key];
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

async function loadDashboardModule() {
  vi.resetModules();
  return import("../session/dashboard");
}

const baseAccount = {
  id: "user-1",
  email: "keithsoyka@gmail.com",
  tier: "free" as const,
  subscription_status: "inactive" as const,
  billing_period_start: null,
  billy_query_count: 7,
  is_admin: false,
  grace_until: null,
  created_at: "2026-03-01T00:00:00.000Z",
  updated_at: "2026-03-02T00:00:00.000Z",
};

const founderContext = {
  id: "fc-1",
  user_id: "user-1",
  plk_snapshot: { resonance: "high" },
  current_state: "Tracing the next continuity lane.",
  mode_preference: "chat" as const,
  last_session_at: "2026-03-30T12:00:00.000Z",
  session_thread: "We were holding the whole braid together.",
  confirmed_adult: true,
  created_at: "2026-03-20T00:00:00.000Z",
  updated_at: "2026-03-30T12:00:00.000Z",
};

describe("session dashboard API", () => {
  beforeEach(() => {
    process.env = { ...process.env };
    vi.restoreAllMocks();
    requireAuthMock.mockReset();
    invalidateAuthUserProfileCacheMock.mockReset();
    getUserAccountMock.mockReset();
    listUserAccountsMock.mockReset();
    getFounderContextMock.mockReset();
    upsertFounderContextMock.mockReset();
    upsertUserAccountMock.mockReset();
  });

  it("returns dashboard data for an authenticated founder-eligible account", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    getUserAccountMock.mockResolvedValue(baseAccount);
    getFounderContextMock.mockResolvedValue(null);

    const req = { method: "GET", headers: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Methods"]).toBe("GET, PATCH, POST, OPTIONS");
    expect(res.body).toMatchObject({
      profile: {
        email: "keithsoyka@gmail.com",
        isAdmin: false,
      },
      controls: {
        founderBootstrapEligible: true,
        founderControlActive: true,
      },
      shortcuts: {
        billy: "/billy",
        billyVoiceStudio: "/billy/voicestudio",
      },
      billyRuntime: {
        voiceStudioPath: "/billy/voicestudio",
      },
      adminUsers: [],
    });
  });

  it("activates founder admin for the founder email allowlist", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    upsertUserAccountMock.mockResolvedValue({
      ...baseAccount,
      tier: "enterprise",
      subscription_status: "active",
      is_admin: true,
    });
    getUserAccountMock.mockResolvedValue({
      ...baseAccount,
      tier: "enterprise",
      subscription_status: "active",
      is_admin: true,
    });
    getFounderContextMock.mockResolvedValue(null);

    const req = {
      method: "POST",
      headers: {},
      body: { action: "bootstrap-founder-admin" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(upsertUserAccountMock).toHaveBeenCalledWith(
      "user-1",
      {
        email: "keithsoyka@gmail.com",
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      }
    );
    expect(invalidateAuthUserProfileCacheMock).toHaveBeenCalledWith("user-1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      profile: {
        tier: "enterprise",
        isAdmin: true,
      },
      controls: {
        canAccessAdminTools: true,
      },
    });
  });

  it("returns admin-managed users and updates a selected account", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@gestaltview.ai",
      tier: "enterprise",
      isAdmin: true,
    });
    getUserAccountMock
      .mockResolvedValueOnce({
        ...baseAccount,
        id: "admin-1",
        email: "admin@gestaltview.ai",
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      })
      .mockResolvedValueOnce(baseAccount)
      .mockResolvedValueOnce({
        ...baseAccount,
        id: "admin-1",
        email: "admin@gestaltview.ai",
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      });
    listUserAccountsMock
      .mockResolvedValueOnce([
        {
          ...baseAccount,
          id: "admin-1",
          email: "admin@gestaltview.ai",
          tier: "enterprise",
          subscription_status: "active",
          is_admin: true,
        },
        baseAccount,
      ])
      .mockResolvedValueOnce([
        {
          ...baseAccount,
          id: "admin-1",
          email: "admin@gestaltview.ai",
          tier: "enterprise",
          subscription_status: "active",
          is_admin: true,
        },
        {
          ...baseAccount,
          tier: "pro",
          subscription_status: "trialing",
          grace_until: "2026-04-05T18:30:00.000Z",
        },
      ]);
    getFounderContextMock.mockResolvedValue(null);
    upsertUserAccountMock.mockResolvedValue({
      ...baseAccount,
      tier: "pro",
      subscription_status: "trialing",
      grace_until: "2026-04-05T18:30:00.000Z",
    });

    const getReq = { method: "GET", headers: {}, body: {} };
    const getRes = createRes();

    await module.default(getReq as never, getRes as never);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toMatchObject({
      controls: { canAccessAdminTools: true },
      adminUsers: [
        {
          id: "admin-1",
          email: "admin@gestaltview.ai",
          isAdmin: true,
        },
        {
          id: "user-1",
          email: "keithsoyka@gmail.com",
          tier: "free",
        },
      ],
    });

    const postReq = {
      method: "POST",
      headers: {},
      body: {
        action: "update-user-account",
        targetUserId: "user-1",
        tier: "pro",
        subscriptionStatus: "trialing",
        isAdmin: false,
        graceUntil: "2026-04-05T18:30",
        billingPeriodStart: null,
      },
    };
    const postRes = createRes();

    await module.default(postReq as never, postRes as never);

    expect(upsertUserAccountMock).toHaveBeenCalledWith("user-1", {
      tier: "pro",
      subscription_status: "trialing",
      is_admin: false,
      grace_until: "2026-04-05T18:30:00.000Z",
      billing_period_start: null,
    });
    expect(invalidateAuthUserProfileCacheMock).toHaveBeenCalledWith("user-1");
    expect(postRes.statusCode).toBe(200);
    expect((postRes.body as { adminUsers: unknown[] }).adminUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "user-1",
          tier: "pro",
          subscriptionStatus: "trialing",
          graceUntil: "2026-04-05T18:30:00.000Z",
        }),
      ])
    );
  });

  it("allows account overrides when live account state is admin but auth enrichment is stale", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@gestaltview.ai",
      tier: "free",
      isAdmin: false,
    });
    getUserAccountMock
      .mockResolvedValueOnce({
        ...baseAccount,
        id: "admin-1",
        email: "admin@gestaltview.ai",
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      })
      .mockResolvedValueOnce(baseAccount)
      .mockResolvedValueOnce({
        ...baseAccount,
        id: "admin-1",
        email: "admin@gestaltview.ai",
        tier: "enterprise",
        subscription_status: "active",
        is_admin: true,
      });
    upsertUserAccountMock.mockResolvedValue({
      ...baseAccount,
      tier: "core",
    });
    getFounderContextMock.mockResolvedValue(null);
    listUserAccountsMock.mockResolvedValue([]);

    const req = {
      method: "POST",
      headers: {},
      body: {
        action: "update-user-account",
        targetUserId: "user-1",
        tier: "core",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(upsertUserAccountMock).toHaveBeenCalledWith("user-1", {
      tier: "core",
    });
    expect(invalidateAuthUserProfileCacheMock).toHaveBeenCalledWith("user-1");
  });

  it("persists founder context for founder/admin users", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "enterprise",
      isAdmin: true,
    });
    upsertFounderContextMock.mockResolvedValue(true);
    getUserAccountMock.mockResolvedValue({
      ...baseAccount,
      tier: "enterprise",
      subscription_status: "active",
      is_admin: true,
    });
    getFounderContextMock.mockResolvedValue(founderContext);

    const req = {
      method: "PATCH",
      headers: {},
      body: {
        currentState: "Ship the founder dashboard cleanly.",
        sessionThread: "Billy now holds the founder line on demand.",
        modePreference: "synthesis",
        confirmedAdult: true,
        plkSnapshot: { tone: "direct" },
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(upsertFounderContextMock).toHaveBeenCalledWith(
      "user-1",
      {
        current_state: "Ship the founder dashboard cleanly.",
        session_thread: "Billy now holds the founder line on demand.",
        mode_preference: "synthesis",
        confirmed_adult: true,
        plk_snapshot: { tone: "direct" },
      }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      founderContext: {
        currentState: "Tracing the next continuity lane.",
        modePreference: "chat",
      },
    });
  });

  it("rejects admin-only account overrides for non-admin users", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });

    const req = {
      method: "POST",
      headers: {},
      body: {
        action: "update-user-account",
        targetUserId: "user-1",
        tier: "enterprise",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Admin access required for account overrides." });
  });

  it("returns the auth error for unauthenticated requests", async () => {
    const module = await loadDashboardModule();
    requireAuthMock.mockResolvedValue({
      status: 401,
      body: { error: "Authentication required" },
    });

    const req = { method: "GET", headers: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
  });
});
