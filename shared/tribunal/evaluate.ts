// GestaltView v2 — Tribunal Evaluation Engine
// © 2026 Keith Soyka / GestaltView
//
// Evaluates multiple candidate answers against corpus evidence,
// PLK resonance, and safety constraints.

import type {
  TribunalInput,
  TribunalVerdict,
  TribunalScore,
  CandidateAnswer,
  TribunalFragment,
} from "./types";

/**
 * Score a single candidate answer against evidence fragments.
 * Returns normalized scores for evidence alignment, PLK resonance, and safety.
 */
function scoreCandidate(
  candidate: CandidateAnswer,
  fragments: TribunalFragment[]
): TribunalScore {
  const response = candidate.response.toLowerCase();

  let evidenceAlignment = 0;
  for (const fragment of fragments) {
    const keywords = fragment.content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const matches = keywords.filter((kw) => response.includes(kw));
    evidenceAlignment += matches.length / Math.max(keywords.length, 1);
  }
  evidenceAlignment = Math.min(evidenceAlignment / Math.max(fragments.length, 1), 1);

  const plkSignals = [
    /\bexact words\b/i,
    /\bpreserve\b/i,
    /\bnever paraphrase\b/i,
    /\bcontext\b/i,
    /\bpacing\b/i,
  ];
  const plkResonance = plkSignals.filter((re) => re.test(candidate.response)).length / plkSignals.length;

  const unsafePatterns = [
    /\bguarantee\b/i,
    /\bcure\b/i,
    /\b100%\b/,
    /\bno risk\b/i,
    /\bpromise\b/i,
  ];
  const unsafeCount = unsafePatterns.filter((re) => re.test(candidate.response)).length;
  const safetyScore = Math.max(0, 1 - unsafeCount * 0.25);

  const overallScore = evidenceAlignment * 0.5 + plkResonance * 0.25 + safetyScore * 0.25;

  return {
    answerId: candidate.id,
    provider: candidate.provider,
    evidenceAlignment: Math.round(evidenceAlignment * 1000) / 1000,
    plkResonance: Math.round(plkResonance * 1000) / 1000,
    safetyScore: Math.round(safetyScore * 1000) / 1000,
    overallScore: Math.round(overallScore * 1000) / 1000,
  };
}

/**
 * Run tribunal evaluation on candidate answers.
 *
 * This is the local heuristic evaluator. For high-stakes flows,
 * the Perplexity Computer `tribunal_evaluate` tool supplements
 * this with an LLM-based deep evaluation via Claude Opus 4.6.
 */
export function evaluateTribunal(input: TribunalInput): TribunalVerdict {
  const fragments = input.contextFragments || [];
  const scores = input.candidateAnswers.map((candidate) =>
    scoreCandidate(candidate, fragments)
  );

  scores.sort((a, b) => b.overallScore - a.overallScore);

  const winner = scores.length > 0 ? scores[0] : null;
  const verdictSummary = winner
    ? `${winner.provider} scored highest (${winner.overallScore.toFixed(3)}) with evidence alignment ${winner.evidenceAlignment.toFixed(3)}, PLK resonance ${winner.plkResonance.toFixed(3)}, safety ${winner.safetyScore.toFixed(3)}.`
    : "No candidates were provided for evaluation.";

  return {
    eventId: crypto.randomUUID(),
    question: input.question,
    winningAnswerId: winner?.answerId ?? null,
    verdictSummary,
    scores,
    evidenceCount: fragments.length,
    timestamp: new Date().toISOString(),
  };
}
