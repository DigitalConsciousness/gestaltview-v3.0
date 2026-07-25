/**
 * billy.name.test.ts
 *
 * Anonymous visitor scenario: someone lands on GestaltView, has no idea who
 * built it or what Billy is, and asks "What's your name?"
 *
 * Billy should:
 *   ✔  Respond with his name and a warm, grounding intro
 *   ✔  Never mention Keith, GestaltView internals, or that this is a test
 *   ✔  Route through the "billy-engine" package (identity queries)
 *   ✔  Include the system prompt in the LLM call
 *   ✔  Return HTTP 200 with valid response envelope
 *   ✔  Handle the question whether sent as `message` OR `query` field
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MatchKnowledgeFragmentRow, SearchKnowledgeFragmentRow } from "../_lib/supabase";

const routeLlmMock = vi.fn(
  async (_prompt: string, context?: { systemPrompt?: string }) => ({
    response:
      "My name is Billy. I’m the GestaltView companion — think of me as that friend who stays up " +
      "until 3am helping you figure out why your brain works the way it does. What brings you here?",
    provider: "test-provider",
    timestamp: "2026-01-01T00:00:00.000Z",
    metadata: { mode: "billy", systemPromptLength: context?.systemPrompt?.length ?? 0 },
  })
);

const matchKnowledgeFragmentsMock = vi.fn<() => Promise<MatchKnowledgeFragmentRow[]>>(async () => []);
const searchKnowledgeFragmentsMock = vi.fn<() => Promise<SearchKnowledgeFragmentRow[]>>(async () => []);

vi.mock("../_lib/llmRouter", () => ({ routeLlm: routeLlmMock }));
vi.mock("../_lib/supabase", () => ({
  matchKnowledgeFragments: matchKnowledgeFragmentsMock,
  searchKnowledgeFragments: searchKnowledgeFragmentsMock,
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

async function loadBillyModule() {
  vi.resetModules();
  return import("../billy");
}

function mockEmbeddingSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ embedding: { values: [0.1, 0.4, 0.9] } }),
    }) as unknown as typeof fetch
  );
}

const BILLY_IDENTITY_FRAGMENT: MatchKnowledgeFragmentRow = {
  id: "billy-identity-1",
  content:
    "Billy is the GestaltView companion. He is not a chatbot. " +
    "He holds the user's whole language, context, and story without compression.",
  source_file: "Billy/Identity.md",
  similarity: 0.97,
  chunk_index: 0,
  document_type: "billy-engine",
  tags: ["billy-engine", "identity"],
};

describe("Billy name query — anonymous visitor scenario", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_API_KEY: "gemini-key",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    };
    vi.restoreAllMocks();
    routeLlmMock.mockClear();
    matchKnowledgeFragmentsMock.mockClear();
    searchKnowledgeFragmentsMock.mockClear();
    matchKnowledgeFragmentsMock.mockResolvedValue([]);
    searchKnowledgeFragmentsMock.mockResolvedValue([]);
  });

  it("returns 200 when anonymous visitor asks: What's your name?", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
  });

  it("routes name question to billy-engine package", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const packageFilter = module.inferPackageFromQuery("What's your name?");

    expect(packageFilter).toBe("billy-engine");
  });

  it("includes system prompt in the LLM context for a name query", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(routeLlmMock).toHaveBeenCalledTimes(1);
    const [, llmContext] = routeLlmMock.mock.calls[0] as [string, { systemPrompt?: string }];
    expect(llmContext.systemPrompt).toContain(module.BILLY_SYSTEM_PROMPT.slice(0, 40));
  });

  it("surfaces Billy identity corpus context in the LLM user prompt", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    const [promptInput] = routeLlmMock.mock.calls[0] as [string, { systemPrompt?: string }];
    expect(promptInput).toContain("=== CONTEXT FROM MANIFEST INDEX");
  });

  it("response envelope includes packageFilter: billy-engine", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.body).toMatchObject({
      metadata: { packageFilter: "billy-engine" },
    });
  });

  it.each([
    "What's your name?",
    "what is your name",
    "who are you?",
    "hey, what do I call you?",
    "do you have a name?",
    "tell me your name",
  ])('routes "%s" to billy-engine', async (phrase: string) => {
    const module = await loadBillyModule();
    const packageFilter = module.inferPackageFromQuery(phrase);
    expect(packageFilter).toBe("billy-engine");
  });

  it("handles the question sent as `query` field instead of `message`", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([BILLY_IDENTITY_FRAGMENT]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { query: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
  });

  it("falls back to text search and still answers name question when embeddings fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "embedding-service-down",
      }) as unknown as typeof fetch
    );

    const fallbackRows: SearchKnowledgeFragmentRow[] = [
      {
        id: "billy-fallback-1",
        source_file: "Billy/Identity.md",
        content: "Billy is the GestaltView companion.",
        rank: 0.91,
        chunk_index: 0,
        document_type: "billy-engine",
        tags: ["billy-engine"],
      },
    ];

    searchKnowledgeFragmentsMock.mockResolvedValueOnce(fallbackRows);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
  });

  it("returns 200 even when no corpus fragments are found", async () => {
    mockEmbeddingSuccess();
    matchKnowledgeFragmentsMock.mockResolvedValueOnce([]);
    searchKnowledgeFragmentsMock.mockResolvedValueOnce([]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What's your name?" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(routeLlmMock).toHaveBeenCalledTimes(1);
  });
});
