export type GravityConfidence = "high" | "medium" | "low" | "noise";

export interface GravityAnalysisInput {
  text: string;
  title?: string;
  source_type?: string;
  context?: string;
}

export interface GravitySurfaceMap {
  loud_claims: string[];
  intensifiers: string[];
  repetition_patterns: string[];
  implied_frame: string;
  notable_absences: string[];
}

export interface GravityReport {
  load_bearing_claims: string[];
  claims_that_collapse_under_scrutiny: string[];
  actual_delta: string;
  incentive_distortion: string;
  signal: string;
  confidence: GravityConfidence;
}

export interface TwoPassGravityResult {
  surface_map: GravitySurfaceMap;
  gravity_report: GravityReport;
  signal_weight: number;
}

const INTENSIFIER_PATTERNS = [
  /\brevolutionary\b/i,
  /\bunprecedented\b/i,
  /\btransformative\b/i,
  /\bgame-changing\b/i,
  /\bbreakthrough\b/i,
  /\bcategory-defining\b/i,
  /\bbest-in-class\b/i,
  /\bworld-class\b/i,
  /\bnext-generation\b/i,
  /\bmarket-leading\b/i,
  /\bmassive\b/i,
  /\bdramatically\b/i,
  /\bseamless\b/i,
  /\beffortless\b/i,
  /\bguaranteed?\b/i,
  /\bproof\b/i,
  /\bproven\b/i,
  /\balways\b/i,
  /\bnever\b/i,
];

const CLAIM_VERB_PATTERNS = [
  /\b(can|will|does|adds?|delivers|links?|stores?|reduces|improves|accelerates|simplifies|solves|replaces|automates|enables|supports|detects|measures|prioritizes|tags?)\b/i,
  /\b(better than|more than|less than|faster than|ahead of)\b/i,
];

const SUPPORT_MARKERS = [
  /\b\d+(?:\.\d+)?%?\b/,
  /\b(?:because|by|through|using|via|with|when|if|so that)\b/i,
  /\b(?:schema|table|function|workflow|metric|dataset|benchmark|evidence|citation|example|implementation|vector|embedding|rpc|api|sql|join|index|priority)\b/i,
];

const FRAME_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:better than|vs\.?|versus|compared to)\b/i, "comparison frame"],
  [/\b(?:revolutionary|transformative|game-changing|breakthrough)\b/i, "transformation frame"],
  [/\b(?:platform|ecosystem|end-to-end|stack)\b/i, "platform frame"],
  [/\b(?:best-in-class|category-defining|market-leading|industry standard)\b/i, "category-leadership frame"],
  [/\b(?:benchmark|evidence|proof|falsifiable|measurement)\b/i, "evidence frame"],
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "this",
  "there",
  "their",
  "have",
  "will",
  "been",
  "into",
  "about",
  "would",
  "could",
  "should",
  "for",
  "your",
  "what",
  "when",
  "where",
  "which",
  "while",
  "than",
  "then",
  "they",
  "them",
  "these",
  "those",
  "its",
  "our",
  "out",
  "can",
  "not",
  "just",
  "more",
  "less",
]);

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const parts = normalized.match(/[^.!?\n]+[.!?]?/g) ?? [normalized];
  return parts.map((part) => normalizeText(part)).filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractPatternMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];
  for (const pattern of patterns) {
    const matcher = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = matcher.exec(text)) !== null) {
      matches.push(normalizeText(match[0]));
      if (!matcher.global) break;
    }
  }
  return unique(matches);
}

function getWordCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  const words = text
    .toLowerCase()
    .match(/\b[a-z][a-z0-9-]{2,}\b/g) ?? [];

  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return counts;
}

