// shared/modules/vibeCoder.ts
// GestaltView v2 — VibeCoder Module Engine
// © 2026 Keith Soyka / GestaltView
//
// Ported from VibeCoder Python source.
// Clarity scoring + vibe alignment scoring (concept preservation + metaphor bonus).
// Fully synchronous. No LLM required.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ClarityGrade = "crystal" | "clear" | "hazy" | "murky" | "opaque";

export type VibeAlignment =
  | "resonant"     // high concept preservation + metaphor bonus
  | "aligned"      // solid concept preservation, minimal metaphor
  | "drifting"     // some concepts lost, voice present
  | "compressed"   // most concepts lost, clinical language
  | "severed";     // near-zero preservation

export interface ClarityBreakdown {
  sentenceLength: number;      // /25 — penalises wall-of-text
  vocabularyRange: number;     // /20 — rewards lexical variety
  concreteNouns: number;       // /20 — rewards grounded language
  activeVoice: number;         // /20 — rewards agency
  punctuationFlow: number;     // /15 — rewards readable rhythm
}

export interface ClarityResult {
  score: number;               // 0–100
  grade: ClarityGrade;
  breakdown: ClarityBreakdown;
  recommendations: string[];
}

export interface ConceptMatch {
  concept: string;
  preserved: boolean;
  foundIn: string;             // snippet of target where it was found
}

export interface VibeResult {
  score: number;               // 0–100
  alignment: VibeAlignment;
  conceptPreservation: number; // 0–100
  metaphorBonus: number;       // 0–20 additive
  conceptMatches: ConceptMatch[];
  recommendations: string[];
}

export interface VibeAnalysis {
  text: string;
  wordCount: number;
  clarity: ClarityResult;
  vibe: VibeResult;
  analysisMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clarity Scorer
// ─────────────────────────────────────────────────────────────────────────────

const CONCRETE_NOUNS = [
  "system", "file", "function", "user", "page", "button", "form", "table",
  "database", "server", "request", "response", "component", "module", "route",
  "api", "token", "key", "error", "message", "data", "list", "item", "event",
  "hook", "state", "store", "model", "view", "action", "flow", "step", "layer",
  "bridge", "map", "path", "door", "wall", "room", "window", "light", "voice",
  "hand", "eye", "mind", "heart", "body", "word", "story", "memory", "moment",
];

const PASSIVE_SIGNALS = [
  " is being ", " was being ", " has been ", " have been ", " had been ",
  " will be ", " is done ", " was done ", " gets done ",
  " is made ", " was made ", " is used ", " was used ",
];

function scoreSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (!sentences.length) return 12;
  const avgWords = sentences.reduce((sum, s) => {
    return sum + s.trim().split(/\s+/).filter(Boolean).length;
  }, 0) / sentences.length;
  // Sweet spot: 12–20 words. Penalty above 30.
  if (avgWords <= 20) return 25;
  if (avgWords <= 30) return 18;
  if (avgWords <= 40) return 10;
  return 5;
}

function scoreVocabularyRange(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (!words.length) return 0;
  const unique = new Set(words);
  const ratio = unique.size / words.length;
  return Math.round(Math.min(20, ratio * 28));
}

function scoreConcreteNouns(text: string): number {
  const lower = text.toLowerCase();
  const hits = CONCRETE_NOUNS.filter(n => lower.includes(n)).length;
  return Math.min(20, hits * 2);
}

function scoreActiveVoice(text: string): number {
  const lower = text.toLowerCase();
  const passiveHits = PASSIVE_SIGNALS.filter(p => lower.includes(p)).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const passiveRatio = passiveHits / sentences;
  if (passiveRatio === 0) return 20;
  if (passiveRatio < 0.2) return 16;
  if (passiveRatio < 0.4) return 10;
  return 5;
}

function scorePunctuationFlow(text: string): number {
  const chars = text.length;
  if (!chars) return 7;
  const commas = (text.match(/,/g) ?? []).length;
  const dashes = (text.match(/—|–|-/g) ?? []).length;
  const colons = (text.match(/:/g) ?? []).length;
  const rhythmMarkers = commas + dashes + colons;
  const density = rhythmMarkers / Math.max(1, chars / 100);
  // Target: ~2–6 rhythm markers per 100 chars
  if (density >= 2 && density <= 6) return 15;
  if (density >= 1 && density <= 8) return 10;
  return 6;
}

function clarityGrade(score: number): ClarityGrade {
  if (score >= 88) return "crystal";
  if (score >= 72) return "clear";
  if (score >= 55) return "hazy";
  if (score >= 38) return "murky";
  return "opaque";
}

function buildClarityRecommendations(breakdown: ClarityBreakdown): string[] {
  const recs: string[] = [];
  if (breakdown.sentenceLength < 15)
    recs.push("Break long sentences. Target 12–20 words per sentence for maximum readability.");
  if (breakdown.vocabularyRange < 12)
    recs.push("Vary your word choice — repetition flattens impact.");
  if (breakdown.concreteNouns < 10)
    recs.push("Anchor abstract ideas with concrete nouns (things you can point to).");
  if (breakdown.activeVoice < 12)
    recs.push("Prefer active voice: 'I built X' over 'X was built'.");
  if (breakdown.punctuationFlow < 8)
    recs.push("Use rhythm markers (commas, dashes, colons) to give sentences breathing room.");
  return recs;
}

