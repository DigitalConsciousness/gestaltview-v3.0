import { describe, expect, it } from "vitest";
import { buildArtifactCardModel } from "@/lib/rendering/multimodal/artifactCardModel";

describe("multimodal artifact card model", () => {
  it("routes markdown with Mermaid fences through the markdown renderer and keeps summary as companion content", () => {
    const model = buildArtifactCardModel({
      title: "Architecture Note",
      summary: "A concise system map.",
      content: "# Map\n\n```mermaid\ngraph TD\nA-->B\n```",
      tags: ["diagram"],
    });

    expect(model.primaryArtifact).toMatchObject({
      title: "Architecture Note",
      format: "markdown",
    });
    expect(model.badges).toContain("markdown");
    expect(model.badges).toContain("diagram");
    expect(model.companions).toEqual([{ label: "Summary", content: "A concise system map." }]);
  });

  it("routes mind-map tagged markdown to the mindmap renderer", () => {
    const model = buildArtifactCardModel({
      title: "Mind",
      content: "# Root\n## Branch\n- Leaf",
      tags: ["mindmap"],
    });

    expect(model.primaryArtifact.format).toBe("mindmap");
    expect(model.badges).toContain("mindmap");
  });

  it("routes media attachments to media renderers and keeps transcripts as companion content", () => {
    const model = buildArtifactCardModel({
      title: "Voice Note",
      transcript: "# Transcript\n\nHello world",
      attachment: {
        kind: "audio",
        name: "voice.mp3",
        mimeType: "audio/mpeg",
        size: 1024,
        dataUrl: "data:audio/mpeg;base64,AAAA",
      },
    });

    expect(model.primaryArtifact).toMatchObject({
      format: "audio",
      mimeType: "audio/mpeg",
      filename: "voice.mp3",
      content: "data:audio/mpeg;base64,AAAA",
    });
    expect(model.companions).toEqual([{ label: "Transcript", content: "# Transcript\n\nHello world" }]);
  });
});
