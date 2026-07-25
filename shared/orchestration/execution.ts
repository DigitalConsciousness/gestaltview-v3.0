import { extractOrchestrationSignals } from "./extraction.js";
import type {
  OrchestrationDecision,
  OrchestrationExportFormat,
  OrchestrationInput,
  OrchestralWorkerId,
} from "./types.js";
import type { OrchestralWorker, OrchestralWorkerPlan, OrchestralWorkerStatus } from "./workers.js";

const REPETITION_WARNING_THRESHOLD = 0.45;
const MIN_REPEAT_SEGMENT_LENGTH = 24;

export type OrchestrationPresentationCandidate = {
  title?: string;
  content?: string;
  previewHtml?: string;
  artifactType?: string;
};

export type OrchestrationPresentationRepair = {
  code: "DUPLICATE_CONTENT_REMOVED";
  message: string;
  field: "content";
  removedSegments: number;
  beforeRatio: number;
  afterRatio: number;
};

export type OrchestrationPresentationGate = {
  /** Repetition is repairable quality feedback, not a terminal condition. */
  allowed: boolean;
  disposition: "accepted" | "repaired" | "blocked";
  reasons: string[];
  warnings: string[];
  repairs: OrchestrationPresentationRepair[];
  effectiveCandidate: OrchestrationPresentationCandidate;
  checks: {
    hasContent: boolean;
    isFullHtmlWhenHtmlProvided: boolean;
    isNotRawJson: boolean;
    isNotMetadataDump: boolean;
    repetitionRatio: number;
    contentRepetitionRatio: number;
    previewHtmlRepetitionRatio: number;
    sourceContentPreserved: true;
  };
};

export type OrchestrationWorkerReceipt = {
  workerId: OrchestralWorkerId;
  label: string;
  status: OrchestralWorkerStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  summary: string;
  dependsOn: OrchestralWorkerId[];
  result: Record<string, unknown>;
  error?: string;
};

export type OrchestrationExecutionResult = {
  status: "completed" | "failed" | "awaiting_approval";
  receipts: OrchestrationWorkerReceipt[];
  presentation: OrchestrationPresentationGate;
  output: Record<string, unknown>;
};

export type ExecuteOrchestrationInput = {
  input: OrchestrationInput;
  decision: OrchestrationDecision;
  plan: OrchestralWorkerPlan;
  now?: () => Date;
};

function nowIso(now: () => Date): string {
  return now().toISOString();
}

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readPresentationCandidate(input: OrchestrationInput): OrchestrationPresentationCandidate {
  const candidate = input.meta?.presentationCandidate;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return {
      title: input.title,
      content: input.text,
      artifactType: input.artifactIntent,
    };
  }

  const record = candidate as Record<string, unknown>;
  return {
    title: typeof record.title === "string" ? record.title : input.title,
    content: typeof record.content === "string" ? record.content : input.text,
    previewHtml: typeof record.previewHtml === "string" ? record.previewHtml : undefined,
    artifactType: typeof record.artifactType === "string" ? record.artifactType : input.artifactIntent,
  };
}

