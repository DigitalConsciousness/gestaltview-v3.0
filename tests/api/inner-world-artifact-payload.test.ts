import { describe, expect, it } from "vitest";

import { buildInnerWorldArtifactPayload } from "../../api/_lib/inner-world.js";

describe("Inner World artifact projection payload", () => {
  it("preserves render source and content references for the client view model", () => {
    const payload = buildInnerWorldArtifactPayload({
      id: "55555555-5555-4555-8555-555555555555",
      source_ref: "render-artifact:44444444-4444-4444-8444-444444444444",
      content_ref: {
        renderJobId: "33333333-3333-4333-8333-333333333333",
        renderArtifactId: "44444444-4444-4444-8444-444444444444",
      },
      user_id: "11111111-1111-4111-8111-111111111111",
      title: "Verified projection",
      summary: "Projection proof",
      source_file_id: null,
      source_file_ref: null,
      html: "<!doctype html><html></html>",
      thumbnail_url: null,
      origin_room: "dynamic_inner_world",
      origin_di_id: null,
      evidence_node_ids: [],
      tags: ["render-fold-in"],
      status: "ready",
      created_at: "2026-07-27T00:00:00.000Z",
      updated_at: "2026-07-27T00:00:00.000Z",
    });

    expect(payload).toMatchObject({
      id: "render-artifact:44444444-4444-4444-8444-444444444444",
      sourceRef: "render-artifact:44444444-4444-4444-8444-444444444444",
      contentRef: {
        renderJobId: "33333333-3333-4333-8333-333333333333",
        renderArtifactId: "44444444-4444-4444-8444-444444444444",
      },
    });
  });
});
