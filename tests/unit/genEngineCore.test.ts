import { describe, expect, it } from "vitest";
import { createArtifact } from "../../shared/gen-engine/core";

describe("gen-engine core", () => {
  it("createArtifact creates a non-JSON artifact shell and preserves source without passthrough metadata as content", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-1"],
      targetType: "markdown",
      synthesisStyle: "faithful",
      destination: "download-only",
      title: "Demo Artifact",
      sourceText: "This exact source language should remain visible in a readable markdown shell.",
      consent: { analyzeText: true, analyzeImage: false, analyzeAudio: false, analyzeVideo: false, inferEmotion: false, storeDerivativeSignals: false },
    });

    expect(result.artifact.content).toContain("Demo Artifact");
    expect(result.artifact.content).toContain("This exact source language should remain visible");
    expect(() => JSON.parse(result.artifact.content)).toThrow();
    expect(result.artifact.content).not.toContain('"metadata"');
  });
});
