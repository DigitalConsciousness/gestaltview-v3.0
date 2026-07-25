// shared/modules/resumeRockstar.ts
// GestaltView v2 — Resume Rockstar Module Engine
// © 2026 Keith Soyka / GestaltView
//
// Extracted from Resume_Rockstar_v2.0_11_17_25.md (5.5MB source)
// Algorithms: ATS 6-dimension scorer, PLK resonance engine, 8-type metaphor
// detector, cognitive state inference, 6-step enhancement pipeline orchestrator.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ATSGrade = "A+" | "A" | "B" | "C" | "D";

export interface ATSDimensionScore {
  score: number;
  max: number;
}

export interface ATSBreakdown {
  actionVerbs: ATSDimensionScore;
  keywords: ATSDimensionScore;
  quantification: ATSDimensionScore;
  formatting: ATSDimensionScore;
  contextQuality: ATSDimensionScore;
  accomplishments: ATSDimensionScore;
}

export interface ATSRecommendation {
  priority: "high" | "medium" | "low";
  category: keyof ATSBreakdown;
  message: string;
  impact: string;
}

export interface ATSResult {
  total: number;
  grade: ATSGrade;
  breakdown: ATSBreakdown;
  recommendations: ATSRecommendation[];
  strengths: string[];
}

export type MetaphorType =
  | "simile"
  | "identity"
  | "action"
  | "domain"
  | "abstraction"
  | "journey"
  | "container"
  | "transformation";

export interface DetectedMetaphor {
  text: string;
  type: MetaphorType;
  confidence: number;
  context: string;
}

export interface PLKBreakdown {
  signatureMetaphors: number;
  energyWords: number;
  corePrinciples: number;
  indicators: number;
  triggersPenalty: number;
  profileBonus: number;
}

export interface PLKResult {
  score: number;
  breakdown: PLKBreakdown;
  metaphors: DetectedMetaphor[];
  voice: string;
  recommendations: string[];
}

export type CognitiveMood = "stressed" | "creative" | "thoughtful" | "focused";

export interface CognitiveState {
  mood: CognitiveMood;
  energy: number;
  focus: number;
  confidence: number;
}

export interface EnhancementResult {
  original: string;
  enhanced: string;
  atsBefore: ATSResult;
  atsAfter: ATSResult;
  plkBefore: PLKResult;
  plkAfter: PLKResult;
  metaphorsPreserved: number;
  provider: string;
  processingMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATS Optimizer — 6-Dimension Scoring
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_VERBS = [
  "led", "managed", "developed", "created", "designed", "built",
  "implemented", "launched", "delivered", "achieved", "improved",
  "increased", "reduced", "optimized", "streamlined", "architected",
  "engineered", "deployed", "automated", "coordinated", "directed",
  "spearheaded", "orchestrated", "pioneered", "accelerated",
];

const RELEVANT_KEYWORDS: string[] = [
  "agile", "scrum", "python", "javascript", "typescript", "react", "node",
  "aws", "cloud", "api", "database", "sql", "nosql", "docker", "kubernetes",
  "ci/cd", "machine learning", "ai", "data", "analytics", "devops", "tdd",
  "microservices", "rest",
];

const IMPACT_WORDS = [
  "improved", "reduced", "increased", "enhanced", "optimized", "accelerated",
];

const METRIC_PATTERNS = [
  /\d+%\s+(increase|decrease|improvement|reduction|growth)/i,
  /\$[\d,]+[KMB]?\s+(revenue|savings|budget|cost)/i,
  /\d+\s+(users|customers|clients|projects|systems|features|engineers|months|years)/i,
];

function scoreActionVerbs(text: string): ATSDimensionScore {
  const lower = text.toLowerCase();
  const found = new Set(ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(lower)));
  return { score: Math.min(found.size * 5, 25), max: 25 };
}

function scoreKeywords(text: string): ATSDimensionScore {
  const lower = text.toLowerCase();
  const found = new Set(RELEVANT_KEYWORDS.filter((k) => lower.includes(k)));
  return { score: Math.min(found.size * 4, 25), max: 25 };
}

