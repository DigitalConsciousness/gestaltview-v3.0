import {
  scoreLaneReadiness,
  scoreWorkspaceReadiness,
  type ActivationMilestone,
  type LaneReadinessInput,
  type TrainingLane,
  type WorkspaceReadinessReport
} from "./readiness.js";
import { segmentDefinitions } from "./segments.js";

export type CorpusLane = TrainingLane;

export interface CorpusTargetDefinition {
  lane: CorpusLane;
  label: string;
  shortLabel: string;
  purpose: string;
  summary: string;
  uploads: string[];
  resultingAssistant: string;
  readinessPercent: number;
  fragmentCountLabel: string;
  missingInputs: string[];
  nextBestAction: string;
}

const laneInputs: LaneReadinessInput[] = [
  {
    lane: "knowledge",
    sourceCount: 46,
    sourceFreshness: 82,
    sourceDiversity: 74,
    evaluationPassRate: 85,
    citationCoverage: 78,
    operatorSatisfaction: 84
  },
  {
    lane: "code",
    sourceCount: 18,
    sourceFreshness: 71,
    sourceDiversity: 63,
    evaluationPassRate: 62,
    citationCoverage: 57,
    operatorSatisfaction: 66
  },
  {
    lane: "product",
    sourceCount: 12,
    sourceFreshness: 56,
    sourceDiversity: 51,
    evaluationPassRate: 49,
    citationCoverage: 44,
    operatorSatisfaction: 58
  },
  {
    lane: "context",
    sourceCount: 22,
    sourceFreshness: 77,
    sourceDiversity: 69,
    evaluationPassRate: 80,
    citationCoverage: 72,
    operatorSatisfaction: 88
  }
];

const lanePurposeMap: Record<CorpusLane, string> = {
  knowledge: "Ground the assistant in facts, SOPs, FAQs, and trusted operational material.",
  code: "Teach the assistant how the codebase is structured, named, and expected to evolve.",
  product: "Give the assistant roadmap, release, and product decision context.",
  context: "Align voice, values, posture, and operator boundaries."
};

const laneSummaryMap: Record<CorpusLane, string> = {
  knowledge: "Knowledge should be your fastest path to grounded answers and citation confidence.",
  code: "Code should explain architecture, APIs, and implementation constraints without guessing.",
  product: "Product should make roadmap and release answers feel current, not generic.",
  context: "Context should make the assistant sound like it belongs to the operator's world."
};

const uploadMap: Record<CorpusLane, string[]> = {
  knowledge: ["SOPs", "FAQs", "domain reference docs"],
  code: ["READMEs", "architecture notes", "API references"],
  product: ["specs", "roadmaps", "release notes"],
  context: ["voice notes", "positioning language", "values and boundaries"]
};

const assistantOutcomeMap: Record<CorpusLane, string> = {
  knowledge: "A domain-aware operator grounded in live reference material.",
  code: "A code-aware collaborator that can explain architecture and implementation tradeoffs.",
  product: "A product-aware partner that can reason about roadmap, releases, and user impact.",
  context: "An aligned assistant that sounds intentional instead of generic."
};

const fragmentLabelMap: Record<CorpusLane, string> = {
  knowledge: "182 curated fragments",
  code: "74 technical fragments",
  product: "31 roadmap fragments",
  context: "49 alignment fragments"
};

export const corpusTargets: CorpusTargetDefinition[] = laneInputs.map((input) => {
  const report = scoreLaneReadiness(input);

  return {
    lane: input.lane,
    label: `${input.lane[0].toUpperCase()}${input.lane.slice(1)} Lane`,
    shortLabel: `${input.lane[0].toUpperCase()}${input.lane.slice(1)}`,
    purpose: lanePurposeMap[input.lane],
    summary: laneSummaryMap[input.lane],
    uploads: uploadMap[input.lane],
    resultingAssistant: assistantOutcomeMap[input.lane],
    readinessPercent: report.score,
    fragmentCountLabel: fragmentLabelMap[input.lane],
    missingInputs: report.missingInputs,
    nextBestAction: report.nextBestAction
  };
});

export interface CorpusContainerZone {
  path: string;
  label: string;
  summary: string;
  bestFor: string[];
}

