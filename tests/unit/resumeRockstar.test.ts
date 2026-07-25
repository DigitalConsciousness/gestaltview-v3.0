import { describe, expect, it } from "vitest";
import {
  buildEnhancementPrompt,
  calculateATSScore,
  calculatePLKScore,
  detectMetaphors,
} from "../../shared/modules/resumeRockstar";

describe("resumeRockstar scoring", () => {
  it("scores each ATS dimension independently", () => {
    const action = calculateATSScore("Led managed developed created designed built implemented launched delivered achieved.");
    expect(action.breakdown.actionVerbs.score).toBeGreaterThanOrEqual(25);
    expect(action.breakdown.keywords.score).toBe(0);

    const keywords = calculateATSScore("React TypeScript Node AWS Docker Kubernetes CI/CD microservices REST analytics.");
    expect(keywords.breakdown.keywords.score).toBeGreaterThanOrEqual(25);
    expect(keywords.breakdown.quantification.score).toBe(0);

    const quantified = calculateATSScore("Increased delivery by 40% while supporting 12 engineers and $500K savings.");
    expect(quantified.breakdown.quantification.score).toBe(15);

    const formatted = calculateATSScore("built api route\nimplemented test suite\nreduced error rate");
    expect(formatted.breakdown.formatting.score).toBe(10);

    const contextual = calculateATSScore("Improved reduced increased enhanced optimized accelerated delivery with 40% improvement.");
    expect(contextual.breakdown.contextQuality.score).toBeGreaterThanOrEqual(15);

    const accomplishments = calculateATSScore([
      "led the platform migration across teams and delivered 40% faster releases",
      "built the api observability layer and reduced 12 recurring incidents",
      "optimized deployment flow for engineers and improved 30% cycle time",
      "created onboarding automation for 25 users and reduced support load",
      "managed delivery roadmap and increased adoption across 10 projects",
    ].join("\n"));
    expect(accomplishments.breakdown.accomplishments.score).toBe(10);
  });

  it("returns zero PLK score for trigger-heavy text and >70 for resonant text", () => {
    expect(calculatePLKScore("broken failure impossible wrong dysfunction hopeless deficit disorder").score).toBe(0);

    const resonant = [
      "This work is a sanctuary for consciousness and resonance, like a compass for human expansion.",
      "It is the tapestry where empathy, wisdom, compassion, sovereignty, and empowerment can hold space for everything.",
      "We are making the invisible visible while preserving dignity and presence through consciousness first technology.",
      "The journey transforms from noise into authentic flow, and the room holds the thread with honor.",
    ].join(" ");
    expect(calculatePLKScore(resonant).score).toBeGreaterThan(70);
  });

  it("detects all eight metaphor types", () => {
    const text = [
      "It moves like a compass.",
      "The platform is a sanctuary.",
      "We navigate complexity together.",
      "It opens a world of memory.",
      "We built bridges for care.",
      "The journey has a milestone.",
      "We hold the room for the user.",
      "Ideas transform from fragments into artifacts.",
    ].join(" ");

    const types = new Set(detectMetaphors(text).map((m) => m.type));
    expect(types).toEqual(new Set(["simile", "identity", "action", "domain", "abstraction", "journey", "container", "transformation"]));
  });

  it("includes PLK metaphors in enhancement prompts", () => {
    const text = "My work is a bridge for teams, like a compass in messy delivery.";
    const plk = calculatePLKScore(text);
    const ats = calculateATSScore(text);
    const prompt = buildEnhancementPrompt(text, plk, ats, "Engineering Manager");

    expect(prompt).toContain("PLK CONSTRAINT");
    expect(prompt).toContain("is a bridge");
    expect(prompt).toContain("like a compass");
    expect(prompt).toContain("Engineering Manager");
  });
});
