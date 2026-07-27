import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ARCHIVED_INNER_WORLD_ARTIFACTS_KEY,
  archiveInnerWorldArtifact,
  clearInnerWorldArtifact,
  artifactStatusLabel,
  artifactOriginLabel,
  classifyInnerWorldArtifactOrigin,
  classifyInnerWorldArtifactView,
  isGalleryStagingStatus,
  isMuseumVisibleArtifact,
  readArchivedInnerWorldArtifacts,
  readInnerWorldArtifacts,
  restoreInnerWorldArtifact,
  writeInnerWorldArtifacts,
  type InnerWorldArtifactRecord,
} from "@/lib/innerWorldFiles";

function artifact(id: string, overrides: Partial<InnerWorldArtifactRecord> = {}): InnerWorldArtifactRecord {
  return {
    id,
    userId: "user-1",
    title: `Artifact ${id}`,
    summary: `Summary ${id}`,
    sourceFileId: null,
    html: `<p>${id}</p>`,
    createdAt: "2026-06-10T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
    originRoom: "creation_corner",
    evidenceNodeIds: [`source-${id}`],
    tags: ["dynamic-inner-world-showcase"],
    ...overrides,
  };
}

describe("inner world artifact lifecycle storage", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
      dispatchEvent: vi.fn(),
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
    });
  });

  it("archives and restores one artifact without deleting unrelated artifacts", () => {
    writeInnerWorldArtifacts([artifact("keep"), artifact("move")]);

    const afterArchive = archiveInnerWorldArtifact("move");

    expect(afterArchive.active.map((item) => item.id)).toEqual(["keep"]);
    expect(afterArchive.archived.map((item) => item.id)).toEqual(["move"]);
    expect(afterArchive.archived[0].status).toBe("archived");
    expect(readInnerWorldArtifacts().map((item) => item.id)).toEqual(["keep"]);
    expect(readArchivedInnerWorldArtifacts().map((item) => item.id)).toEqual(["move"]);

    const afterRestore = restoreInnerWorldArtifact("move");

    expect(afterRestore.active.map((item) => item.id)).toEqual(["move", "keep"]);
    expect(afterRestore.active[0].status).toBe("ready");
    expect(afterRestore.archived).toEqual([]);
  });

  it("clears a bad raw-output record from active and archived storage", () => {
    writeInnerWorldArtifacts([artifact("raw", { html: "{\"raw\":true}" }), artifact("keep")]);
    window.localStorage.setItem(ARCHIVED_INNER_WORLD_ARTIFACTS_KEY, JSON.stringify([artifact("archived-raw")]));

    const result = clearInnerWorldArtifact("raw");
    const archivedResult = clearInnerWorldArtifact("archived-raw");

    expect(result.active.map((item) => item.id)).toEqual(["keep"]);
    expect(archivedResult.archived).toEqual([]);
  });

  it("labels gallery statuses and only treats ready or active artifacts as museum-visible", () => {
    expect(artifactStatusLabel(undefined)).toBe("Ready");
    expect(artifactStatusLabel("queued")).toBe("Queued");
    expect(isGalleryStagingStatus("queued")).toBe(true);
    expect(isGalleryStagingStatus("ready")).toBe(false);
    expect(isMuseumVisibleArtifact({ status: undefined })).toBe(true);
    expect(isMuseumVisibleArtifact({ status: "active" })).toBe(true);
    expect(isMuseumVisibleArtifact({ status: "draft" })).toBe(false);
  });

  it("classifies raw json blobs as raw artifacts instead of museum-visible html", () => {
    const result = classifyInnerWorldArtifactView(
      artifact("raw-json", { html: "{\"raw\":true}", tags: ["scene-graph"] }),
    );

    expect(result.kind).toBe("raw");
    expect(result.primaryRenderable).toBe(false);
  });

  it("only labels a render projection verified when durable source identifiers survive", () => {
    const verified = classifyInnerWorldArtifactOrigin(
      artifact("projection", {
        sourceRef: "render-artifact:44444444-4444-4444-8444-444444444444",
        contentRef: {
          renderJobId: "33333333-3333-4333-8333-333333333333",
          renderArtifactId: "44444444-4444-4444-8444-444444444444",
        },
      }),
    );
    const incomplete = classifyInnerWorldArtifactOrigin(
      artifact("incomplete", {
        sourceRef: "render-artifact:legacy-without-receipt",
      }),
    );

    expect(verified).toBe("render_projection_verified");
    expect(artifactOriginLabel(verified)).toBe("Verified render projection");
    expect(incomplete).toBe("server_legacy");
  });

  it("keeps local drafts and manual imports conservatively classified", () => {
    expect(classifyInnerWorldArtifactOrigin(artifact("local"))).toBe("local_draft");
    expect(
      classifyInnerWorldArtifactOrigin(
        artifact("import", { sourceFileId: "file-1" }),
      ),
    ).toBe("manual_import");
  });
});