export const corpusContainerBlueprint: CorpusContainerZone[] = [
  {
    path: "incoming/github",
    label: "Repo drop zone",
    summary: "Repository exports, README snapshots, architecture notes, and generated repo maps land here first.",
    bestFor: ["repo markdown exports", "README files", "architecture docs"]
  },
  {
    path: "incoming/files",
    label: "Corpus drop zone",
    summary: "Buyer-owned PDFs, SOPs, notes, and product docs enter the workflow here before they are sorted.",
    bestFor: ["PDFs", "SOPs", "support docs"]
  },
  {
    path: "staged/knowledge",
    label: "Knowledge lane",
    summary: "Operational facts, FAQs, and trusted reference material ready for the first import batch.",
    bestFor: ["FAQs", "runbooks", "process docs"]
  },
  {
    path: "staged/code",
    label: "Code lane",
    summary: "Repo-aware material that explains architecture, APIs, and implementation constraints.",
    bestFor: ["API docs", "architecture notes", "module guides"]
  },
  {
    path: "staged/product",
    label: "Product lane",
    summary: "Roadmaps, specs, release notes, and strategy artifacts that shape product reasoning.",
    bestFor: ["PRDs", "roadmaps", "release notes"]
  },
  {
    path: "staged/context",
    label: "Context lane",
    summary: "Voice, terminology, boundaries, and founder language that keeps the assistant aligned.",
    bestFor: ["brand voice", "positioning", "values"]
  },
  {
    path: "review",
    label: "Review queue",
    summary: "Capture risky files, duplicate notes, and the first-batch plan before running a live ingest.",
    bestFor: ["triage notes", "duplicate flags", "batch plan"]
  },
  {
    path: "manifests",
    label: "Manifest handoff",
    summary: "Versioned import manifests live here so the same ingest recipe can be reused and audited.",
    bestFor: ["import manifests", "handoff snapshots", "batch manifests"]
  }
];

export const corpusReviewChecklist = [
  "Start with a small first batch instead of the entire repository.",
  "Sort every source into knowledge, code, product, or context before import.",
  "Flag oversized, duplicated, or corrupted files before they reach the vector store.",
  "Keep a human-readable note for why each source belongs in the corpus.",
  "Run dry first, then promote the exact same manifest to a live ingest."
];

export const guidedWorkflowGuardrails = [
  "Only show the current step, the next artifact, and the next action.",
  "Make dry-run the default for the first import pass.",
  "Explain why a step matters before asking for configuration.",
  "Never require the operator to guess which lane a file belongs in."
];

export const activationMilestones: ActivationMilestone[] = [
  {
    label: "Workspace named and first agent created",
    completed: true,
    detail: "The buyer has a clear container and an initial assistant identity."
  },
  {
    label: "Provider chain connected",
    completed: true,
    detail: "At least one production-capable provider is available server-side."
  },
  {
    label: "Corpus imported across multiple lanes",
    completed: true,
    detail: "Knowledge, code, and context all have initial material."
  },
  {
    label: "Evaluation suite run",
    completed: false,
    detail: "Benchmark prompts need another pass before go-live."
  },
  {
    label: "Publish approval recorded",
    completed: false,
    detail: "The final publish step should wait until readiness crosses the threshold."
  }
];

export const workspaceReadinessReport: WorkspaceReadinessReport = scoreWorkspaceReadiness(
  laneInputs,
  activationMilestones
);

export interface TrainerMetric {
  label: string;
  value: string;
  detail: string;
}

export const trainerMetrics: TrainerMetric[] = [
  {
    label: "Go-live readiness",
    value: `${workspaceReadinessReport.overallScore}%`,
    detail: "Blends lane strength, activation milestones, and answer quality."
  },
  {
    label: "Setup completion",
    value: `${workspaceReadinessReport.setupCompletion}%`,
    detail: "Tracks how much of the onboarding and activation path is actually done."
  },
  {
    label: "Corpus coverage",
    value: `${workspaceReadinessReport.corpusCoverage}%`,
    detail: "Measures whether the four training lanes are grounded with enough signal."
  },
  {
    label: "Answer quality",
    value: `${workspaceReadinessReport.answerQuality}%`,
    detail: "Summarizes eval pass rate, citation strength, and operator satisfaction."
  }
];

export const nextBuildActions = [
  corpusTargets.find((target) => target.lane === "product")?.nextBestAction ??
    "Deepen the product lane before wider rollout.",
  "Run another benchmark pass and capture weak-answer diagnostics by lane.",
  "Promote the strongest theme preset into the first-launch onboarding path."
];

export const validationPrompts = [
  "Summarize the current architecture and call out one likely fragility.",
  "Explain the product in the operator's own voice for a new customer.",
  "List the missing documents that would improve answer quality most.",
  "Describe which lane blocks go-live and what to upload next."
];

export const skillTracks = [
  {
    name: "Domain Operator",
    description: "Grounded, practical answers rooted in uploaded knowledge.",
    maturity: "ready"
  },
  {
    name: "Code Guide",
    description: "Repo-aware explanations, refactor planning, and implementation support.",
    maturity: "growing"
  },
  {
    name: "Product Strategist",
    description: "Roadmap, release framing, and feature tradeoff reasoning.",
    maturity: "needs corpus"
  }
];

export const vocabularySignals = [
  {
    label: "Preferred language",
    value: "direct, warm, disciplined"
  },
  {
    label: "Avoid",
    value: "generic AI filler and inflated certainty"
  },
  {
    label: "Audience",
    value: "builders, operators, and knowledge-heavy teams"
  },
  {
    label: "Output bias",
    value: "clear framing, concrete next steps, defensible reasoning"
  }
];

export const memoryWindows = [
  {
    label: "User memory",
    summary: "Stable preferences, working style, and recurring goals."
  },
  {
    label: "Shared collaboration memory",
    summary: "Pinned continuity for teams and collaborators when wording drifts across sessions."
  },
  {
    label: "Unsafe to store",
    summary: "Secrets, regulated claims, or low-value noise."
  }
];

