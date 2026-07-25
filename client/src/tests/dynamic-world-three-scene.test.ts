import { describe, expect, it } from "vitest";
import { buildThreeMuseumSceneItems } from "@/features/dynamic-inner-world/world-renderer/three/buildThreeMuseumSceneItems";
import type { WorldNode } from "@/features/dynamic-inner-world/world-renderer/types";

function pod(id: string, index: number, overrides: Partial<WorldNode> = {}): WorldNode {
  return {
    id: `node-${id}`,
    kind: "artifact-pod",
    artifactId: id,
    title: `Artifact ${id}`,
    summary: `Summary for ${id}`,
    tags: ["memory"],
    position: {
      x: index * 120 - 240,
      y: index * 8,
      z: -index * 90,
      rotateY: index * 0.1,
      scale: 0.8,
    },
    emphasis: "secondary",
    ...overrides,
  };
}

describe("buildThreeMuseumSceneItems", () => {
  it("keeps the selected artifact primary and converts CSS-stage positions into R3F coordinates", () => {
    const items = buildThreeMuseumSceneItems([
      pod("a", 0),
      pod("b", 1, { emphasis: "primary", position: { x: 0, y: -4, z: 28, scale: 1.18 } }),
      pod("c", 2),
    ]);

    expect(items).toHaveLength(3);
    expect(items[1]).toMatchObject({
      id: "node-b",
      artifactId: "b",
      label: "Artifact b",
      active: true,
      position: [0, -0.08, 0.56],
      scale: 1.28,
      color: "#67e8f9",
    });
    expect(items[0].position).toEqual([-4.8, 0, 0]);
  });

  it("caps the rendered anchors so crowded museums stay light enough for the runtime", () => {
    const items = buildThreeMuseumSceneItems(Array.from({ length: 30 }, (_, index) => pod(`artifact-${index}`, index)));

    expect(items).toHaveLength(14);
    expect(items.at(-1)?.artifactId).toBe("artifact-13");
  });

  it("ignores non-artifact world nodes", () => {
    const items = buildThreeMuseumSceneItems([
      pod("a", 0),
      {
        id: "stats",
        kind: "world-stats-ribbon",
        position: { x: 0, y: 0, z: 0 },
        emphasis: "ambient",
      },
    ]);

    expect(items.map((item) => item.artifactId)).toEqual(["a"]);
  });
});
