import { describe, expect, it } from "vitest";

import {
  buildCreationCornerHtml,
  buildCreationCornerExportFile,
  buildCreationCornerInnerWorldArtifact,
  type CreationCornerRenderableResult,
} from "@/lib/creationCornerArtifacts";

function makeResult(overrides: Partial<CreationCornerRenderableResult> = {}): CreationCornerRenderableResult {
  return {
    id: "artifact-1",
    title: "Showcase Draft",
    artifact_type: "markdown",
    content: "# Showcase Draft\n\nThis is ready for the Inner World.",
    generation_mode: "local-codex",
    fallback_used: true,
    warnings: ["Codex API offline - local export is available."],
    provenance: {
      artifactId: "artifact-1",
      sourceCaptureIds: ["capture-1"],
      sourceHashes: ["h123"],
      artifactHash: "habcdef12",
      generatedAt: "2026-06-10T00:00:00.000Z",
      engineVersion: "1.0.0",
    },
    codex: {
      status: "ready",
      artifact: {
        id: "codex-1",
        contractVersion: "codex.v1",
        kind: "document",
        templateKey: "creation-corner/document",
        securityClass: "user-private",
      },
      manifest: [
        { format: "html", status: "ready", mimeType: "text/html;charset=utf-8" },
        { format: "json", status: "ready", mimeType: "application/json;charset=utf-8" },
      ],
    },
    ...overrides,
  };
}

describe("Creation Corner artifact packaging", () => {
  it("builds separate markdown, html, and json exports", () => {
    const result = makeResult();
    const markdown = buildCreationCornerExportFile(result, "markdown");
    const html = buildCreationCornerExportFile(result, "html");
    const json = buildCreationCornerExportFile(result, "json");

    expect(markdown.fileName).toBe("showcase-draft.md");
    expect(markdown.mimeType).toBe("text/markdown;charset=utf-8");
    expect(markdown.content).toMatch(/^# Showcase Draft/);
    expect(html.fileName).toBe("showcase-draft.html");
    expect(html.mimeType).toBe("text/html;charset=utf-8");
    expect(html.content).toContain("<!doctype html>");
    expect(html.content).toContain("Export Manifest");
    expect(html.content).not.toContain("Warnings");
    expect(json.fileName).toBe("showcase-draft.json");
    expect(json.content).toContain("\"artifact_type\": \"markdown\"");
    expect(json.content).not.toContain("\"warnings\"");
  });

  it("packages Dynamic Inner World showcase artifacts with rendered html and provenance tags", () => {
    const artifact = buildCreationCornerInnerWorldArtifact(makeResult(), "user-1");

    expect(artifact.userId).toBe("user-1");
    expect(artifact.originRoom).toBe("creation_corner");
    expect(artifact.html).toContain("<!doctype html>");
    expect(artifact.evidenceNodeIds).toEqual(["habcdef12"]);
    expect(artifact.tags).toEqual(expect.arrayContaining(["dynamic-inner-world-showcase", "codex-document"]));
  });

  it("escapes Mermaid source before embedding it in the preview document", () => {
    const html = buildCreationCornerHtml(makeResult({
      content: [
        "# Mermaid preview",
        "",
        "```mermaid",
        "flowchart LR",
        "  A[Capture <draft>] --> B[Done & safe]",
        "```",
      ].join("\n"),
    }));

    expect(html).toContain("A[Capture &lt;draft&gt;] --&gt; B[Done &amp; safe]");
    expect(html).not.toContain("A[Capture <draft>] --> B[Done & safe]");
  });
});
