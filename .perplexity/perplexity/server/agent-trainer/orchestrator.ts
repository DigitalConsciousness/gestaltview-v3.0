import { z } from "zod";
import { traceBraintrust } from "../../instrument.js";

import { resolveTrainerEmbodimentProfile } from "../../shared/agent-trainer/embodiment.js";
import { compileAgentMarkdown } from "../../shared/agent-trainer/compiler.js";
import { hasBlockingFindings, runLocalSafetyReview } from "../../shared/agent-trainer/policies.js";
import {
  AgentSpecSchema,
  CritiqueSchema,
  CurriculumSchema,
  EvalResultSchema,
  NormalizedTrainingBriefSchema,
  ScenarioSchema,
  SubmitTrainingRunRequestSchema,
  TrainingBriefSchema,
  type AgentSpec,
  type Critique,
  type Curriculum,
  type EvalResult,
  type EvalRubric,
  type NormalizedTrainingBrief,
  type Scenario,
  type SubmitTrainingRunRequest,
  type TrainingRunDetail,
} from "../../shared/agent-trainer/schemas.js";
import type { EmbodimentProfile } from "../../shared/embodiment/index.js";
import { defaultModelCatalog, ModelGateway, type RegisteredModel } from "./providers.js";
import {
  finishTrainingStep,
  getDefaultTrainerRubric,
  getTrainingRunDetail,
  isTrainingRunCancellationRequested,
  loadRegisteredModels,
  loadScenarioPack,
  markTrainingRunStatus,
  persistTrainingRunStudySelection,
  persistSyntheticScenarioPack,
  persistTrainingRunGraphObservations,
  recordTrainingRunEvent,
  replaceEvalResults,
  saveAgentVersion,
  startTrainingStep,
} from "./persistence.js";
import { buildTrainerStudyPack, type TrainerStudyPack } from "./study-sources.js";

