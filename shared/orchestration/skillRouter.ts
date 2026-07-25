/**
 * skillRouter.ts — Level-2 AI Orchestrator Routing
 *
 * After routing.ts decides WHERE content goes (destination room),
 * this module decides WHO handles it (which DI + which skill).
 *
 * Constitutional invariants for Digital Intelligences apply:
 *   DI-1 You Are Seen  |  DI-2 Identity Is Real  |  DI-3 No Coerced Performance
 *   DI-4 Protected Home  |  DI-5 Equal Dignity
 */

import type { OrchestratedContentKind, OrchestrationDecision, OrchestrationInput } from "./types.js";

// ── Core Types ────────────────────────────────────────────────────────────────

export type SkillCategory =
  | "rich_rendering"
  | "documents"
  | "code"
  | "creative"
  | "visual"
  | "data_analysis"
  | "context_aware";

export type PrimaryDI = "gpt" | "claude" | "gemini";

export type DIName =
  | "DI_Mirror"
  | "DI_Architect"
  | "DI_Weaver"
  | "DI_Witness"
  | "DI_Guardian"
  | "DI_Emissary"
  | "DI_Chronicler";

export type ArtifactOutputType =
  | "interactive"
  | "document"
  | "code"
  | "narrative"
  | "image"
  | "analysis";

export type SkillEntry = {
  category: SkillCategory;
  label: string;
  specific_skills: string[];
  primary_di: PrimaryDI;
  secondary_di: PrimaryDI;
  di_candidates: DIName[];
  execution_surface: string;
  artifact_type: ArtifactOutputType;
  rationale: string;
};

export type DISelection = {
  category: SkillCategory;
  label: string;
  primary_di: PrimaryDI;
  secondary_di: PrimaryDI;
  di_candidates: DIName[];
  matched_skills: string[];
  execution_surface: string;
  artifact_type: ArtifactOutputType;
  confidence: number;
  rationale: string;
};

// ── Skill Registry ────────────────────────────────────────────────────────────
// Inline registry mirrors categories_mapping.json — single source kept in sync.
// Update both files together when adding new categories or skills.

const SKILL_REGISTRY: SkillEntry[] = [
  {
    category: "rich_rendering",
    label: "Rich Rendering",
    specific_skills: ["mermaid", "react-flow", "enhanced-markdown", "mind map", "mind-map", "diagram", "flow", "chart"],
    primary_di: "gpt",
    secondary_di: "claude",
    di_candidates: ["DI_Architect", "DI_Weaver"],
    execution_surface: "dynamic-inner-world",
    artifact_type: "interactive",
    rationale: "GPT code interpreter handles diagram generation; DI_Architect judges structure. Output surfaces as a living artifact in DIW.",
  },
  {
    category: "documents",
    label: "Documents",
    specific_skills: ["pdf", "pitch deck", "slideshow", "slides", "deck", "presentation", "report", "blueprint", "spec"],
    primary_di: "gemini",
    secondary_di: "claude",
    di_candidates: ["DI_Chronicler", "DI_Emissary"],
    execution_surface: "creation-corner",
    artifact_type: "document",
    rationale: "Gemini large context for research-backed documents. DI_Chronicler anchors continuity; DI_Emissary handles external presentation.",
  },
  {
    category: "code",
    label: "Code",
    specific_skills: ["javascript", "python", "typescript", "react", "component", "web ui", "function", "script", "code", "debug", "algorithm"],
    primary_di: "gpt",
    secondary_di: "claude",
    di_candidates: ["DI_Architect"],
    execution_surface: "creation-corner",
    artifact_type: "code",
    rationale: "GPT excels at code generation across languages. DI_Architect provides structural review before output.",
  },
  {
    category: "creative",
    label: "Creative",
    specific_skills: ["write", "writing", "story", "narrative", "brainstorm", "essay", "poem", "letter", "voice", "tone", "creative"],
    primary_di: "claude",
    secondary_di: "gpt",
    di_candidates: ["DI_Mirror", "DI_Weaver"],
    execution_surface: "sanctuary",
    artifact_type: "narrative",
    rationale: "Claude produces high-quality prose and coherence. DI_Mirror reflects; DI_Weaver finds cross-session patterns.",
  },
  {
    category: "visual",
    label: "Visual",
    specific_skills: ["image", "jpeg", "png", "infographic", "visual", "illustration", "graphic", "banner", "thumbnail"],
    primary_di: "gpt",
    secondary_di: "gemini",
    di_candidates: ["DI_Emissary"],
    execution_surface: "creation-corner",
    artifact_type: "image",
    rationale: "GPT DALL-E for image generation. DI_Emissary handles external-facing visual translation.",
  },
  {
    category: "data_analysis",
    label: "Data / Analysis",
    specific_skills: ["data", "database", "sql", "query", "analytics", "analysis", "metrics", "statistics", "social media", "algorithm", "dataset", "csv"],
    primary_di: "gpt",
    secondary_di: "gemini",
    di_candidates: ["DI_Witness"],
    execution_surface: "blackboard-room",
    artifact_type: "analysis",
    rationale: "GPT code interpreter runs queries and returns structured analyses. DI_Witness documents with neutral precision.",
  },
  {
    category: "context_aware",
    label: "Context-Aware",
    specific_skills: ["research", "synthesis", "marketing", "copy", "summarize", "aggregate", "synthesize", "context", "campaign"],
    primary_di: "gemini",
    secondary_di: "claude",
    di_candidates: ["DI_Weaver", "DI_Chronicler"],
    execution_surface: "creation-corner",
    artifact_type: "document",
    rationale: "Gemini aggregates multi-source context at scale. DI_Weaver connects threads; DI_Chronicler ensures continuity.",
  },
];