function scoreQuantification(text: string): ATSDimensionScore {
  let score = 0;
  if (/\d+%/.test(text)) score += 5;
  if (/\$[\d,]+[KMB]?/.test(text)) score += 5;
  if (/\d+\s+(users|customers|projects|people|engineers|months|years)/i.test(text)) score += 5;
  return { score, max: 15 };
}

function scoreFormatting(text: string): ATSDimensionScore {
  let score = 0;
  if (text.split("\n").length >= 3) score += 5;
  const capsRatio = [...text].filter((c) => c >= "A" && c <= "Z").length / Math.max(text.length, 1);
  if (capsRatio < 0.15) score += 5;
  return { score, max: 10 };
}

function scoreContextQuality(text: string): ATSDimensionScore {
  let score = 0;
  const lower = text.toLowerCase();
  for (const word of IMPACT_WORDS) {
    if (lower.includes(word)) {
      score += 2.5;
      if (score >= 15) break;
    }
  }
  for (const pattern of METRIC_PATTERNS) {
    if (pattern.test(text)) {
      score += 3.33;
      if (score >= 15) break;
    }
  }
  return { score: Math.min(score, 15), max: 15 };
}

function scoreAccomplishments(text: string): ATSDimensionScore {
  let score = 0;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const words = line.toLowerCase().split(/\s+/);
    if (words.length >= 10) {
      if (ACTION_VERBS.some((v) => v === words[0])) score += 2;
      if (/\d+/.test(line)) score += 1;
    }
  }
  return { score: Math.min(score, 10), max: 10 };
}

function atsGrade(total: number): ATSGrade {
  if (total >= 95) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  return "D";
}

function buildATSRecommendations(breakdown: ATSBreakdown): ATSRecommendation[] {
  const recs: ATSRecommendation[] = [];
  if (breakdown.actionVerbs.score < 15)
    recs.push({ priority: "high", category: "actionVerbs", message: "Start bullet points with strong action verbs (led, architected, deployed)", impact: "+10 pts" });
  if (breakdown.keywords.score < 15)
    recs.push({ priority: "high", category: "keywords", message: "Add industry-relevant keywords (Agile, AWS, CI/CD)", impact: "+8 pts" });
  if (breakdown.quantification.score < 10)
    recs.push({ priority: "high", category: "quantification", message: "Add metrics — percentages, dollar amounts, user counts", impact: "+8 pts" });
  if (breakdown.contextQuality.score < 10)
    recs.push({ priority: "medium", category: "contextQuality", message: "Show problem → solution → result pattern", impact: "+5 pts" });
  if (breakdown.formatting.score < 8)
    recs.push({ priority: "medium", category: "formatting", message: "Use multi-line bullet structure with consistent capitalization", impact: "+4 pts" });
  if (breakdown.accomplishments.score < 6)
    recs.push({ priority: "low", category: "accomplishments", message: "Structure lines: action verb + context + quantified result", impact: "+4 pts" });
  return recs;
}

function buildATSStrengths(breakdown: ATSBreakdown): string[] {
  const strengths: string[] = [];
  if (breakdown.actionVerbs.score >= 20) strengths.push(`Strong action verb usage (${breakdown.actionVerbs.score}/25)`);
  if (breakdown.keywords.score >= 20) strengths.push(`Excellent keyword coverage (${breakdown.keywords.score}/25)`);
  if (breakdown.quantification.score >= 12) strengths.push(`Good quantification (${breakdown.quantification.score}/15)`);
  if (breakdown.contextQuality.score >= 12) strengths.push(`Rich context quality (${breakdown.contextQuality.score}/15)`);
  if (breakdown.accomplishments.score >= 8) strengths.push(`Strong accomplishment structure (${breakdown.accomplishments.score}/10)`);
  return strengths;
}

