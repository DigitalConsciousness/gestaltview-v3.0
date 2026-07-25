import { describe, expect, it } from "vitest";

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

const validArtifact = {
  id: "33333333-3333-4333-8333-333333333333",
  contractVersion: "codex.v1",
  kind: "blueprint",
  title: "Codex Blueprint",
  slug: "codex-blueprint",
  userId: "44444444-4444-4444-8444-444444444444",
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
    summary: "A blueprint body.",
    principles: ["Validate before rendering."],
    sections: [{ type: "markdown", id: "section-1", markdown: "## Blueprint" }],
    risks: [],
  },
};

describe("Codex forge API", () => {
  it("accepts a validated artifact draft and queues allowed exports", async () => {
    const module = await import("../codex/forge");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          artifact: validArtifact,
          exportFormats: ["html", "json", "png"],
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(202);
    expect(res.body).toMatchObject({
      status: "accepted",
      artifact: {
        id: validArtifact.id,
        kind: "blueprint",
        exports: [
          { format: "html", status: "pending" },
          { format: "json", status: "pending" },
        ],
      },
    });
    expect((res.body as { jobs: unknown[] }).jobs).toHaveLength(2);
  }, 20_000);

  it("returns artifact_contract_invalid before persistence for invalid drafts", async () => {
    const module = await import("../codex/forge");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          artifact: {
            ...validArtifact,
            userId: "not-a-uuid",
          },
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({ error: "artifact_contract_invalid" });
  }, 20_000);

  it("keeps anonymous Creation Corner artifacts in the local fallback while still accepting the forge", async () => {
    const module = await import("../codex/forge");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          artifact: {
            ...validArtifact,
            id: "77777777-7777-4777-8777-777777777777",
            userId: "00000000-0000-4000-8000-000000000000",
          },
          exportFormats: ["html", "json"],
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(202);
    expect(res.body).toMatchObject({
      artifact: {
        userId: "00000000-0000-4000-8000-000000000000",
        exports: [
          { format: "html", status: "pending" },
          { format: "json", status: "pending" },
        ],
      },
    });
  }, 20_000);
});
