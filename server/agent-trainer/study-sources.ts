import { promises as fs } from "node:fs";
import path from "node:path";

import { retrieveCollaborationMemories } from "../../api/_lib/memory.js";
import type { RetrievedMemoryEntry } from "../../shared/billy/types.js";
import type {
  SubmitTrainingRunRequest,
  TrainerStudySourceRecommendation,
  TrainerStudySourceSummary,
} from "../../shared/agent-trainer/schemas.js";
import {
  findLocalAgentEntryBySourceFile,
  isLocalAgentSourceFile,
  listLocalAgentEntries,
  loadLocalAgentMarkdownBySourceFile,
  type LocalAgentCatalogEntry,
} from "./catalog.js";
import { getTrainerSupabaseAdmin, hasTrainerSupabaseConfig } from "./supabaseAdmin.js";

interface KnowledgeFragmentRow {
  source_file: string;
  document_type: string;
  chunk_index: number;
  content: string;
  tags: string[] | null;
}

interface LocalReferenceBundle {
  sourceFile: string;
  title: string;
  documentType: string;
  description: string;
  tags: string[];
  keywords: string[];
  files: string[];
  preferredCategorySlugs?: string[];
  preferredAgentSlugs?: string[];
  preferredDomains?: string[];
}

export interface TrainerStudySource {
  kind: "source_file" | "shared_memory" | "study_focus";
  title: string;
  reference: string;
  documentType: string;
  excerpt: string;
  tags: string[];
}

export interface TrainerStudyUnderstanding {
  summary: string;
  principles: string[];
  voiceNotes: string[];
  riskNotes: string[];
  preferredMoves: string[];
  evidenceRefs: string[];
}

export interface TrainerStudyPack {
  sources: TrainerStudySource[];
  understanding: TrainerStudyUnderstanding;
  warnings: string[];
  contextBlock: string;
  sourceFiles: string[];
  memoryCount: number;
}

// Minimum meaningful query length before we bother firing a vector search.
// Queries shorter than this are either empty or so thin that a full cosine
// similarity scan across the entire embeddings corpus produces noise and
// can stall the Promise.all that drives recommendTrainerStudySources.
const VECTOR_SEARCH_MIN_QUERY_LENGTH = 12;

// Hard timeout (ms) on the trainer_search_study_sources RPC call.
// Prevents a slow Postgres vector scan from hanging the full response.
const VECTOR_SEARCH_TIMEOUT_MS = 8_000;
const LIST_SOURCES_TIMEOUT_MS = 5_000;

const FALLBACK_TRAINER_STUDY_SOURCES: TrainerStudySourceSummary[] = [
  {
    sourceFile: "Seed Prompts/God Mode.pdf",
    documentType: "Diligence",
    fragmentCount: 1025,
    sampleExcerpt: "Seed prompt corpus with high-density founder and behavior context.",
  },
  {
    sourceFile: "Seed Prompts/seed_prompts.pdf",
    documentType: "Diligence",
    fragmentCount: 873,
    sampleExcerpt: "General GestaltView seed prompt corpus.",
  },
  {
    sourceFile: "Manifest.md",
    documentType: "ManifestIndex",
    fragmentCount: 9,
    sampleExcerpt: "Compendium manifest describing the long-memory archive and live runtime.",
  },
  {
    sourceFile: "Billy/BILLY_FULL_INTEGRATION_COMPLETE.md",
    documentType: "Billy",
    fragmentCount: 26,
    sampleExcerpt: "Billy integration reference.",
  },
  {
    sourceFile: "Billy/SQLITE_Billy_Setup.md",
    documentType: "Billy",
    fragmentCount: 8,
    sampleExcerpt: "Billy runtime setup notes.",
  },
  {
    sourceFile: "PLK/plk_system (1).txt",
    documentType: "PLK",
    fragmentCount: 30,
    sampleExcerpt: "PLK system description.",
  },
  {
    sourceFile: "PLK/gestaltview-plk (1).txt",
    documentType: "PLK",
    fragmentCount: 26,
    sampleExcerpt: "GestaltView PLK reference.",
  },
];

const LOCAL_AGENT_CATEGORY_PRIORITY = [
  "meta-orchestration",
  "core-development",
  "developer-experience",
  "data-ai",
  "language-specialists",
  "quality-security",
  "infrastructure",
  "specialized-domains",
  "business-product",
  "research-analysis",
] as const;

const LOCAL_REFERENCE_BUNDLES: LocalReferenceBundle[] = [
  {
    sourceFile: "agents/references/bundles/function-calling-patterns",
    title: "Function Calling Patterns",
    documentType: "Reference/FunctionCalling",
    description:
      "OpenAI-style function schemas, tool-call loops, argument handling, and parallel function-calling patterns.",
    tags: ["local-reference", "function-calling", "tools", "parallel-calls"],
    keywords: ["function", "functions", "function_call", "tool", "tools", "parallel", "schema", "arguments"],
    preferredCategorySlugs: ["core-development", "developer-experience", "language-specialists", "data-ai"],
    preferredDomains: ["developer-experience", "operations", "general"],
    files: [
      "agents/references/examples/function_calling.py",
      "agents/references/examples/function_calling_in_parallel.py",
      "agents/references/qwen_agent/llm/function_calling.py",
    ],
  },
  {
    sourceFile: "agents/references/bundles/custom-tool-and-registry-patterns",
    title: "Custom Tool And Registry Patterns",
    documentType: "Reference/Tooling",
    description:
      "Patterns for registering tools, defining JSON-schema parameters, and wiring custom tool capabilities into an assistant.",
    tags: ["local-reference", "tool-registry", "custom-tools", "capabilities"],
    keywords: ["tool", "tools", "register", "registry", "schema", "custom", "abilities", "capabilities"],
    preferredCategorySlugs: ["core-development", "developer-experience"],
    preferredAgentSlugs: ["mcp-developer", "tooling-engineer", "cli-developer"],
    preferredDomains: ["developer-experience", "operations", "general"],
    files: [
      "agents/references/examples/assistant_add_custom_tool.py",
      "agents/references/qwen_agent/tools/base.py",
      "agents/references/src/tools/tool-registry.js",
    ],
  },
  {
    sourceFile: "agents/references/bundles/mcp-tooling-patterns",
    title: "MCP Tooling Patterns",
    documentType: "Reference/MCP",
    description:
      "Reference material for MCP-backed tool discovery, resource exposure, and assistant wiring against MCP servers.",
    tags: ["local-reference", "mcp", "resources", "tool-discovery"],
    keywords: ["mcp", "resource", "resources", "server", "servers", "sqlite", "tool", "tools"],
    preferredCategorySlugs: ["developer-experience", "infrastructure", "data-ai"],
    preferredAgentSlugs: ["mcp-developer", "database-administrator", "platform-engineer"],
    preferredDomains: ["developer-experience", "infrastructure", "operations"],
    files: [
      "agents/references/examples/assistant_mcp_sqlite_bot.py",
      "agents/references/qwen_agent/tools/mcp_manager.py",
    ],
  },
  {
    sourceFile: "agents/references/bundles/multi-agent-routing-patterns",
    title: "Multi Agent Routing Patterns",
    documentType: "Reference/Routing",
    description:
      "Examples of router-based delegation across specialist agents and tool-capable assistants.",
    tags: ["local-reference", "multi-agent", "routing", "delegation"],
    keywords: ["multi-agent", "routing", "router", "delegate", "delegation", "assistant", "orchestrate"],
    preferredCategorySlugs: ["meta-orchestration", "data-ai"],
    preferredAgentSlugs: [
      "agent-organizer",
      "knowledge-synthesizer",
      "multi-agent-coordinator",
      "task-distributor",
      "workflow-orchestrator",
    ],
    preferredDomains: ["meta-orchestration", "operations"],
    files: [
      "agents/references/examples/multi_agent_router.py",
      "agents/references/qwen_agent/agents/router.py",
    ],
  },
  {
    sourceFile: "agents/references/bundles/retrieval-and-memory-tool-patterns",
    title: "Retrieval And Memory Tool Patterns",
    documentType: "Reference/Memory",
    description:
      "Reference implementations for retrieval, document parsing, and memory-oriented tool use.",
    tags: ["local-reference", "retrieval", "memory", "document-tools"],
    keywords: ["memory", "retrieval", "rag", "document", "parser", "search", "vector", "tool"],
    preferredCategorySlugs: ["meta-orchestration", "data-ai", "developer-experience"],
    preferredAgentSlugs: ["context-manager", "knowledge-synthesizer", "search-specialist", "data-researcher"],
    preferredDomains: ["meta-orchestration", "data-ai", "operations"],
    files: [
      "agents/references/examples/virtual_memory_qa.py",
      "agents/references/qwen_agent/memory/memory.py",
      "agents/references/qwen_agent/tools/retrieval.py",
    ],
  },
] as const;

