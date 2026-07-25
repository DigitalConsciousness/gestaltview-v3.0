import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  getInnerWorldSupabaseAdminMock: vi.fn(),
  buildInnerWorldArtifactPayloadMock: vi.fn((row: { id: string; title: string }) => ({
    id: row.id,
    title: row.title,
  })),
  runCodexExportJobMock: vi.fn(),
}));

vi.mock("../_lib/auth", () => ({
  requireAuth: mocks.requireAuthMock,
}));

vi.mock("../_lib/inner-world", () => ({
  getInnerWorldSupabaseAdmin: mocks.getInnerWorldSupabaseAdminMock,
  buildInnerWorldArtifactPayload: mocks.buildInnerWorldArtifactPayloadMock,
}));

vi.mock("../../workers/codex/runner.js", () => ({
  runCodexExportJob: mocks.runCodexExportJobMock,
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

describe("production fix spec 2026-06-09", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCronSecret = process.env.CRON_SECRET;
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.CRON_SECRET = originalCronSecret;
    process.env.SUPABASE_URL = originalSupabaseUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    vi.unstubAllGlobals();
  });

  it("uses production-safe .js specifiers from the Codex template barrel", () => {
    const source = readFileSync(resolve(process.cwd(), "shared/codex/templates/index.ts"), "utf8");

    expect(source).toContain('export * from "./components.js";');
    expect(source).toContain('export * from "./html.js";');
  });

  it("accepts a matching CRON_SECRET bearer token for codex drain invocations", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "cron-secret";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );

    const drainModule = await import("../cron/codex-drain");
    const res = createRes();

    await drainModule.default(
      {
        method: "GET",
        headers: { authorization: "Bearer cron-secret" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "idle", processed: 0, results: [] });
  });

  it("claims codex drain work through the atomic claim RPC", async () => {
    process.env.NODE_ENV = "production";
    process.env.CRON_SECRET = "cron-secret";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    const drainModule = await import("../cron/codex-drain");
    const res = createRes();

    await drainModule.default(
      {
        method: "GET",
        headers: { authorization: "Bearer cron-secret" },
      } as never,
      res as never,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/rest/v1/rpc/claim_codex_jobs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ batch_size: 5 }),
      }),
    );
  });

  it("clamps artifact GET pagination and applies the requested offset", async () => {
    const rangeMock = vi.fn().mockResolvedValue({
      data: [{ id: "artifact-1", title: "Artifact One" }],
      error: null,
    });
    const orderMock = vi.fn(() => ({ range: rangeMock }));
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));

    mocks.requireAuthMock.mockReturnValue({
      id: "user-1",
      email: "user@example.com",
      tier: "free",
      isAdmin: false,
    });
    mocks.getInnerWorldSupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => ({ select: selectMock })),
    });

    const artifactsModule = await import("../inner-world/artifacts");
    const res = createRes();

    await artifactsModule.default(
      {
        method: "GET",
        headers: {},
        query: { limit: "1000", offset: "25" },
      } as never,
      res as never,
    );

    expect(rangeMock).toHaveBeenCalledWith(25, 124);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ artifacts: [{ id: "artifact-1", title: "Artifact One" }] });
  });

  it("includes render route files in vercel packaging", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"));

    expect(config.functions["api/render/*.ts"]).toEqual({
      includeFiles: "api/_lib/**,shared/rendering/**",
    });
  });

  it("falls back to a select list without origin_di_id when the live table rejects that column", async () => {
    const rangeMock = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: 'column "origin_di_id" does not exist' } })
      .mockResolvedValueOnce({ data: [{ id: "artifact-2", title: "Recovered Artifact" }], error: null });
    const orderMock = vi.fn(() => ({ range: rangeMock }));
    const eqMock = vi.fn(() => ({ order: orderMock }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));

    mocks.requireAuthMock.mockReturnValue({
      id: "user-1",
      email: "user@example.com",
      tier: "free",
      isAdmin: false,
    });
    mocks.getInnerWorldSupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => ({ select: selectMock })),
    });

    const artifactsModule = await import("../inner-world/artifacts");
    const res = createRes();

    await artifactsModule.default({ method: "GET", headers: {}, query: {} } as never, res as never);

    expect(selectMock).toHaveBeenNthCalledWith(2, expect.not.stringContaining("origin_di_id"));
    expect(res.statusCode).toBe(200);
  });
});
