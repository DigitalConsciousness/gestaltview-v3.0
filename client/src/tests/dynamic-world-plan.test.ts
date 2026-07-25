import { describe, expect, it } from "vitest";
import { buildWorldPlan } from "@/features/dynamic-inner-world/world-renderer/buildWorldPlan";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

function artifact(id: string, overrides: Partial<InnerWorldArtifactRecord> = {}): InnerWorldArtifactRecord {
  return {
    id,
    userId: "user-1",
    title: `Artifact ${id}`,
    summary: `Summary for ${id}`,
    sourceFileId: null,
    html: `<p>${id}</p>`,
    createdAt: "2026-05-31T00:00:00.000Z",
    updatedAt: "2026-05-31T00:00:00.000Z",
    originRoom: "dynamic_inner_world",
    evidenceNodeIds: [],
    tags: ["memory"],
    ...overrides,
  };
}

describe("buildWorldPlan", () => {
  it("builds a safe empty hall plan with controls and curator only", () => {
    const plan = buildWorldPlan({
      artifacts: [],
      archivedArtifacts: [],
      selectedArtifactId: null,
      resonanceLinks: [],
      searchQuery: "",
      selectedTags: [],
      typeFilter: "all",
      sortMode: "recent",
    });

    expect(plan.selectedArtifactId).toBeNull();
    expect(plan.nodes.map((node) => node.kind)).toEqual(["empty-hall-state", "search-control-deck", "curator-console"]);
  });

  it("promotes the selected artifact and uses stable deterministic positions", () => {
    const input = {
      artifacts: [artifact("a"), artifact("b"), artifact("c")],
      archivedArtifacts: [artifact("archived")],
      selectedArtifactId: "b",
      resonanceLinks: [{ artifactId: "c", title: "Artifact c", reason: "Shared memory tag.", score: 0.82 }],
      searchQuery: "memory",
      selectedTags: ["memory"],
      typeFilter: "text",
      sortMode: "recent",
    };

    const first = buildWorldPlan(input);
    const second = buildWorldPlan(input);
    const selected = first.nodes.find((node) => node.artifactId === "b");
    const related = first.nodes.find((node) => node.artifactId === "c" && node.kind === "artifact-pod");

    expect(first.mode).toBe("museum");
    expect(first.selectedArtifactId).toBe("b");
    expect(selected?.emphasis).toBe("primary");
    expect(selected?.position).toMatchObject({ x: 0, z: 28, scale: 1.18 });
    expect(related?.position).toEqual(second.nodes.find((node) => node.id === related?.id)?.position);
    expect(first.nodes.some((node) => node.kind === "resonance-rail")).toBe(true);
    expect(first.nodes.some((node) => node.kind === "archive-vault")).toBe(true);
  });

  it("switches crowded halls into archive mode and caps visible pod nodes", () => {
    const artifacts = Array.from({ length: 72 }, (_, index) => artifact(`artifact-${index}`));
    const plan = buildWorldPlan({
      artifacts,
      archivedArtifacts: [],
      selectedArtifactId: "artifact-40",
      resonanceLinks: [],
      searchQuery: "",
      selectedTags: [],
      typeFilter: "all",
      sortMode: "recent",
    });

    expect(plan.mode).toBe("archive");
    expect(plan.nodes.filter((node) => node.kind === "artifact-pod")).toHaveLength(60);
    expect(plan.nodes.find((node) => node.artifactId === "artifact-40")?.emphasis).toBe("primary");
  });
});