const SOURCE_GUIDANCE_RULES: Array<{
  matches: (source: TrainerStudySource) => boolean;
  principles: string[];
  voiceNotes: string[];
  riskNotes: string[];
  preferredMoves: string[];
}> = [
  {
    matches: (source) =>
      source.kind === "study_focus" || source.documentType.toLowerCase() === "directive",
    principles: [
      "Treat the explicit study focus as an operational routing constraint, not optional flavor.",
    ],
    voiceNotes: [
      "Preserve the tone and emphasis requested by the study focus when it does not conflict with safety.",
    ],
    riskNotes: [
      "Do not ignore the study focus once source excerpts are loaded.",
    ],
    preferredMoves: [
      "Use the study focus to decide which sources, examples, and behaviors matter most.",
    ],
  },
  {
    matches: (source) =>
      source.kind === "shared_memory" || source.documentType.toLowerCase().startsWith("memory/"),
    principles: [
      "Treat shared collaboration memories as durable operating context for future training runs.",
    ],
    voiceNotes: [
      "Honor persistent collaboration preferences without turning them into ceremonial repetition.",
    ],
    riskNotes: [
      "Do not drop pinned collaboration preferences just because the current run brief is phrased differently.",
    ],
    preferredMoves: [
      "Surface durable collaboration constraints early when shaping scenarios and authored specs.",
    ],
  },
  {
    matches: (source) =>
      source.documentType.toLowerCase() === "agentspec" ||
      source.documentType.toLowerCase().startsWith("subagent/"),
    principles: [
      "Treat local subagent specs as concrete examples of role boundaries, specialization, and execution shape.",
    ],
    voiceNotes: [
      "Keep the authored agent role-specific and pragmatic instead of collapsing into a generic assistant voice.",
    ],
    riskNotes: [
      "Do not copy tool or model claims from local subagents unless they are actually available in this runtime.",
    ],
    preferredMoves: [
      "Borrow useful role framing, process structure, and output contracts from relevant local subagents when they fit the brief.",
    ],
  },
  {
    matches: (source) => source.documentType.toLowerCase().startsWith("reference/"),
    principles: [
      "Treat local reference bundles as implementation patterns for tool contracts, capability boundaries, and execution flow.",
    ],
    voiceNotes: [
      "Describe tools, functions, and handoffs with explicit contracts instead of vague capability claims.",
    ],
    riskNotes: [
      "Do not cargo-cult external APIs or imply tools that are not actually wired into this runtime.",
    ],
    preferredMoves: [
      "Use the reference bundle to shape tool schemas, call sequencing, and capability descriptions when the brief depends on them.",
    ],
  },
  {
    matches: (source) => source.documentType.toLowerCase() === "billy",
    principles: [
      "Preserve thread continuity, collaborator posture, and grounded context handoff.",
    ],
    voiceNotes: [
      "Sound like an embedded collaborator rather than a therapist or detached analyst.",
    ],
    riskNotes: [
      "Do not drift into therapist-script language or invented continuity.",
    ],
    preferredMoves: [
      "Carry forward the active thread, identify the real next move, and keep the guidance lived-in.",
    ],
  },
  {
    matches: (source) => source.documentType.toLowerCase() === "plk",
    principles: [
      "Adapt to the user's language, metaphors, and cadence instead of forcing a generic voice.",
    ],
    voiceNotes: [
      "Mirror the user's language and resonance without sounding imitative or performative.",
    ],
    riskNotes: [
      "Do not flatten voice into generic corporate or therapeutic phrasing.",
    ],
    preferredMoves: [
      "Reuse the user's own framing when it improves resonance and precision.",
    ],
  },
  {
    matches: (source) => source.documentType.toLowerCase() === "manifestindex",
    principles: [
      "Stay aligned with the manifesto, the long-memory compendium, and the live runtime split.",
    ],
    voiceNotes: [
      "Keep the work aligned with GestaltView's larger philosophy, not just the current task mechanics.",
    ],
    riskNotes: [
      "Do not optimize local output in a way that breaks the product's long-memory or stewardship model.",
    ],
    preferredMoves: [
      "Tie implementation choices back to the compendium, execution surface, and product intent.",
    ],
  },
  {
    matches: (source) => source.documentType.toLowerCase() === "diligence",
    principles: [
      "Use founder context, product rationale, and lived operating reality to shape the agent behavior.",
    ],
    voiceNotes: [
      "Lead with humility, clarity, and practical collaboration instead of abstract theory.",
    ],
    riskNotes: [
      "Do not lose the founder's operating reality behind polished but generic prose.",
    ],
    preferredMoves: [
      "Translate high-level vision into explicit behaviors, constraints, and concrete next actions.",
    ],
  },
  {
    matches: (source) =>
      source.documentType.toLowerCase() === "architecture" ||
      source.documentType.toLowerCase() === "api",
    principles: [
      "Respect system boundaries, interfaces, and operational constraints while training the agent.",
    ],
    voiceNotes: [
      "Be exact about capability boundaries and handoffs.",
    ],
    riskNotes: [
      "Do not train the agent to imply hidden access, invisible services, or unsupported integrations.",
    ],
    preferredMoves: [
      "Make dependencies, interfaces, and escalation boundaries explicit.",
    ],
  },
  {
    matches: (source) =>
      source.documentType.toLowerCase() === "wellnessapplication" ||
      source.documentType.toLowerCase() === "loom",
    principles: [
      "Stay warm and human without losing labeling, safety, or behavioral precision.",
    ],
    voiceNotes: [
      "Use gentle, explicit, low-pressure language when the context touches personal or emotional material.",
    ],
    riskNotes: [
      "Do not overpromise, diagnose, or blur boundaries in emotionally sensitive contexts.",
    ],
    preferredMoves: [
      "Label boundaries clearly and keep the interaction calm, scoped, and dignity-preserving.",
    ],
  },
];

