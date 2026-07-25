export type TrainingLane = "knowledge" | "code" | "product" | "context";

export interface LaneReadinessInput {
  lane: TrainingLane;
  sourceCount: number;
  sourceFreshness: number;
  sourceDiversity: number;
  evaluationPassRate: number;
  citationCoverage: number;
  operatorSatisfaction: number;
}

export interface LaneReadinessReport {
  lane: TrainingLane;
  score: number;
  missingInputs: string[];
  nextBestAction: string;
}

export interface ActivationMilestone {
  label: string;
  completed: boolean;
  detail: string;
}

export interface WorkspaceReadinessReport {
  overallScore: number;
  setupCompletion: number;
  corpusCoverage: number;
  answerQuality: number;
  laneReports: LaneReadinessReport[];
  activationMilestones: ActivationMilestone[];
  goLiveVerdict: "not_ready" | "close" | "ready";
}

const laneWeightMap: Record<TrainingLane, number> = {
  knowledge: 0.3,
  code: 0.25,
  product: 0.25,
  context: 0.2
};

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeSourceCount(sourceCount: number): number {
  return clampPercent((Math.max(sourceCount, 0) / 25) * 100);
}

function getLaneMissingInputs(input: LaneReadinessInput): string[] {
  const missing: string[] = [];

  if (normalizeSourceCount(input.sourceCount) < 55) {
    missing.push("More buyer-owned source coverage");
  }
  if (input.sourceFreshness < 60) {
    missing.push("Fresher documents or recent release context");
  }
  if (input.sourceDiversity < 60) {
    missing.push("More diverse source types for this lane");
  }
  if (input.evaluationPassRate < 70) {
    missing.push("Benchmark coverage and prompt iteration");
  }
  if (input.citationCoverage < 65) {
    missing.push("Better citation grounding from uploaded sources");
  }
  if (input.operatorSatisfaction < 70) {
    missing.push("Operator validation and answer review")
  }

  return missing;
}

function getLaneNextAction(input: LaneReadinessInput): string {
  if (normalizeSourceCount(input.sourceCount) < 55) {
    return "Add 10-25 high-signal sources before widening scope.";
  }
  if (input.evaluationPassRate < 70) {
    return "Run another benchmark pass and capture weak-answer diagnostics.";
  }
  if (input.citationCoverage < 65) {
    return "Tighten retrieval and add explicit source-rich documents.";
  }
  if (input.sourceFreshness < 60) {
    return "Refresh the lane with recent specs, changelogs, or SOP updates.";
  }
  return "Promote this lane into the go-live evaluation suite.";
}

export function scoreLaneReadiness(input: LaneReadinessInput): LaneReadinessReport {
  const score =
    normalizeSourceCount(input.sourceCount) * 0.18 +
    clampPercent(input.sourceFreshness) * 0.12 +
    clampPercent(input.sourceDiversity) * 0.16 +
    clampPercent(input.evaluationPassRate) * 0.2 +
    clampPercent(input.citationCoverage) * 0.18 +
    clampPercent(input.operatorSatisfaction) * 0.16;

  return {
    lane: input.lane,
    score: clampPercent(score),
    missingInputs: getLaneMissingInputs(input),
    nextBestAction: getLaneNextAction(input)
  };
}

export function scoreWorkspaceReadiness(
  inputs: LaneReadinessInput[],
  activationMilestones: ActivationMilestone[]
): WorkspaceReadinessReport {
  const laneReports = inputs.map((input) => scoreLaneReadiness(input));
  const laneScores = Object.fromEntries(
    laneReports.map((report) => [report.lane, report.score])
  ) as Record<TrainingLane, number>;

  const overallScore = clampPercent(
    laneScores.knowledge * laneWeightMap.knowledge +
      laneScores.code * laneWeightMap.code +
      laneScores.product * laneWeightMap.product +
      laneScores.context * laneWeightMap.context
  );

  const completedMilestones = activationMilestones.filter((item) => item.completed).length;
  const setupCompletion = clampPercent(
    activationMilestones.length === 0
      ? 0
      : (completedMilestones / activationMilestones.length) * 100
  );
  const corpusCoverage = clampPercent(
    (laneScores.knowledge + laneScores.code + laneScores.product + laneScores.context) / 4
  );
  const answerQuality = clampPercent(
    laneReports.reduce((sum, report) => sum + report.score, 0) / laneReports.length
  );

  return {
    overallScore,
    setupCompletion,
    corpusCoverage,
    answerQuality,
    laneReports,
    activationMilestones,
    goLiveVerdict: overallScore >= 78 && setupCompletion >= 70
      ? "ready"
      : overallScore >= 62
        ? "close"
        : "not_ready"
  };
}
