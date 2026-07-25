import { describe, expect, it } from "vitest";

import {
  CodexArtifactJsonSchema,
  CodexArtifactSchema,
  getAllowedExportFormats,
  renderArtifactHtml,
} from "../../shared/gen-engine/index.js";

const baseArtifact = {
  id: "11111111-1111-4111-8111-111111111111",
  contractVersion: "codex.v1",
  kind: "session_recap",
  title: "Session Recap",
  slug: "session-recap",
  userId: "22222222-2222-4222-8222-222222222222",
  securityClass: "private",
  templateKey: "session-recap-v1",
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
      confidence: 0.9,
    },
  ],
  exports: [],
  meta: {},
  body: {
    summary: "A validated recap.",
    decisions: ["Keep rendering deterministic."],
    nextActions: [{ id: "next-1", text: "Wire the renderer." }],
    openLoops: [],
    sections: [{ type: "markdown", id: "section-1", markdown: "## Notes\n\nNo raw HTML." }],
  },
};

describe("Codex artifact contract", () => {
  it("validates the canonical session recap body and exports JSON Schema", () => {
    const artifact = CodexArtifactSchema.parse(baseArtifact);

    expect(artifact.kind).toBe("session_recap");
    expect(artifact.securityClass).toBe("private");
    expect(CodexArtifactJsonSchema).toMatchObject({ $schema: expect.any(String) });
  });

  it("rejects unknown model-authored fields", () => {
    expect(() => CodexArtifactSchema.parse({
      ...baseArtifact,
      body: {
        ...baseArtifact.body,
        unsafeHtml: "<script>alert('no')</script>",
      },
    })).toThrow();
  });

  it("routes allowed exports by artifact kind", () => {
    expect(getAllowedExportFormats("session_recap")).toEqual(["html", "pdf", "mp3", "json"]);
    expect(getAllowedExportFormats("spatial_scene")).toEqual(["html", "png", "gltf"]);
  });

  it("renders deterministic escaped HTML from a validated artifact", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      title: "Session <Recap>",
    });
    const html = renderArtifactHtml(artifact);

    expect(html).toContain("Session &lt;Recap&gt;");
    expect(html).not.toContain("<script>");
  });
});