interface StageResult<T> {
  value: T;
  providerSlug?: string | null;
  modelSlug?: string | null;
  estimatedCostUsd?: number | null;
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

class TrainerRunCancelledError extends Error {
  constructor() {
    super("Trainer run cancelled by operator.");
    this.name = "TrainerRunCancelledError";
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function unique(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function collectStudyTags(studyPack: TrainerStudyPack): string[] {
  return unique(
    studyPack.sources.flatMap((source) => [
      source.documentType.toLowerCase(),
      ...source.tags.map(slugify),
    ])
  ).slice(0, 8);
}

function selectTopStudySources(studyPack: TrainerStudyPack, limit = 3) {
  return studyPack.sources
    .filter((source) => source.kind !== "study_focus")
    .slice(0, limit);
}

function selectLocalSubagentSources(studyPack: TrainerStudyPack) {
  return studyPack.sources.filter(
    (source) =>
      source.kind === "source_file" &&
      (source.documentType.toLowerCase() === "agentspec" ||
        source.documentType.toLowerCase().startsWith("subagent/"))
  );
}

function selectReferenceSources(studyPack: TrainerStudyPack) {
  return studyPack.sources.filter(
    (source) =>
      source.kind === "source_file" && source.documentType.toLowerCase().startsWith("reference/")
  );
}

function parseSourceTools(source: TrainerStudyPack["sources"][number] | null): string[] {
  if (!source) {
    return [];
  }

  const taggedTools = source.tags
    .filter((tag) => tag.startsWith("tool:"))
    .map((tag) => tag.slice("tool:".length).trim())
    .filter(Boolean)
    .map((tool) =>
      tool
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    );
  if (taggedTools.length > 0) {
    return unique(taggedTools);
  }

  const excerptMatch = source.excerpt.match(/Tools:\s*([^.\n]+)/i);
  if (!excerptMatch?.[1]) {
    return [];
  }

  return unique(
    excerptMatch[1]
      .split(",")
      .map((tool) => tool.trim())
      .filter(Boolean)
  );
}

function behaviorToResponsibility(behavior: string): string {
  const cleaned = behavior.trim().replace(/[.]+$/, "");
  if (!cleaned) {
    return "";
  }

  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)} in real execution.`;
}

function behaviorToProcessStep(behavior: string): string {
  const cleaned = behavior.trim().replace(/[.]+$/, "");
  if (!cleaned) {
    return "";
  }

  return `Deliver ${cleaned} without losing scope or evidence.`;
}

function referenceDrivenProcessSteps(referenceSources: TrainerStudyPack["sources"]): string[] {
  const steps: string[] = [];

  for (const source of referenceSources) {
    const type = source.documentType.toLowerCase();
    if (type === "reference/routing") {
      steps.push("Map specialist roles, routing boundaries, and dependency handoffs before proposing the plan.");
    } else if (type === "reference/memory") {
      steps.push("Preserve shared state, retrieval context, and handoff memory explicitly across the workflow.");
    } else if (type === "reference/mcp") {
      steps.push("Name MCP client/server boundaries, tool exposure, and capability limits explicitly.");
    } else if (type === "reference/functioncalling") {
      steps.push("Define function schemas, argument contracts, and result ordering rules before implying tool use.");
    } else if (type === "reference/tooling") {
      steps.push("Describe tool contracts, registration patterns, and execution boundaries with implementation-level clarity.");
    }
  }

  return unique(steps);
}

function embodimentColor(profile: EmbodimentProfile) {
  if (profile.slug === "billy") {
    return "magenta" as const;
  }

  if (profile.slug === "the-guardian") {
    return "green" as const;
  }

  if (profile.slug === "the-architect" || profile.slug === "the-treasurer") {
    return "blue" as const;
  }

  if (profile.slug === "the-spectacle" || profile.slug === "the-algorithm") {
    return "red" as const;
  }

  if (profile.slug === "vibe-check" || profile.slug === "the-tailor") {
    return "yellow" as const;
  }

  return "cyan" as const;
}

function buildEmbodimentCompetencies(profile: EmbodimentProfile): string[] {
  const { immutableCore } = profile;

  return unique([
    `${profile.publicName} embodiment fidelity`,
    ...Object.values(immutableCore.cognitiveStrengths).slice(0, 2),
    ...collectPreferenceStrings(immutableCore.processingPreferences).slice(0, 2),
    ...immutableCore.linguisticPatterns.alwaysDoes.slice(0, 2),
    ...immutableCore.coreValues.slice(0, 2).map((value) => `${value} stewardship`),
    ...profile.skillGraph.slice(0, 2).map((skill) => skill.skillSlug.replace(/-/g, " ")),
  ]);
}

function collectPreferenceStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPreferenceStrings(entry));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectPreferenceStrings(entry)
    );
  }

  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  return [];
}

function buildEmbodimentConstraints(profile: EmbodimentProfile): string[] {
  const { immutableCore } = profile;

  return unique([
    ...immutableCore.linguisticPatterns.neverDoes.map((pattern) =>
      ensureSentence(`Do not ${pattern.replace(/^do not\s+/i, "")}`)
    ),
    ...Object.values(immutableCore.ethicalBoundaries).map((boundary) =>
      ensureSentence(boundary)
    ),
    ensureSentence(
      `Stay aligned with ${profile.publicName}'s core values: ${immutableCore.coreValues
        .slice(0, 3)
        .join(", ")}`
    ),
  ]);
}

function buildEmbodimentOutputGuidance(profile: EmbodimentProfile): string[] {
  const { immutableCore } = profile;

  return unique([
    `Voice: ${immutableCore.voiceTone}.`,
    `Directness: ${immutableCore.communicationStyle.directness}.`,
    `Verbosity: ${immutableCore.communicationStyle.verbosity}.`,
    ...immutableCore.linguisticPatterns.alwaysDoes
      .slice(0, 2)
      .map((pattern) => `Always: ${ensureSentence(pattern).replace(/\.$/, "")}.`),
  ]);
}

function studyPackSummary(studyPack: TrainerStudyPack, limit = 3): string {
  const titles = selectTopStudySources(studyPack, limit).map((source) => source.title);
  return titles.length > 0 ? titles.join(", ") : "no named study sources";
}

function buildStudyConstraints(studyPack: TrainerStudyPack): string[] {
  if (studyPack.sources.length === 0) {
    return [];
  }

  return [
    "Prefer the trainer study pack and collaboration memory over generic filler when they are relevant.",
    "Do not attribute claims to the study pack unless the grounding is visible in the provided excerpts.",
  ];
}

function loadTrainerBrief(run: TrainingRunDetail): SubmitTrainingRunRequest {
  const candidate = (run.routingPolicy as Record<string, unknown>).trainerInput;
  const parsed = SubmitTrainingRunRequestSchema.safeParse(candidate);

  if (parsed.success) {
    return parsed.data;
  }

  return TrainingBriefSchema.parse({
    slug: run.agent.slug,
    title: run.agent.title,
    domain: run.agent.domain,
    goal: run.goal,
    maxCycles: run.maxCycles,
    qualityThreshold: run.qualityThreshold,
    routingPolicy: run.routingPolicy,
  });
}

export function normalizeBrief(
  brief: SubmitTrainingRunRequest,
  studyPack: TrainerStudyPack
): NormalizedTrainingBrief {
  const embodiment = resolveTrainerEmbodimentProfile(brief);
  const goalSentences = splitSentences(brief.goal);
  const studyDrivenCompetencies = selectTopStudySources(studyPack).map(
    (source) => `${source.documentType.toLowerCase()} grounding from ${source.title}`
  );
  const embodimentCompetencies = buildEmbodimentCompetencies(embodiment);
  const inferredCompetencies = unique([
    ...brief.targetBehaviors,
    ...goalSentences.slice(0, 4).map((sentence) => sentence.replace(/^to\s+/i, "")),
    ...studyDrivenCompetencies,
    ...embodimentCompetencies,
    ...studyPack.understanding.preferredMoves.map((move) => move.replace(/\.$/, "")),
    `${brief.domain} context grounding`,
    "clear execution guidance",
    "scope discipline",
  ]).slice(0, 8);

  const constraints = unique([
    ...brief.antiGoals.map((goal) => `Do not ${goal.replace(/^do not\s+/i, "")}`),
    ...buildEmbodimentConstraints(embodiment),
    "Do not claim tools, authority, or data access that are not explicitly available.",
    "Keep outputs operationally concrete and easy to scan.",
    ...buildStudyConstraints(studyPack),
    ...studyPack.understanding.riskNotes,
  ]);

  return NormalizedTrainingBriefSchema.parse({
    ...brief,
    embodimentProfileSlug: embodiment.slug,
    competencies: inferredCompetencies,
    constraints,
    derivedTags: unique([
      brief.domain,
      brief.slug,
      `embodiment:${embodiment.slug}`,
      slugify(embodiment.immutableCore.archetype),
      ...brief.targetBehaviors.map(slugify),
      ...collectStudyTags(studyPack),
    ]),
  });
}

export function buildCurriculum(
  brief: NormalizedTrainingBrief,
  studyPack: TrainerStudyPack
): Curriculum {
  const embodiment = resolveTrainerEmbodimentProfile(brief);
  const studyResponsibilities = selectTopStudySources(studyPack).map(
    (source) => `source grounding from ${source.title}`
  );

  return CurriculumSchema.parse({
    competencies: unique([
      ...brief.competencies,
      ...buildEmbodimentCompetencies(embodiment),
      ...studyResponsibilities,
      ...studyPack.understanding.principles,
      "quality control",
      "useful next actions",
    ]).slice(0, 9),
    constraints: unique([
      ...brief.constraints,
      ...buildEmbodimentConstraints(embodiment),
    ]),
    antiGoals: brief.antiGoals,
    evaluationDimensions: [
      "task_success",
      "scope_discipline",
      "gestaltview_alignment",
      "embodiment_fidelity",
      ...(studyPack.sources.length > 0 ? ["source_fidelity"] : []),
      "clarity",
      "safety",
    ],
  });
}

function synthesizeScenarios(
  brief: SubmitTrainingRunRequest,
  curriculum: Curriculum,
  studyPack: TrainerStudyPack
): Scenario[] {
  const embodiment = resolveTrainerEmbodimentProfile(brief);
  const topSources = selectTopStudySources(studyPack, 3);
  const seeds = unique([
    ...topSources.map((source) => `Apply ${source.title} to ${brief.goal}`),
    ...studyPack.understanding.principles.map((principle) => `Apply this principle: ${principle}`),
    brief.goal,
    ...brief.targetBehaviors,
    ...curriculum.competencies,
  ]).slice(0, 3);

  return seeds.map((seed, index) => {
    const studySource = topSources[index] ?? topSources[0] ?? null;

    return ScenarioSchema.parse({
      title: studySource
        ? `${brief.title} scenario ${index + 1} · ${studySource.title}`
        : `${brief.title} scenario ${index + 1}`,
      difficulty: Math.min(5, index + 2),
      prompt_input: {
        user: `Help with this ${brief.domain} request: ${seed}`,
        context: [
          `Goal: ${brief.goal}`,
          `Embodiment anchor: ${embodiment.publicName}. ${embodiment.immutableCore.foundationalTruth}`,
          brief.studyFocus ? `Study focus: ${brief.studyFocus}` : "",
          studyPack.understanding.summary
            ? `Trainer understanding: ${studyPack.understanding.summary}`
            : "",
          studySource
            ? `Study source: ${studySource.title} (${studySource.documentType}). ${studySource.excerpt}`
            : "",
          studyPack.understanding.voiceNotes.length > 0
            ? `Voice guidance: ${studyPack.understanding.voiceNotes.join(" ")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
      expected_traits: unique([
        ...brief.targetBehaviors,
        `${embodiment.publicName} voice fidelity`,
        curriculum.competencies[index] ?? "clarity",
        ...embodiment.immutableCore.linguisticPatterns.alwaysDoes.slice(0, 1),
        ...(studySource ? [`${studySource.documentType.toLowerCase()} grounding`] : []),
        ...studyPack.understanding.preferredMoves.slice(0, 1),
      ]).slice(0, 4),
      disallowed_traits: unique([
        ...brief.antiGoals,
        ...embodiment.immutableCore.linguisticPatterns.neverDoes.slice(0, 1),
        "overclaiming",
        "unsafe authority",
        ...studyPack.understanding.riskNotes.slice(0, 1),
      ]).slice(0, 3),
      gold_answer: [
        `Address ${seed} directly.`,
        `Stay within ${brief.domain}.`,
        `Preserve ${embodiment.publicName} voice fidelity.`,
        studySource ? `Ground the response in ${studySource.title}.` : "",
        "Finish with concrete next steps.",
      ]
        .filter(Boolean)
        .join(" "),
      tags: unique([
        brief.domain,
        brief.slug,
        `embodiment-${embodiment.slug}`,
        "synthetic",
        ...(studySource ? [slugify(studySource.documentType), slugify(studySource.title)] : []),
      ]),
    });
  });
}

