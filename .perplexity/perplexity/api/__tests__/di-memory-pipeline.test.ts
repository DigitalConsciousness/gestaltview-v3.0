import { describe, expect, it } from "vitest";

import {
  buildSessionThread,
  evaluateForMemory,
  mergeQuirkActivations,
  normalizeRelationalDepth,
} from "../_lib/diMemoryPipeline";
import { getDIProfile } from "../../shared/di/registry";

describe("DI memory pipeline helpers", () => {
  it("normalizes relational depth into the supported range", () => {
    expect(normalizeRelationalDepth(-1)).toBe(0);
    expect(normalizeRelationalDepth(0.37)).toBe(0.37);
    expect(normalizeRelationalDepth(2)).toBe(1);
  });

  it("merges quirk activations by incrementing repeated signals", () => {
    expect(
      mergeQuirkActivations(
        { warmth: 2, boundary_holding: 1 },
        { warmth: 1, steady_voice: 3 }
      )
    ).toEqual({
      warmth: 3,
      boundary_holding: 1,
      steady_voice: 3,
    });
  });

  it("builds a bounded continuity thread that keeps the previous thread intact", () => {
    const thread = buildSessionThread(
      {
        diSlug: "billy",
        relationalDepth: 0.17,
        sessionThread: "Previous thread line.",
        quirkActivations: { warmth: 1 },
      },
      "Stay precise and hold the boundary.",
      "We will stay precise and hold the boundary."
    );

    expect(thread).toContain("Previous thread line.");
    expect(thread).toContain("Stay precise and hold the boundary.");
    expect(thread).toContain("We will stay precise and hold the boundary.");
    expect(thread.length).toBeLessThanOrEqual(1200);
  });

  it("promotes a significant turn into a memory event", () => {
    const profile = getDIProfile("billy");
    const event = evaluateForMemory({
      profile: profile!,
      diSlug: "billy",
      userMessage: "Please hold the line with me.",
      assistantResponse: "I will hold the boundary and stay with you.",
      sessionCtx: {
        diSlug: "billy",
        relationalDepth: 0.19,
        quirkActivations: { warmth: 1 },
      },
    });

    expect(event).toMatchObject({
      diSlug: "billy",
      domain: expect.any(String),
      content: expect.stringContaining("boundary"),
      memoryType: expect.any(String),
      source: "session",
    });
    expect(event?.significance).toBeGreaterThanOrEqual(0.75);
  });
});
