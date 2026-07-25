import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const routeLlmMock = vi.fn();
  const embedTextForRetrievalMock = vi.fn();
  const retrieveMemoryEntriesMock = vi.fn();
  const matchKnowledgeFragmentsMock = vi.fn();
  const searchKnowledgeFragmentsMock = vi.fn();
  const matchSkillFragmentsMock = vi.fn();
  const searchSkillFragmentsMock = vi.fn();
  const getFounderContextMock = vi.fn();
  const supabaseAuthGetUserMock = vi.fn();
  const sessionMaybeSingleMock = vi.fn();
  const supabaseUpsertMock = vi.fn();
  const supabaseInsertMock = vi.fn();
  const createClientMock = vi.fn(() => ({
    auth: { getUser: supabaseAuthGetUserMock },
    from: (table: string) => {
      if (table === "di_sessions") {
        const selectChain: Record<string, unknown> = {
          eq: vi.fn(() => selectChain),
          maybeSingle: sessionMaybeSingleMock,
        };

        return {
          select: () => selectChain,
          upsert: supabaseUpsertMock,
        };
      }

      if (table === "di_memory_events") {
        return {
          insert: supabaseInsertMock,
        };
      }

      return {
        select: () => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: sessionMaybeSingleMock,
            })),
          })),
        }),
        upsert: supabaseUpsertMock,
        insert: supabaseInsertMock,
      };
    },
  }));

  return {
    routeLlmMock,
    embedTextForRetrievalMock,
    retrieveMemoryEntriesMock,
    matchKnowledgeFragmentsMock,
    searchKnowledgeFragmentsMock,
    matchSkillFragmentsMock,
    searchSkillFragmentsMock,
    getFounderContextMock,
    supabaseAuthGetUserMock,
    sessionMaybeSingleMock,
    supabaseUpsertMock,
    supabaseInsertMock,
    createClientMock,
  };
});

const {
  routeLlmMock,
  embedTextForRetrievalMock,
  retrieveMemoryEntriesMock,
  matchKnowledgeFragmentsMock,
  searchKnowledgeFragmentsMock,
  matchSkillFragmentsMock,
  searchSkillFragmentsMock,
  getFounderContextMock,
  supabaseAuthGetUserMock,
  sessionMaybeSingleMock,
  supabaseUpsertMock,
  supabaseInsertMock,
  createClientMock,
} = mocks;

import diHandler from "../di";

vi.mock("../_lib/llmRouter", () => ({ routeLlm: mocks.routeLlmMock }));
vi.mock("../_lib/embeddings", () => ({ embedTextForRetrieval: mocks.embedTextForRetrievalMock }));
vi.mock("../_lib/memory", () => ({ retrieveMemoryEntries: mocks.retrieveMemoryEntriesMock }));
vi.mock("../_lib/supabase", () => ({
  matchKnowledgeFragments: mocks.matchKnowledgeFragmentsMock,
  searchKnowledgeFragments: mocks.searchKnowledgeFragmentsMock,
  matchSkillFragments: mocks.matchSkillFragmentsMock,
  searchSkillFragments: mocks.searchSkillFragmentsMock,
  getFounderContext: mocks.getFounderContextMock,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClientMock,
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

describe("DI route", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.SUPABASE_SERVICE_KEY = "service-key";

    vi.clearAllMocks();

    embedTextForRetrievalMock.mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
      backend: "gemini",
      model: "test-model",
    });
    retrieveMemoryEntriesMock.mockResolvedValue({
      memories: [{ title: "Memory fragment", summary: "memory fragment", content: "memory fragment", kind: "relational", scope: "shared", importance: 1, pinned: false }],
      retrievalMode: "semantic",
      embedBackend: "gemini",
      embedModel: "test-model",
    });
    matchKnowledgeFragmentsMock.mockResolvedValue([
      { content: "knowledge fragment", source_file: "k.md", document_type: "guide", chunk_index: 0, tags: [], similarity: 0.9 },
    ]);
    searchKnowledgeFragmentsMock.mockResolvedValue([]);
    matchSkillFragmentsMock.mockResolvedValue([]);
    searchSkillFragmentsMock.mockResolvedValue([]);
    getFounderContextMock.mockResolvedValue(null);
    supabaseAuthGetUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    sessionMaybeSingleMock.mockResolvedValue({
      data: {
        id: "session-1",
        user_id: "user-1",
        di_slug: "billy",
        relational_depth: 0.1,
        quirk_activations: {},
        session_thread: "Previous thread line.",
        mode_preference: "chat",
        last_session_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
    supabaseUpsertMock.mockResolvedValue({ data: null, error: null });
    supabaseInsertMock.mockResolvedValue({ data: null, error: null });
    routeLlmMock.mockResolvedValue({
      response: "We will stay steady.",
      provider: "test-provider",
      timestamp: "2026-01-01T00:00:00.000Z",
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {},
    });
  });

  it("rejects missing body fields", async () => {
    const res = createRes();
    await diHandler({ method: "POST", headers: {}, body: {} } as never, res as never);

    expect(res.statusCode).toBe(400);
  });

  it("routes a bootstrap turn without writing a memory event", async () => {
    const res = createRes();
    await diHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: { diSlug: "billy", message: "__bootstrap__", mode: "synthesis" },
      } as never,
      res as never
    );

    expect(routeLlmMock).toHaveBeenCalledWith(
      expect.stringContaining("User message: __bootstrap__"),
      expect.objectContaining({
        systemPrompt: expect.stringContaining("FOUNDATIONAL TRUTH"),
        mode: "synthesis",
        exhibit: "billy",
      })
    );
    expect(res.body).toMatchObject({
      diSlug: "billy",
      conversationMode: "synthesis",
      memoryEventWritten: false,
    });
  });

  it("writes session continuity and a memory event when the turn is significant", async () => {
    const res = createRes();
    await diHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer token" },
        body: { diSlug: "billy", message: "Hold the boundary.", mode: "chat", userTier: "core" },
      } as never,
      res as never
    );

    expect(supabaseUpsertMock).toHaveBeenCalled();
    expect(supabaseInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        di_slug: "billy",
        user_id: "user-1",
      })
    );
    expect(res.body).toMatchObject({
      diSlug: "billy",
      conversationMode: "chat",
      memoryEventWritten: true,
    });
  });
});