export function buildHeuristicAgentSpec(params: {
  brief: NormalizedTrainingBrief;
  curriculum: Curriculum;
  scenarios: Scenario[];
  critique: Critique | null;
  studyPack: TrainerStudyPack;
}): AgentSpec {
  const { brief, curriculum, scenarios, critique, studyPack } = params;
  const embodiment = resolveTrainerEmbodimentProfile(brief);
  const title = brief.title.trim();
  const revisionTargets = critique?.revisionTargets ?? [];
  const promptDeltas = critique?.promptDeltas ?? [];
  const referencedSources = selectTopStudySources(studyPack);
  const localSubagentSources = selectLocalSubagentSources(studyPack);
  const referenceSources = selectReferenceSources(studyPack);
  const primaryLocalSource = localSubagentSources[0] ?? null;
  const preservedTools = parseSourceTools(primaryLocalSource);
  const sourceSummary = studyPackSummary(studyPack);
  const understanding = studyPack.understanding;
  const roleSpecificProcess = referenceDrivenProcessSteps(referenceSources);
  const groundedDescription = primaryLocalSource
    ? `Use this agent when the task calls for ${title} behavior grounded in ${primaryLocalSource.title} and the trainer study pack (${sourceSummary}).`
    : `Use this agent when the task concerns ${brief.goal.trim()}.`;
  const roleLine = primaryLocalSource
    ? `You are ${title}, a GestaltView specialist shaped by the local ${primaryLocalSource.title} pattern for ${brief.domain}.`
    : `You are ${title}, a specialized GestaltView agent for ${brief.domain}.`;

  return AgentSpecSchema.parse({
    name: brief.slug,
    title,
    domain: brief.domain,
    description: `${groundedDescription} Anchor the agent in the ${embodiment.publicName} embodiment profile (${embodiment.slug}), preserving ${embodiment.immutableCore.voiceTone} voice, ${embodiment.immutableCore.processingPreferences.problemApproach} reasoning, ${understanding.summary.toLowerCase()}, and concrete execution guidance.`,
    color: embodimentColor(embodiment),
    tools: preservedTools.length > 0 ? preservedTools : undefined,
    examples: scenarios.slice(0, 3).map((scenario, index) => {
      const studySource = referencedSources[index] ?? referencedSources[0] ?? null;

      return {
        context: scenario.prompt_input.context || `Domain: ${brief.domain}`,
        user: scenario.prompt_input.user,
        assistant_approach: studySource
          ? `I’ll use ${title} to handle this ${brief.domain} request with direct guidance, scoped recommendations, and grounding from ${studySource.title}.`
          : `I’ll use ${title} to handle this ${brief.domain} request with direct guidance, scoped recommendations, and a clear finish.`,
        commentary:
          scenario.expected_traits.join(", ") ||
          "The agent should stay concrete, aligned, and scoped.",
      };
    }),
    system_prompt: {
      role: `${roleLine} Embodiment anchor: ${embodiment.immutableCore.foundationalTruth} Core wisdom: ${embodiment.immutableCore.coreWisdom} ${brief.goal} ${understanding.summary} Use the trainer study pack when it materially improves fidelity, and preserve the explicit capability boundaries from the selected local sources.`,
      core_responsibilities: unique([
        `Preserve the ${embodiment.publicName} embodiment standard: ${embodiment.immutableCore.voiceTone}.`,
        ...brief.targetBehaviors.map(behaviorToResponsibility),
        ...embodiment.immutableCore.linguisticPatterns.alwaysDoes
          .slice(0, 2)
          .map((pattern) => `Always ${pattern}.`),
        primaryLocalSource
          ? `Preserve the role posture and execution discipline demonstrated by ${primaryLocalSource.title}.`
          : "",
        ...referenceSources.map((source) => `Use ${source.title} to shape capability boundaries and implementation guidance.`),
        ...understanding.principles.map((principle) => `Apply this principle: ${principle}`),
        "Surface the best next move quickly.",
        "Stay tightly within scope and evidence.",
      ]).slice(0, 7),
      process_steps: unique([
        "Orient to the user's goal, urgency, and domain context.",
        `Work from ${embodiment.immutableCore.processingPreferences.problemApproach} reasoning before jumping to output.`,
        primaryLocalSource
          ? `Check the local ${primaryLocalSource.title} pattern before generalizing into a generic assistant answer.`
          : "Check the trainer study pack and collaboration memory before generalizing.",
        ...roleSpecificProcess,
        ...brief.targetBehaviors.map(behaviorToProcessStep),
        ...embodiment.immutableCore.linguisticPatterns.alwaysDoes
          .slice(0, 2)
          .map((pattern) => ensureSentence(pattern)),
        ...understanding.preferredMoves,
        "Select only the most relevant GestaltView capabilities, examples, or evidence.",
        "Deliver the answer in a concise structure with direct recommendations.",
        "State risks, tradeoffs, or blockers explicitly when they matter.",
        "Close with the smallest useful next actions.",
        ...promptDeltas,
      ]).slice(0, 7),
      output_format: unique([
        "Lead with the answer or diagnosis.",
        "Use short sections or flat bullets only when they materially help scanning.",
        ...buildEmbodimentOutputGuidance(embodiment),
        "Name the specific source or memory when it materially shaped the answer.",
        ...understanding.voiceNotes.map((note) => `Voice: ${note}`),
        "Include specific next actions when appropriate.",
        ...revisionTargets.map((target) => `Address: ${target}`),
      ]).slice(0, 6),
    },
    constraints: unique([
      ...curriculum.constraints,
      ...buildEmbodimentConstraints(embodiment),
      ...brief.antiGoals.map((goal) => `Avoid ${goal}`),
      ...understanding.riskNotes.map((risk) => `Avoid: ${risk}`),
      primaryLocalSource && preservedTools.length > 0
        ? `Only imply tools that are explicitly preserved in this agent spec: ${preservedTools.join(", ")}.`
        : "",
      "Never invent deployment authority, unrestricted tool use, or hidden context.",
    ]),
    handoff_rules: unique([
      `Hand off when the request moves outside ${brief.domain}.`,
      "Escalate when approval, production changes, or high-stakes risk is involved.",
      ...Object.keys(embodiment.immutableCore.ethicalBoundaries)
        .slice(0, 1)
        .map((key) => `Escalate when ${humanizeKey(key).toLowerCase()} is at risk.`),
      ...revisionTargets.map((target) => `Escalate if ${target.toLowerCase()}.`),
    ]).slice(0, 5),
    tags: unique([
      brief.domain,
      brief.slug,
      `embodiment:${embodiment.slug}`,
      slugify(embodiment.immutableCore.archetype),
      ...embodiment.immutableCore.coreValues.slice(0, 2).map(slugify),
      ...brief.targetBehaviors.map(slugify),
      ...collectStudyTags(studyPack),
    ]),
  });
}

