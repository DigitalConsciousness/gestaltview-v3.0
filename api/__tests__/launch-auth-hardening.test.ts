import { beforeEach, describe, expect, it, vi } from "vitest";

const insertRowMock = vi.fn(async () => true);
const routeLlmMock = vi.fn(async () => ({
  response: "Rendered artifact",
  provider: "test-provider",
  free: true,
  tokensUsed: 1,
  processingTime: 1,
  metadata: {},
}));
const bridgeToCodexMock = vi.fn(async () => ({
  codex_artifact: { id: "codex-1" },
  warnings: [],
}));
const getFounderContextMock = vi.fn(async () => null);
const upsertFounderContextMock = vi.fn(async () => true);
const matchKnowledgeFragmentsMock = vi.fn(async () => []);
const searchKnowledgeFragmentsMock = vi.fn(async () => []);
const matchSkillFragmentsMock = vi.fn(async () => []);
const searchSkillFragmentsMock = vi.fn(async () => []);
const retrieveMemoryEntriesMock = vi.fn(async () => ({
  memories: [],
  retrievalMode: "none",
  embedBackend: null,
  embedModel: null,
}));
const captureBillyMemoriesMock = vi.fn(async () => ({
  candidates: 0,
  stored: 0,
}));

vi.mock("../_lib/supabase", () => ({
  insertRow: insertRowMock,
  getFounderContext: getFounderContextMock,
  upsertFounderContext: upsertFounderContextMock,
  matchKnowledgeFragments: matchKnowledgeFragmentsMock,
  searchKnowledgeFragments: searchKnowledgeFragmentsMock,
  matchSkillFragments: matchSkillFragmentsMock,
  searchSkillFragments: searchSkillFragmentsMock,
}));

vi.mock("../_lib/llmRouter", () => ({
  routeLlm: routeLlmMock,
}));

vi.mock("../_lib/codexBridge", () => ({
  bridgeToCodex: bridgeToCodexMock,
}));

vi.mock("../_lib/memory", () => ({
  retrieveMemoryEntries: retrieveMemoryEntriesMock,
  captureBillyMemories: captureBillyMemoriesMock,
}));

vi.mock("../../shared/billy/diagnostics", () => ({
  diagnoseBilly: vi.fn(async () => ({ status: {}, details: {} })),
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

async function authCookie(userId = "auth-user"): Promise<string> {
  process.env.SESSION_SECRET = "launch-auth-test-secret";
  const { createAuthSessionCookie } = await import("../_lib/auth");
  return createAuthSessionCookie("user@example.com", userId, "user", "core");
}

describe("launch auth hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503, text: async () => "offline" })));
    process.env.SESSION_SECRET = "launch-auth-test-secret";
  });

  it("keeps anonymous Billy chat on the guest user instead of trusting spoofed identity", async () => {
    const module = await import("../billy");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        query: { userId: "victim-query" },
        headers: { "x-user-id": "victim-header" },
        body: { message: "who are you", userId: "victim-body" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(routeLlmMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "guest-user" }),
    );
    expect(captureBillyMemoriesMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "guest-user" }),
    );
    expect(insertRowMock).not.toHaveBeenCalled();
  });

  it("requires authentication for persisted bucket drops", async () => {
    const module = await import("../billy-bucket-drop");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        query: { userId: "victim-query" },
        headers: { "x-user-id": "victim-header" },
        body: { content: "save this", userId: "victim-body" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(401);
    expect(insertRowMock).not.toHaveBeenCalled();
  });

  it("stores bucket drops under the authenticated user and ignores body userId", async () => {
    const module = await import("../billy-bucket-drop");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        query: {},
        headers: { cookie: await authCookie("auth-user") },
        body: { content: "save this", userId: "victim-body" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(insertRowMock).toHaveBeenCalledWith(
      "bucket_drops",
      expect.objectContaining({ user_id: "auth-user" }),
    );
  });

  it("uses authenticated identity for gen-engine artifact user ownership", async () => {
    const module = await import("../gen-engine/artifacts");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        query: {},
        headers: { cookie: await authCookie("auth-user") },
        body: {
          userId: "victim-body",
          sourceText: "render this",
          targetType: "markdown",
          title: "Launch Auth",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect((res.body as { artifact: { userId: string | undefined } }).artifact.userId).toBe("auth-user");
    expect(routeLlmMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "auth-user" }),
    );
  });

  it("does not attach legacy Creation Corner syntheses to spoofed user ids", async () => {
    const module = await import("../creation-corner/synthesize");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        query: {},
        headers: {},
        body: {
          user_id: "victim-body",
          text: "a launch artifact",
          artifact_type: "blueprint_md",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect((res.body as { codex: { artifact: { userId: string } } }).codex.artifact.userId).toBe(
      "00000000-0000-4000-8000-000000000000",
    );
  });
});