function looksLikeRawJson(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function looksLikeMetadataDump(value: string): boolean {
  const lower = value.toLowerCase();
  const metadataKeys = [
    "artifact_id",
    "source_capture_ids",
    "source_artifact_ids",
    "result_payload",
    "decision_payload",
    "internal_diagnostics",
  ];
  return metadataKeys.filter((key) => lower.includes(key)).length >= 3;
}

function htmlToVisibleText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRepeatKey(value: string): string {
  return value
    .replace(/[`*_>#~()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function repeatSegments(value: string): string[] {
  return value
    .split(/(?:\n{2,}|(?<=[.!?])\s+)/)
    .map((segment) => normalizeRepeatKey(segment))
    .filter((segment) => segment.length >= MIN_REPEAT_SEGMENT_LENGTH);
}

export function repetitionRatio(value: string): number {
  const segments = repeatSegments(value);
  if (segments.length < 3) return 0;
  return Number((1 - new Set(segments).size / segments.length).toFixed(3));
}

function dedupeRepeatedContent(value: string): {
  content: string;
  removedSegments: number;
} {
  const parts = value.split(/(\n{2,}|(?<=[.!?])\s+)/);
  const seen = new Set<string>();
  const kept: string[] = [];
  let removedSegments = 0;

  for (let index = 0; index < parts.length; index += 2) {
    const segment = parts[index] ?? "";
    const separator = parts[index + 1] ?? "";
    const key = normalizeRepeatKey(segment);
    if (key.length >= MIN_REPEAT_SEGMENT_LENGTH && seen.has(key)) {
      removedSegments += 1;
      continue;
    }
    if (key.length >= MIN_REPEAT_SEGMENT_LENGTH) seen.add(key);
    kept.push(segment, separator);
  }

  return { content: normalizeText(kept.join("")), removedSegments };
}

/**
 * Alternate representations are checked independently. Combining content and
 * previewHtml double-counts valid material and caused the observed failures.
 */
export function evaluatePresentationCandidate(
  candidate: OrchestrationPresentationCandidate,
): OrchestrationPresentationGate {
  const originalContent = normalizeText(candidate.content);
  const previewHtml = normalizeText(candidate.previewHtml);
  const visiblePreview = htmlToVisibleText(previewHtml);
  const hasContent = originalContent.length > 0 || visiblePreview.length > 0;
  const isFullHtmlWhenHtmlProvided =
    !previewHtml || /<!doctype html|<html[\s>]/i.test(previewHtml);
  const isNotRawJson = !looksLikeRawJson(originalContent);
  const isNotMetadataDump =
    !looksLikeMetadataDump(originalContent) && !looksLikeMetadataDump(visiblePreview);
  const reasons: string[] = [];
  const warnings: string[] = [];
  const repairs: OrchestrationPresentationRepair[] = [];

  if (!hasContent) reasons.push("The artifact has no visible content.");
  if (!isFullHtmlWhenHtmlProvided) {
    reasons.push("The HTML preview is partial rather than a complete document.");
  }
  if (!isNotRawJson) reasons.push("Raw JSON is not a finished user-facing artifact.");
  if (!isNotMetadataDump) reasons.push("Internal metadata is leaking into the visible artifact.");

  const originalContentRatio = repetitionRatio(originalContent);
  let effectiveContent = originalContent;
  let effectiveContentRatio = originalContentRatio;

  if (originalContentRatio >= REPETITION_WARNING_THRESHOLD) {
    const repaired = dedupeRepeatedContent(originalContent);
    const repairedRatio = repetitionRatio(repaired.content);
    if (repaired.removedSegments > 0 && repairedRatio < originalContentRatio) {
      effectiveContent = repaired.content;
      effectiveContentRatio = repairedRatio;
      repairs.push({
        code: "DUPLICATE_CONTENT_REMOVED",
        message: "Repeated derivative segments were removed; the preserved source was not changed.",
        field: "content",
        removedSegments: repaired.removedSegments,
        beforeRatio: originalContentRatio,
        afterRatio: repairedRatio,
      });
    }
  }

  const previewHtmlRepetitionRatio = repetitionRatio(visiblePreview);
  if (effectiveContentRatio >= REPETITION_WARNING_THRESHOLD) {
    warnings.push("The content remains highly repetitive after deterministic repair.");
  }
  if (previewHtmlRepetitionRatio >= REPETITION_WARNING_THRESHOLD) {
    warnings.push("The HTML preview is highly repetitive and should be reviewed.");
  }

  const allowed = reasons.length === 0;
  return {
    allowed,
    disposition: allowed ? (repairs.length > 0 ? "repaired" : "accepted") : "blocked",
    reasons,
    warnings,
    repairs,
    effectiveCandidate: {
      ...candidate,
      content: effectiveContent || candidate.content,
      previewHtml: candidate.previewHtml,
    },
    checks: {
      hasContent,
      isFullHtmlWhenHtmlProvided,
      isNotRawJson,
      isNotMetadataDump,
      repetitionRatio: Math.max(effectiveContentRatio, previewHtmlRepetitionRatio),
      contentRepetitionRatio: effectiveContentRatio,
      previewHtmlRepetitionRatio,
      sourceContentPreserved: true,
    },
  };
}

function buildSynthesisContract(
  input: OrchestrationInput,
  decision: OrchestrationDecision,
): Record<string, unknown> {
  return {
    targetType: decision.artifactTargetType ?? null,
    synthesisStyle: decision.synthesisStyle,
    destination: decision.artifactDestination ?? decision.destination,
    exportFormats: decision.exportFormats,
    preserveSourceLanguage: decision.synthesisStyle === "faithful",
    sourceCaptureIds: input.sourceCaptureIds ?? [],
    sourceArtifactIds: input.sourceArtifactIds ?? [],
  };
}

function buildRenderingContract(formats: OrchestrationExportFormat[]): Record<string, unknown> {
  return {
    formats,
    requiresFullHtmlDocument: formats.includes("html") || formats.includes("pdf_ready_html"),
    requiresManifest: true,
    rawModelOutputMayRenderDirectly: false,
    targetFailureIsolationRequired: true,
    unsupportedTargetsMustBeReported: true,
  };
}

function runWorker(
  worker: OrchestralWorker,
  input: OrchestrationInput,
  decision: OrchestrationDecision,
  presentation: OrchestrationPresentationGate,
): Record<string, unknown> {
  switch (worker.id) {
    case "intake":
      return {
        source: {
          title: input.title ?? null,
          text: input.text ?? null,
          contextClues: input.contextClues ?? [],
          sourceCaptureIds: input.sourceCaptureIds ?? [],
          sourceArtifactIds: input.sourceArtifactIds ?? [],
        },
        preserved: true,
      };
    case "normalization":
      return {
        title: normalizeText(input.title),
        processingText: normalizeText(input.text),
        contextClues: (input.contextClues ?? []).map((value) => normalizeText(value)).filter(Boolean),
        sourceMutated: false,
      };
    case "profile_enrichment": {
      const extraction = extractOrchestrationSignals({
        trigger: input.trigger,
        sourceRoom: input.sourceRoom,
        title: input.title,
        text: input.text,
        contextClues: input.contextClues,
      });
      return {
        extractionId: extraction.extractionId,
        nuggets: extraction.nuggets,
        modulePopulation: extraction.modulePopulation,
        autoApplied: false,
      };
    }
    case "scaffold_context": {
      const extraction = extractOrchestrationSignals({
        trigger: input.trigger,
        sourceRoom: input.sourceRoom,
        title: input.title,
        text: input.text,
        contextClues: input.contextClues,
      });
      return {
        extractionId: extraction.extractionId,
        contextualizedSignals: extraction.nuggets,
        modulePopulation: extraction.modulePopulation,
      };
    }
    case "orb_generation":
      return {
        candidates: [],
        generationMode: "contextualized-candidate",
        approvalRequired: true,
        note: "Orb persistence remains a separate bounded write after contextual review.",
      };
    case "synthesis":
      return buildSynthesisContract(input, decision);
    case "rendering":
      return buildRenderingContract(decision.exportFormats);
    case "persistence":
      return {
        receiptRequired: true,
        sourceLineagePreserved: true,
        destructiveMutationAllowed: false,
      };
    case "presentation":
      return presentation as unknown as Record<string, unknown>;
    case "validation":
      return {
        valid: presentation.allowed,
        presentationReasons: presentation.reasons,
        presentationWarnings: presentation.warnings,
        presentationRepairs: presentation.repairs,
        decisionConfidence: decision.confidence,
      };
    default:
      return {};
  }
}

export function executeOrchestration({
  input,
  decision,
  plan,
  now = () => new Date(),
}: ExecuteOrchestrationInput): OrchestrationExecutionResult {
  const candidate = readPresentationCandidate(input);
  const presentation = evaluatePresentationCandidate(candidate);
  const receipts: OrchestrationWorkerReceipt[] = [];
  const completed = new Set<OrchestralWorkerId>();
  const failed = new Set<OrchestralWorkerId>();

  for (const worker of plan.workers) {
    const startedAt = nowIso(now);
    const started = Date.parse(startedAt);
    const blockedBy = worker.dependsOn.filter((dependency) => failed.has(dependency));
    const missingDependencies = worker.dependsOn.filter((dependency) => !completed.has(dependency));

    if (blockedBy.length > 0 || missingDependencies.length > 0) {
      const completedAt = nowIso(now);
      receipts.push({
        workerId: worker.id,
        label: worker.label,
        status: "skipped",
        startedAt,
        completedAt,
        durationMs: Math.max(0, Date.parse(completedAt) - started),
        summary: worker.summary,
        dependsOn: worker.dependsOn,
        result: { blockedBy, missingDependencies },
      });
      failed.add(worker.id);
      continue;
    }

    try {
      const result = runWorker(worker, input, decision, presentation);
      const workerFailed = worker.id === "presentation" && !presentation.allowed;
      const completedAt = nowIso(now);
      receipts.push({
        workerId: worker.id,
        label: worker.label,
        status: workerFailed ? "failed" : "done",
        startedAt,
        completedAt,
        durationMs: Math.max(0, Date.parse(completedAt) - started),
        summary: worker.summary,
        dependsOn: worker.dependsOn,
        result,
        ...(workerFailed ? { error: presentation.reasons.join(" ") } : {}),
      });
      if (workerFailed) failed.add(worker.id);
      else completed.add(worker.id);
    } catch (error) {
      const completedAt = nowIso(now);
      receipts.push({
        workerId: worker.id,
        label: worker.label,
        status: "failed",
        startedAt,
        completedAt,
        durationMs: Math.max(0, Date.parse(completedAt) - started),
        summary: worker.summary,
        dependsOn: worker.dependsOn,
        result: {},
        error: error instanceof Error ? error.message : String(error),
      });
      failed.add(worker.id);
    }
  }

  const output = Object.fromEntries(receipts.map((receipt) => [receipt.workerId, receipt.result]));
  const status =
    plan.spawnMode === "approval"
      ? "awaiting_approval"
      : receipts.some((receipt) => receipt.status === "failed" || receipt.status === "skipped")
        ? "failed"
        : "completed";

  return { status, receipts, presentation, output };
}
