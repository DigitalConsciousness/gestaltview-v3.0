import { describe, expect, it } from "vitest";

import { getCodexArtifact } from "../codex/_persistence.js";

process.env.CODEX_DISABLE_SUPABASE = "true";

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

const artifact = {
  id: "88888888-8888-4888-8888-888888888888",
  contractVersion: "codex.v1",
  kind: "blueprint",
  title: "Runner Blueprint",
  slug: "runner-blueprint",
  userId: "00000000-0000-4000-8000-000000000000",
  securityClass: "private",
  templateKey: "blueprint-v1",
  templateVersion: "v1",
  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z",
  sourceIds: ["capture-1"],
  provenance: [
    {
      sourceType: "capture",
      sourceId: "capture-1",
      hash: "0123456789abcdef",
      transform: "synthesize",
    },
  ],
  exports: [],
  meta: {},
  body: {
    summary: "A blueprint body for export.",
    principles: ["Render deterministically."],
    sections: [{ type: "markdown", id: "section-1", markdown: "## Runner Blueprint" }],
    risks: [],
  },
};

describe("Codex export runner", () => {
  it("renders a queued HTML job and updates the artifact manifest", async () => {
    const forgeModule = await import("../codex/forge");
    const runModule = await import("../codex/jobs/[jobId]/run");
    const forgeRes = createRes();

    await forgeModule.default(
      {
        method: "POST",
        headers: {},
        body: {
          artifact,
          exportFormats: ["html", "json"],
        },
      } as never,
      forgeRes as never,
    );

    expect(forgeRes.statusCode).toBe(202);
    const htmlJob = (forgeRes.body as { jobs: Array<{ id: string; format: string }> }).jobs.find(
      (job) => job.format === "html",
    );
    expect(htmlJob?.id).toBeTruthy();

    const runRes = createRes();
    await runModule.default(
      {
        method: "POST",
        headers: {},
        query: { jobId: htmlJob?.id },
      } as never,
      runRes as never,
    );

    expect(runRes.statusCode).toBe(200);
    expect(runRes.body).toMatchObject({
      status: "ready",
      manifestItem: {
        format: "html",
        status: "ready",
        mimeType: "text/html;charset=utf-8",
      },
    });
    expect((runRes.body as { manifestItem: { storagePath: string; bytes: number; sha256: string } }).manifestItem.storagePath).toMatch(/^memory:\/\/codex\//);
    expect((runRes.body as { manifestItem: { bytes: number; sha256: string } }).manifestItem.bytes).toBeGreaterThan(0);
    expect((runRes.body as { manifestItem: { sha256: string } }).manifestItem.sha256).toMatch(/^[a-f0-9]{64}$/);

    const record = await getCodexArtifact(artifact.id);
    expect(record?.artifact.exports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          format: "html",
          status: "ready",
          mimeType: "text/html;charset=utf-8",
        }),
        expect.objectContaining({
          format: "json",
          status: "pending",
        }),
      ]),
    );
  }, 20_000);

  it("drains all pending HTML and JSON jobs for an artifact", async () => {
    const forgeModule = await import("../codex/forge");
    const drainModule = await import("../codex/artifacts/[artifactId]/drain-exports");
    const forgeRes = createRes();
    const artifactId = "99999999-9999-4999-8999-999999999999";

    await forgeModule.default(
      {
        method: "POST",
        headers: {},
        body: {
          artifact: {
            ...artifact,
            id: artifactId,
            slug: "runner-blueprint-drain",
          },
          exportFormats: ["html", "json"],
        },
      } as never,
      forgeRes as never,
    );

    expect(forgeRes.statusCode).toBe(202);

    const drainRes = createRes();
    await drainModule.default(
      {
        method: "POST",
        headers: {},
        query: { artifactId },
      } as never,
      drainRes as never,
    );

    expect(drainRes.statusCode).toBe(200);
    expect(drainRes.body).toMatchObject({
      status: "drained",
      manifest: [
        { format: "html", status: "ready" },
        { format: "json", status: "ready" },
      ],
    });
    expect((drainRes.body as { jobs: Array<{ status: string }> }).jobs.every((job) => job.status === "ready")).toBe(true);
  }, 20_000);
});
