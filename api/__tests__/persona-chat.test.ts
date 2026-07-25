import { describe, expect, it } from "vitest";
import { resolvePersonaChatSystemPrompt } from "../trainer/persona-chat";

describe("persona chat prompt resolution", () => {
  it("uses the canonical trainer persona prompt when no embodiment override is provided", () => {
    const prompt = resolvePersonaChatSystemPrompt({ personaId: "weaver" });

    expect(prompt).toContain("The Weaver");
    expect(prompt).toContain("Training Orchestrator");
    expect(prompt).toContain("Keep responses to 2-3 sentences");
  });

  it("allows a selected embodiment to operate inside the current trainer lane", () => {
    const prompt = resolvePersonaChatSystemPrompt({
      personaId: "weaver",
      embodimentProfileSlug: "the-guardian",
    });

    expect(prompt).toContain("The Guardian");
    expect(prompt).toContain("Training Orchestrator");
    expect(prompt).toContain("Stay scoped to the weaver training lane");
  });
});