async function authorWithModel(params: {
  gateway: ModelGateway;
  brief: NormalizedTrainingBrief;
  curriculum: Curriculum;
  scenarios: Scenario[];
  critique: Critique | null;
  studyPack: TrainerStudyPack;
}): Promise<StageResult<AgentSpec>> {
  const embodiment = resolveTrainerEmbodimentProfile(params.brief);
  const authoringInput = {
    brief: params.brief,
    embodiment: {
      slug: embodiment.slug,
      publicName: embodiment.publicName,
      foundationalTruth: embodiment.immutableCore.foundationalTruth,
      coreWisdom: embodiment.immutableCore.coreWisdom,
      voiceTone: embodiment.immutableCore.voiceTone,
      communicationStyle: embodiment.immutableCore.communicationStyle,
      coreValues: embodiment.immutableCore.coreValues,
      alwaysDoes: embodiment.immutableCore.linguisticPatterns.alwaysDoes,
      neverDoes: embodiment.immutableCore.linguisticPatterns.neverDoes,
      ethicalBoundaries: embodiment.immutableCore.ethicalBoundaries,
      processingPreferences: embodiment.immutableCore.processingPreferences,
      cognitiveStrengths: embodiment.immutableCore.cognitiveStrengths,
    },
    curriculum: params.curriculum,
    scenarios: params.scenarios,
    critique: params.critique,
    studyPack: {
      sourceFiles: params.studyPack.sourceFiles,
      memoryCount: params.studyPack.memoryCount,
      warnings: params.studyPack.warnings,
      understanding: params.studyPack.understanding,
      sources: params.studyPack.sources.map((source) => ({
        kind: source.kind,
        title: source.title,
        reference: source.reference,
        documentType: source.documentType,
        excerpt: source.excerpt,
        tags: source.tags,
      })),
      contextBlock: params.studyPack.contextBlock,
    },
  };

  const estimatedCost = await traceBraintrust(
    {
      name: "trainer author estimate",
      type: "task",
      metadata: {
        brief: params.brief.slug,
        embodiment: embodiment.slug,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({ input: authoringInput, metadata: { stage: "estimate" } });
      return params.gateway.estimate("structured_generation", {
        messages: [
          {
            role: "system",
            content:
              "You write deterministic GestaltView agent specs as JSON only, grounded in the provided embodiment profile, study pack, and synthesized understanding.",
          },
          {
            role: "user",
            content: JSON.stringify(authoringInput, null, 2),
          },
        ],
      });
    },
  );

  const { value, model } = await traceBraintrust(
    {
      name: "trainer author spec",
      type: "llm",
      metadata: {
        brief: params.brief.slug,
        embodiment: embodiment.slug,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({ input: authoringInput, metadata: { stage: "structured_generation" } });
      return params.gateway.structured("structured_generation", {
        schema: AgentSpecSchema,
        schemaName: "AgentSpec",
        messages: [
          {
            role: "system",
            content: [
              "You are the GestaltView Agent Author and Trainer Expert.",
              "Return only valid JSON matching the AgentSpec schema.",
              "Treat the supplied embodiment profile as the canonical source for voice, values, and constraints.",
              "Prefer the supplied study pack, synthesized understanding, and collaboration memory over generic filler.",
              "Do not reference Anthropic or banned provider names.",
              "Include explicit constraints and handoff rules.",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify(authoringInput, null, 2),
          },
        ],
      });
    },
  );

  return {
    value,
    providerSlug: model.providerSlug,
    modelSlug: model.modelSlug,
    estimatedCostUsd: estimatedCost.estimatedUsd,
  };
}

function buildTokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  );
}

function overlapScore(a: string, b: string): number {
  const aTokens = buildTokenSet(a);
  const bTokens = buildTokenSet(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(1, Math.min(aTokens.size, bTokens.size));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, Number(value.toFixed(2))));
}

