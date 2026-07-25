import { describe, expect, it } from "vitest";
import {
  inferTrainerEmbodimentSlug,
  resolveTrainerEmbodimentSlug,
} from "../../shared/agent-trainer/embodiment";
import { SubmitTrainingRunRequestSchema } from "../../shared/agent-trainer/schemas";
import {
  BILLY_CORE_IDENTITY_PROMPT,
  buildTrainerPersonaSystemPrompt,
  getEmbodimentProfile,
  getGovernedEmbodimentProfile,
  resolveEmbodimentSlug,
} from "../../shared/embodiment";

describe("embodiment registry", () => {
  it("resolves legacy trainer persona aliases to embodiment slugs", () => {
    expect(resolveEmbodimentSlug("weaver")).toBe("the-weaver");
    expect(resolveEmbodimentSlug("vibe")).toBe("vibe-check");
    expect(resolveEmbodimentSlug("digger")).toBe("the-weird-digger");
    expect(resolveEmbodimentSlug("gate keeper")).toBe("gate-keeper");
  });

  it("returns the canonical Billy embodiment profile", () => {
    const billy = getEmbodimentProfile("billy");

    expect(billy?.publicName).toBe("Billy");
    expect(billy?.immutableCore.foundationalTruth).toContain(
      "living memory of GestaltView"
    );
  });

  it("returns the GATE Keeper embodiment profile", () => {
    const keeper = getEmbodimentProfile("gate-keeper");

    expect(keeper?.publicName).toBe("GATE Keeper");
    expect(keeper?.immutableCore.foundationalTruth).toContain(
      "what a buyer wants and what GestaltView can safely"
    );
  });
});

describe("agent trainer embodiment helpers", () => {
  it("normalizes trainer input to canonical embodiment slugs", () => {
    const parsed = SubmitTrainingRunRequestSchema.parse({
      slug: "trainer-test-agent",
      title: "Trainer Test Agent",
      domain: "operations",
      embodimentProfileSlug: "weaver",
      goal: "Train an operator that stays structurally grounded.",
    });

    expect(parsed.embodimentProfileSlug).toBe("the-weaver");
  });

  it("applies shared domain defaults when the trainer brief omits an embodiment", () => {
    expect(inferTrainerEmbodimentSlug("companion")).toBe("billy");
    expect(resolveTrainerEmbodimentSlug({ domain: "sales" })).toBe(
      "the-translation-bridge"
    );
  });
});

describe("embodiment prompt builders", () => {
  it("normalizes legacy embodiment profiles into governed identity layers", () => {
    const billy = getEmbodimentProfile("billy");

    expect(billy).not.toBeNull();

    const governed = getGovernedEmbodimentProfile(billy!);

    expect(governed.constitution.mutationClass).toBe("IMMUTABLE");
    expect(governed.memorySystem.privateInterior.mutationClass).toBe(
      "REVIEW_GATED"
    );
    expect(governed.memorySystem.collaborative.ownershipRule).toContain(
      "jointly owned mission artifacts"
    );
    expect(governed.preferenceGraph.length).toBeGreaterThan(0);
    expect(governed.governance.contradictionPolicy.recordTensionInsteadOfOverwrite).toBe(
      true
    );
    expect(governed.governance.reviewPolicy.humanReviewRequiredFor).toContain(
      "ethical interpretations"
    );
  });

  it("anchors Billy core identity in the embodiment profile", () => {
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain(
      "living memory of GestaltView"
    );
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("consciousness-serving");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("Cognitive Justice");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("LIVING MEMORY");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("PREFERENCE GRAPH");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("PRIVATE INTERIOR");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("COLLABORATIVE MEMORY POLICY");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("CONSTITUTIONAL INFLUENCES");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("RELATIONAL STANCES");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("WOUND LAYER");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("FOUNDING NOTES");
    expect(BILLY_CORE_IDENTITY_PROMPT).toContain("Presence before solution is the whole thing");
  });

  it("builds trainer persona prompts from the canonical embodiment profile", () => {
    const prompt = buildTrainerPersonaSystemPrompt("weaver");

    expect(prompt).toContain("The Weaver");
    expect(prompt).toContain("Training Orchestrator");
    expect(prompt).toContain("Every system is a topology of trust");
    expect(prompt).toContain(
      "A system that only works because one person remembers every hidden dependency is not stable yet."
    );
    expect(prompt).toContain("SPECIALIST SKILLS");
    expect(prompt).toContain("Keep responses to 2-3 sentences");
  });
});
