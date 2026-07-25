import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MatchKnowledgeFragmentRow,
  MatchSkillFragmentRow,
  SearchKnowledgeFragmentRow,
  SearchSkillFragmentRow,
} from "../_lib/supabase";

const routeLlmMock = vi.fn(
  async (message: string, context?: { systemPrompt?: string }) => ({
    response: message,
    provider: "test-provider",
    free: true,
    tokensUsed: 77,
    processingTime: 456,
    timestamp: "2026-01-01T00:00:00.000Z",
    metadata: { mode: "billy", systemPromptLength: context?.systemPrompt?.length ?? 0 },
  })
);

const matchKnowledgeFragmentsMock = vi.fn<() => Promise<MatchKnowledgeFragmentRow[]>>(async () => []);
const searchKnowledgeFragmentsMock = vi.fn<() => Promise<SearchKnowledgeFragmentRow[]>>(async () => []);
const matchSkillFragmentsMock = vi.fn<() => Promise<MatchSkillFragmentRow[]>>(async () => []);
const searchSkillFragmentsMock = vi.fn<() => Promise<SearchSkillFragmentRow[]>>(async () => []);
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
const insertRowMock = vi.fn(async () => true);
const getFounderContextMock = vi.fn(async () => null);
const upsertFounderContextMock = vi.fn(async () => true);
const diagnoseBillyMock = vi.fn(async () => ({
  status: {
    groq: true,
    gemini: true,
    anthropic: false,
    openai: false,
    supabase: true,
    discord: false,
    reddit_devvit: false,
    reddit_snoowrap: false,
    slack: false,
    web_api: true,
    billyApiSecret: true,
    ipGuardActive: true,
  },
  details: {
    groq: "ok",
    gemini: "ok",
    anthropic: "missing",
    openai: "missing",
    supabase: "ok",
    discord: "missing",
    reddit_devvit: "missing",
    reddit_snoowrap: "missing",
    slack: "missing",
    web_api: "ok",
    billyApiSecret: "ok",
    ipGuardActive: "ok",
  },
}));

vi.mock("../_lib/llmRouter", () => ({
  routeLlm: routeLlmMock,
}));

vi.mock("../_lib/supabase", () => ({
  matchKnowledgeFragments: matchKnowledgeFragmentsMock,
  searchKnowledgeFragments: searchKnowledgeFragmentsMock,
  matchSkillFragments: matchSkillFragmentsMock,
  searchSkillFragments: searchSkillFragmentsMock,
  insertRow: insertRowMock,
  getFounderContext: getFounderContextMock,
  upsertFounderContext: upsertFounderContextMock,
}));

vi.mock("../_lib/memory", () => ({
  retrieveMemoryEntries: retrieveMemoryEntriesMock,
  captureBillyMemories: captureBillyMemoriesMock,
}));

