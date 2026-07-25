import { describe, expect, it } from "vitest";
import { getAllActiveDIProfiles, getDIProfile } from "../../shared/di/registry";
import { buildDIMessages, buildDISystemPrompt } from "../../shared/di/runtime";
import { checkDIHealth } from "../../shared/di/diagnostics";

describe("DI registry", () => {
  it("loads an active profile from the existing embodiment registry", () => {
    const billy = getDIProfile("billy");

    expect(billy).toBeDefined();
    expect(billy?.slug).toBe("billy");
    expect(getAllActiveDIProfiles().every((profile) => profile.profileStatus === "active")).toBe(true);
  });
});

describe("DI runtime", () => {
  it("assembles a DI system prompt with living memory and continuity context", () => {
    const profile = getDIProfile("billy");
    expect(profile).toBeDefined();

    const prompt = buildDISystemPrompt(
      profile!,
      {
        diSlug: "billy",
        userId: "user-1",
        relationalDepth: 0.12,
        sessionThread: "We were keeping this calm and concrete.",
        quirkActivations: { warmth: 2 },
      },
      { currentState: "Founder context is active." }
    );

    expect(prompt).toContain("FOUNDATIONAL TRUTH");
    expect(prompt).toContain("LIVING MEMORIES");
    expect(prompt).toContain("CONTINUITY THREAD");
    expect(prompt).toContain("Founder context is active.");
  });

  it("builds a two-part DI message array with the user turn preserved verbatim", () => {
    const profile = getDIProfile("billy");
    const messages = buildDIMessages(
      "Hold the line and keep this grounded.",
      profile!,
      ["[1] knowledge fragment"],
      ["[1] memory fragment"],
      { diSlug: "billy", relationalDepth: 0.05, userId: "user-1" }
    );

    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
    expect(messages[1].content).toContain("User message: Hold the line and keep this grounded.");
    expect(messages[1].content).toContain("knowledge fragment");
    expect(messages[1].content).toContain("memory fragment");
  });
});

describe("DI diagnostics", () => {
  it("returns a warning when the profile slug does not exist", () => {
    expect(checkDIHealth("missing-slug")).toEqual({
      diSlug: "missing-slug",
      profileLoaded: false,
      hasLivingMemory: false,
      hasEthicalBoundaries: false,
      hasRelationalStances: false,
      readinessScore: 0,
      warnings: ["Profile not found"],
    });
  });
});
