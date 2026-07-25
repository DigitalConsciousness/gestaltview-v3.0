import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const listWorkspaceDocumentsMock = vi.fn();
const createWorkspaceDocumentMock = vi.fn();
const updateWorkspaceDocumentMock = vi.fn();
const deleteWorkspaceDocumentMock = vi.fn();
const syncWorkspaceDocumentToCorpusMock = vi.fn();
const deleteWorkspaceDocumentCorpusRowsMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/supabase", () => ({
  listWorkspaceDocuments: listWorkspaceDocumentsMock,
  createWorkspaceDocument: createWorkspaceDocumentMock,
  updateWorkspaceDocument: updateWorkspaceDocumentMock,
  deleteWorkspaceDocument: deleteWorkspaceDocumentMock,
  syncWorkspaceDocumentToCorpus: syncWorkspaceDocumentToCorpusMock,
  deleteWorkspaceDocumentCorpusRows: deleteWorkspaceDocumentCorpusRowsMock,
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

async function loadModule() {
  vi.resetModules();
  return import("../documents/index");
}

describe("documents API", () => {
  beforeEach(() => {
    requireAuthMock.mockReset();
    listWorkspaceDocumentsMock.mockReset();
    createWorkspaceDocumentMock.mockReset();
    updateWorkspaceDocumentMock.mockReset();
    deleteWorkspaceDocumentMock.mockReset();
    syncWorkspaceDocumentToCorpusMock.mockReset();
    deleteWorkspaceDocumentCorpusRowsMock.mockReset();
  });

  it("lists saved document analyses", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    listWorkspaceDocumentsMock.mockResolvedValue([
      {
        id: "doc-1",
        user_id: "user-1",
        workspace_id: null,
        filename: "brief.txt",
        file_size_bytes: 128,
        file_type: "text/plain",
        raw_text: "hello",
        analysis_status: "completed",
        analysis_summary: "Brief summary",
        key_points: ["hello"],
        topics: ["brief"],
        sentiment: "neutral",
        word_count: 1,
        reading_time_minutes: 1,
        analysis_payload: {},
        created_at: "2026-04-30T00:00:00.000Z",
        updated_at: "2026-04-30T00:00:00.000Z",
      },
    ]);

    const req = { method: "GET", headers: {}, query: {}, body: {} };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(listWorkspaceDocumentsMock).toHaveBeenCalledWith("user-1", undefined);
    expect(res.body).toMatchObject({
      documents: [{ id: "doc-1", filename: "brief.txt" }],
    });
  });

  it("creates a persisted document record", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    createWorkspaceDocumentMock.mockResolvedValue({
      id: "doc-2",
      user_id: "user-1",
      workspace_id: null,
      filename: "brief.txt",
      file_size_bytes: 128,
      file_type: "text/plain",
      raw_text: "hello",
      analysis_status: "completed",
      analysis_summary: "Brief summary",
      key_points: ["hello"],
      topics: ["brief"],
      sentiment: "neutral",
      word_count: 1,
      reading_time_minutes: 1,
      analysis_payload: {},
      created_at: "2026-04-30T00:00:00.000Z",
      updated_at: "2026-04-30T00:00:00.000Z",
    });

    const req = {
      method: "POST",
      headers: {},
      query: {},
      body: {
        filename: "brief.txt",
        fileSizeBytes: 128,
        fileType: "text/plain",
        rawText: "hello",
        analysisSummary: "Brief summary",
        keyPoints: ["hello"],
        topics: ["brief"],
        sentiment: "neutral",
        wordCount: 1,
        readingTimeMinutes: 1,
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(createWorkspaceDocumentMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        filename: "brief.txt",
        file_size_bytes: 128,
        file_type: "text/plain",
        analysis_summary: "Brief summary",
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      document: { filename: "brief.txt" },
    });
  });

  it("updates a saved document", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    updateWorkspaceDocumentMock.mockResolvedValue({
      id: "doc-3",
      user_id: "user-1",
      workspace_id: "ws-1",
      filename: "brief-updated.txt",
      file_size_bytes: 128,
      file_type: "text/plain",
      raw_text: "hello",
      analysis_status: "completed",
      analysis_summary: "Updated summary",
      key_points: ["hello"],
      topics: ["brief"],
      sentiment: "neutral",
      word_count: 1,
      reading_time_minutes: 1,
      analysis_payload: {},
      created_at: "2026-04-30T00:00:00.000Z",
      updated_at: "2026-04-30T00:00:00.000Z",
    });
    syncWorkspaceDocumentToCorpusMock.mockResolvedValue(true);

    const req = {
      method: "PATCH",
      headers: {},
      query: {},
      body: {
        id: "doc-3",
        filename: "brief-updated.txt",
        workspaceId: "ws-1",
        analysisSummary: "Updated summary",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(updateWorkspaceDocumentMock).toHaveBeenCalledWith(
      "user-1",
      "doc-3",
      expect.objectContaining({
        filename: "brief-updated.txt",
        workspace_id: "ws-1",
        analysis_summary: "Updated summary",
      })
    );
    expect(syncWorkspaceDocumentToCorpusMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it("deletes a saved document", async () => {
    const module = await loadModule();
    requireAuthMock.mockResolvedValue({
      id: "user-1",
      email: "keith@example.com",
      tier: "free",
      isAdmin: false,
    });
    listWorkspaceDocumentsMock.mockResolvedValue([
      {
        id: "doc-4",
        user_id: "user-1",
        workspace_id: "ws-1",
        filename: "brief.txt",
        file_size_bytes: 128,
        file_type: "text/plain",
        raw_text: "hello",
        analysis_status: "completed",
        analysis_summary: "Brief summary",
        key_points: ["hello"],
        topics: ["brief"],
        sentiment: "neutral",
        word_count: 1,
        reading_time_minutes: 1,
        analysis_payload: {},
        created_at: "2026-04-30T00:00:00.000Z",
        updated_at: "2026-04-30T00:00:00.000Z",
      },
    ]);
    deleteWorkspaceDocumentCorpusRowsMock.mockResolvedValue(true);
    deleteWorkspaceDocumentMock.mockResolvedValue(true);

    const req = {
      method: "DELETE",
      headers: {},
      query: {},
      body: { id: "doc-4" },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(deleteWorkspaceDocumentCorpusRowsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        workspaceDocumentId: "doc-4",
      })
    );
    expect(deleteWorkspaceDocumentMock).toHaveBeenCalledWith("user-1", "doc-4");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ deleted: true });
  });
});
