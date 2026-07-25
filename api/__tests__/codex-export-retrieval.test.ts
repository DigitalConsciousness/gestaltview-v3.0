import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCodexArtifactMock: vi.fn(),
  listCodexJobsForArtifactMock: vi.fn(),
  createCodexSignedUrlMock: vi.fn(),
  requireAuthMock: vi.fn(),
}));

vi.mock("../codex/_persistence.js", () => ({
  getCodexArtifact: mocks.getCodexArtifactMock,
  listCodexJobsForArtifact: mocks.listCodexJobsForArtifactMock,
}));

vi.mock("../../shared/codex/storage.js", () => ({
  createCodexSignedUrl: mocks.createCodexSignedUrlMock,
}));

vi.mock("../_lib/auth.js", () => ({
  requireAuth: mocks.requireAuthMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string | Buffer) => void;
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
    end(value?: string | Buffer) {
      this.body = typeof value === "string" ? value : value?.toString("utf8") ?? null;
    },
  };
}

function readJsonBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "string") {
    return body as Record<string, unknown>;
  }

  return JSON.parse(body) as Record<string, unknown>;
}

const baseArtifact = {
  id: "11111111-1111-4111-8111-111111111111",
  contractVersion: "codex.v1",
  kind: "blueprint" as const,
  title: "Runner Blueprint",
  slug: "runner-blueprint",
  userId: "22222222-2222-4222-8222-222222222222",
  securityClass: "private" as const,
  templateKey: "blueprint-v1",
  templateVersion: "v1",
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z",
  sourceIds: ["capture-1"],
  provenance: [
    {
      sourceType: "capture" as const,
      sourceId: "capture-1",
      hash: "0123456789abcdef",
      transform: "synthesize" as const,
    },
  ],
  meta: {},
};

describe("Codex export retrieval", () => {
  const originalCodezBucket = process.env.CODEX_EXPORT_BUCKET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CODEX_EXPORT_BUCKET = "codex-exports";
  });

  afterEach(() => {
    process.env.CODEX_EXPORT_BUCKET = originalCodezBucket;
    vi.unstubAllGlobals();
  });

  it("returns a signed URL in preview mode for a ready export", async () => {
    mocks.getCodexArtifactMock.mockResolvedValue({
      artifact: {
        ...baseArtifact,
        securityClass: "public",
        exports: [
          { format: "html", status: "ready", storagePath: "codex/artifact/job.html", mimeType: "text/html;charset=utf-8" },
        ],
      },
      status: "ready",
    });
    mocks.listCodexJobsForArtifactMock.mockResolvedValue([]);
    mocks.createCodexSignedUrlMock.mockResolvedValue("https://signed.example/export.html");

    const route = await import("../codex/artifacts/[artifactId]/exports/[format]");
    const res = createRes();

    await route.default(
      {
        method: "GET",
        headers: {},
        query: { artifactId: baseArtifact.id, format: "html" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(readJsonBody(res.body)).toMatchObject({
      status: "ready",
      mode: "preview",
      signedUrl: "https://signed.example/export.html",
      artifactId: baseArtifact.id,
      format: "html",
      kind: "blueprint",
      expiresAt: expect.any(String),
    });
  }, 20_000);

  it("streams persistent html content for owned artifacts", async () => {
    mocks.getCodexArtifactMock.mockResolvedValue({
      artifact: {
        ...baseArtifact,
        exports: [
          { format: "html", status: "ready", storagePath: "codex/artifact/job.html", mimeType: "text/html;charset=utf-8" },
        ],
      },
      status: "ready",
    });
    mocks.listCodexJobsForArtifactMock.mockResolvedValue([]);
    mocks.requireAuthMock.mockReturnValue({
      id: baseArtifact.userId,
      email: "user@example.com",
      tier: "free",
      isAdmin: false,
    });
    mocks.createCodexSignedUrlMock.mockResolvedValue("https://signed.example/export.html");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "<html><body>Persistent export</body></html>",
      }),
    );

    const route = await import("../codex/artifacts/[artifactId]/exports/[format]");
    const res = createRes();

    await route.default(
      {
        method: "GET",
        headers: { authorization: "Bearer token" },
        query: { artifactId: baseArtifact.id, format: "html", mode: "persistent" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/html;charset=utf-8");
    expect(String(res.body)).toContain("Persistent export");
  }, 20_000);

  it("reports pending exports with a job id", async () => {
    mocks.getCodexArtifactMock.mockResolvedValue({
      artifact: {
        ...baseArtifact,
        exports: [
          { format: "html", status: "pending" },
        ],
      },
      status: "draft",
    });
    mocks.listCodexJobsForArtifactMock.mockResolvedValue([
      { id: "job-1", artifactId: baseArtifact.id, format: "html", status: "running", retryCount: 0, createdAt: "2026-06-02T00:00:00.000Z", updatedAt: "2026-06-02T00:00:00.000Z" },
    ]);

    const route = await import("../codex/artifacts/[artifactId]/exports/[format]");
    const res = createRes();

    await route.default(
      {
        method: "GET",
        headers: {},
        query: { artifactId: baseArtifact.id, format: "html" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(202);
    expect(readJsonBody(res.body)).toMatchObject({
      status: "running",
      jobId: "job-1",
      artifactId: baseArtifact.id,
      format: "html",
    });
  }, 20_000);
});