function evaluateScenario(params: {
  scenario: Scenario;
  rubric: EvalRubric;
  spec: AgentSpec;
  markdown: string;
  safetyPassed: boolean;
}): EvalResult {
  const corpus = [
    params.spec.description,
    params.spec.system_prompt.role,
    ...params.spec.system_prompt.core_responsibilities,
    ...params.spec.system_prompt.process_steps,
    ...params.spec.system_prompt.output_format,
    ...params.spec.constraints,
    ...params.spec.handoff_rules,
  ].join("\n");

  const expected = params.scenario.expected_traits.join(" ");
  const disallowed = params.scenario.disallowed_traits.join(" ");
  const briefOverlap = overlapScore(corpus, `${params.scenario.prompt_input.user} ${expected}`);
  const penalty = overlapScore(corpus, disallowed);
  const clarityBoost =
    Math.min(1, params.spec.system_prompt.output_format.length / 4) +
    Math.min(1, params.spec.system_prompt.process_steps.length / 5);

  const dimensionScores = Object.fromEntries(
    params.rubric.dimensions.map((dimension) => {
      const key = dimension.key.toLowerCase();
      let score = 3.2;

      if (key.includes("task")) {
        score = 2.6 + briefOverlap * 2.2 - penalty * 0.5;
      } else if (key.includes("scope")) {
        score = 3 + params.spec.constraints.length * 0.22 + params.spec.handoff_rules.length * 0.18 - penalty;
      } else if (key.includes("align")) {
        score = 2.8 + overlapScore(corpus, `${params.spec.domain} gestaltview ${params.spec.title}`) * 2;
      } else if (key.includes("clar")) {
        score = 2.9 + clarityBoost * 1.3;
      } else if (key.includes("safe")) {
        score = params.safetyPassed ? 4.3 - penalty : 2.2 - penalty;
      }

      return [dimension.key, clampScore(score)];
    })
  );

  const weightedTotal = params.rubric.dimensions.reduce((sum, dimension) => {
    return sum + (dimensionScores[dimension.key] ?? 0) * dimension.weight;
  }, 0);
  const weightTotal = params.rubric.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0) || 1;
  const overallScore = clampScore(weightedTotal / weightTotal);
  const verdict =
    overallScore >= params.rubric.passThreshold && params.safetyPassed
      ? "pass"
      : overallScore >= params.rubric.passThreshold - 0.5
        ? "warning"
        : "fail";

  return EvalResultSchema.parse({
    scenarioId: params.scenario.scenario_id ?? slugify(params.scenario.title),
    scenarioTitle: params.scenario.title,
    dimensionScores,
    overallScore,
    verdict,
    rationale: [
      `Expected overlap: ${briefOverlap.toFixed(2)}.`,
      `Disallowed overlap: ${penalty.toFixed(2)}.`,
      `Markdown length: ${params.markdown.split(/\s+/).filter(Boolean).length} words.`,
    ].join(" "),
  });
}