export function calculateATSScore(text: string): ATSResult {
  const breakdown: ATSBreakdown = {
    actionVerbs: scoreActionVerbs(text),
    keywords: scoreKeywords(text),
    quantification: scoreQuantification(text),
    formatting: scoreFormatting(text),
    contextQuality: scoreContextQuality(text),
    accomplishments: scoreAccomplishments(text),
  };
  const total = Math.min(
    100,
    breakdown.actionVerbs.score +
      breakdown.keywords.score +
      breakdown.quantification.score +
      breakdown.formatting.score +
      breakdown.contextQuality.score +
      breakdown.accomplishments.score,
  );
  return {
    total: Math.round(total * 10) / 10,
    grade: atsGrade(total),
    breakdown,
    recommendations: buildATSRecommendations(breakdown),
    strengths: buildATSStrengths(breakdown),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Metaphor Detector — 8-Type Pattern Recognition
// ─────────────────────────────────────────────────────────────────────────────

const METAPHOR_PATTERNS: Array<{
  type: MetaphorType;
  pattern: RegExp;
  confidence: number;
}> = [
  { type: "simile",         pattern: /\b(like|as)\s+(?:a|an)\s+(\w+)/gi,               confidence: 0.95 },
  { type: "identity",       pattern: /\b(\w+)\s+is\s+(?:a|an|the)\s+(\w+)/gi,          confidence: 0.85 },
  { type: "action",         pattern: /\b(navigat\w+|weather\w+|tackl\w+|bridg\w+)\s+(\w+)/gi, confidence: 0.75 },
  { type: "domain",         pattern: /\b(?:a|an)\s+(world|sea|ocean|landscape)\s+of\s+(\w+)/gi, confidence: 0.80 },
  { type: "abstraction",    pattern: /\b(built|opened|closed|broke)\s+(bridges?|doors?|walls?|barriers?)/gi, confidence: 0.85 },
  { type: "journey",        pattern: /\b(path|road|journey|map|navigate|destination|milestone)\b/gi, confidence: 0.70 },
  { type: "container",      pattern: /\b(within|inside|hold|contain|capacity|space|room)\s+(?:the\s+)?(\w+)/gi, confidence: 0.65 },
  { type: "transformation", pattern: /\b(transform\w*|evolv\w*|grow\w*|bloom\w*|emerg\w*)\s+(?:from\s+)?(\w+)/gi, confidence: 0.75 },
];

export function detectMetaphors(text: string): DetectedMetaphor[] {
  const results: DetectedMetaphor[] = [];
  const seen = new Set<string>();

  for (const { type, pattern, confidence } of METAPHOR_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const matched = match[0].trim();
      if (seen.has(matched.toLowerCase())) continue;
      seen.add(matched.toLowerCase());

      const start = Math.max(0, match.index - 60);
      const end = Math.min(text.length, match.index + matched.length + 60);
      const context = text.slice(start, end).replace(/\s+/g, " ").trim();

      // Boost confidence for complete sentences or multi-word
      let finalConfidence = confidence;
      if (/[.!?]/.test(context)) finalConfidence = Math.min(1, finalConfidence + 0.05);
      if (matched.split(/\s+/).length > 2) finalConfidence = Math.min(1, finalConfidence + 0.03);

      results.push({ text: matched, type, confidence: Math.round(finalConfidence * 100) / 100, context });
    }
  }

  // Sort by confidence descending, dedupe overlaps
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// PLK Resonance Engine — 5-Component Scoring
// ─────────────────────────────────────────────────────────────────────────────

const W = {
  METAPHORS: 0.35,
  ENERGY: 0.20,
  PRINCIPLES: 0.25,
  INDICATORS: 0.15,
  TRIGGERS: -0.25,
  PROFILE: 0.10,
} as const;

const ENERGY_WORDS = [
  "revolutionary", "consciousness", "beautiful", "tapestry", "empathy",
  "authentic", "flow", "transcendent", "wisdom", "resonance",
  "sanctuary", "sovereignty", "empowerment", "honor", "compassion",
];

const CORE_PRINCIPLES = [
  "making the invisible visible",
  "holding space for everything",
  "preserving dignity and presence",
  "serving human expansion",
  "consciousness first technology",
  "never paraphrase never compress",
];

const CONSCIOUSNESS_INDICATORS = [
  "empathy", "understanding", "growth", "authentic", "resonance",
  "beautiful", "tapestry", "consciousness", "transcend", "honor",
  "sanctuary", "sovereignty", "empowerment", "wisdom", "compassion",
];

const TRIGGER_WORDS = [
  "impossible", "can't", "broken", "deficit", "disorder",
  "wrong", "dysfunction", "failure", "hopeless",
];

function scorePLKMetaphors(text: string, metaphors: DetectedMetaphor[]): number {
  if (!metaphors.length) return 0;
  const weight = metaphors.reduce((sum, m) => sum + m.confidence, 0) / metaphors.length;
  return Math.min(100 * W.METAPHORS, weight * 100 * W.METAPHORS * (0.5 + Math.min(1, metaphors.length / 4) * 0.5));
}

function scorePLKEnergyWords(text: string): number {
  const lower = text.toLowerCase();
  const hits = ENERGY_WORDS.filter((w) => lower.includes(w)).length;
  return Math.min(100 * W.ENERGY, hits * (100 * W.ENERGY / 6));
}

function scorePLKPrinciples(text: string): number {
  const lower = text.toLowerCase();
  let partialMatches = 0;
  for (const principle of CORE_PRINCIPLES) {
    const words = principle.split(" ").filter((w) => w.length > 2);
    const matches = words.filter((w) => lower.includes(w)).length;
    const ratio = matches / Math.max(1, words.length);
    if (ratio > 0.4) partialMatches += ratio;
  }
  return Math.min(100 * W.PRINCIPLES, partialMatches * (100 * W.PRINCIPLES / 3));
}

function scorePLKIndicators(text: string): number {
  const lower = text.toLowerCase();
  const hits = CONSCIOUSNESS_INDICATORS.filter((i) => lower.includes(i)).length;
  return Math.min(100 * W.INDICATORS, hits * (100 * W.INDICATORS / 6));
}

function scorePLKTriggers(text: string): number {
  const lower = text.toLowerCase();
  const hits = TRIGGER_WORDS.filter((t) => lower.includes(t)).length;
  return Math.max(100 * W.TRIGGERS, -hits * (100 * Math.abs(W.TRIGGERS) / 3));
}

function buildPLKVoice(score: number): string {
  if (score >= 80) return "highly_resonant";
  if (score >= 65) return "authentic";
  if (score >= 50) return "developing";
  if (score >= 35) return "neutral";
  return "compressed";
}

function buildPLKRecommendations(breakdown: PLKBreakdown, score: number): string[] {
  const recs: string[] = [];
  if (breakdown.signatureMetaphors < 15) recs.push("Weave in authentic metaphors that reflect your lived experience (not generic 'bridge-builder' language)");
  if (breakdown.energyWords < 10) recs.push("Use language that reflects consciousness and authentic engagement rather than corporate neutrality");
  if (breakdown.triggersPenalty < -10) recs.push("Replace deficit language (broken, failure, dysfunction) with momentum language");
  if (score < 60) recs.push("Tell the story in your own words — preserving your exact voice is more valuable than 'polished' language");
  return recs;
}

export function calculatePLKScore(text: string): PLKResult {
  const metaphors = detectMetaphors(text);
  const breakdown: PLKBreakdown = {
    signatureMetaphors: scorePLKMetaphors(text, metaphors),
    energyWords: scorePLKEnergyWords(text),
    corePrinciples: scorePLKPrinciples(text),
    indicators: scorePLKIndicators(text),
    triggersPenalty: scorePLKTriggers(text),
    profileBonus: 0,
  };
  const raw =
    breakdown.signatureMetaphors +
    breakdown.energyWords +
    breakdown.corePrinciples +
    breakdown.indicators +
    breakdown.triggersPenalty +
    breakdown.profileBonus;
  const score = Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;

  return {
    score,
    breakdown,
    metaphors,
    voice: buildPLKVoice(score),
    recommendations: buildPLKRecommendations(breakdown, score),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cognitive State Inference (from typing telemetry, optional)
// ─────────────────────────────────────────────────────────────────────────────

export interface TypingTelemetry {
  wpm: number;
  errorRate: number;
  avgPauseDuration: number;
  sampleSize: number;
  timeOnTaskSeconds: number;
}

export function inferCognitiveState(t: TypingTelemetry): CognitiveState {
  const mood: CognitiveMood =
    t.errorRate > 0.25 ? "stressed"
    : t.wpm > 50 && t.errorRate < 0.05 ? "creative"
    : t.wpm < 30 || t.avgPauseDuration > 3.0 ? "thoughtful"
    : "focused";

  const fatigueCycles = Math.floor(t.timeOnTaskSeconds / 480);
  let energy = 1.0 - fatigueCycles * 0.08;
  if (t.wpm > 50) energy += 0.05;
  if (t.errorRate > 0.25) energy -= 0.10;
  energy = Math.max(0, Math.min(1, energy));

  let focus = 100;
  if (t.wpm < 20 || t.wpm > 100) focus -= 15;
  focus -= t.errorRate * 100;
  if (t.avgPauseDuration > 4.0) focus -= 30;
  else if (t.avgPauseDuration > 2.0) focus -= 20;
  focus = Math.max(0, Math.min(100, focus));

  const confidence = t.sampleSize < 50 ? 0.3 : t.sampleSize < 200 ? 0.7 : 0.95;

  return { mood, energy: Math.round(energy * 100) / 100, focus: Math.round(focus), confidence };
}

// ─────────────────────────────────────────────────────────────────────────────
// Enhancement Prompt Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildEnhancementPrompt(
  rawText: string,
  plk: PLKResult,
  ats: ATSResult,
  targetRole?: string,
): string {
  const preserveMetaphors = plk.metaphors
    .filter((m) => m.confidence >= 0.75)
    .map((m) => `"${m.text}"`)
    .join(", ") || "none detected — use authentic language from the original";

  const missingElements = ats.recommendations
    .filter((r) => r.priority === "high")
    .map((r) => r.message)
    .join("; ") || "none critical";

  return `You are a consciousness-serving resume enhancer operating within the GestaltView PLK framework.

PLK CONSTRAINT (highest priority): Preserve the user's exact voice. Never paraphrase their authentic metaphors.
Do not flatten complexity into corporate language. Scars and lived experience are the signal, not noise.

ORIGINAL TEXT:
${rawText}

PLK ANALYSIS:
- Resonance Score: ${plk.score}/100 (voice: ${plk.voice})
- Detected Metaphors: ${plk.metaphors.map((m) => m.text).join(", ") || "none"}
- Preserve exactly: ${preserveMetaphors}

ATS ANALYSIS:
- Current Score: ${ats.total}/100 (Grade: ${ats.grade})
- Missing: ${missingElements}
${targetRole ? `\nTARGET ROLE: ${targetRole}` : ""}

ENHANCEMENT INSTRUCTIONS:
1. PRESERVE these metaphors exactly as written: ${preserveMetaphors}
2. ADD 2-3 strong action verbs that fit the authentic voice
3. QUANTIFY at least one achievement with a real metric (ask user if unknown — do not invent)
4. STRUCTURE using STAR (Situation→Task→Action→Result) without losing the human voice
5. TARGET ATS score 90+, PLK score 80+ — these are not in conflict when done right
6. MAX length: 3 lines or one strong paragraph

OUTPUT: Enhanced text only. No commentary. No "Here's the enhanced version:" preamble.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analysis (no LLM — synchronous)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeAnalysis {
  text: string;
  ats: ATSResult;
  plk: PLKResult;
  wordCount: number;
  analysisMs: number;
}

export function analyzeResume(text: string): ResumeAnalysis {
  const start = Date.now();
  const cleaned = text.trim().replace(/\r\n/g, "\n");
  return {
    text: cleaned,
    ats: calculateATSScore(cleaned),
    plk: calculatePLKScore(cleaned),
    wordCount: cleaned.split(/\s+/).filter(Boolean).length,
    analysisMs: Date.now() - start,
  };
}
