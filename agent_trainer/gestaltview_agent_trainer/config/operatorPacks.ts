export type OperatorPackKind = "skills" | "tools" | "agent_sources" | "memory";

export interface OperatorPack {
  slug: string;
  title: string;
  kind: OperatorPackKind;
  summary: string;
  includes: string[];
  bestFor: string;
}

export const operatorPacks: OperatorPack[] = [
  {
    slug: "general-operator-foundation",
    title: "General Operator Foundation",
    kind: "skills",
    summary: "A neutral starter layer for operators who want a disciplined assistant without vertical bias.",
    includes: [
      "answer-quality heuristics",
      "corpus hygiene checklist",
      "operator-facing prompt conventions"
    ],
    bestFor: "solo builders and generalist teams starting with a blank slate"
  },
  {
    slug: "devops-terminal-pack",
    title: "DevOps Terminal Pack",
    kind: "tools",
    summary: "CLI-first pack for operators who want terminal workflows, environment checks, and packaging controls.",
    includes: [
      "environment doctor commands",
      "packaging shortcuts",
      "memory and trainer status inspection"
    ],
    bestFor: "technical operators, SRE-minded builders, and serious developers"
  },
  {
    slug: "agent-source-starter-bundle",
    title: "Agent Source Starter Bundle",
    kind: "agent_sources",
    summary: "Preloaded source-bundle concept for skill references, tool references, and study-pack assembly.",
    includes: [
      "category-aware source bundles",
      "tool and function reference stubs",
      "study-before-write training posture"
    ],
    bestFor: "buyers who want reusable specialist patterns without custom sourcing work"
  },
  {
    slug: "persistent-memory-foundation",
    title: "Persistent Memory Foundation",
    kind: "memory",
    summary: "A buyer-safe memory model that separates user memory, shared memory, and pinned continuity.",
    includes: [
      "user continuity model",
      "shared collaboration memory model",
      "pinned continuity review posture"
    ],
    bestFor: "teams that need continuity across sessions and collaborators"
  }
];
