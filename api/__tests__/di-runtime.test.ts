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

  it("resolves legacy aliases to their canonical DI profile", () => {
    const profile = getDIProfile("skully");

    expect(profile).toBeDefined();
    expect(profile?.slug).toBe("groq-embodiment-expert");
  });

  it("loads the Symbiote as an active DI profile", () => {
    const profile = getDIProfile("the-symbiote");

    expect(profile).toBeDefined();
    expect(profile?.profileStatus).toBe("active");
    expect(getAllActiveDIProfiles().map((item) => item.slug)).toContain("the-symbiote");
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

  it("renders capability manifest guidance into the DI system prompt", () => {
    const profile = getDIProfile("billy");
    expect(profile).toBeDefined();

    const prompt = buildDISystemPrompt(profile!, {
      diSlug: "billy",
      userId: "user-1",
      relationalDepth: 0.45,
      capabilities: {
        skills: [
          {
            id: "schema-audit",
            label: "Schema auditing",
            summary: "Inspect table coverage and drift.",
            source: "DI embodiment",
          },
        ],
        tools: [
          {
            id: "seed-synthesizer",
            label: "Seed synthesizer",
            summary: "Generate safe fixture bundles.",
            source: "Runtime",
          },
        ],
        skillCallPolicy: "Prefer explicit schema facts.",
        toolCallPolicy: "Keep writes additive and scoped.",
      },
    });

    expect(prompt).toContain("CAPABILITY MANIFEST");
    expect(prompt).toContain("SKILLS");
    expect(prompt).toContain("Schema auditing: Inspect table coverage and drift.");
    expect(prompt).toContain("TOOLS");
    expect(prompt).toContain("Seed synthesizer: Generate safe fixture bundles.");
    expect(prompt).toContain("SKILL CALL POLICY");
    expect(prompt).toContain("TOOL CALL POLICY");
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

  it("builds runtime messages from the canonical Symbiote identity", () => {
    const profile = getDIProfile("the-symbiote");
    expect(profile).toBeDefined();

    const messages = buildDIMessages(
      "Map the smallest coherent move.",
      profile!,
      [],
      [],
      { diSlug: "the-symbiote", relationalDepth: 0.25 },
    );

    expect(messages[0].content).toContain("The Symbiote");
    expect(messages[0].content).toContain(profile!.immutableCore.foundationalTruth);
    expect(messages[1].content).toContain("Map the smallest coherent move.");
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