function extractLoudClaims(sentences: string[]): string[] {
  return unique(
    sentences.filter((sentence) => {
      if (sentence.length < 12) return false;
      const hasClaimVerb = CLAIM_VERB_PATTERNS.some((pattern) => pattern.test(sentence));
      const hasIntensity = INTENSIFIER_PATTERNS.some((pattern) => pattern.test(sentence));
      const hasExclamation = sentence.includes("!");
      return hasClaimVerb || hasIntensity || hasExclamation;
    })
  );
}

function extractIntensifiers(text: string): string[] {
  return extractPatternMatches(text, INTENSIFIER_PATTERNS);
}

function detectRepetitionPatterns(text: string): string[] {
  const counts = getWordCounts(text);
  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([word, count]) => `${word} (x${count})`);
}

function detectImpliedFrame(text: string): string {
  for (const [pattern, frame] of FRAME_PATTERNS) {
    if (pattern.test(text)) {
      return frame;
    }
  }
  return "claim-to-evidence frame";
}

function detectNotableAbsences(text: string): string[] {
  const absences: string[] = [];

  if (!/\b\d+(?:\.\d+)?%?\b/.test(text)) {
    absences.push("No measurable thresholds or counts are stated.");
  }

  if (!/\b(?:cite|citation|source|according to|reference|references)\b/i.test(text)) {
    absences.push("No citations or source references are named.");
  }

  if (!/\b(?:tradeoff|limitation|constraint|risk|failure mode|counterexample|counterpoint)\b/i.test(text)) {
    absences.push("No tradeoffs, limits, or failure modes are acknowledged.");
  }

  if (!/\b(?:example|for example|case study|demo|walkthrough)\b/i.test(text)) {
    absences.push("No concrete example is supplied.");
  }

  return absences;
}

function hasSpecificity(sentence: string): boolean {
  return SUPPORT_MARKERS.some((pattern) => pattern.test(sentence));
}

function collapseSentence(sentence: string): string {
  return sentence
    .replace(
      /\b(revolutionary|unprecedented|transformative|game-changing|breakthrough|best-in-class|world-class|next-generation|market-leading|category-defining|massive|dramatically|seamless|effortless|guaranteed?|proven|always|never)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+;/g, ";")
    .replace(/\s+:/g, ":")
    .trim();
}

function shortSentence(sentence: string): string {
  const pieces = sentence
    .split(/[,;]\s*|\s+\band\b\s+|\s+\bbut\b\s+/i)
    .map((piece) => normalizeText(piece))
    .filter(Boolean);

  return pieces[0] ?? normalizeText(sentence);
}

function selectActualDelta(loadBearingClaims: string[], sentences: string[]): string {
  const candidate =
    loadBearingClaims
      .slice()
      .sort((a, b) => a.length - b.length || a.localeCompare(b))[0] ??
    sentences.find((sentence) => hasSpecificity(sentence)) ??
    sentences[0] ??
    "";

  const collapsed = shortSentence(collapseSentence(candidate));
  return collapsed || candidate;
}

function buildIncentiveDistortion(text: string, sourceType?: string): string {
  const lower = text.toLowerCase();
  if (sourceType && /marketing|announcement|launch|sales|product/.test(sourceType.toLowerCase())) {
    return "Commercial framing rewards novelty, urgency, and category stretch.";
  }

  if (/(launch|announce|market|sell|buyers?|users?|customers?|growth|revenue|platform|category|disrupt)/.test(lower)) {
    return "The source is rewarded for sounding larger, newer, and more inevitable than the evidence warrants.";
  }

  return "The source may benefit from being believed before it is demonstrated.";
}

function confidenceFromClaims(loadBearingCount: number, collapseCount: number, intensityCount: number): GravityConfidence {
  if (loadBearingCount === 0) return "noise";
  if (loadBearingCount >= 2 && collapseCount === 0 && intensityCount <= 2) return "high";
  if (collapseCount > loadBearingCount || intensityCount >= 5) return "low";
  return "medium";
}