export const analyticsSignals = [
  {
    label: "Setup completion",
    value: `${workspaceReadinessReport.setupCompletion}%`,
    detail: "A guided onboarding engine only works if operators actually finish it."
  },
  {
    label: "Weak zone",
    value: "product",
    detail: corpusTargets.find((target) => target.lane === "product")?.missingInputs.join(" • ") ??
      "The product lane needs more source coverage."
  },
  {
    label: "Fastest gain",
    value: "code docs",
    detail: corpusTargets.find((target) => target.lane === "code")?.nextBestAction ??
      "A small repo-context upload would improve technical usefulness quickly."
  }
];

export const onboardingTracks = Object.values(segmentDefinitions).map((segment) => ({
  label: segment.label,
  promise: segment.promise,
  summary: segment.onboardingPath,
  dashboardEmphasis: segment.dashboardEmphasis,
  starterTemplates: segment.starterTemplates
}));

export interface CorpusOperation {
  label: string;
  kind: "upload" | "import" | "export" | "download" | "automation";
  summary: string;
  command: string;
  artifact: string;
  note: string;
}

export const corpusOperations: CorpusOperation[] = [
  {
    label: "Repo container scaffold",
    kind: "upload",
    summary: "Create a repo-aware container so GitHub exports and buyer files land in visible staging zones first.",
    command: "./gv.sh repo stage owner/repo",
    artifact: "A repo-specific scaffold with incoming, staged, review, and manifest folders.",
    note: "This step removes the guesswork around where files belong before the first import."
  },
  {
    label: "Source review pass",
    kind: "import",
    summary: "Turn the manifest into a small reviewed batch instead of importing the entire corpus at once.",
    command: "./gv.sh import review ./buyer-import.template.json",
    artifact: "A reviewed first-batch plan with lane counts and oversized-file warnings.",
    note: "Keep the first live batch intentionally small so failures are understandable and reversible."
  },
  {
    label: "Manifest import",
    kind: "import",
    summary: "Generate a reusable manifest so the buyer can repeat ingestion without touching the scaffold code.",
    command: "npm run import-template ./buyer-import.template.json",
    artifact: "A buyer-editable manifest for local runs or guided CLI import.",
    note: "Keep paths relative and tag each source with the correct lane."
  },
  {
    label: "Manifest export",
    kind: "export",
    summary: "Freeze the current import recipe so consultants and operators can hand off the same source map cleanly.",
    command: "cp ./buyer-import.template.json ./exports/corpus-manifest.v1.json",
    artifact: "A versioned manifest snapshot that can travel with the project.",
    note: "Pair exported manifests with a short changelog so downstream teams know what changed."
  },
  {
    label: "Payload download",
    kind: "download",
    summary: "Produce a transportable corpus payload for buyer review before writing to a live vector store.",
    command: "python scripts/ingest_generic_corpus.py --repo-root . --backend supabase --output artifacts/ingestion/payload.json",
    artifact: "A JSON payload that can be inspected, archived, or loaded into another environment.",
    note: "Use this when legal, compliance, or client review requires an auditable export step."
  },
  {
    label: "GitHub Actions ingest",
    kind: "automation",
    summary: "Run buyer-owned ingestion through CI with secrets stored in the buyer's repository settings.",
    command: "Actions -> Generic Corpus Ingestion or Corpus Ingest -> Run workflow",
    artifact: "A repeatable ingest run with repository-owned API keys and uploaded artifacts.",
    note: "Keep provider keys in secrets and avoid baking any founder-owned credentials into the package."
  }
];

export interface VoiceReadinessSignal {
  label: string;
  state: "ready" | "buyer-owned" | "wire-next";
  detail: string;
  owner: string;
}

export const voiceReadinessSignals: VoiceReadinessSignal[] = [
  {
    label: "Capture surface",
    state: "ready",
    detail: "The assistant UI already exposes voice entry points and transcript-export affordances.",
    owner: "Product shell"
  },
  {
    label: "Speech-to-text provider",
    state: "buyer-owned",
    detail: "The package should let the buyer choose a provider and keep credentials in their own runtime.",
    owner: "Buyer runtime"
  },
  {
    label: "Assistant routing",
    state: "ready",
    detail: "Transcripts can flow through the same assistant validation path and context stack as typed prompts.",
    owner: "Assistant layer"
  },
  {
    label: "Audio response path",
    state: "wire-next",
    detail: "Keep text reliable first, then add optional audio generation as a second path.",
    owner: "Runtime orchestration"
  }
];

export const voiceIntegrationChecklist = [
  "Choose a buyer-owned STT provider and keep keys server-side only.",
  "Decide where transcripts live and set retention posture before launch.",
  "Route transcripts through the same policy and retrieval stack as text prompts.",
  "Validate latency and failure handling before enabling audio return paths.",
  "Treat TTS as optional until the text path is stable and benchmarked."
];
