import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  appendBlackboardRecapToCreationCorner,
  appendBlackboardRecapToInnerWorld,
  buildBlackboardRecapCreationBlueprint,
  buildBlackboardRecapInnerWorldArtifact,
} from "@/lib/blackboardRecapArtifacts";
import { readBlueprints } from "@/components/Scaffold";
import { FILE_STORAGE_KEYS, readInnerWorldArtifacts } from "@/lib/innerWorldFiles";
import type { RecapArtifact } from "@/components/SessionRecapGenerator";

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

const FIXTURE_ARTIFACT: RecapArtifact = {
  id: "recap-123",
  title: "Blackboard Room · Recap",
  type: "recap",
  content: "<article><h1>Recap</h1><p>We built the thing.</p></article>",
  surface: "forward",
  source: "session-recap",
  status: "draft",
  metadata: {
    sessionLabel: "Blackboard Room",
    captureCount: 2,
    generatedAt: "2026-06-12T12:00:00.000Z",
    context: "Generated recap for: Blackboard Room",
    surface: "forward",
    createdAt: "2026-06-12T12:00:00.000Z",
    updatedAt: "2026-06-12T12:00:00.000Z",
    sourceDiId: "curator",
    sourceDiLabel: "The Curator",
  },
};

beforeEach(() => {
  const localStorage = createMemoryStorage();
  (globalThis as any).window = {
    localStorage,
    setTimeout,
    clearTimeout,
    dispatchEvent: () => true,
  };
  (globalThis as typeof globalThis & { fetch?: typeof fetch }).fetch = vi.fn(async () => {
    return new Response(JSON.stringify({ artifact: FIXTURE_ARTIFACT }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
});

describe("blackboard recap artifact helpers", () => {
  it("builds a blackboard-origin inner world artifact", () => {
    const artifact = buildBlackboardRecapInnerWorldArtifact(FIXTURE_ARTIFACT, "user-1", ["capture-a", "capture-b"]);

    expect(artifact).toMatchObject({
      id: "recap-123",
      userId: "user-1",
      title: "Blackboard Room · Recap",
      originRoom: "blackboard",
      originDiId: "curator",
      evidenceNodeIds: ["capture-a", "capture-b"],
      tags: expect.arrayContaining(["blackboard-room", "session-recap"]),
    });
    expect(artifact.summary).toBe("Recap We built the thing.");
    expect(artifact.html).toContain("We built the thing.");
  });

  it("appends the recap artifact to local inner world storage", () => {
    appendBlackboardRecapToInnerWorld(FIXTURE_ARTIFACT, "user-1", ["capture-a"]);

    expect(readInnerWorldArtifacts()).toHaveLength(1);
    expect(readInnerWorldArtifacts()[0]).toMatchObject({
      id: "recap-123",
      userId: "user-1",
      originRoom: "blackboard",
      originDiId: "curator",
      evidenceNodeIds: ["capture-a"],
      tags: expect.arrayContaining(["blackboard-room", "session-recap"]),
    });
    expect(window.localStorage.getItem(FILE_STORAGE_KEYS.innerWorldArtifacts)).toContain("recap-123");
  });

  it("persists a recap as Creation Corner source material", () => {
    const blueprint = buildBlackboardRecapCreationBlueprint(FIXTURE_ARTIFACT, ["capture-a"]);

    expect(blueprint).toMatchObject({
      id: "recap-123",
      title: "Blackboard Room · Recap",
      sourceOrbIds: ["capture-a"],
      captureCount: 2,
      tags: expect.arrayContaining(["blackboard-room", "session-recap"]),
    });
    expect(blueprint.summary).toContain("We built the thing.");
    expect(blueprint.outputs.markdown).toContain("We built the thing.");

    appendBlackboardRecapToCreationCorner(FIXTURE_ARTIFACT, ["capture-a"]);
    expect(readBlueprints()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "recap-123" })]),
    );
  });
});
