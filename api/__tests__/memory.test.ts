import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const listMemoryEntriesMock = vi.fn();
const upsertMemoryEntryMock = vi.fn();
const updateMemoryEntryMock = vi.fn();
const deleteMemoryEntryMock = vi.fn();
const retrieveMemoryEntriesMock = vi.fn();
const embedTextForRetrievalMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  getBearerToken: vi.fn(() => "session-token"),
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/supabase", () => ({
  listMemoryEntries: listMemoryEntriesMock,
  upsertMemoryEntry: upsertMemoryEntryMock,
  updateMemoryEntry: updateMemoryEntryMock,
  deleteMemoryEntry: deleteMemoryEntryMock,
}));

vi.mock("../_lib/embeddings", () => ({
  embedTextForRetrieval: embedTextForRetrievalMock,
}));

vi.mock("../_lib/memory", async () => {
  const actual = await vi.importActual<typeof import("../_lib/memory")>("../_lib/memory");
  return {
    ...actual,
    retrieveMemoryEntries: retrieveMemoryEntriesMock,
  };
});

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

async function loadMemoryModule() {
  vi.resetModules();
  return import("../session/memory");
}

describe("session memory API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requireAuthMock.mockReset();
    listMemoryEntriesMock.mockReset();
    upsertMemoryEntryMock.mockReset();
    updateMemoryEntryMock.mockReset();
    deleteMemoryEntryMock.mockReset();
    retrieveMemoryEntriesMock.mockReset();
    embedTextForRetrievalMock.mockReset();
  });

  it("requires authentication", async () => {
    const module = await loadMemoryModule();
    requireAuthMock.mockResolvedValue({ status: 401, body: { error: "Authentication required" } });

    const req = { method: "GET", headers: {}, query: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
  });

  it("extracts durable Billy memory candidates from first-person statements", async () => {
    const { extractBillyMemoryCandidates } = await import("../_lib/memory");
    const candidates = extractBillyMemoryCandidates({
      userMessage:
        "I get overwhelmed when Slack notifications stack up. I'm working on GestaltView's trainer this week.",
      assistantResponse: "We can reduce the noise and tighten the trainer loop.",
      section: "hero",
      conversationMode: "chat",
    });

    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      kind: "constraint",
      scope: "personal",
      tags: expect.arrayContaining(["billy-auto", "constraint", "section-hero", "mode-chat"]),
    });
    expect(candidates[1]).toMatchObject({
      kind: "project",
      scope: "personal",
      tags: expect.arrayContaining(["billy-auto", "project"]),
    });
  });

  it("ignores question-only or volatile support-request turns for auto-capture", async () => {
    const { extractBillyMemoryCandidates } = await import("../_lib/memory");
    const candidates = extractBillyMemoryCandidates({
      userMessage: "Can you help me debug this? What should we do next?",
      assistantResponse: "Let's inspect the failing path first.",
      section: "hero",
      conversationMode: "synthesis",
    });

    expect(candidates).toEqual([]);
  });

  it("returns retrieval results for memory search", async () => {
    const module = await loadMemoryModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    retrieveMemoryEntriesMock.mockResolvedValue({
      memories: [
        {
          id: "mem-1",
          title: "Morning rhythm",
          summary: "The user does best before noon.",
          content: "The user does best before noon.",
          kind: "preference",
          scope: "personal",
          importance: 4,
          pinned: true,
          tags: ["workflow"],
          score: 0.88,
        },
      ],
      retrievalMode: "semantic",
      embedBackend: "gemini",
      embedModel: "text-embedding-004",
    });

    const req = { method: "GET", headers: {}, query: { q: "when do I write best?" }, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(retrieveMemoryEntriesMock).toHaveBeenCalledWith({
      userId: "user-1",
      query: "when do I write best?",
      topK: 12,
    });
    expect(res.body).toMatchObject({
      retrievalMode: "semantic",
      embedBackend: "gemini",
      memories: [{ id: "mem-1" }],
    });
  });

  it("stores a curated memory entry", async () => {
    const module = await loadMemoryModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    embedTextForRetrievalMock.mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
      backend: "gemini",
      model: "text-embedding-004",
    });
    upsertMemoryEntryMock.mockResolvedValue({
      id: "mem-1",
      user_id: "user-1",
      scope: "personal",
      kind: "project",
      title: "Build the memory bank carefully.",
      summary: "No generic sludge.",
      content: "Build the memory bank carefully.\n\nNo generic sludge.",
      content_hash: "hash-1",
      source: "manual",
      source_ref: null,
      tags: ["memory", "quality"],
      metadata: {},
      importance: 5,
      pinned: true,
      archived_at: null,
      created_at: "2026-03-30T00:00:00.000Z",
      updated_at: "2026-03-30T00:00:00.000Z",
    });

    const req = {
      method: "POST",
      headers: {},
      query: {},
      body: {
        kind: "project",
        title: "Build the memory bank carefully.",
        summary: "No generic sludge.",
        content: "Build the memory bank carefully.\n\nNo generic sludge.",
        tags: ["memory", "quality"],
        importance: 5,
        pinned: true,
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(upsertMemoryEntryMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        kind: "project",
        scope: "personal",
        title: "Build the memory bank carefully.",
        summary: "No generic sludge.",
        pinned: true,
        importance: 5,
        content_hash: expect.any(String),
        embedding: [0.1, 0.2, 0.3],
      }),
      "session-token"
    );
    expect(res.body).toMatchObject({
      memory: { id: "mem-1" },
      embedBackend: "gemini",
    });
  });

  it("updates an existing memory entry by id", async () => {
    const module = await loadMemoryModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    embedTextForRetrievalMock.mockResolvedValue({
      embedding: [0.3, 0.2, 0.1],
      backend: "gemini",
      model: "text-embedding-004",
    });
    updateMemoryEntryMock.mockResolvedValue({
      id: "mem-2",
      user_id: "user-1",
      scope: "personal",
      kind: "preference",
      title: "Quiet mornings",
      summary: "Best work happens before Slack noise.",
      content: "Best work happens before Slack noise.",
      content_hash: "hash-2",
      source: "manual",
      source_ref: null,
      tags: ["workflow"],
      metadata: {},
      importance: 4,
      pinned: true,
      archived_at: null,
      created_at: "2026-03-30T00:00:00.000Z",
      updated_at: "2026-03-30T00:10:00.000Z",
    });

    const req = {
      method: "POST",
      headers: {},
      query: {},
      body: {
        id: "mem-2",
        kind: "preference",
        title: "Quiet mornings",
        summary: "Best work happens before Slack noise.",
        content: "Best work happens before Slack noise.",
        importance: 4,
        pinned: true,
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(updateMemoryEntryMock).toHaveBeenCalledWith(
      "user-1",
      "mem-2",
      expect.objectContaining({
        title: "Quiet mornings",
        pinned: true,
        embedding: [0.3, 0.2, 0.1],
      }),
      "session-token"
    );
    expect(upsertMemoryEntryMock).not.toHaveBeenCalled();
  });
});
