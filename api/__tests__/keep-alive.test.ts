import { beforeEach, describe, expect, it, vi } from "vitest";
import keepAliveHandler from "../keep-alive";

type MockRes = {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string | string[]) => MockRes;
  end: (value?: string) => void;
  getHeader: (key: string) => string | string[] | undefined;
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
    setHeader(key: string, value: string | string[]) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
    getHeader(key: string) {
      return this.headers[key];
    },
  };
}

function createFetchResponse(ok: boolean, status = 200, body = "[]") {
  return {
    ok,
    status,
    text: async () => body,
  };
}

describe("keep-alive route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("skips the DB ping when Supabase env vars are missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = createRes();
    await keepAliveHandler({ method: "GET", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: "warm" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pings the documents table through Supabase REST", async () => {
    process.env.SUPABASE_URL = "supabase.test/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse(true));
    vi.stubGlobal("fetch", fetchMock);

    const res = createRes();
    await keepAliveHandler({ method: "GET", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ status: "warm" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://supabase.test/rest/v1/documents?select=document_id&limit=1",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          apikey: "service-role",
          Authorization: "Bearer service-role",
        }),
      })
    );
  });

  it("reports Supabase REST failures as degraded without failing cron", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse(false, 500, "db down"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = createRes();
    await keepAliveHandler({ method: "GET", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "degraded",
      error: "Supabase ping failed: 500 db down",
    });
  });

  it("reports Supabase ping aborts as degraded without failing cron", async () => {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.SUPABASE_REQUEST_TIMEOUT_MS = "12000";
    const abortError = new Error("This operation was aborted");
    abortError.name = "AbortError";
    const fetchMock = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = createRes();
    await keepAliveHandler({ method: "GET", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "degraded",
      error: "Supabase ping timed out after 8000ms",
    });
  });

  it("reports session secret as required locally while keeping Billy diagnose optional", async () => {
    const { summarizeHotfixEnv } = await import("../../scripts/check-hotfix-env.mjs");

    const result = summarizeHotfixEnv({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon",
      SESSION_SECRET: "",
      BILLY_API_SECRET: "",
      ASSEMBLYAI_API_KEY: "",
      BILLY_TRANSCRIPTION_URL: "",
      GROQ_API_KEY: "groq-key",
    });

    expect(result.coreRuntime.status).toBe("ready");
    expect(result.session.status).toBe("action_required");
    expect(result.billyDiagnose.status).toBe("disabled");
    expect(result.transcriptory.status).toBe("ready");
  });

  it("rejects non-keepalive methods", async () => {
    const res = createRes();
    await keepAliveHandler({ method: "POST", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
  });
});
