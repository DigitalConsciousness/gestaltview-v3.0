import { describe, expect, it } from "vitest";

import {
  buildCreationCornerOutputs,
  buildGenEngineHealth,
  createArtifact,
  createCaptureSignal,
  exportArtifact,
  scanAmbientCoherence,
  scoreResonance,
} from "../../shared/gen-engine/index.js";

describe("gen engine core", () => {
  it("preserves capture material even when analysis consent is off", () => {
    const result = createCaptureSignal({
      captureId: "capture-1",
      text: "Keep the source words visible.",
      sourceRoom: "blackboard-room",
      consent: {
        analyzeText: false,
        analyzeImage: false,
        analyzeAudio: false,
        analyzeVideo: false,
        inferEmotion: false,
        storeDerivativeSignals: false,
      },
    });

    expect(result.success).toBe(true);
    expect(result.captureId).toBe("capture-1");
    expect(result.fusedText).toContain("Keep the source words visible.");
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]?.success).toBe(false);
    expect(result.warnings.join(" ")).toContain("consent");
  });

  it("scores resonance against PLK terms", () => {
    const result = scoreResonance({
      text: "Preserve the source language and provenance.",
      plkContext: {
        signatureMetaphors: "source, room, thread",
      },
    });

    expect(result.score).toBeGreaterThan(60);
    expect(result.metaphorsMatched).toEqual(expect.arrayContaining(["preserve", "source", "provenance"]));
    expect(result.warnings).toHaveLength(0);
  });

  it("creates a provenance-aware artifact payload", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-1", "capture-2"],
      sourceArtifactIds: ["artifact-9"],
      targetType: "blueprint-markdown",
      synthesisStyle: "faithful",
      destination: "creation-corner",
      userInstructions: "Keep the original meaning intact.",
      preserveExactLanguage: true,
      plkMode: "light-touch",
      title: "Foundational Draft",
      summary: "A held draft for the next pass.",
      sourceText: "The original capture text.",
      sourceRoom: "creation-corner",
      tags: ["draft", "provenance"],
      userId: "user-1",
    });

    expect(result.artifact.title).toBe("Foundational Draft");
    expect(result.artifact.contentFormat).toBe("markdown");
    expect(result.artifact.content).toContain("Foundational Draft");
    expect(result.provenance.sourceCaptureIds).toEqual(["capture-1", "capture-2"]);
    expect(result.provenance.artifactHash).toMatch(/^h[0-9a-f]{8}$/);
    expect(result.reviewRequired).toBe(true);
  });

  it("builds the Creation Corner output family with provenance in the code export", () => {
    const outputs = buildCreationCornerOutputs({
      title: "Foundational Draft",
      summary: "A held draft for the next pass.",
      tags: ["draft", "provenance"],
      status: "ready",
      note: "Keep the original meaning intact.",
      sourceMarkdown: "# Source\n\nThe original capture text.",
      sourceBlueprintJson: JSON.stringify({ id: "blueprint-1" }),
      sourceCaptureIds: ["capture-1"],
      captureCount: 1,
      sourceRoom: "creation-corner",
    });

    expect(outputs.markdown).toContain("## Status");
    expect(outputs.markdown).toContain("ready");
    expect(outputs.html).toContain("Foundational Draft");
    expect(outputs.pdfHtml).toContain("Refinement Note");
    expect(outputs.code).toContain("provenance");
    expect(outputs.agentPrompt).toContain("Blueprint JSON");
  });

  it("exports markdown artifacts as real HTML documents when HTML is requested", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-1"],
      targetType: "markdown",
      synthesisStyle: "faithful",
      destination: "dynamic-inner-world",
      userInstructions: "Make this showcase-ready.",
      preserveExactLanguage: true,
      plkMode: "light-touch",
      title: "Showcase Draft",
      summary: "A draft that should render in Dynamic Inner World.",
      sourceText: "This should become visible, not raw JSON.",
      sourceRoom: "creation-corner",
      tags: ["showcase"],
    });

    const html = exportArtifact(result.artifact, "html");
    const markdown = exportArtifact(result.artifact, "markdown");
    const json = exportArtifact(result.artifact, "json");

    expect(html.mimeType).toBe("text/html;charset=utf-8");
    expect(html.fileName).toBe("showcase_draft.html");
    expect(html.content).toContain("<!doctype html>");
    expect(html.content).toContain("Showcase Draft");
    expect(html.content).not.toMatch(/^# Showcase Draft/);
    expect(markdown.content).toMatch(/^# Showcase Draft/);
    expect(json.content).toContain("\"type\": \"markdown\"");
  });

  it("scans ambient coherence without producing finished artifacts", () => {
    const result = scanAmbientCoherence({
      userId: "user-1",
      room: "all",
      maxSignals: 2,
    });

    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.signals.length).toBeLessThanOrEqual(2);
    expect(result.generatedArtifacts).toEqual([]);
  });

  it("reports the local-first engine as degraded when no provider is configured", () => {
    const health = buildGenEngineHealth({});

    expect(health.status).toBe("degraded");
    expect(health.adapters.text_basic).toBe(true);
    expect(health.adapters.llm).toBe(false);
    expect(health.warnings.length).toBeGreaterThan(0);
  });
});
