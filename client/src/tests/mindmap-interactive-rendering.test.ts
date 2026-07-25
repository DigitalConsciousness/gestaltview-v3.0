import { describe, expect, it } from "vitest";
import { buildMindMapModel, layoutMindMapNodes } from "@/lib/rendering/mindmap/mindMapModel";

describe("interactive mind map model", () => {
  it("parses headings and bullets into a rooted outline tree", () => {
    const model = buildMindMapModel([
      "# Launch Plan",
      "## Rendering",
      "- Markdown Pro",
      "- Mermaid diagrams",
      "## Rooms",
      "- Blackboard",
      "  - Capture surface",
    ].join("\n"));

    expect(model.root.title).toBe("Launch Plan");
    expect(model.nodes.map((node) => [node.id, node.title, node.depth, node.parentId])).toEqual([
      ["node-0", "Launch Plan", 0, null],
      ["node-1", "Rendering", 1, "node-0"],
      ["node-2", "Markdown Pro", 2, "node-1"],
      ["node-3", "Mermaid diagrams", 2, "node-1"],
      ["node-4", "Rooms", 1, "node-0"],
      ["node-5", "Blackboard", 2, "node-4"],
      ["node-6", "Capture surface", 3, "node-5"],
    ]);
  });

  it("creates a readable synthetic root for plain bullet lists", () => {
    const model = buildMindMapModel("- One\n- Two");

    expect(model.root.title).toBe("Mind Map");
    expect(model.nodes.map((node) => node.title)).toEqual(["Mind Map", "One", "Two"]);
  });

  it("lays nodes out deterministically by depth and sibling order", () => {
    const model = buildMindMapModel("# Root\n## A\n- A1\n## B");
    const first = layoutMindMapNodes(model.nodes);
    const second = layoutMindMapNodes(model.nodes);

    expect(first).toEqual(second);
    expect(first.find((node) => node.id === "node-0")).toMatchObject({ x: 80, y: 120 });
    expect(first.find((node) => node.id === "node-2")?.x).toBeGreaterThan(first.find((node) => node.id === "node-1")?.x ?? 0);
  });
});
