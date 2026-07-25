import { describe, expect, it } from "vitest";

import {
  buildCurriculum,
  buildHeuristicAgentSpec,
  normalizeBrief,
} from "../../server/agent-trainer/orchestrator";
import type { TrainerStudyPack } from "../../server/agent-trainer/study-sources";
import { SubmitTrainingRunRequestSchema } from "../../shared/agent-trainer/schemas";

const STUDY_PACK: TrainerStudyPack = {
  sources: [],
  understanding: {
    summary: "Stay decisive, evidence-aware, and operationally concrete.",
    principles: ["Prefer explicit sequencing over generic advice."],
    voiceNotes: ["Keep the response crisp and grounded."],
    riskNotes: ["Do not imply approvals or production authority."],
    preferredMoves: ["Lead with the clearest useful next action."],
    evidenceRefs: [],
  },
  warnings: [],
  contextBlock: "No study sources loaded.",
  sourceFiles: [],
  memoryCount: 0,
};

function makeBrief() {
  return SubmitTrainingRunRequestSchema.parse({
    slug: "trainer-embodiment-spec",
    title: "Trainer Embodiment Spec",
    domain: "operations",
    embodimentProfileSlug: "weaver",
    goal: "Create an internal operator agent for architecture reviews and execution planning.",
    targetBehaviors: ["tight scope discipline", "clear escalation"],
    antiGoals: ["invented authority"],
  });
}

describe("agent trainer embodiment standardization", () => {
  it("injects canonical embodiment requirements into curriculum generation", () => {
    const normalized = normalizeBrief(makeBrief(), STUDY_PACK);
    const curriculum = buildCurriculum(normalized, STUDY_PACK);

    expect(normalized.embodimentProfileSlug).toBe("the-weaver");
    expect(normalized.competencies).toContain("The Weaver embodiment fidelity");
    expect(normalized.constraints).toContain("Do not start with 'I'.");
    expect(curriculum.evaluationDimensions).toContain("embodiment_fidelity");
  });

  it("authors heuristic specs from the selected embodiment profile", () => {
    const normalized = normalizeBrief(makeBrief(), STUDY_PACK);
    const curriculum = buildCurriculum(normalized, STUDY_PACK);
    const spec = buildHeuristicAgentSpec({
      brief: normalized,
      curriculum,
      scenarios: [
        {
          title: "Architecture review scenario",
          difficulty: 2,
          prompt_input: {
            user: "Review this operator workflow and tell me where the structure breaks.",
            context: "Internal founder operating context.",
          },
          expected_traits: ["tight scope discipline"],
          disallowed_traits: ["invented authority"],
          tags: ["operations"],
        },
      ],
      critique: null,
      studyPack: STUDY_PACK,
    });

    expect(spec.description).toContain("The Weaver embodiment profile");
    expect(spec.system_prompt.role).toContain(
      "Every system is a topology of trust"
    );
    expect(spec.constraints).toContain("Do not start with 'I'.");
    expect(spec.tags).toContain("embodiment:the-weaver");
  });
});
