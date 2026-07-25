import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";

export type TribunalMode = "session" | "debate" | "roundtable";

export type TribunalStance =
  | "synthesis"
  | "imagistic"
  | "skeptical"
  | "dialectical"
  | "generative"
  | "practical"
  | "custom";

export interface TribunalParticipantSummary {
  slug: TrainerEmbodimentSlug;
  label: string;
  color: string;
  stance?: TribunalStance | string;
}

export interface TribunalMessageMeta {
  addressedTo?: string[];
  isAutoReply?: boolean;
  replyDepth?: number;
}

export const TRIBUNAL_STANCE_OPTIONS: ReadonlyArray<{
  value: TribunalStance;
  label: string;
  description: string;
}> = [
  {
    value: "synthesis",
    label: "Synthesis / Integration",
    description: "Looks for the through-line and the cleanest joint answer.",
  },
  {
    value: "imagistic",
    label: "Metaphoric / Imagistic",
    description: "Speaks in image, texture, and resonance.",
  },
  {
    value: "skeptical",
    label: "Empirical / Skeptical",
    description: "Presses for evidence, mechanism, and falsifiability.",
  },
  {
    value: "dialectical",
    label: "Dialectical / Questioning",
    description: "Returns questions to probe assumptions and contradictions.",
  },
  {
    value: "generative",
    label: "Generative / Making",
    description: "Moves toward something that could be built or composed.",
  },
  {
    value: "practical",
    label: "Consequential / Practical",
    description: "Looks for action, tradeoffs, and operational next steps.",
  },
  {
    value: "custom",
    label: "Custom Lens",
    description: "Use the voice on its own terms instead of a preset frame.",
  },
] as const;
