import { describe, expect, it } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function makeReq(body: unknown, method = "POST"): VercelRequest {
  return { method, body, headers: {} } as VercelRequest;
}

function makeRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: "",
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    json(payload: unknown) {
      this.body = JSON.stringify(payload);
      return this;
    },
    send(payload: string | Buffer) {
      this.body = Buffer.isBuffer(payload) ? payload.toString("utf8") : payload;
      return this;
    },
  };

  return res as unknown as VercelResponse & typeof res;
}

describe("/api/render/decide", () => {
  it("renders codex artifacts as html", async () => {
    const { default: handler } = await import("../render/decide.js");
    const res = makeRes();

    await handler(
      makeReq({
        artifactKind: "report_document",
        format: "html",
        content: {
          id: "11111111-1111-4111-8111-111111111111",
          contractVersion: "codex.v1",
          kind: "report_document",
          title: "Rendered Report",
          slug: "rendered-report",
          userId: "22222222-2222-4222-8222-222222222222",
          securityClass: "private",
          templateKey: "report-document-v1",
          templateVersion: "v1",
          createdAt: "2026-06-24T00:00:00.000Z",
          updatedAt: "2026-06-24T00:00:00.000Z",
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
            summary: "A preview-ready report.",
            sections: [
              {
                type: "markdown",
                id: "section-1",
                markdown: "# Preview\n\nRendered through the new route.",
              },
            ],
            appendix: [],
          },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/html");
    expect(String(res.body)).toContain("Rendered Report");
    expect(String(res.body)).toContain("Preview");
  });

  it("returns 422 for unsupported renderer formats", async () => {
    const { default: handler } = await import("../render/decide.js");
    const res = makeRes();

    await handler(
      makeReq({
        artifactKind: "markdown",
        format: "pdf",
        content: "# nope",
      }),
      res,
    );

    expect(res.statusCode).toBe(422);
    expect(String(res.body)).toContain("supportedFormats");
  });

  it("fails closed when the durable render ledger is unavailable", async () => {
    const { default: handler } = await import("../render/engine.js");
    const res = makeRes();

    await handler(
      makeReq({
        graphId: "graph-1",
        nodes: [{ id: "n1", name: "Node One", props: { source: "Hello world" } }],
      }),
      res,
    );

    expect(res.statusCode).toBe(503);
    expect(JSON.parse(String(res.body))).toMatchObject({
      ok: false,
      error: {
        code: "RENDER_PERSISTENCE_UNAVAILABLE",
      },
    });
  });

  it("renders mind-map previews with a valid Mermaid root and safe labels", async () => {
    const { default: handler } = await import("../render/decide.js");
    const res = makeRes();

    await handler(
      makeReq({
        artifactKind: "mind_map",
        format: "html",
        content: {
          body: {
            summary: "A mind map preview.",
            nodes: [{ id: "node-1", label: "Roadmap [draft] <team> & edge" }],
            edges: [],
          },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(String(res.body)).toContain("mindmap");
    expect(String(res.body)).toContain("root((Roadmap draft team and edge))");
    expect(String(res.body)).not.toContain("(()) Roadmap [draft]");
  });
});
