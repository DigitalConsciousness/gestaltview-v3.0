import { describe, expect, it } from "vitest";

import { getRenderer, MindMapRenderer, resolveFormat } from "@/lib/rendering";
import { DiagramRenderer } from "@/lib/rendering/renderers/DiagramRenderer";
import { GraphRenderer } from "@/lib/rendering/renderers/GraphRenderer";

describe("rendering format aliases", () => {
  it("routes python artifacts through the code renderer", () => {
    expect(getRenderer("python")).toBe(getRenderer("code"));
  });

  it("routes mindmap artifacts through the HTML5 renderer", () => {
    expect(getRenderer("mindmap")).toBe(MindMapRenderer);
    expect(getRenderer("mindmap")).not.toBe(getRenderer("html5"));
  });

  it("infers python from file hints and explicit shebangs", () => {
    expect(
      resolveFormat({
        content: "#!/usr/bin/env python3\nprint('hello')",
        filename: "script.txt",
      }),
    ).toBe("python");

    expect(
      resolveFormat({
        content: "print('hello')",
        filename: "script.py",
      }),
    ).toBe("python");
  });

  it("preserves explicit mindmap format hints", () => {
    expect(
      resolveFormat({
        content: "<!doctype html><html><body>map</body></html>",
        format: "mindmap",
      }),
    ).toBe("mindmap");
  });

  it("routes first-class diagram artifacts through the diagram renderer", () => {
    expect(getRenderer("diagram")).toBe(DiagramRenderer);
    expect(getRenderer("mermaid")).toBe(DiagramRenderer);
  });

  it("infers mermaid diagrams from diagram file hints", () => {
    expect(
      resolveFormat({
        content: "graph TD\nA-->B",
        filename: "system-flow.mmd",
      }),
    ).toBe("mermaid");

    expect(
      resolveFormat({
        content: "sequenceDiagram\nAlice->>Bob: Hello",
        filename: "handoff.mermaid",
      }),
    ).toBe("mermaid");
  });

  it("routes graph artifacts through the graph renderer", () => {
    expect(getRenderer("graph")).toBe(GraphRenderer);
    expect(getRenderer("workflow")).toBe(GraphRenderer);
  });

  it("infers graph content from graph file hints and arrow syntax", () => {
    expect(
      resolveFormat({
        content: "Capture -> Artifact",
        filename: "lineage.graph.json",
      }),
    ).toBe("graph");

    expect(
      resolveFormat({
        content: "Capture -> Artifact\nArtifact -> Share Card",
        filename: "lineage.txt",
      }),
    ).toBe("graph");
  });
});