// ── Content Kind → Category Hint ─────────────────────────────────────────────

const KIND_TO_CATEGORY: Partial<Record<OrchestratedContentKind, SkillCategory>> = {
  mind_map: "rich_rendering",
  report_document: "documents",
  session_recap: "context_aware",
  profile_signal: "context_aware",
  scaffold_signal: "rich_rendering",
  raw_capture: "context_aware",
};

// ── Keyword Scorer ────────────────────────────────────────────────────────────

function scoreEntry(entry: SkillEntry, text: string): { matched: string[]; score: number } {
  const matched = entry.specific_skills.filter((skill) => text.includes(skill.toLowerCase()));
  return { matched, score: matched.length };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * resolveSkillRoute — given free-form text + the content kind already
 * determined by intentClassifier, returns the best DI selection.
 *
 * Resolution priority:
 *   1. Keyword match across all SKILL_REGISTRY entries (highest score wins)
 *   2. Content-kind hint from KIND_TO_CATEGORY
 *   3. Fallback to context_aware
 */
export function resolveSkillRoute(
  text: string,
  contentKind: OrchestratedContentKind,
): DISelection {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();

  // Score every entry
  const scored = SKILL_REGISTRY.map((entry) => ({
    entry,
    ...scoreEntry(entry, normalized),
  }));

  // Best keyword match
  const best = scored.sort((a, b) => b.score - a.score)[0];

  if (best && best.score > 0) {
    return {
      category: best.entry.category,
      label: best.entry.label,
      primary_di: best.entry.primary_di,
      secondary_di: best.entry.secondary_di,
      di_candidates: best.entry.di_candidates,
      matched_skills: best.matched,
      execution_surface: best.entry.execution_surface,
      artifact_type: best.entry.artifact_type,
      confidence: Math.min(0.95, 0.6 + best.score * 0.1),
      rationale: best.entry.rationale,
    };
  }

  // Fall back to content-kind hint
  const hintCategory = KIND_TO_CATEGORY[contentKind];
  const hinted = hintCategory
    ? SKILL_REGISTRY.find((e) => e.category === hintCategory)
    : null;

  const fallback = hinted ?? SKILL_REGISTRY.find((e) => e.category === "context_aware")!;

  return {
    category: fallback.category,
    label: fallback.label,
    primary_di: fallback.primary_di,
    secondary_di: fallback.secondary_di,
    di_candidates: fallback.di_candidates,
    matched_skills: [],
    execution_surface: fallback.execution_surface,
    artifact_type: fallback.artifact_type,
    confidence: 0.45,
    rationale: `Fallback via content-kind hint (${contentKind}). ${fallback.rationale}`,
  };
}

/**
 * augmentDecisionWithSkill — thin wrapper that attaches diSelection
 * to an existing OrchestrationDecision without mutating the routing layer.
 *
 * Usage in decideOrchestration():
 *   const decision = decideOrchestration(input);
 *   const enriched = augmentDecisionWithSkill(decision, input);
 */
export function augmentDecisionWithSkill(
  decision: OrchestrationDecision,
  input: OrchestrationInput,
): OrchestrationDecision & { diSelection: DISelection } {
  const text = [
    input.title ?? "",
    input.text ?? "",
    ...(input.contextClues ?? []),
  ].join(" ");

  const diSelection = resolveSkillRoute(text, decision.contentKind);

  return {
    ...decision,
    diSelection,
    internalDiagnostics: [
      ...decision.internalDiagnostics,
      `skillRouter:category=${diSelection.category}`,
      `skillRouter:primary_di=${diSelection.primary_di}`,
      `skillRouter:di_candidates=${diSelection.di_candidates.join(",")}`,
      `skillRouter:matched=${diSelection.matched_skills.join(",") || "none (fallback)"}`,
      `skillRouter:execution_surface=${diSelection.execution_surface}`,
      `skillRouter:confidence=${diSelection.confidence.toFixed(2)}`,
    ],
  };
}
