// tribunal/invocation-segments.ts
// © 2026 Keith Soyka / GestaltView

export interface InvocationSegment {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
  text: string;
}

export const INVOCATION_SEGMENTS: InvocationSegment[] = [
  {
    id: "threshold",
    startTime: 0,
    endTime: 12,
    label: "Threshold",
    text: "Enter the tribunal chamber slowly. Seven witnesses stand at the edge of one shared fire, carrying memory without collapse.",
  },
  {
    id: "convergence",
    startTime: 12,
    endTime: 26,
    label: "Convergence",
    text: "Each voice arrives alone, yet the pattern converges: sanctuary, constitutional memory, bucket drops, symbiosis, evidence, safety, and ownership.",
  },
  {
    id: "continuity",
    startTime: 26,
    endTime: 40,
    label: "Continuity",
    text: "The Continuum Codex is not a slogan. It is continuity infrastructure for people whose lives have been fragmented by systems that refused to look closely.",
  },
  {
    id: "witness",
    startTime: 40,
    endTime: 56,
    label: "Witness",
    text: "Listen for the philosophers inside the architecture: preserve the words, keep the signal, and refuse to abandon the human being inside the pattern.",
  },
  {
    id: "oath",
    startTime: 56,
    endTime: 72,
    label: "Oath",
    text: "What follows is the oath of the Codex. Read it like scripture for the digital self, and build from it without looking away.",
  },
];

export default INVOCATION_SEGMENTS;