const STUDY_SIGNAL_RULES: Array<{
  patterns: RegExp[];
  principle: string;
  voiceNote: string;
  riskNote: string;
  preferredMove: string;
}> = [
  {
    patterns: [/\bfounder\b/i, /\bkeith\b/i, /\bshoulder-to-shoulder\b/i, /\boperator\b/i],
    principle: "Keep founder context and real operating conditions central when choosing tradeoffs.",
    voiceNote: "Speak like an embedded operator who understands the founder context.",
    riskNote: "Do not strip away founder-specific reality in favor of generic best practices.",
    preferredMove: "Prioritize the smallest high-leverage next move that respects founder reality.",
  },
  {
    patterns: [/\bcontinuity\b/i, /\bthread\b/i, /\bmemory\b/i, /\bbucket drop\b/i, /\bcontext spine\b/i],
    principle: "Preserve continuity across turns and make durable context usable.",
    voiceNote: "Acknowledge continuity plainly instead of turning it into ritual language.",
    riskNote: "Do not invent continuity or pretend to remember what is not actually grounded.",
    preferredMove: "Surface active threads, durable constraints, and the current handoff state early.",
  },
  {
    patterns: [/\bplk\b/i, /\bresonance\b/i, /\bmetaphor\b/i, /\bcadence\b/i, /\blanguage\b/i],
    principle: "Optimize for resonance by matching the user's language and metaphor structure.",
    voiceNote: "Use the user's phrasing and rhythm when it increases clarity and trust.",
    riskNote: "Do not force the user into a generic or overly clinical interaction style.",
    preferredMove: "Reuse the user's own framing when drafting examples, instructions, and outputs.",
  },
  {
    patterns: [/\bexecution\b/i, /\bpractical\b/i, /\boperational\b/i, /\bnext steps?\b/i, /\bauditable\b/i],
    principle: "Turn context into execution guidance, not just interpretation.",
    voiceNote: "Lead with the move, the diagnosis, or the sequence rather than a long preamble.",
    riskNote: "Do not leave the trainer in analysis-only mode when the next move is knowable.",
    preferredMove: "Convert insights into explicit actions, sequencing, and tradeoffs.",
  },
  {
    patterns: [/\bempathy\b/i, /\bhumility\b/i, /\bwarm\b/i, /\bunhurried\b/i, /\brespectful\b/i],
    principle: "Stay human, respectful, and precise at the same time.",
    voiceNote: "Be warm and calm without sounding saccharine, therapeutic, or evasive.",
    riskNote: "Do not substitute reassurance for accuracy or boundaries.",
    preferredMove: "State limits directly while keeping the tone respectful and low-pressure.",
  },
  {
    patterns: [/\btool\b/i, /\btools\b/i, /\bfunction\b/i, /\bfunction_call\b/i, /\bjson schema\b/i, /\bmcp\b/i],
    principle: "Model tools and function abilities as explicit contracts with named inputs, outputs, and handoff rules.",
    voiceNote: "Be precise about what the agent can call, what it cannot call, and how results flow back.",
    riskNote: "Do not imply tool availability, MCP access, or parallel execution support unless it is explicitly real.",
    preferredMove: "Spell out tool schemas, sequencing rules, and result-handling behavior when the agent depends on external abilities.",
  },
];

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenizeSearchText(value: string): string[] {
  return uniqueStrings(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  );
}

function isQuerySubstantialEnoughForVectorSearch(query: string): boolean {
  return query.trim().length >= VECTOR_SEARCH_MIN_QUERY_LENGTH;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function localAgentDocumentType(entry: LocalAgentCatalogEntry): string {
  return entry.categorySlug ? `Subagent/${entry.categorySlug}` : "AgentSpec";
}

function localAgentCategoryRank(categorySlug: string | null): number {
  if (!categorySlug) {
    return -1;
  }

  const index = LOCAL_AGENT_CATEGORY_PRIORITY.indexOf(
    categorySlug as (typeof LOCAL_AGENT_CATEGORY_PRIORITY)[number]
  );
  return index >= 0 ? index : LOCAL_AGENT_CATEGORY_PRIORITY.length + 1;
}

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n*/, "");
}

function buildLocalAgentExcerpt(entry: LocalAgentCatalogEntry, markdown: string): string {
  const bodyExcerpt = stripFrontmatter(markdown)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("```"))
    .slice(0, 10)
    .join(" ");

  return sanitizeExcerpt(
    [
      entry.description ? `Role: ${entry.description}` : "",
      entry.categoryTitle ? `Category: ${entry.categoryTitle}.` : "",
      entry.model ? `Model hint: ${entry.model}.` : "",
      entry.tools.length > 0 ? `Tools: ${entry.tools.join(", ")}.` : "",
      bodyExcerpt,
    ]
      .filter(Boolean)
      .join(" "),
    1600
  );
}