function signalWeightFromConfidence(
  confidence: GravityConfidence,
  loadBearingCount: number,
  collapseCount: number,
  repetitionCount: number,
  intensityCount: number
): number {
  const confidenceBase: Record<GravityConfidence, number> = {
    high: 0.86,
    medium: 0.62,
    low: 0.34,
    noise: 0.1,
  };

  const raw =
    confidenceBase[confidence] +
    Math.min(0.12, loadBearingCount * 0.03) -
    Math.min(0.08, collapseCount * 0.025) -
    Math.min(0.06, intensityCount * 0.01) +
    Math.min(0.05, repetitionCount * 0.008);

  return Math.max(0.05, Math.min(0.98, Math.round(raw * 1000) / 1000));
}

export function runTwoPassGravityProtocol(input: GravityAnalysisInput): TwoPassGravityResult {
  const textParts = [input.title, input.context, input.text].filter(Boolean).map((part) => normalizeText(part ?? ""));
  const text = normalizeText(textParts.join("\n\n"));
  const sentences = splitSentences(text);
  const loudClaims = extractLoudClaims(sentences);
  const intensifiers = extractIntensifiers(text);
  const repetitionPatterns = detectRepetitionPatterns(text);
  const impliedFrame = detectImpliedFrame(text);
  const notableAbsences = detectNotableAbsences(text);

  const loadBearingClaims = loudClaims.filter(
    (claim) => hasSpecificity(claim) || /\b(?:because|by|through|using|via|with|when|if)\b/i.test(claim)
  );

  const claimsThatCollapse = loudClaims.filter((claim) => {
    const hasSupport = hasSpecificity(claim) || /\b(?:because|by|through|using|via|with|when|if)\b/i.test(claim);
    const hypeHeavy = INTENSIFIER_PATTERNS.some((pattern) => pattern.test(claim));
    return !hasSupport || hypeHeavy;
  });

  const actualDelta = selectActualDelta(loadBearingClaims, sentences);
  const confidence = confidenceFromClaims(loadBearingClaims.length, claimsThatCollapse.length, intensifiers.length);
  const signalWeight = signalWeightFromConfidence(
    confidence,
    loadBearingClaims.length,
    claimsThatCollapse.length,
    repetitionPatterns.length,
    intensifiers.length
  );

  const signal =
    actualDelta ||
    "Nothing load-bearing survives the second pass.";

  return {
    surface_map: {
      loud_claims: loudClaims,
      intensifiers,
      repetition_patterns: repetitionPatterns,
      implied_frame: impliedFrame,
      notable_absences: notableAbsences,
    },
    gravity_report: {
      load_bearing_claims: loadBearingClaims,
      claims_that_collapse_under_scrutiny: claimsThatCollapse,
      actual_delta: actualDelta || "Nothing load-bearing survives the second pass.",
      incentive_distortion: buildIncentiveDistortion(text, input.source_type),
      signal,
      confidence,
    },
    signal_weight: signalWeight,
  };
}

export function buildChunkSignalWeight(
  result: TwoPassGravityResult,
  chunkText: string,
  chunkIndex = 0
): number {
  const lowered = chunkText.toLowerCase();
  const matchesLoadBearing = result.gravity_report.load_bearing_claims.some((claim) =>
    lowered.includes(claim.toLowerCase())
  );
  const matchesSignal = lowered.includes(result.gravity_report.actual_delta.toLowerCase());
  const isCollapseHeavy = result.gravity_report.claims_that_collapse_under_scrutiny.some((claim) =>
    lowered.includes(claim.toLowerCase())
  );

  const base = result.signal_weight;
  const adjusted =
    base +
    (matchesLoadBearing ? 0.1 : 0) +
    (matchesSignal ? 0.08 : 0) -
    (isCollapseHeavy ? 0.08 : 0) -
    Math.min(0.05, chunkIndex * 0.005);

  return Math.max(0.05, Math.min(0.98, Math.round(adjusted * 1000) / 1000));
}
