import { describe, expect, it } from "vitest";

import { buildRecapPrompt, type InnerWorldCapture } from "@/components/Scaffold";

function makeCapture(overrides: Partial<InnerWorldCapture> = {}): InnerWorldCapture {
  return {
    id: "capture-1",
    label: "capture-1",
    title: "Layout refinement",
    text: "Reworked the Dynamic Inner World header and recap surface.",
    source: "blackboard",
    type: "context",
    tags: ["layout", "recap"],
    resonance: 72,
    color: "#BF00FF",
    createdAt: "2026-05-13T00:00:00.000Z",
    status: "approved",
    surface: "forward",
    metadata: {
      createdAt: "2026-05-13T00:00:00.000Z",
      context: "Design pass for recap integration",
      meaning: "Keep context visible and grounded",
      surface: "forward",
    },
    ...overrides,
  };
}

describe("buildRecapPrompt", () => {
  it("includes the surface label and capture context", () => {
    const prompt = buildRecapPrompt([makeCapture()], "Creative Work");

    expect(prompt).toContain('Surface: "Creative Work"');
    expect(prompt).toContain("Layout refinement");
    expect(prompt).toContain("Reworked the Dynamic Inner World header and recap surface.");
  });

  it("falls back to metadata context when text is missing", () => {
    const prompt = buildRecapPrompt(
      [
        makeCapture({
          title: "Untitled orb",
          text: "",
          metadata: {
            createdAt: "2026-05-13T00:00:00.000Z",
            context: "Capture context fallback",
            meaning: "Meaning fallback",
            surface: "forward",
          },
        }),
      ],
      "Museum Notes"
    );

    expect(prompt).toContain("Untitled orb");
    expect(prompt).toContain("Capture context fallback");
    expect(prompt).not.toContain("Meaning fallback");
  });

  it("falls back to metadata meaning when context is empty", () => {
    const prompt = buildRecapPrompt(
      [
        makeCapture({
          title: "Meaning orb",
          text: "",
          metadata: {
            createdAt: "2026-05-13T00:00:00.000Z",
            context: "   ",
            meaning: "Meaning fallback",
            surface: "forward",
          },
        }),
      ],
      "Museum Notes"
    );

    expect(prompt).toContain("Meaning orb");
    expect(prompt).toContain("Meaning fallback");
  });
});
