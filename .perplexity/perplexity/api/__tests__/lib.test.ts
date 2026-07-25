import { beforeEach, describe, expect, it, vi } from "vitest";
import { envelope } from "../_lib/response";
import { getUserId } from "../_lib/user";

async function loadSupabaseLib() {
  vi.resetModules();
  return import("../_lib/supabase");
}

async function loadAuthLib() {
  vi.resetModules();
  return import("../_lib/auth");
}

function createJsonResponse(payload: unknown, ok: boolean = true) {
  return {
    ok,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

function createHealthyPipelineFetchMock() {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/rest/v1/processing_runs?")) {
      return createJsonResponse([{ run_id: "run-1" }]);
    }

    return createJsonResponse([]);
  });
}

describe("api lib utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.doUnmock("@supabase/supabase-js");
  });

  it("creates envelope shape", () => {
    const result = envelope("ok", "provider", {
      free: true,
      tokensUsed: 42,
      processingTime: 123,
      metadata: { x: 1 },
    });

    expect(result.response).toBe("ok");
    expect(result.provider).toBe("provider");
    expect(result.free).toBe(true);
    expect(result.tokensUsed).toBe(42);
    expect(result.processingTime).toBe(123);
    expect(result.metadata).toEqual({ x: 1 });
    expect(typeof result.timestamp).toBe("string");
  });

  it("resolves user id by precedence and trims whitespace", () => {
    const req = { headers: { "x-user-id": " header-user " }, query: { userId: "query-user" } };
    const fromBody = getUserId(req as never, { userId: " body-user " });
    const fromHeader = getUserId(req as never, {});
    const fallback = getUserId({ headers: {}, query: {} } as never, {});

    expect(fromBody).toBe("body-user");
    expect(fromHeader).toBe("header-user");
    expect(fallback).toBe("guest-user");
  });

  it("recognizes founder admin emails from the default allowlist", async () => {
    const { isFounderAdminEmail, hasFounderOrAdminAccess } = await loadAuthLib();

    expect(isFounderAdminEmail("keithsoyka@gmail.com")).toBe(true);
    expect(
      hasFounderOrAdminAccess({
        email: "keithsoyka@gmail.com",
        isAdmin: false,
      })
    ).toBe(true);
  });

  it("recognizes founder admin emails from FOUNDER_ADMIN_EMAILS", async () => {
    process.env.FOUNDER_ADMIN_EMAILS = " founder@example.com,ops@example.com ";

    const { isFounderAdminEmail } = await loadAuthLib();
    expect(isFounderAdminEmail("ops@example.com")).toBe(true);
    expect(isFounderAdminEmail("someone@example.com")).toBe(false);
  });

  it("authenticates with the anon key fallback when the service role key is unavailable", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    process.env.VITE_SUPABASE_ANON_KEY = "anon-key";

    const getUserMock = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "founder@example.com" } },
      error: null,
    });
    const singleMock = vi.fn().mockResolvedValue({
      data: { tier: "pro", is_admin: true },
      error: null,
    });
    const eqMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const createClientMock = vi
      .fn()
      .mockReturnValueOnce({
        auth: {
          getUser: getUserMock,
        },
      })
      .mockReturnValueOnce({
        from: fromMock,
      });

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: createClientMock,
    }));

    const { getAuthUser } = await loadAuthLib();
    const user = await getAuthUser({
      headers: { authorization: "Bearer session-token" },
    } as never);

    expect(user).toEqual({
      id: "user-1",
      email: "founder@example.com",
      tier: "pro",
      isAdmin: true,
    });
    expect(createClientMock).toHaveBeenNthCalledWith(
      1,
      "https://supabase.test",
      "anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        }),
      })
    );
    expect(createClientMock).toHaveBeenNthCalledWith(
      2,
      "https://supabase.test",
      "anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        }),
        global: {
          headers: {
            Authorization: "Bearer session-token",
          },
        },
      })
    );
  });

  it("keeps a verified auth session when profile enrichment fails", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const getUserMock = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "keithsoyka@gmail.com" } },
      error: null,
    });
    const singleMock = vi.fn().mockRejectedValue(new Error("profile timeout"));
    const eqMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const createClientMock = vi.fn().mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
      from: fromMock,
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: createClientMock,
    }));

    const { getAuthUser } = await loadAuthLib();
    const user = await getAuthUser({
      url: "/api/session/dashboard",
      headers: { authorization: "Bearer session-token" },
    } as never);

    expect(user).toEqual({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    expect(singleMock).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("invalidates cached auth profiles after admin state changes", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const getUserMock = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "founder@example.com" } },
      error: null,
    });
    const singleMock = vi
      .fn()
      .mockResolvedValueOnce({
        data: { tier: "free", is_admin: false },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { tier: "enterprise", is_admin: true },
        error: null,
      });
    const eqMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const createClientMock = vi.fn().mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
      from: fromMock,
    });

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: createClientMock,
    }));

    const { getAuthUser, invalidateAuthUserProfileCache } = await loadAuthLib();
    const req = { headers: { authorization: "Bearer session-token" } } as never;

    await expect(getAuthUser(req)).resolves.toMatchObject({ isAdmin: false, tier: "free" });
    await expect(getAuthUser(req)).resolves.toMatchObject({ isAdmin: false, tier: "free" });
    expect(singleMock).toHaveBeenCalledTimes(1);

    invalidateAuthUserProfileCache("user-1");

    await expect(getAuthUser(req)).resolves.toMatchObject({
      isAdmin: true,
      tier: "enterprise",
    });
    expect(singleMock).toHaveBeenCalledTimes(2);
  });

  it("bypasses cached auth profiles on admin-gated control surfaces", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const getUserMock = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "founder@example.com" } },
      error: null,
    });
    const singleMock = vi
      .fn()
      .mockResolvedValueOnce({
        data: { tier: "free", is_admin: false },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { tier: "enterprise", is_admin: true },
        error: null,
      });
    const eqMock = vi.fn(() => ({ single: singleMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const fromMock = vi.fn(() => ({ select: selectMock }));
    const createClientMock = vi.fn().mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
      from: fromMock,
    });

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: createClientMock,
    }));

    const { getAuthUser } = await loadAuthLib();
    const req = {
      url: "/api/trainer/agents",
      headers: { authorization: "Bearer session-token" },
    } as never;

    await expect(getAuthUser(req)).resolves.toMatchObject({ isAdmin: false, tier: "free" });
    await expect(getAuthUser(req)).resolves.toMatchObject({
      isAdmin: true,
      tier: "enterprise",
    });
    expect(singleMock).toHaveBeenCalledTimes(2);
  });

  it("reports missing supabase config in health check", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { checkPipelineHealth } = await loadSupabaseLib();
    const result = await checkPipelineHealth();

    expect(result.ok).toBe(false);
    expect(result.details[0]).toContain("Missing SUPABASE_URL");
  });

  it("normalizes malformed SUPABASE_URL values for health checks", async () => {
    process.env.SUPABASE_URL = "://ltajayfzlaevchxngkrm.supabase.co/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = createHealthyPipelineFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { checkPipelineHealth } = await loadSupabaseLib();
    const result = await checkPipelineHealth();

    expect(result.ok).toBe(true);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://ltajayfzlaevchxngkrm.supabase.co/rest/v1/knowledge_fragments?select=id&limit=1"
    );
    const processingRunsCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/rest/v1/processing_runs?")
    );
    expect(String(processingRunsCall?.[0])).toContain(
      "status=in.(complete,completed,completed_with_errors)"
    );
  });

  it("falls back to VITE_SUPABASE_URL when the server URL is unset", async () => {
    delete process.env.SUPABASE_URL;
    process.env.VITE_SUPABASE_URL = "ltajayfzlaevchxngkrm.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = createHealthyPipelineFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { checkPipelineHealth } = await loadSupabaseLib();
    const result = await checkPipelineHealth();

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(10);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("https://ltajayfzlaevchxngkrm.supabase.co/rest/v1/");
  });

  it("uses the caller bearer token for user-scoped Supabase REST reads", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    process.env.VITE_SUPABASE_ANON_KEY = "anon-key";

    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse([
        {
          id: "user-1",
          email: "founder@example.com",
          tier: "free",
          subscription_status: "inactive",
          billing_period_start: null,
          billy_query_count: 0,
          is_admin: false,
          grace_until: null,
          created_at: "2026-03-01T00:00:00.000Z",
          updated_at: "2026-03-01T00:00:00.000Z",
        },
      ])
    );
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { getUserAccount } = await loadSupabaseLib();
    const row = await getUserAccount("user-1", "session-token");

    expect(row?.id).toBe("user-1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "https://supabase.test/rest/v1/users?id=eq.user-1"
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: expect.objectContaining({
        apikey: "anon-key",
        Authorization: "Bearer session-token",
      }),
    });
  });

  it("retries semantic retrieval without a package filter when the filtered pass is empty", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse([]))
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            id: "frag-1",
            content: "PLK preserves the user's exact language.",
            source_file: "Methods/PLK.md",
            document_type: "methods",
            chunk_index: 0,
            tags: ["methods"],
            similarity: 0.97,
          },
        ])
      );
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { matchKnowledgeFragments } = await loadSupabaseLib();
    const rows = await matchKnowledgeFragments({
      queryEmbedding: [0.1, 0.2, 0.3],
      topK: 3,
      packageFilter: "methods",
    });

    expect(rows).toHaveLength(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      filter_package: "methods",
      filter_type: "methods",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      filter_package: null,
      filter_type: null,
    });
  });

  it("retries text retrieval without a package filter when the filtered pass is empty", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse([]))
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            id: "frag-1",
            content: "PLK preserves the user's exact language.",
            source_file: "Methods/PLK.md",
            document_type: "methods",
            chunk_index: 0,
            tags: ["methods"],
            rank: 0.91,
          },
        ])
      );
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { searchKnowledgeFragments } = await loadSupabaseLib();
    const rows = await searchKnowledgeFragments({
      query: "What is PLK really?",
      topK: 3,
      packageFilter: "methods",
    });

    expect(rows).toHaveLength(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      filter_package: "methods",
      filter_type: "methods",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      filter_package: null,
      filter_type: null,
    });
  });

  it("checks all required tables when supabase config exists", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    const fetchMock = createHealthyPipelineFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { checkPipelineHealth } = await loadSupabaseLib();
    const result = await checkPipelineHealth();

    expect(result.ok).toBe(true);
    expect(result.details).toEqual([]);
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual(
      expect.arrayContaining([
        "https://supabase.test/rest/v1/knowledge_fragments?select=id&limit=1",
        "https://supabase.test/rest/v1/skill_fragments?select=id&limit=1",
        "https://supabase.test/rest/v1/memory_entries?select=id&limit=1",
        "https://supabase.test/rest/v1/bucket_drops?select=id&limit=1",
        "https://supabase.test/rest/v1/musical_dna_analyses?select=id&limit=1",
        "https://supabase.test/rest/v1/tribunal_sessions?select=id&limit=1",
        "https://supabase.test/rest/v1/billy_sessions?select=id&limit=1",
      ])
    );
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("/rest/v1/processing_runs?"))).toBe(true);
  });
});