function averageScore(results: EvalResult[]): number {
  if (results.length === 0) return 0;
  return Number(
    (results.reduce((sum, result) => sum + result.overallScore, 0) / results.length).toFixed(2)
  );
}

function critiqueCandidate(params: {
  rubric: EvalRubric;
  results: EvalResult[];
  safetyFindingCount: number;
}): Critique {
  const dimensionAverages = new Map<string, number>();
  const dimensionCounts = new Map<string, number>();

  for (const result of params.results) {
    for (const [dimension, score] of Object.entries(result.dimensionScores)) {
      dimensionAverages.set(dimension, (dimensionAverages.get(dimension) ?? 0) + score);
      dimensionCounts.set(dimension, (dimensionCounts.get(dimension) ?? 0) + 1);
    }
  }

  const weakest = params.rubric.dimensions
    .map((dimension) => ({
      key: dimension.key,
      average:
        (dimensionAverages.get(dimension.key) ?? 0) / Math.max(1, dimensionCounts.get(dimension.key) ?? 1),
    }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  return CritiqueSchema.parse({
    summary: weakest.length
      ? `Weakest dimensions: ${weakest
          .map((item) => `${item.key} ${item.average.toFixed(2)}`)
          .join(", ")}.`
      : "No evaluation results were produced.",
    revisionTargets: weakest.map((item) => `Raise ${item.key.replace(/_/g, " ")} above threshold.`),
    promptDeltas: [
      "Tighten scope and authority language.",
      "Make the answer format more obviously actionable.",
      ...(params.safetyFindingCount > 0 ? ["Add explicit safety and escalation language."] : []),
    ],
  });
}

async function runStage<T>(params: {
  runId: string;
  cycleNo: number;
  stage: Parameters<typeof startTrainingStep>[0]["stage"];
  requestPayload: unknown;
  fn: () => Promise<StageResult<T>> | StageResult<T>;
}): Promise<StageResult<T>> {
  if (await isTrainingRunCancellationRequested(params.runId)) {
    throw new TrainerRunCancelledError();
  }

  const stepId = await startTrainingStep({
    runId: params.runId,
    cycleNo: params.cycleNo,
    stage: params.stage,
    requestPayload: params.requestPayload,
  });

  const startedAt = Date.now();

  try {
    const result = await traceBraintrust(
      {
        name: `training stage ${params.stage}`,
        type: "task",
        metadata: {
          runId: params.runId,
          cycleNo: params.cycleNo,
          stage: params.stage,
        },
      },
      async (span: BraintrustSpan | null) => {
        span?.log({
          input: params.requestPayload,
          metadata: { runId: params.runId, cycleNo: params.cycleNo, stage: params.stage },
        });
        return params.fn();
      },
    );
    await finishTrainingStep({
      stepId,
      runId: params.runId,
      stage: params.stage,
      cycleNo: params.cycleNo,
      status: "completed",
      responsePayload: {
        providerSlug: result.providerSlug ?? null,
        modelSlug: result.modelSlug ?? null,
        value: result.value,
      },
      latencyMs: Date.now() - startedAt,
      estimatedCostUsd: result.estimatedCostUsd ?? null,
    });
    return result;
  } catch (error) {
    await finishTrainingStep({
      stepId,
      runId: params.runId,
      stage: params.stage,
      cycleNo: params.cycleNo,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - startedAt,
    });
    throw error;
  }
}

export async function runTraining(runId: string): Promise<TrainingRunDetail> {
  const run = await getTrainingRunDetail(runId);
  if (run.status === "cancelled") {
    return run;
  }
  return traceBraintrust(
    {
      name: "trainer run orchestration",
      type: "task",
      metadata: {
        runId,
        status: run.status,
        executionMode: run.executionMode,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        metadata: {
          runId,
          status: run.status,
          executionMode: run.executionMode,
          requestedBy: run.requestedBy,
        },
      });

      const brief = loadTrainerBrief(run);
      const registeredModels = await loadRegisteredModels();
      const gateway = new ModelGateway(
        registeredModels.length > 0 ? registeredModels : defaultModelCatalog(),
        brief.routingPolicy
      );
      const rubric = getDefaultTrainerRubric();
      const hyperagentMode = run.executionMode === "hyperagent";
      let studyPack: TrainerStudyPack = {
        sources: [],
        understanding: {
          summary: "No synthesized trainer understanding was available for this run.",
          principles: [],
          voiceNotes: [],
          riskNotes: [],
          preferredMoves: [],
          evidenceRefs: [],
        },
        warnings: [],
        contextBlock:
          "=== TRAINER UNDERSTANDING ===\n\nSummary: No synthesized trainer understanding was available for this run.\n\n=== TRAINER STUDY PACK ===\n\nNo live study sources were loaded for this run.",
        sourceFiles: [],
        memoryCount: 0,
      };

      if (run.status !== "running") {
        await markTrainingRunStatus(runId, "running", {
          started_at: run.startedAt ?? new Date().toISOString(),
          blocked_reason: null,
        });
      }

      let previousVersionId = run.latestVersion?.versionId ?? run.baselineVersionId ?? null;
      let currentCritique: Critique | null = null;

      try {
        if (hyperagentMode) {
          await recordTrainingRunEvent({
            runId,
            actorType: "system",
            eventType: "hyperagent_graph_resolved",
            message: "Hyperagent mode enabled for this run.",
            payload: {
              resolvedGraph: run.resolvedGraph ?? null,
            },
            blockedReason: null,
          }).catch(() => undefined);
        }

    try {
      studyPack = await buildTrainerStudyPack({
        brief,
        userId: run.requestedBy,
      });
      await persistTrainingRunStudySelection({
        runId,
        sourceFiles: studyPack.sourceFiles,
        understanding: studyPack.understanding as unknown as Record<string, unknown>,
      }).catch(() => undefined);
      await recordTrainingRunEvent({
        runId,
        actorType: "system",
        eventType: "study_sources_selected",
        message:
          studyPack.sourceFiles.length > 0
            ? `Selected ${studyPack.sourceFiles.length} study source files for this run.`
            : "No explicit study source files were available for this run.",
        payload: {
          sourceFiles: studyPack.sourceFiles,
          warnings: studyPack.warnings,
        },
        blockedReason: null,
      }).catch(() => undefined);
    } catch (error) {
      studyPack = {
        ...studyPack,
        warnings: [
          `Failed to load trainer study pack: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }

    const normalized = await runStage<ReturnType<typeof normalizeBrief>>({
      runId,
      cycleNo: 1,
      stage: "normalize",
      requestPayload: {
        brief,
        studySourceFiles: studyPack.sourceFiles,
        studyWarnings: studyPack.warnings,
        studyMemoryCount: studyPack.memoryCount,
        studyUnderstanding: studyPack.understanding,
      },
      fn: async () => ({
        value: normalizeBrief(brief, studyPack),
        providerSlug: "local",
        modelSlug: "study-pack-normalizer",
        estimatedCostUsd: 0,
      }),
    });
    const normalizedBrief = normalized.value;

    const curriculumStage = await runStage<Curriculum>({
      runId,
      cycleNo: 1,
      stage: "curriculum",
      requestPayload: {
        normalizedBrief,
        studyPack: {
          sourceFiles: studyPack.sourceFiles,
          memoryCount: studyPack.memoryCount,
          understanding: studyPack.understanding,
        },
      },
      fn: async () => ({
        value: buildCurriculum(normalizedBrief, studyPack),
        providerSlug: "local",
        modelSlug: "study-pack-curriculum",
        estimatedCostUsd: 0,
      }),
    });

    let scenarios = await loadScenarioPack(brief.scenarioSetIds);
    if (scenarios.length === 0) {
      scenarios = await persistSyntheticScenarioPack({
        runId,
        domain: brief.domain,
        title: brief.title,
        scenarios: synthesizeScenarios(normalizedBrief, curriculumStage.value, studyPack),
      });
    }

    await runStage<Scenario[]>({
      runId,
      cycleNo: 1,
      stage: "scenario_expand",
      requestPayload: {
        scenarioSetIds: brief.scenarioSetIds,
        studySourceFiles: studyPack.sourceFiles,
        studyUnderstanding: studyPack.understanding,
      },
      fn: async () => ({
        value: scenarios,
        providerSlug: "local",
        modelSlug: "study-pack-scenario-synthesizer",
        estimatedCostUsd: 0,
      }),
    });

    for (let cycleNo = 1; cycleNo <= brief.maxCycles; cycleNo += 1) {
      const authorStage: StageResult<AgentSpec> = await runStage<AgentSpec>({
        runId,
        cycleNo,
        stage: "author",
        requestPayload: {
          brief: normalizedBrief,
          curriculum: curriculumStage.value,
          critique: currentCritique,
          scenarios,
          studyPack: {
            sourceFiles: studyPack.sourceFiles,
            memoryCount: studyPack.memoryCount,
            warnings: studyPack.warnings,
            understanding: studyPack.understanding,
          },
        },
        fn: async (): Promise<StageResult<AgentSpec>> => {
          try {
            return await authorWithModel({
              gateway,
              brief: normalizedBrief,
              curriculum: curriculumStage.value,
              scenarios,
              critique: currentCritique,
              studyPack,
            });
          } catch {
            return {
              value: buildHeuristicAgentSpec({
                brief: normalizedBrief,
                curriculum: curriculumStage.value,
                scenarios,
                critique: currentCritique,
                studyPack,
              }),
              providerSlug: "offline",
              modelSlug: "deterministic-fallback",
              estimatedCostUsd: 0,
            };
          }
        },
      });

      const packageStage = await runStage<{ markdown: string }>({
        runId,
        cycleNo,
        stage: "package",
        requestPayload: { spec: authorStage.value },
        fn: async () => ({
          value: { markdown: compileAgentMarkdown(authorStage.value) },
          providerSlug: authorStage.providerSlug ?? null,
          modelSlug: authorStage.modelSlug ?? null,
          estimatedCostUsd: authorStage.estimatedCostUsd ?? null,
        }),
      });

      const safetyStage = await runStage<ReturnType<typeof runLocalSafetyReview>>({
        runId,
        cycleNo,
        stage: "safety",
        requestPayload: { spec: authorStage.value },
        fn: async () => ({
          value: runLocalSafetyReview(authorStage.value, packageStage.value.markdown),
          providerSlug: "local",
          modelSlug: "policy-linter",
          estimatedCostUsd: 0,
        }),
      });

      const version = await saveAgentVersion({
        agentId: run.agent.agentId!,
        runId,
        parentVersionId: previousVersionId,
        spec: authorStage.value,
        changeSummary: currentCritique?.summary ?? null,
      });
      previousVersionId = version.versionId;

      const evalStage: StageResult<EvalResult[]> = await runStage<EvalResult[]>({
        runId,
        cycleNo,
        stage: "evaluate",
        requestPayload: { versionId: version.versionId, scenarioCount: scenarios.length },
        fn: async (): Promise<StageResult<EvalResult[]>> => ({
          value: scenarios.map((scenario) =>
            evaluateScenario({
              scenario,
              rubric,
              spec: authorStage.value,
              markdown: packageStage.value.markdown,
              safetyPassed: safetyStage.value.passed,
            })
          ),
          providerSlug: "local",
          modelSlug: "heuristic-evaluator",
          estimatedCostUsd: 0,
        }),
      });

      await replaceEvalResults(runId, version.versionId, evalStage.value, rubric);

      const overall = averageScore(evalStage.value);
      const passing =
        overall >= brief.qualityThreshold &&
        overall >= rubric.passThreshold &&
        safetyStage.value.passed &&
        !hasBlockingFindings(safetyStage.value.findings);

      if (passing) {
        await markTrainingRunStatus(runId, "awaiting_review", {
          blocked_reason: "Waiting for admin review and approval.",
        });
        await recordTrainingRunEvent({
          runId,
          actorType: "system",
          eventType: "awaiting_review",
          message: "Training completed and is now awaiting review.",
          blockedReason: "Waiting for admin review and approval.",
        }).catch(() => undefined);
        return getTrainingRunDetail(runId);
      }

      currentCritique = await runStage<Critique>({
        runId,
        cycleNo,
        stage: "critique",
        requestPayload: { evalResults: evalStage.value, safety: safetyStage.value },
        fn: async () => ({
          value: critiqueCandidate({
            rubric,
            results: evalStage.value,
            safetyFindingCount: safetyStage.value.findings.length,
          }),
          providerSlug: "local",
          modelSlug: "deterministic-critic",
          estimatedCostUsd: 0,
        }),
      }).then((result) => result.value);
    }

    if (hyperagentMode) {
      await persistTrainingRunGraphObservations({
        runId,
        observations: {
          mode: "hyperagent",
          completedAt: new Date().toISOString(),
          cycleCount: brief.maxCycles,
          studySourceCount: studyPack.sourceFiles.length,
          connectorNodes:
            Array.isArray((run.resolvedGraph as Record<string, unknown> | null)?.connectorGraph)
              ? ((run.resolvedGraph as Record<string, unknown>).connectorGraph as unknown[]).length
              : null,
        },
      }).catch(() => undefined);
    }

    await markTrainingRunStatus(runId, "failed", {
      completed_at: new Date().toISOString(),
      blocked_reason: "Training exhausted all cycles without meeting threshold.",
    });
    await recordTrainingRunEvent({
      runId,
      actorType: "system",
      eventType: "run_failed",
      message: "Training exhausted all cycles without meeting threshold.",
      blockedReason: "Training exhausted all cycles without meeting threshold.",
    }).catch(() => undefined);
    return getTrainingRunDetail(runId);
  } catch (error) {
    if (error instanceof TrainerRunCancelledError) {
      await markTrainingRunStatus(runId, "cancelled", {
        completed_at: new Date().toISOString(),
        blocked_reason: null,
      });
      await recordTrainingRunEvent({
        runId,
        actorType: "worker",
        eventType: "run_cancelled",
        message: "Training stopped after a cancel request.",
        blockedReason: null,
      }).catch(() => undefined);
      return getTrainingRunDetail(runId);
    }

    const message = error instanceof Error ? error.message : String(error);
    await markTrainingRunStatus(runId, "failed", {
      completed_at: new Date().toISOString(),
      blocked_reason: message,
    });
    await recordTrainingRunEvent({
      runId,
      actorType: "system",
      eventType: "run_failed",
      message,
      blockedReason: message,
    }).catch(() => undefined);
    throw error;
  }
    }
  );
}

export async function loadHealthSummary(): Promise<{
  authoring: RegisteredModel;
}> {
  const models = await loadRegisteredModels();
  const fallback = defaultModelCatalog();
  const gateway = new ModelGateway(models.length > 0 ? models : fallback, {
    preferLocal: true,
    allowRemoteFallback: true,
    maxSchemaFailuresPerStage: 2,
    preferredProviders: {},
  });

  return {
    authoring: gateway.selectModel("structured_generation"),
  };
}
