import { describe, expect, it } from "vitest";
import {
  analyzeMarkdown,
  getMarkdownCalloutKind,
  getMarkdownCodeKind,
  normalizeMermaidSource,
  prepareMarkdownForRender,
} from "@/lib/rendering/markdown/analyzeMarkdown";

describe("markdown pro rendering helpers", () => {
  it("detects mermaid fences without treating ordinary code as diagrams", () => {
    const source = [
      "# System Map",
      "",
      "```mermaid",
      "graph TD",
      "  A[Capture] --> B[Artifact]",
      "```",
      "",
      "```tsx",
      "export function Demo() { return null; }",
      "```",
    ].join("\n");

    const analysis = analyzeMarkdown(source);

    expect(analysis.diagramBlocks).toEqual([
      {
        language: "mermaid",
        code: "graph TD\n  A[Capture] --> B[Artifact]",
      },
    ]);
    expect(analysis.codeBlocks).toHaveLength(2);
    expect(getMarkdownCodeKind("mermaid")).toBe("diagram");
    expect(getMarkdownCodeKind("tsx")).toBe("code");
  });

  it("normalizes flowchart-like fences into Mermaid-compatible source", () => {
    expect(normalizeMermaidSource("flowchart", "A-->B")).toBe("flowchart TD\nA-->B");
    expect(normalizeMermaidSource("mermaid", "sequenceDiagram\nA->>B: hello")).toBe("sequenceDiagram\nA->>B: hello");
  });

  it("classifies document callouts for styled markdown rendering", () => {
    expect(getMarkdownCalloutKind("> [!NOTE] Keep this")).toBe("note");
    expect(getMarkdownCalloutKind("> [!WARNING] Check risk")).toBe("warning");
    expect(getMarkdownCalloutKind("> [!SUCCESS] Shipped")).toBe("success");
    expect(getMarkdownCalloutKind("> ordinary quote")).toBeNull();
  });

  it("converts raw callout markers into readable labels before rendering", () => {
    expect(prepareMarkdownForRender("> [!NOTE] Keep this safe")).toBe("> **Note:** Keep this safe");
    expect(prepareMarkdownForRender("> [!WARNING] Check risk")).toBe("> **Warning:** Check risk");
  });
});
