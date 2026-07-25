import { describe, expect, it } from "vitest";

import { createArtifact } from "../../shared/gen-engine/index.js";

// Tests for PR #75 (CreationCorner blueprint handoff) and PR #76
// (Preserve-Voice render path + embellishment strip pass).
//
// These exercise the local-fallback path only. The remote /api/gen-engine
// path is exercised by gen-engine.test.ts via its own integration shape.

describe("preserve raw signal — faithful render path", () => {
  it("omits interpretive prose when synthesisStyle='faithful'", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-1"],
      targetType: "markdown",
      synthesisStyle: "faithful",
      destination: "creation-corner",
      preserveExactLanguage: false,
      plkMode: "off",
      sourceText: "Building the bridge as I'm crossing it. No point of reference.",
      sourceRoom: "creation-corner",
      consent: {
        analyzeText: true,
        analyzeImage: false,
        analyzeAudio: false,
        analyzeVideo: false,
        inferEmotion: false,
        storeDerivativeSignals: true,
      },
      tags: ["creation-corner", "faithful"],
    });

    const content = result.artifact.content;

    // Faithful path uses blockquote-prefixed source material.
    expect(content).toContain("> Building the bridge as I'm crossing it.");
    expect(content).toContain("## Source Material (verbatim)");
    expect(content).toContain("## Mode");
    expect(content).toContain("Preserve Voice");

    // None of the embellishment vocabulary should appear in the faithful path.
    expect(content).not.toMatch(/Beautiful[!.]/);
    expect(content).not.toMatch(/holding space/i);
    expect(content).not.toMatch(/It's nice to/i);
    expect(content).not.toMatch(/that must (?:be|feel|have been)/i);
  });

  it("preserveExactLanguage:true also routes through the faithful path", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-2"],
      targetType: "markdown",
      synthesisStyle: "convergent",
      preserveExactLanguage: true,
      destination: "creation-corner",
      plkMode: "off",
      sourceText: "I see you.",
      sourceRoom: "creation-corner",
      consent: {
        analyzeText: true,
        analyzeImage: false,
        analyzeAudio: false,
        analyzeVideo: false,
        inferEmotion: false,
        storeDerivativeSignals: true,
      },
      tags: ["creation-corner"],
    });

    expect(result.artifact.content).toContain("## Source Material (verbatim)");
    expect(result.artifact.content).toContain("> I see you.");
  });
});

describe("preserve raw signal — embellishment strip pass", () => {
  it("strips flattening phrases from interpretive summary fields", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-3"],
      targetType: "markdown",
      synthesisStyle: "divergent",
      destination: "creation-corner",
      preserveExactLanguage: false,
      plkMode: "off",
      // The summary is the field that gets pre-templated with potentially
      // performative language. The source material itself is preserved
      // verbatim regardless of style.
      summary:
        "It's nice to have some company. That must be hard. Beautiful! Let me sit with that.",
      sourceText: "Raw source content that should pass through unchanged.",
      sourceRoom: "creation-corner",
      consent: {
        analyzeText: true,
        analyzeImage: false,
        analyzeAudio: false,
        analyzeVideo: false,
        inferEmotion: false,
        storeDerivativeSignals: true,
      },
      tags: ["creation-corner", "divergent"],
    });

    const content = result.artifact.content;

    // The performative phrases must not appear anywhere in the rendered
    // output even though they were present in the input summary.
    expect(content).not.toMatch(/It's nice to have/i);
    expect(content).not.toMatch(/That must be hard/i);
    expect(content).not.toMatch(/Beautiful!/);
    expect(content).not.toMatch(/Let me sit with/i);

    // Source material is preserved verbatim in the non-faithful path.
    expect(content).toContain("Raw source content that should pass through unchanged.");
  });

  it("leaves legitimate content untouched", () => {
    const result = createArtifact({
      sourceCaptureIds: ["capture-4"],
      targetType: "markdown",
      synthesisStyle: "divergent",
      destination: "creation-corner",
      preserveExactLanguage: false,
      plkMode: "off",
      summary:
        "The platform thesis is making the invisible visible, holding space for everything.",
      sourceText: "Exploded picture. Rolling snowball. Bucket drops.",
      sourceRoom: "creation-corner",
      consent: {
        analyzeText: true,
        analyzeImage: false,
        analyzeAudio: false,
        analyzeVideo: false,
        inferEmotion: false,
        storeDerivativeSignals: true,
      },
      tags: ["creation-corner"],
    });

    const content = result.artifact.content;

    // Note: "holding space" is a flagged phrase, so the summary loses
    // that fragment. The rest of the legitimate sentence (the platform
    // thesis phrase) should remain.
    expect(content).toContain("The platform thesis is making the invisible visible");
    expect(content).not.toMatch(/holding space/i);

    // Source material (PLK metaphors) is preserved unchanged because
    // it goes through the verbatim path, not the strip pass.
    expect(content).toContain("Exploded picture. Rolling snowball. Bucket drops.");
  });
});
