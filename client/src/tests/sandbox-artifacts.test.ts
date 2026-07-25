import { beforeEach, describe, expect, it } from "vitest";

import {
  buildSandboxArtifactPayload,
  readSandboxArtifactRecord,
  readSandboxState,
  storeSandboxArtifactRecord,
  writeSandboxState,
  type SandboxArtifactRecord,
  type SandboxState,
} from "@/lib/sandboxArtifacts";

const DEFAULT_STATE: SandboxState = {
  htmlCode: "<div>html</div>",
  pythonCode: "print('python')",
  threeCode: "console.log('three')",
  lastMode: "html",
};

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

beforeEach(() => {
  const localStorage = createMemoryStorage();
  (globalThis as any).window = {
    localStorage,
  };
});

describe("sandbox artifact helpers", () => {
  it("builds a payload from the active sandbox mode", () => {
    const payload = buildSandboxArtifactPayload("python", DEFAULT_STATE, "data:image/png;base64,abc");

    expect(payload.type).toBe("sandbox");
    expect(payload.mode).toBe("python");
    expect(payload.sourceCode).toBe(DEFAULT_STATE.pythonCode);
    expect(payload.previewSnapshot).toBe("data:image/png;base64,abc");
    expect(payload.title.startsWith("Sandbox · PYTHON · ")).toBe(true);
    expect(payload.metadata.modeContext).toMatchObject({
      htmlCode: DEFAULT_STATE.htmlCode,
      pythonCode: DEFAULT_STATE.pythonCode,
      threeCode: DEFAULT_STATE.threeCode,
    });
  });

  it("round-trips sandbox state and falls back for corrupt storage", () => {
    writeSandboxState(DEFAULT_STATE);
    expect(readSandboxState({ ...DEFAULT_STATE, lastMode: "three" })).toEqual(DEFAULT_STATE);

    window.localStorage.setItem("gestaltview:sandbox:state", "{not-json");
    expect(readSandboxState({ ...DEFAULT_STATE, lastMode: "three" })).toEqual({
      ...DEFAULT_STATE,
      lastMode: "three",
    });
  });

  it("stores and retrieves sandbox artifact records locally", () => {
    const record: SandboxArtifactRecord = {
      artifactId: "artifact-123",
      payload: buildSandboxArtifactPayload("html", DEFAULT_STATE),
      response: {
        artifact: {
          id: "artifact-123",
          title: "Sandbox export",
          type: "code",
          content: "<div>exported</div>",
          contentFormat: "html",
          sourceCaptureIds: [],
          sourceArtifactIds: [],
          destination: "download-only",
          createdAt: new Date().toISOString(),
          metadata: {},
        },
        provenance: {
          artifactId: "artifact-123",
          sourceCaptureIds: [],
          sourceHashes: [],
          artifactHash: "abc123",
          transformType: "formatting",
          generatedAt: new Date().toISOString(),
          engineVersion: "test",
        },
        warnings: [],
        reviewRequired: false,
      } as never,
      savedAt: new Date().toISOString(),
    };

    storeSandboxArtifactRecord(record);

    expect(readSandboxArtifactRecord("artifact-123")).toMatchObject({
      artifactId: "artifact-123",
      payload: expect.objectContaining({
        type: "sandbox",
        mode: "html",
        sourceCode: record.payload.sourceCode,
      }),
    });
  });
});
