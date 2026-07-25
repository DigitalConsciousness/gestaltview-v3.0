import { describe, expect, it } from "vitest";

import {
  buildCreationCornerCodexArtifact,
  mapCreationCornerArtifactType,
  mapCreationCornerCodexKind,
  mapCreationCornerDestination,
  mapCreationCornerStyle,
} from "../../shared/codex/creationCorner.js";
import type { CodexArtifact } from "../../shared/codex/contracts.js";

describe("Creation Corner Codex mapping", () => {
  it("maps legacy Creation Corner controls to gen-engine and Codex contracts", () => {
    expect(mapCreationCornerArtifactType("blueprint_md")).toBe("blueprint-markdown");
    expect(mapCreationCornerArtifactType("image")).toBe("image-prompt");
    expect(mapCreationCornerStyle("structural")).toBe("technical");
    expect(mapCreationCornerDestination("dynamic_inner_world")).toBe("dynamic-inner-world");
    expect(mapCreationCornerCodexKind("blueprint_md")).toBe("blueprint");
    expect(mapCreationCornerCodexKind("image")).toBe("share_card");
  });

  it("builds a private validated Codex artifact from Creation Corner output", () => {
    const artifact = buildCreationCornerCodexArtifact({
      legacyType: "blueprint_md",
      userId: "55555555-5555-4555-8555-555555555555",
      title: "Creation Draft",
      content: "A source-linked draft.",
      sourceText: "Raw source material.",
      now: "2026-06-02T00:00:00.000Z",
      id: "66666666-6666-4666-8666-666666666666",
    });

    expect(artifact).toMatchObject({
      id: "66666666-6666-4666-8666-666666666666",
      contractVersion: "codex.v1",
      kind: "blueprint",
      securityClass: "private",
      templateKey: "blueprint-v1",
      exports: [
        { format: "html", status: "pending" },
        { format: "json", status: "pending" },
      ],
    });
    expect(artifact.provenance[0]?.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("bounds oversized Creation Corner output to the Codex contract", () => {
    const artifact = buildCreationCornerCodexArtifact({
      legacyType: "markdown",
      userId: "55555555-5555-4555-8555-555555555555",
      title: "A".repeat(240),
      content: "B".repeat(45_000),
      sourceText: "Raw source material.",
      now: "2026-06-02T00:00:00.000Z",
      id: "66666666-6666-4666-8666-666666666666",
    });
    const body = artifact.body as Extract<CodexArtifact, { kind: "report_document" }>["body"];
    const sections = body.sections.map((section) => {
      expect(section.type).toBe("markdown");
      return section as Extract<(typeof body.sections)[number], { type: "markdown" }>;
    });

    expect(artifact.title).toHaveLength(160);
    expect(sections).toHaveLength(3);
    expect(sections[0]?.markdown).toHaveLength(20_000);
    expect(sections[1]?.markdown).toHaveLength(20_000);
    expect(sections[2]?.markdown).toHaveLength(5_000);
  });
});
