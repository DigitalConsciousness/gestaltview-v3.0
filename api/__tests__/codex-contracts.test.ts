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
    expect(getAllowedExportFormats("session_recap")).toEqual(["html", "pdf", "json"]);
    expect(getAllowedExportFormats("report_document")).toEqual(["html", "pdf"]);
    expect(getAllowedExportFormats("mind_map")).toEqual(["html", "png"]);
    expect(getAllowedExportFormats("spatial_scene")).toEqual(["html", "png"]);
    expect(getAllowedExportFormats("audio_narration")).toEqual(["html", "mp3", "wav", "json"]);
    expect(getAllowedExportFormats("profile_portrait")).toEqual(["html", "pdf", "json"]);
  });

  it("renders deterministic escaped HTML from a validated artifact", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      title: "Session <Recap>",
    });
    const html = renderArtifactHtml(artifact);

    expect(html).toContain("Session &lt;Recap&gt;");
    expect(html).toContain('class="gv-shell"');
    expect(html).toContain('data-kind="session_recap"');
    expect(html).not.toContain("Session <Recap>");
    expect(html).not.toContain("<Recap>");
  });

  it("renders session recap markdown sections as real HTML elements", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      body: {
        ...baseArtifact.body,
        sections: [
          {
            type: "markdown",
            id: "section-1",
            markdown: "# What emerged\n\n- First thread\n- Second thread\n\n> Worth holding",
          },
        ],
      },
    });

    const html = renderArtifactHtml(artifact);

    expect(html).toContain("<h1>What emerged</h1>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>First thread</li>");
    expect(html).toContain("<blockquote");
    expect(html).not.toContain("# What emerged");
    expect(html).not.toContain("- First thread");
  });

  it("sanitizes Mermaid structural characters in mind-map labels", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      kind: "mind_map",
      title: "Roadmap [draft] \"next\" <team> & edge",
      templateKey: "mind-map-v1",
      body: {
        summary: "A mind map with a user-authored title.",
        nodes: [{
          id: "node-1",
          label: "Roadmap [draft] \"next\" <team> & edge",
          sourceIds: ["capture-1"],
        }],
        edges: [],
      },
    });

    const html = renderArtifactHtml(artifact);

    expect(html).toContain("node1[&quot;Roadmap draft next team and edge&quot;]");
    expect(html).not.toContain('node1["Roadmap [draft]');
  });

  it("renders a kind-specific shell for share cards", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      kind: "share_card",
      title: "A Share Card",
      templateKey: "share-card-v1",
      body: {
        headline: "The signal is clear",
        subhead: "A warm, shareable summary.",
        theme: "aurora",
      },
    });

    const html = renderArtifactHtml(artifact);

    expect(html).toContain("gv-share-card");
    expect(html).toContain("A warm, shareable summary.");
    expect(html).toContain('data-kind="share_card"');
  });

  it("validates and renders profile portrait artifacts", () => {
    const artifact = CodexArtifactSchema.parse({
      ...baseArtifact,
      kind: "profile_portrait",
      title: "The Listening Architect",
      templateKey: "profile-portrait-v1",
      body: {
        portraitTitle: "The Listening Architect",
        tagline: "A steady weave of capture, synthesis, and language.",
        dimensions: Array.from({ length: 10 }, (_, index) => ({
          kind: [
            "cognitive_style",
            "linguistic_signature",
            "energy_rhythm",
            "capture_behavior",
            "synthesis_readiness",
            "emotional_texture",
            "identity_anchors",
            "growth_edges",
            "relational_patterns",
            "creative_mode",
          ][index],
          label: `Dimension ${index + 1}`,
          summary: `Portrait signal ${index + 1}.`,
          confidence: 0.7,
          evidenceCount: 3,
          signalSources: ["memory_entries", "bucket_drops"],
          rawQuotes: ["Quoted signal"],
        })),
        overallConfidence: 0.72,
        sourceWindowStart: "2026-06-01T00:00:00.000Z",
        sourceWindowEnd: "2026-06-02T00:00:00.000Z",
        totalSourceRecords: 19,
        inferenceTriggeredBy: "manual",
        inferenceRunId: "33333333-3333-4333-8333-333333333333",
        version: 1,
      },
    });

    const html = renderArtifactHtml(artifact);

    expect(html).toContain("The Listening Architect");
    expect(html).toContain("A steady weave of capture");
    expect(html).toContain("Dimension 1");
  });
});