export function calculateClarityScore(text: string): ClarityResult {
  const breakdown: ClarityBreakdown = {
    sentenceLength: scoreSentenceLength(text),
    vocabularyRange: scoreVocabularyRange(text),
    concreteNouns: scoreConcreteNouns(text),
    activeVoice: scoreActiveVoice(text),
    punctuationFlow: scorePunctuationFlow(text),
  };
  const score = Math.min(
    100,
    breakdown.sentenceLength +
    breakdown.vocabularyRange +
    breakdown.concreteNouns +
    breakdown.activeVoice +
    breakdown.punctuationFlow
  );
  return {
    score: Math.round(score * 10) / 10,
    grade: clarityGrade(score),
    breakdown,
    recommendations: buildClarityRecommendations(breakdown),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Vibe Alignment Scorer
// Requires a source text (the original voice) and a target text (the output).
// When called with a single text, source === target → perfect preservation.
// ─────────────────────────────────────────────────────────────────────────────

const METAPHOR_MARKERS = [
  "like", "as a", "as an", "is a", "is the", "bridge", "journey", "map",
  "navigate", "tapestry", "sanctuary", "weave", "thread", "light", "shadow",
  "river", "ocean", "mountain", "door", "window", "mirror", "fire", "seed",
  "bloom", "transform", "emerge", "constellation", "compass", "anchor",
];

function extractConcepts(text: string): string[] {
  // Extract meaningful multi-word phrases and strong single nouns
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 4);
  const unique = [...new Set(words)];
  // Return top 20 by length (longer = more specific = more meaningful)
  return unique.sort((a, b) => b.length - a.length).slice(0, 20);
}

function scoreConceptPreservation(
  sourceConcepts: string[],
  targetText: string
): { score: number; matches: ConceptMatch[] } {
  const lowerTarget = targetText.toLowerCase();
  const matches: ConceptMatch[] = [];

  for (const concept of sourceConcepts) {
    const idx = lowerTarget.indexOf(concept);
    const preserved = idx !== -1;
    const start = Math.max(0, idx - 30);
    const end = Math.min(lowerTarget.length, idx + concept.length + 30);
    matches.push({
      concept,
      preserved,
      foundIn: preserved ? targetText.slice(start, end).trim() : "",
    });
  }

  const preserved = matches.filter(m => m.preserved).length;
  const score = sourceConcepts.length === 0
    ? 100
    : Math.round((preserved / sourceConcepts.length) * 100);

  return { score, matches };
}

function scoreMetaphorBonus(sourceText: string, targetText: string): number {
  const lowerSource = sourceText.toLowerCase();
  const lowerTarget = targetText.toLowerCase();
  const sourceMarkers = METAPHOR_MARKERS.filter(m => lowerSource.includes(m));
  if (!sourceMarkers.length) return 0;
  const preserved = sourceMarkers.filter(m => lowerTarget.includes(m)).length;
  const ratio = preserved / sourceMarkers.length;
  return Math.round(Math.min(20, ratio * 20));
}

function vibeAlignment(conceptScore: number, metaphorBonus: number): VibeAlignment {
  const total = conceptScore + metaphorBonus * 0.5;
  if (total >= 90) return "resonant";
  if (total >= 72) return "aligned";
  if (total >= 52) return "drifting";
  if (total >= 32) return "compressed";
  return "severed";
}

function buildVibeRecommendations(
  alignment: VibeAlignment,
  conceptScore: number,
  metaphorBonus: number
): string[] {
  const recs: string[] = [];
  if (conceptScore < 60)
    recs.push("Core concepts from the original are not making it through — the voice is being compressed. Restore the original's key nouns and phrases.");
  if (metaphorBonus < 8)
    recs.push("The original's metaphors aren't present in the output. Metaphors are not decoration — they're how this person thinks. Preserve them exactly.");
  if (alignment === "drifting")
    recs.push("The output has drifted from the source voice. Pull it back toward the original's rhythm and imagery.");
  if (alignment === "compressed" || alignment === "severed")
    recs.push("The output has been sanitised into generic language. This is a PLK violation. Start over from the original.");
  return recs;
}

export function calculateVibeScore(
  sourceText: string,
  targetText: string
): VibeResult {
  const sourceConcepts = extractConcepts(sourceText);
  const { score: conceptPreservation, matches } = scoreConceptPreservation(
    sourceConcepts,
    targetText
  );
  const metaphorBonus = scoreMetaphorBonus(sourceText, targetText);
  const score = Math.min(
    100,
    Math.round(conceptPreservation * 0.8 + metaphorBonus * 1.0)
  );
  const alignment = vibeAlignment(conceptPreservation, metaphorBonus);

  return {
    score,
    alignment,
    conceptPreservation,
    metaphorBonus,
    conceptMatches: matches,
    recommendations: buildVibeRecommendations(alignment, conceptPreservation, metaphorBonus),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary export — single-text analysis (source === target, vibe is self-score)
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeVibe(text: string): VibeAnalysis {
  const start = Date.now();
  const cleaned = text.trim().replace(/\r\n/g, "\n");
  return {
    text: cleaned,
    wordCount: cleaned.split(/\s+/).filter(Boolean).length,
    clarity: calculateClarityScore(cleaned),
    vibe: calculateVibeScore(cleaned, cleaned),
    analysisMs: Date.now() - start,
  };
}