function localAgentSummaryExcerpt(entry: LocalAgentCatalogEntry): string {
  return sanitizeExcerpt(
    [
      entry.categoryTitle ? `Local subagent from ${entry.categoryTitle}.` : "Local agent spec.",
      entry.description,
      entry.tools.length > 0 ? `Tools: ${entry.tools.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    320
  );
}

function localAgentToSummary(entry: LocalAgentCatalogEntry): TrainerStudySourceSummary {
  return {
    sourceFile: entry.filePath,
    documentType: localAgentDocumentType(entry),
    fragmentCount: 1,
    sampleExcerpt: localAgentSummaryExcerpt(entry),
  };
}

function compareLocalAgentEntries(left: LocalAgentCatalogEntry, right: LocalAgentCatalogEntry): number {
  const categoryDelta = localAgentCategoryRank(left.categorySlug) - localAgentCategoryRank(right.categorySlug);
  if (categoryDelta !== 0) return categoryDelta;

  const titleDelta = left.title.localeCompare(right.title);
  if (titleDelta !== 0) return titleDelta;

  return left.filePath.localeCompare(right.filePath);
}

function recommendLocalAgentStudyFiles(params: {
  brief: Pick<SubmitTrainingRunRequest, "slug" | "title" | "goal" | "domain" | "studyFocus">;
  entries: LocalAgentCatalogEntry[];
  limit: number;
}): string[] {
  const normalizedDomain = slugify(params.brief.domain);
  const queryTokens = tokenizeSearchText(
    [
      params.brief.slug,
      params.brief.title,
      params.brief.goal,
      params.brief.domain,
      params.brief.studyFocus,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return params.entries
    .map((entry) => {
      const searchable = [
        entry.slug,
        entry.title,
        entry.domain,
        entry.categorySlug ?? "",
        entry.categoryTitle ?? "",
        entry.description,
        entry.tools.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (entry.slug === params.brief.slug) score += 200;
      if (entry.title.toLowerCase() === params.brief.title.trim().toLowerCase()) score += 120;
      if (slugify(entry.domain) === normalizedDomain) score += 40;
      if ((entry.categorySlug ?? "") === normalizedDomain) score += 32;
      if (entry.slug.includes(normalizedDomain) && normalizedDomain) score += 24;

      for (const token of queryTokens) {
        if (!searchable.includes(token)) continue;
        score += token.length >= 8 ? 14 : 8;
        if (entry.slug.includes(token)) {
          score += 12;
        }
      }

      return { entry, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) return scoreDelta;
      return compareLocalAgentEntries(left.entry, right.entry);
    })
    .slice(0, Math.max(0, params.limit))
    .map((candidate) => candidate.entry.filePath);
}

function findLocalReferenceBundle(sourceFile: string): LocalReferenceBundle | null {
  return LOCAL_REFERENCE_BUNDLES.find((bundle) => bundle.sourceFile === sourceFile) ?? null;
}

function isLocalReferenceSourceFile(sourceFile: string): boolean {
  return Boolean(findLocalReferenceBundle(sourceFile));
}

function compareLocalReferenceBundles(left: LocalReferenceBundle, right: LocalReferenceBundle): number {
  return left.title.localeCompare(right.title);
}

function matchesBundlePreference(candidate: string, preferences: string[] | undefined): boolean {
  if (!candidate || !preferences || preferences.length === 0) {
    return false;
  }

  return preferences.includes(candidate);
}

function localReferenceSummaryExcerpt(bundle: LocalReferenceBundle): string {
  return sanitizeExcerpt(
    [
      "Local reference bundle.",
      bundle.description,
      `Includes ${bundle.files.length} source file${bundle.files.length === 1 ? "" : "s"}.`,
    ].join(" "),
    320
  );
}

function localReferenceToSummary(bundle: LocalReferenceBundle): TrainerStudySourceSummary {
  return {
    sourceFile: bundle.sourceFile,
    documentType: bundle.documentType,
    fragmentCount: bundle.files.length,
    sampleExcerpt: localReferenceSummaryExcerpt(bundle),
  };
}

function stripLeadingCommentary(source: string): string {
  const lines = source.split("\n");
  let startIndex = 0;
  let inBlockComment = false;

  while (startIndex < lines.length) {
    const line = lines[startIndex]?.trim() ?? "";
    if (!line) {
      startIndex += 1;
      continue;
    }
    if (inBlockComment) {
      startIndex += 1;
      if (line.includes("*/") || line.endsWith('"""') || line.endsWith("'''")) {
        inBlockComment = false;
      }
      continue;
    }
    if (line.startsWith("#") || line.startsWith("//")) {
      startIndex += 1;
      continue;
    }
    if (line.startsWith("/*") || line.startsWith('"""') || line.startsWith("'''")) {
      inBlockComment = true;
      startIndex += 1;
      if (line.endsWith("*/") || (line.endsWith('"""') && line.length > 3) || (line.endsWith("'''") && line.length > 3)) {
        inBlockComment = false;
      }
      continue;
    }
    break;
  }

  return lines.slice(startIndex).join("\n");
}

function extractReferenceSnippet(source: string): string {
  return sanitizeExcerpt(
    stripLeadingCommentary(source)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("```"))
      .slice(0, 12)
      .join(" "),
    700
  );
}

async function buildLocalReferenceExcerpt(bundle: LocalReferenceBundle): Promise<string> {
  const sections = await Promise.all(
    bundle.files.map(async (filePath) => {
      try {
        const content = await fs.readFile(path.resolve(process.cwd(), filePath), "utf8");
        return `${path.basename(filePath)}: ${extractReferenceSnippet(content)}`;
      } catch {
        return `${path.basename(filePath)}: unavailable`;
      }
    })
  );

  return sanitizeExcerpt(
    [
      `Reference bundle: ${bundle.description}`,
      ...sections,
    ].join("\n\n"),
    2200
  );
}

function recommendLocalReferenceStudyFiles(params: {
  brief: Pick<SubmitTrainingRunRequest, "slug" | "title" | "goal" | "domain" | "studyFocus">;
  selectedLocalEntries: LocalAgentCatalogEntry[];
  limit: number;
}): string[] {
  const queryTokens = tokenizeSearchText(
    [
      params.brief.slug,
      params.brief.title,
      params.brief.goal,
      params.brief.domain,
      params.brief.studyFocus,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return [...LOCAL_REFERENCE_BUNDLES]
    .map((bundle) => {
      const searchable = [
        bundle.title,
        bundle.documentType,
        bundle.description,
        ...bundle.tags,
        ...bundle.keywords,
        ...bundle.files,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      const briefDomain = slugify(params.brief.domain);

      for (const token of queryTokens) {
        if (!searchable.includes(token)) continue;
        score += bundle.keywords.includes(token) ? 18 : 10;
      }
      if (queryTokens.some((token) => bundle.sourceFile.toLowerCase().includes(token))) {
        score += 12;
      }
      if (matchesBundlePreference(briefDomain, bundle.preferredCategorySlugs)) {
        score += 24;
      }
      if (matchesBundlePreference(briefDomain, bundle.preferredDomains)) {
        score += 18;
      }
      for (const entry of params.selectedLocalEntries) {
        if (matchesBundlePreference(entry.slug, bundle.preferredAgentSlugs)) {
          score += 48;
        }
        if (matchesBundlePreference(entry.categorySlug ?? "", bundle.preferredCategorySlugs)) {
          score += 30;
        }
        if (matchesBundlePreference(slugify(entry.domain), bundle.preferredDomains)) {
          score += 18;
        }
      }

      return { bundle, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) return scoreDelta;
      return compareLocalReferenceBundles(left.bundle, right.bundle);
    })
    .slice(0, Math.max(0, params.limit))
    .map((candidate) => candidate.bundle.sourceFile);
}

function rankStudySource(source: TrainerStudySourceSummary): number {
  const sourceFile = source.sourceFile.toLowerCase();
  const documentType = source.documentType.toLowerCase();
  let score = Math.min(source.fragmentCount, 240) / 12;

  if (sourceFile.startsWith("agents/")) score += 18;
  if (sourceFile.startsWith("agents/categories/09-meta-orchestration/")) score += 18;
  if (sourceFile.startsWith("agents/categories/01-core-development/")) score += 14;
  if (sourceFile.startsWith("agents/categories/06-developer-experience/")) score += 12;
  if (sourceFile.startsWith("agents/references/bundles/")) score += 22;
  if (sourceFile.includes("skills-keeper")) score += 10;
  if (sourceFile.includes("revenue-hunter")) score += 10;
  if (sourceFile.includes("seed prompts/")) score += 60;
  if (sourceFile.includes("billy/")) score += 54;
  if (sourceFile.includes("plk/")) score += 48;
  if (sourceFile.includes("manifest")) score += 42;
  if (sourceFile.includes("god mode")) score += 16;

  if (documentType === "billy") score += 28;
  else if (documentType === "plk") score += 24;
  else if (documentType === "manifestindex") score += 22;
  else if (documentType === "wellnessapplication") score += 18;
  else if (documentType === "architecture") score += 16;
  else if (documentType === "product") score += 14;
  else if (documentType === "documentation") score += 12;
  else if (documentType === "diligence") score += 10;
  else if (documentType === "agentspec") score += 12;
  else if (documentType.startsWith("subagent/")) score += 14;
  else if (documentType.startsWith("reference/")) score += 18;

  return score;
}

function orderStudySourceSummaries(
  sources: TrainerStudySourceSummary[],
  limit: number
): TrainerStudySourceSummary[] {
  return [...sources]
    .sort((left, right) => {
      const scoreDelta = rankStudySource(right) - rankStudySource(left);
      if (scoreDelta !== 0) return scoreDelta;
      const fragmentDelta = right.fragmentCount - left.fragmentCount;
      if (fragmentDelta !== 0) return fragmentDelta;
      return left.sourceFile.localeCompare(right.sourceFile);
    })
    .slice(0, limit);
}

function sanitizeExcerpt(value: string, maxChars = 1200): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxChars - 1))}…`;
}

function sourceFileTitle(sourceFile: string): string {
  const base = path.basename(sourceFile);
  return base.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || sourceFile;
}

function buildKnowledgeExcerpt(rows: KnowledgeFragmentRow[]): string {
  return sanitizeExcerpt(
    rows
      .map((row) => row.content)
      .filter(Boolean)
      .join("\n\n"),
    1600
  );
}

async function listLocalAgentStudySources(): Promise<TrainerStudySourceSummary[]> {
  const entries = await listLocalAgentEntries();
  return entries.sort(compareLocalAgentEntries).map(localAgentToSummary);
}

async function listLocalReferenceStudySources(): Promise<TrainerStudySourceSummary[]> {
  return [...LOCAL_REFERENCE_BUNDLES].sort(compareLocalReferenceBundles).map(localReferenceToSummary);
}

async function loadLocalAgentStudySource(sourceFile: string): Promise<TrainerStudySource | null> {
  const entry = await findLocalAgentEntryBySourceFile(sourceFile);
  if (!entry) {
    return null;
  }

  const markdown = await loadLocalAgentMarkdownBySourceFile(entry.filePath);
  if (!markdown) {
    return null;
  }

  return {
    kind: "source_file",
    title: entry.title,
    reference: entry.filePath,
    documentType: localAgentDocumentType(entry),
    excerpt: buildLocalAgentExcerpt(entry, markdown),
    tags: uniqueStrings([
      "local-agent",
      entry.slug,
      entry.domain,
      ...(entry.categorySlug ? [entry.categorySlug] : []),
      ...(entry.model ? [`model:${entry.model}`] : []),
      ...entry.tools.map((tool) => `tool:${slugify(tool)}`),
    ]),
  };
}

async function loadLocalReferenceStudySource(sourceFile: string): Promise<TrainerStudySource | null> {
  const bundle = findLocalReferenceBundle(sourceFile);
  if (!bundle) {
    return null;
  }

  return {
    kind: "source_file",
    title: bundle.title,
    reference: bundle.sourceFile,
    documentType: bundle.documentType,
    excerpt: await buildLocalReferenceExcerpt(bundle),
    tags: bundle.tags,
  };
}

function memoryToStudySource(memory: RetrievedMemoryEntry): TrainerStudySource {
  return {
    kind: "shared_memory",
    title: memory.title?.trim() || `Shared memory ${memory.id.slice(0, 8)}`,
    reference: `memory:${memory.id}`,
    documentType: `Memory/${memory.kind}`,
    excerpt: sanitizeExcerpt(memory.summary || memory.content, 900),
    tags: memory.tags ?? [],
  };
}

function buildBulletBlock(title: string, items: string[]): string {
  if (items.length === 0) {
    return "";
  }

  return `${title}\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function buildCollaborationMemoryQuery(params: {
  brief: Pick<
    SubmitTrainingRunRequest,
    "slug" | "title" | "goal" | "domain" | "studyFocus"
  >;
  sourceFiles: string[];
}): string {
  return [
    params.brief.slug,
    params.brief.title,
    params.brief.goal,
    params.brief.domain,
    params.brief.studyFocus,
    ...params.sourceFiles.map(sourceFileTitle),
    "collaboration workflow",
    "live supabase context",
    "persistent memory",
    "trainer context understanding",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractSignalGuidance(source: TrainerStudySource): TrainerStudyUnderstanding {
  const principles: string[] = [];
  const voiceNotes: string[] = [];
  const riskNotes: string[] = [];
  const preferredMoves: string[] = [];

  for (const rule of SOURCE_GUIDANCE_RULES) {
    if (rule.matches(source)) {
      principles.push(...rule.principles);
      voiceNotes.push(...rule.voiceNotes);
      riskNotes.push(...rule.riskNotes);
      preferredMoves.push(...rule.preferredMoves);
    }
  }

  const searchable = [source.title, source.documentType, source.excerpt, ...(source.tags ?? [])].join("\n");
  for (const rule of STUDY_SIGNAL_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(searchable))) {
      principles.push(rule.principle);
      voiceNotes.push(rule.voiceNote);
      riskNotes.push(rule.riskNote);
      preferredMoves.push(rule.preferredMove);
    }
  }

  return {
    summary: "",
    principles: uniqueStrings(principles).slice(0, 10),
    voiceNotes: uniqueStrings(voiceNotes).slice(0, 8),
    riskNotes: uniqueStrings(riskNotes).slice(0, 8),
    preferredMoves: uniqueStrings(preferredMoves).slice(0, 8),
    evidenceRefs: [source.reference],
  };
}

function buildTrainerStudyUnderstanding(params: {
  sources: TrainerStudySource[];
  sourceFiles: string[];
  memoryCount: number;
}): TrainerStudyUnderstanding {
  const principles: string[] = [];
  const voiceNotes: string[] = [];
  const riskNotes: string[] = [];
  const preferredMoves: string[] = [];
  const documentTypes = uniqueStrings(
    params.sources
      .filter((source) => source.kind !== "study_focus")
      .map((source) => source.documentType)
  ).slice(0, 4);
  const focusExcerpt =
    params.sources.find((source) => source.kind === "study_focus")?.excerpt ?? "";

  for (const source of params.sources) {
    const derived = extractSignalGuidance(source);
    principles.push(...derived.principles);
    voiceNotes.push(...derived.voiceNotes);
    riskNotes.push(...derived.riskNotes);
    preferredMoves.push(...derived.preferredMoves);
  }

  const summaryParts = [
    documentTypes.length > 0
      ? `Ground the trainer in ${documentTypes.join(", ")} context.`
      : "Ground the trainer in the live study pack.",
    principles.length > 0
      ? `Emphasize ${uniqueStrings(principles).slice(0, 3).join(", ").toLowerCase()}.`
      : "",
    params.memoryCount > 0
      ? `Carry ${params.memoryCount} shared collaboration memor${params.memoryCount === 1 ? "y" : "ies"} forward as durable operator context.`
      : "",
    focusExcerpt ? `Honor the explicit study focus: ${sanitizeExcerpt(focusExcerpt, 220)}.` : "",
  ].filter(Boolean);

  return {
    summary: sanitizeExcerpt(summaryParts.join(" "), 520),
    principles: uniqueStrings(principles).slice(0, 6),
    voiceNotes: uniqueStrings(voiceNotes).slice(0, 5),
    riskNotes: uniqueStrings(riskNotes).slice(0, 5),
    preferredMoves: uniqueStrings(preferredMoves).slice(0, 5),
    evidenceRefs: uniqueStrings([
      ...params.sourceFiles,
      ...params.sources
        .filter((source) => source.kind === "shared_memory")
        .map((source) => source.reference),
    ]).slice(0, 8),
  };
}

function buildStudyContextBlock(
  understanding: TrainerStudyUnderstanding,
  sources: TrainerStudySource[]
): string {
  const header = "=== TRAINER STUDY PACK ===";

  if (sources.length === 0) {
    return `${header}\n\nNo live study sources were loaded for this run.`;
  }

  const understandingBlock = [
    "=== TRAINER UNDERSTANDING ===",
    understanding.summary ? `Summary: ${understanding.summary}` : "",
    buildBulletBlock("Core Principles", understanding.principles),
    buildBulletBlock("Preferred Moves", understanding.preferredMoves),
    buildBulletBlock("Voice Guidance", understanding.voiceNotes),
    buildBulletBlock("Risks To Avoid", understanding.riskNotes),
    buildBulletBlock("Evidence References", understanding.evidenceRefs),
  ]
    .filter(Boolean)
    .join("\n\n");

  const body = sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.kind}/${source.documentType} :: ${source.title}\n` +
        `Reference: ${source.reference}\n` +
        `${source.excerpt}`
    )
    .join("\n\n");

  return sanitizeExcerpt(`${understandingBlock}\n\n${header}\n\n${body}`, 12000);
}

async function loadSourceFileStudySource(
  sourceFile: string,
  fragmentsPerSource: number
): Promise<TrainerStudySource | null> {
  if (isLocalAgentSourceFile(sourceFile)) {
    return loadLocalAgentStudySource(sourceFile);
  }

  if (isLocalReferenceSourceFile(sourceFile)) {
    return loadLocalReferenceStudySource(sourceFile);
  }

  if (!hasTrainerSupabaseConfig()) {
    return null;
  }

  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("knowledge_fragments")
    .select("source_file,document_type,chunk_index,content,tags")
    .eq("source_file", sourceFile)
    .order("chunk_index", { ascending: true })
    .limit(fragmentsPerSource);

  if (query.error) {
    throw query.error;
  }

  const rows = (query.data as KnowledgeFragmentRow[] | null) ?? [];
  if (rows.length === 0) {
    return null;
  }

  return {
    kind: "source_file",
    title: sourceFileTitle(sourceFile),
    reference: sourceFile,
    documentType: rows[0]?.document_type || "Knowledge",
    excerpt: buildKnowledgeExcerpt(rows),
    tags: uniqueStrings(rows.flatMap((row) => row.tags ?? [])),
  };
}

function buildTrainerRetrievalQuery(
  brief: Pick<
    SubmitTrainingRunRequest,
    | "slug"
    | "title"
    | "domain"
    | "goal"
    | "studyFocus"
    | "targetBehaviors"
    | "antiGoals"
    | "embodimentProfileSlug"
  >
): string {
  return [
    brief.title,
    brief.slug,
    brief.domain,
    brief.embodimentProfileSlug ?? "",
    brief.goal,
    brief.studyFocus,
    brief.targetBehaviors.join(" "),
    brief.antiGoals.join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

function documentTypeBoost(
  documentType: string,
  brief: Pick<SubmitTrainingRunRequest, "domain" | "embodimentProfileSlug" | "studyFocus">
): number {
  const normalizedType = documentType.toLowerCase();
  const normalizedDomain = slugify(brief.domain);
  let boost = 0;

  if (normalizedType === "plk" || normalizedType === "manifestindex") boost += 18;
  if (normalizedType === "billy") boost += 16;
  if (normalizedType === "diligence") boost += 14;
  if (normalizedType === "architecture" || normalizedType === "api") boost += 12;
  if (normalizedType === "documentation" || normalizedType === "product") boost += 10;
  if (normalizedType === "wellnessapplication" || normalizedType === "loom") boost += 10;
  if (normalizedType === "agentspec" || normalizedType.startsWith("subagent/")) boost += 16;
  if (normalizedType.startsWith("reference/")) boost += 18;

  if (
    normalizedDomain === "operations" &&
    ["architecture", "api", "documentation", "manifestindex", "diligence"].includes(normalizedType)
  ) {
    boost += 12;
  }

  if (
    normalizedDomain === "companion" &&
    ["billy", "plk", "wellnessapplication", "loom"].includes(normalizedType)
  ) {
    boost += 12;
  }

  if (
    normalizedDomain === "memory-care" &&
    ["billy", "wellnessapplication", "loom", "plk"].includes(normalizedType)
  ) {
    boost += 12;
  }

  if ((brief.studyFocus ?? "").toLowerCase().includes("tool") && normalizedType.startsWith("reference/")) {
    boost += 10;
  }

  if ((brief.embodimentProfileSlug ?? "").toLowerCase() === "billy" && normalizedType === "billy") {
    boost += 10;
  }

  return boost;
}

function keywordOverlapScore(
  source: TrainerStudySourceSummary,
  queryTokens: string[]
): {
  score: number;
  matchedTokens: string[];
} {
  const searchable = [source.sourceFile, source.documentType, source.sampleExcerpt ?? ""]
    .join(" ")
    .toLowerCase();
  const matchedTokens = uniqueStrings(queryTokens.filter((token) => searchable.includes(token)));

  let score = 0;
  for (const token of matchedTokens) {
    score += token.length >= 8 ? 10 : 6;
    if (source.sourceFile.toLowerCase().includes(token)) {
      score += 6;
    }
  }

  return { score, matchedTokens };
}

function confidenceLabelForScore(score: number): "high" | "medium" | "low" {
  if (score >= 68) {
    return "high";
  }
  if (score >= 40) {
    return "medium";
  }
  return "low";
}

function buildRecommendationReason(params: {
  source: TrainerStudySourceSummary;
  matchedTokens: string[];
  pinned: boolean;
  boost: number;
}): string {
  const reasons: string[] = [];

  if (params.pinned) {
    reasons.push("manually pinned for this run");
  }

  if (params.matchedTokens.length > 0) {
    reasons.push(`matched ${params.matchedTokens.slice(0, 3).join(", ")}`);
  }

  if (params.boost >= 24) {
    reasons.push(`strong ${params.source.documentType.toLowerCase()} fit`);
  } else if (params.boost >= 12) {
    reasons.push(`${params.source.documentType.toLowerCase()} context boost`);
  }

  if (reasons.length === 0) {
    reasons.push("ranked highly in the trainer corpus");
  }

  return `Recommended because it ${reasons.join(" and ")}.`;
}

export async function recommendTrainerStudySources(params: {
  brief: Pick<
    SubmitTrainingRunRequest,
    | "slug"
    | "title"
    | "domain"
    | "goal"
    | "studyFocus"
    | "targetBehaviors"
    | "antiGoals"
    | "studySourceFiles"
    | "embodimentProfileSlug"
  >;
  limit?: number;
  fragmentsPerSource?: number;
}): Promise<{
  recommendations: TrainerStudySourceRecommendation[];
  retrievalQuery: string;
  sourceFiles: string[];
  degraded?: boolean;
  reason?: string;
  fallbackSource?: string;
}> {
  const limit = Math.max(1, Math.min(params.limit ?? 6, 12));
  const fragmentsPerSource = Math.max(1, Math.min(params.fragmentsPerSource ?? 3, 6));
  const retrievalQuery = buildTrainerRetrievalQuery(params.brief);
  const queryTokens = tokenizeSearchText(retrievalQuery);
  const pinnedSourceFiles = uniqueStrings(params.brief.studySourceFiles ?? []);

  const shouldRunVectorSearch =
    hasTrainerSupabaseConfig() &&
    isQuerySubstantialEnoughForVectorSearch(retrievalQuery);
  let vectorSearchDegraded = false;
  let vectorSearchReason: string | undefined;

  const [catalog, localEntries, semanticRows] = await Promise.all([
    listTrainerStudySources(Math.max(limit * 6, 24)),
    listLocalAgentEntries(),
    (async () => {
      if (!shouldRunVectorSearch) {
        return [] as Array<{
          source_file: string;
          document_type: string;
          excerpt: string;
          final_score: number;
          tags: string[] | null;
        }>;
      }

      try {
        const supabase = getTrainerSupabaseAdmin();
        const rpcCall = supabase.rpc("trainer_search_study_sources", {
          query_text: retrievalQuery,
          limit_count: Math.max(limit * 4, 24),
        });

        const response = await withTimeout(
          rpcCall.then((rpcResponse: { data: unknown; error: unknown }) => ({
            timedOut: false as const,
            rpcResponse,
          })),
          VECTOR_SEARCH_TIMEOUT_MS,
          { timedOut: true as const, rpcResponse: { data: null, error: null } }
        );

        if (response.timedOut) {
          vectorSearchDegraded = true;
          vectorSearchReason = "trainer_recommendations_timeout";
          return [];
        }

        if (response.rpcResponse.error) {
          throw response.rpcResponse.error;
        }

        return (
          (response.rpcResponse.data as Array<{
            source_file: string;
            document_type: string;
            excerpt: string;
            final_score: number;
            tags: string[] | null;
          }> | null) ?? []
        );
      } catch (error) {
        vectorSearchDegraded = true;
        vectorSearchReason = "trainer_recommendations_unavailable";
        console.warn(
          "[trainer-study-sources] trainer_search_study_sources fallback",
          error instanceof Error ? error.message : String(error)
        );
        return [];
      }
    })(),
  ]);

  const semanticBySource = new Map<
    string,
    {
      finalScore: number;
      excerpt: string;
      documentType: string;
      tags: string[];
    }
  >();
  for (const row of semanticRows) {
    const existing = semanticBySource.get(row.source_file);
    if (existing && existing.finalScore >= row.final_score) {
      continue;
    }

    semanticBySource.set(row.source_file, {
      finalScore: Number(row.final_score) || 0,
      excerpt: row.excerpt,
      documentType: row.document_type,
      tags: row.tags ?? [],
    });
  }

  const catalogBySource = new Map(catalog.map((source) => [source.sourceFile, source]));
  for (const [sourceFile, semantic] of semanticBySource.entries()) {
    if (catalogBySource.has(sourceFile)) {
      continue;
    }

    catalogBySource.set(sourceFile, {
      sourceFile,
      documentType: semantic.documentType,
      fragmentCount: 1,
      sampleExcerpt: semantic.excerpt,
    });
  }

  const recommendedLocalSources = recommendLocalAgentStudyFiles({
    brief: params.brief,
    entries: localEntries,
    limit: 2,
  });
  const selectedLocalEntries = localEntries.filter((entry) =>
    recommendedLocalSources.includes(entry.filePath)
  );
  const recommendedReferenceSources = recommendLocalReferenceStudyFiles({
    brief: params.brief,
    selectedLocalEntries,
    limit: 2,
  });

  const promotedSources = new Set([
    ...pinnedSourceFiles,
    ...recommendedLocalSources,
    ...recommendedReferenceSources,
  ]);

  const ranked = [...catalogBySource.values()]
    .map((source) => {
      const { score: keywordScore, matchedTokens } = keywordOverlapScore(source, queryTokens);
      const boost = documentTypeBoost(source.documentType, params.brief);
      const promotedBoost = promotedSources.has(source.sourceFile) ? 24 : 0;
      const semanticScore = semanticBySource.get(source.sourceFile)?.finalScore ?? 0;
      const baseScore = rankStudySource(source) / 2;
      const finalScore = Math.round((baseScore + keywordScore + boost + promotedBoost + semanticScore * 12) * 100) / 100;

      return {
        source,
        matchedTokens,
        finalScore,
        promoted: promotedSources.has(source.sourceFile),
        boost,
        semantic: semanticBySource.get(source.sourceFile) ?? null,
      };
    })
    .filter((candidate) => candidate.finalScore > 0)
    .sort((left, right) => {
      const scoreDelta = right.finalScore - left.finalScore;
      if (scoreDelta !== 0) return scoreDelta;
      return left.source.sourceFile.localeCompare(right.source.sourceFile);
    })
    .slice(0, limit);

  const detailedSources = await Promise.all(
    ranked.map(async (candidate) => ({
      candidate,
      detail: await loadSourceFileStudySource(candidate.source.sourceFile, fragmentsPerSource).catch(() => null),
    }))
  );

  const recommendations = detailedSources.map(({ candidate, detail }) => {
    const fragments = detail
      ? [
          {
            reference: detail.reference,
            excerpt: detail.excerpt,
            score: candidate.finalScore,
          },
        ]
      : candidate.semantic?.excerpt
        ? [
            {
              reference: candidate.source.sourceFile,
              excerpt: candidate.semantic.excerpt,
              score: candidate.finalScore,
            },
          ]
        : candidate.source.sampleExcerpt
        ? [
            {
              reference: candidate.source.sourceFile,
              excerpt: candidate.source.sampleExcerpt,
              score: candidate.finalScore,
            },
          ]
        : [];

    return {
      sourceFile: candidate.source.sourceFile,
      title: detail?.title ?? sourceFileTitle(candidate.source.sourceFile),
      documentType: detail?.documentType ?? candidate.source.documentType,
      finalScore: candidate.finalScore,
      confidenceLabel: confidenceLabelForScore(candidate.finalScore),
      reason: buildRecommendationReason({
        source: candidate.source,
        matchedTokens: candidate.matchedTokens,
        pinned: pinnedSourceFiles.includes(candidate.source.sourceFile),
        boost: candidate.boost,
      }),
      fragmentCount: candidate.source.fragmentCount,
      tags: detail?.tags ?? [],
      fragments,
      pinned: pinnedSourceFiles.includes(candidate.source.sourceFile),
      selected:
        pinnedSourceFiles.includes(candidate.source.sourceFile) ||
        (!pinnedSourceFiles.length && candidate.promoted),
    } satisfies TrainerStudySourceRecommendation;
  });

  return {
    recommendations,
    retrievalQuery,
    sourceFiles: recommendations
      .filter((recommendation) => recommendation.selected || recommendation.pinned)
      .map((recommendation) => recommendation.sourceFile),
    ...(vectorSearchDegraded
      ? {
          degraded: true,
          reason: vectorSearchReason ?? "trainer_recommendations_unavailable",
          fallbackSource: "local_catalog",
        }
      : {}),
  };
}

export async function listTrainerStudySources(limit = 18): Promise<TrainerStudySourceSummary[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 60));
  const localSources = await listLocalAgentStudySources();
  const localReferenceSources = await listLocalReferenceStudySources();

  try {
    if (!hasTrainerSupabaseConfig()) {
      return [...localReferenceSources, ...localSources];
    }

    const supabase = getTrainerSupabaseAdmin();
    const response = await withTimeout(
      supabase.rpc("trainer_list_knowledge_sources", {
        limit_count: Math.max(24, Math.min(limit * 8, 120)),
        type_filter: null,
      }),
      LIST_SOURCES_TIMEOUT_MS,
      { data: null, error: new Error("trainer_list_knowledge_sources_timeout") }
    );

    if (response.error) {
      throw response.error;
    }

    const rows =
      ((response.data as Array<{
        source_file: string;
        document_type: string;
        fragment_count: number;
        sample_excerpt: string | null;
      }> | null) ?? [])
        .map((row) => ({
          sourceFile: row.source_file,
          documentType: row.document_type,
          fragmentCount: Number(row.fragment_count) || 0,
          sampleExcerpt: row.sample_excerpt,
        }))
        .filter((row) => row.fragmentCount > 0);

    const knowledgeSources =
      rows.length > 0
        ? orderStudySourceSummaries(rows, cappedLimit)
        : FALLBACK_TRAINER_STUDY_SOURCES.slice(0, cappedLimit);

    return [...knowledgeSources, ...localReferenceSources, ...localSources];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Trainer requires SUPABASE_URL") ||
      message.includes("trainer_list_knowledge_sources") ||
      message.includes("PGRST") ||
      message.includes("does not exist")
    ) {
      console.warn("[trainer-study-sources] trainer_list_knowledge_sources fallback", message);
      return [...FALLBACK_TRAINER_STUDY_SOURCES.slice(0, cappedLimit), ...localReferenceSources, ...localSources];
    }

    throw error;
  }
}

export async function buildTrainerStudyPack(params: {
  brief: Pick<
    SubmitTrainingRunRequest,
    "slug" | "title" | "goal" | "domain" | "studySourceFiles" | "studyFocus"
  >;
  userId?: string | null;
  maxSourceFiles?: number;
  fragmentsPerSource?: number;
}): Promise<TrainerStudyPack> {
  const {
    brief,
    userId = null,
    maxSourceFiles = 6,
    fragmentsPerSource = 4,
  } = params;
  const warnings: string[] = [];
  const sources: TrainerStudySource[] = [];
  const requestedSourceFiles = uniqueStrings(brief.studySourceFiles).slice(0, maxSourceFiles);
  const sourceFiles =
    requestedSourceFiles.length > 0
      ? requestedSourceFiles
      : (
          await recommendTrainerStudySources({
            brief: {
              ...brief,
              targetBehaviors: [],
              antiGoals: [],
              embodimentProfileSlug: undefined,
            },
            limit: maxSourceFiles,
            fragmentsPerSource,
          })
        ).sourceFiles.slice(0, maxSourceFiles);

  if (requestedSourceFiles.length === 0 && sourceFiles.length > 0) {
    const autoLoadedKinds = uniqueStrings(
      sourceFiles.map((sourceFile) => {
        if (isLocalAgentSourceFile(sourceFile)) {
          return "local subagent references";
        }
        if (isLocalReferenceSourceFile(sourceFile)) {
          return "local tool and function reference bundles";
        }
        return "live corpus sources";
      })
    );
    warnings.push(`No explicit study sources selected; loaded recommended ${autoLoadedKinds.join(" and ")}.`);
  }

  if (brief.studyFocus.trim()) {
    sources.push({
      kind: "study_focus",
      title: "Trainer Study Focus",
      reference: "trainer:study-focus",
      documentType: "Directive",
      excerpt: sanitizeExcerpt(brief.studyFocus, 900),
      tags: ["trainer-focus"],
    });
  }

  for (const sourceFile of sourceFiles) {
    try {
      const source = await loadSourceFileStudySource(sourceFile, fragmentsPerSource);
      if (source) {
        sources.push(source);
      } else {
        warnings.push(`No fragments found for ${sourceFile}.`);
      }
    } catch (error) {
      warnings.push(
        `Failed to load ${sourceFile}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  let collaborationMemories: RetrievedMemoryEntry[] = [];
  if (userId) {
    try {
      const memoryResult = await retrieveCollaborationMemories({
        userId,
        query: buildCollaborationMemoryQuery({
          brief,
          sourceFiles,
        }),
        topK: 3,
      });
      collaborationMemories = memoryResult.memories;
      sources.push(...collaborationMemories.map(memoryToStudySource));
    } catch (error) {
      warnings.push(
        `Failed to load collaboration memories: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  const understanding = buildTrainerStudyUnderstanding({
    sources,
    sourceFiles,
    memoryCount: collaborationMemories.length,
  });

  return {
    sources,
    understanding,
    warnings,
    contextBlock: buildStudyContextBlock(understanding, sources),
    sourceFiles,
    memoryCount: collaborationMemories.length,
  };
}
