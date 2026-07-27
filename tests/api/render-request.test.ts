import type { VercelRequest } from "@vercel/node";
import { describe, expect, it } from "vitest";
import { parseRequestBody } from "../../api/render/request.js";

describe("render request parsing", () => {
  it("translates the observed legacy Creation Corner graph body", () => {
    const graph = {
      schema: "nextgen.scene-graph.v1",
      graphId: "legacy-graph",
      nodes: [],
      edges: [],
    };
    const parsed = parseRequestBody({
      body: { jobId: "legacy-job", graph, metadata: { room: "creation-corner" } },
    } as VercelRequest);
    expect(parsed).toMatchObject({
      contractVersion: "gestaltview.render-request.v2",
      sourceFamily: "scene_graph",
      sceneGraph: graph,
      idempotencyKey: "legacy:legacy-job",
    });
  });

  it("normalizes canonical target defaults", () => {
    const parsed = parseRequestBody({
      body: {
        contractVersion: "gestaltview.render-request.v2",
        sourceFamily: "scene_graph",
        content: "# Hello",
        targets: [{ format: "HTML", mimeType: "text/html" }],
      },
    } as VercelRequest);
    expect(parsed.targets?.[0]).toMatchObject({
      format: "html",
      destinationIntent: "preview",
      required: true,
    });
  });

  it("rejects arbitrary extra fields on the canonical envelope", () => {
    expect(() =>
      parseRequestBody({
        body: {
          contractVersion: "gestaltview.render-request.v2",
          sourceFamily: "scene_graph",
          content: "# Hello",
          unexpected: true,
        },
      } as VercelRequest),
    ).toThrow("The render request is invalid.");
  });

  it("rejects an unversioned canonical envelope", () => {
    expect(() =>
      parseRequestBody({
        body: {
          sourceFamily: "scene_graph",
          content: "# Hello",
        },
      } as VercelRequest),
    ).toThrow("The render request is invalid.");
  });
});
