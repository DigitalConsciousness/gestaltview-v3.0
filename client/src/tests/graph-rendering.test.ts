import { describe, expect, it } from "vitest";

import { buildGraphModel, layoutGraphNodes } from "@/lib/rendering/graph/graphModel";

describe("graph rendering model", () => {
  it("parses JSON node and edge content into a normalized graph", () => {
    const model = buildGraphModel(JSON.stringify({
      nodes: [{ id: "capture", label: "Capture" }, { id: "artifact", label: "Artifact" }],
      edges: [{ source: "capture", target: "artifact", label: "synthesizes" }],
    }));

    expect(model.nodes).toEqual([
      { id: "capture", label: "Capture" },
      { id: "artifact", label: "Artifact" },
    ]);
    expect(model.edges).toEqual([
      { id: "edge-0", source: "capture", target: "artifact", label: "synthesizes" },
    ]);
  });

  it("parses simple arrow lines into graph nodes and edges", () => {
    const model = buildGraphModel("Capture -> Artifact\nArtifact -> Share Card");

    expect(model.nodes.map((node) => node.label)).toEqual(["Capture", "Artifact", "Share Card"]);
    expect(model.edges.map((edge) => [edge.source, edge.target])).toEqual([
      ["capture", "artifact"],
      ["artifact", "share-card"],
    ]);
  });

  it("lays graph nodes out deterministically", () => {
    const model = buildGraphModel("A -> B\nA -> C\nC -> D");
    const first = layoutGraphNodes(model);
    const second = layoutGraphNodes(model);

    expect(first).toEqual(second);
    expect(first.nodes.find((node) => node.id === "a")).toMatchObject({ x: 80, y: 100 });
    expect(first.width).toBeGreaterThan(300);
    expect(first.height).toBeGreaterThan(200);
  });
});