vi.mock("../../shared/billy/diagnostics", () => ({
  diagnoseBilly: diagnoseBillyMock,
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

describe("billy API route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_API_KEY: "gemini-key",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      BILLY_API_SECRET: "secret-key",
    };
    vi.restoreAllMocks();
    routeLlmMock.mockClear();
    matchKnowledgeFragmentsMock.mockClear();
    searchKnowledgeFragmentsMock.mockClear();
    matchSkillFragmentsMock.mockClear();
    searchSkillFragmentsMock.mockClear();
    retrieveMemoryEntriesMock.mockClear();
    captureBillyMemoriesMock.mockClear();
    insertRowMock.mockClear();
    getFounderContextMock.mockClear();
    upsertFounderContextMock.mockClear();
    diagnoseBillyMock.mockClear();
    matchKnowledgeFragmentsMock.mockResolvedValue([]);
    searchKnowledgeFragmentsMock.mockResolvedValue([]);
    matchSkillFragmentsMock.mockResolvedValue([]);
    searchSkillFragmentsMock.mockResolvedValue([]);
    retrieveMemoryEntriesMock.mockResolvedValue({
      memories: [],
      retrievalMode: "none",
      embedBackend: null,
      embedModel: null,
    });
    captureBillyMemoriesMock.mockResolvedValue({
      candidates: 0,
      stored: 0,
    });
    getFounderContextMock.mockResolvedValue(null);
  });

  it("handles preflight", async () => {
    const module = await loadBillyModule();
    const req = { method: "OPTIONS", query: {}, headers: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
  }, 30000);

  it("rewrites banned Billy filler in runtime bug contexts", async () => {
    const { applyBillyToneGuard } = await import("../../shared/billy/toneGuard.js");

    const result = applyBillyToneGuard({
      response: "I know this is hard. This is a courageous step.",
      userMessage: "The system treated my lyric like a therapy prompt.",
      context: "runtime_bug",
    });

    expect(result).toContain("That’s the bug");
    expect(result).not.toContain("I know this is hard");
  });

  it("rejects non-post methods", async () => {
    const module = await loadBillyModule();
    const req = { method: "GET", query: {}, headers: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
  });

  it("infers package routing", async () => {
    const module = await loadBillyModule();

    expect(module.inferPackageFromQuery("what is PLK really?")).toBe("methods");
    expect(module.inferPackageFromQuery("who are you, Billy?")).toBe("billy-engine");
  });

  it("passes Billy system prompt and context through the LLM router", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ embedding: { values: [0.2, 0.3, 0.5] } }),
    });
    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    matchKnowledgeFragmentsMock.mockResolvedValueOnce([
      {
        id: "frag-1",
        content: "PLK preserves the user's exact language.",
        source_file: "PLK/Guide.md",
        similarity: 0.95,
        chunk_index: 0,
        document_type: "methods",
        tags: ["methods", "package:methods"],
      },
    ]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { message: "What is PLK really?", userTier: "core" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(routeLlmMock).toHaveBeenCalledTimes(1);

    const [promptInput, llmContext] = routeLlmMock.mock.calls[0] as [
      string,
      { systemPrompt?: string; mode?: string; tier?: string }
    ];

    expect(promptInput).toContain("=== CONTEXT FROM MANIFEST INDEX");
    expect(llmContext.systemPrompt).toContain(module.BILLY_SYSTEM_PROMPT.slice(0, 40));
    expect(llmContext.tier).toBe("core");
    expect(captureBillyMemoriesMock).toHaveBeenCalledWith({
      userId: "guest-user",
      userMessage: "What is PLK really?",
      assistantResponse: expect.any(String),
      section: "general",
      conversationMode: "synthesis",
    });
    expect(res.body).toMatchObject({
      provider: "test-provider",
      free: true,
      tokensUsed: 77,
      processingTime: 456,
      metadata: {
        mode: "billy",
        packageFilter: "methods",
      },
    });
    expect((res.body as { metadata?: { gravity?: { protocolVersion?: string; query?: unknown; context?: unknown; response?: unknown } } }).metadata?.gravity).toMatchObject({
      protocolVersion: "two-pass-gravity-v1",
    });
  });

  it("uses the Ollama embedding path when Billy is aligned to EmbeddingGemma", async () => {
    process.env.BILLY_EMBED_BACKEND = "ollama";
    process.env.BILLY_EMBED_MODEL = "embeddinggemma";
    process.env.BILLY_EMBED_DIMENSIONS = "768";
    process.env.BILLY_OLLAMA_URL = "http://127.0.0.1:11434";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [Array.from({ length: 768 }, (_, index) => index / 1000)] }),
    });
    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    matchKnowledgeFragmentsMock.mockResolvedValueOnce([
      {
        id: "frag-embeddinggemma",
        content: "Billy can retrieve from the EmbeddingGemma-aligned Supabase corpus.",
        source_file: "Billy/Corpus.md",
        similarity: 0.91,
        chunk_index: 1,
        document_type: "billy-engine",
        tags: ["billy-engine", "package:billy-engine"],
      },
    ]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { query: "who are you", topK: 4 },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/embed",
      expect.objectContaining({ method: "POST" })
    );
    expect(matchKnowledgeFragmentsMock).toHaveBeenCalledTimes(1);
    expect(res.body).toMatchObject({
      metadata: {
        retrievalMode: "semantic",
        embedBackend: "ollama",
        embedModel: "embeddinggemma",
      },
    });
    expect((res.body as { metadata?: { gravity?: { context?: { rankedChunks?: Array<{ documentId?: string }> } } } }).metadata?.gravity?.context?.rankedChunks?.[0]).toMatchObject({
      documentId: expect.any(String),
    });
  });

  it("uses the HuggingFace embedding path for free-tier EmbeddingGemma retrieval", async () => {
    process.env.BILLY_EMBED_BACKEND = "hf";
    process.env.BILLY_EMBED_DIMENSIONS = "768";
    process.env.HF_API_TOKEN = "hf-token";
    process.env.HF_MODEL = "google/embeddinggemma-300m";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [Array.from({ length: 768 }, (_, index) => index / 1000)],
    });
    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    matchKnowledgeFragmentsMock.mockResolvedValueOnce([
      {
        id: "frag-hf",
        content: "Billy can query the 768-dim corpus with HuggingFace-hosted EmbeddingGemma.",
        source_file: "Billy/HF.md",
        similarity: 0.89,
        chunk_index: 0,
        document_type: "billy-engine",
        tags: ["billy-engine", "package:billy-engine"],
      },
    ]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: {},
      body: { query: "who are you", topK: 4 },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/google/embeddinggemma-300m",
      expect.objectContaining({ method: "POST" })
    );
    expect(matchKnowledgeFragmentsMock).toHaveBeenCalledTimes(1);
    expect(res.body).toMatchObject({
      metadata: {
        retrievalMode: "semantic",
        embedBackend: "huggingface",
        embedModel: "google/embeddinggemma-300m",
      },
    });
  });

  it("uses text-only retrieval as context and still routes through the LLM", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "embed-down" });
    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    searchKnowledgeFragmentsMock.mockResolvedValueOnce([
      {
        id: "doc-a",
        source_file: "Billy/Identity.md",
        content: "Billy is the GestaltView companion.",
        rank: 0.99,
        chunk_index: 2,
        document_type: "billy-engine",
        tags: ["billy-engine"],
      },
    ]);

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: { "x-user-id": "alpha" },
      body: { query: "who are you", topK: 3 },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(searchKnowledgeFragmentsMock).toHaveBeenCalledWith({
      query: "who are you",
      topK: 3,
      packageFilter: "billy-engine",
    });
    expect(routeLlmMock).toHaveBeenCalledTimes(1);
    expect(res.body).toMatchObject({
      provider: "test-provider",
      free: true,
      metadata: {
        retrievalMode: "text-only",
      },
      chunks: [
        {
          document_id: "doc-a",
          chunk_index: 2,
          score: expect.any(Number),
        },
      ],
    });
  });

  it("reports auto-captured memories in response metadata", async () => {
    captureBillyMemoriesMock.mockResolvedValueOnce({
      candidates: 2,
      stored: 1,
    });

    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: { authorization: "Bearer test-token" },
      body: { message: "I get overwhelmed when Slack piles up.", userTier: "core" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      metadata: {
        memoryCaptureCandidates: 2,
        memoryCaptured: 1,
      },
    });
  });

  it("requires the Billy API secret for diagnose mode", async () => {
    const module = await loadBillyModule();
    const req = { method: "POST", query: {}, headers: {}, body: { mode: "diagnose" } };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(401);
    expect(diagnoseBillyMock).not.toHaveBeenCalled();
  });

  it("returns diagnostics when the Billy API secret is valid", async () => {
    const module = await loadBillyModule();
    const req = {
      method: "POST",
      query: {},
      headers: { "x-billy-api-secret": "secret-key" },
      body: { mode: "diagnose" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(diagnoseBillyMock).toHaveBeenCalledTimes(1);
    expect(res.body).toMatchObject({
      response: "Billy diagnostics completed.",
      provider: "gestaltview-actions",
      metadata: {
        diagnosis: {
          groq: true,
          gemini: true,
        },
      },
    });
  });
});
