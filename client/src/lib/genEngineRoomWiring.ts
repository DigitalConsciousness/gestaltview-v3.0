import type { CaptureOrb } from "@/components/Scaffold";
import {
  createCaptureSignal as createCaptureSignalDefault,
  scoreResonance as scoreResonanceDefault,
} from "@/lib/genEngineClient";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import type { FusionResponse, ResonanceResponse } from "@shared/gen-engine";

type CreateCaptureSignal = typeof createCaptureSignalDefault;
type ScoreResonance = typeof scoreResonanceDefault;

export type DynamicInnerWorldResonanceLink = {
  artifactId: string;
  title: string;
  score: number;
  reason: string;
};

type EnrichBlackboardCaptureInput = {
  capture: CaptureOrb;
  previousCaptures: CaptureOrb[];
  userId?: string;
  createCaptureSignal?: CreateCaptureSignal;
  scoreResonance?: ScoreResonance;
};

type BuildDynamicInnerWorldResonanceLinksInput = {
  selectedArtifact: InnerWorldArtifactRecord;
  artifacts: InnerWorldArtifactRecord[];
  scoreResonance?: ScoreResonance;
};

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Number(Math.max(0, Math.min(1, score / 100)).toFixed(2));
}

function compactWarnings(...groups: Array<string[] | undefined>): string[] {
  return Array.from(new Set(groups.flatMap((group) => group ?? []).filter(Boolean))).slice(0, 6);
}

function captureContext(previousCaptures: CaptureOrb[]): Record<string, string> {
  const recent = previousCaptures.slice(0, 6);

  return {
    recentCaptureTitles: recent.map((capture) => capture.title).join(" | "),
    recentCaptureTags: Array.from(new Set(recent.flatMap((capture) => capture.tags))).slice(0, 12).join(", "),
  };
}

function artifactText(artifact: InnerWorldArtifactRecord): string {
  return [
    artifact.title,
    artifact.summary,
    artifact.tags.join(" "),
    artifact.evidenceNodeIds.join(" "),
    artifact.html.replace(/<[^>]*>/g, " "),
  ]
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

function linkReason(response: ResonanceResponse): string {
  if (response.metaphorsMatched.length > 0) {
    return `Shared signal: ${response.metaphorsMatched.slice(0, 3).join(", ")}`;
  }

  if (response.warnings.length > 0) {
    return response.warnings[0] ?? "Related context surfaced by gen-engine.";
  }

  return "Related context surfaced by gen-engine.";
}

export async function enrichBlackboardCaptureWithResonance({
  capture,
  previousCaptures,
  userId,
  createCaptureSignal = createCaptureSignalDefault,
  scoreResonance = scoreResonanceDefault,
}: EnrichBlackboardCaptureInput): Promise<CaptureOrb> {
  const fusion: FusionResponse = await createCaptureSignal({
    captureId: capture.id,
    text: capture.text,
    sourceRoom: "blackboard-room",
    userId,
    consent: {
      analyzeText: true,
      analyzeImage: false,
      analyzeAudio: false,
      analyzeVideo: false,
      inferEmotion: false,
      storeDerivativeSignals: true,
    },
    context: {
      title: capture.title,
      tags: capture.tags,
      previousCaptureCount: previousCaptures.length,
    },
  });

  const resonance = await scoreResonance({
    text: [fusion.fusedText || capture.text, previousCaptures.slice(0, 6).map((item) => item.text).join("\n")].join("\n\n"),
    userId,
    plkContext: captureContext(previousCaptures),
  });

  return {
    ...capture,
    metadata: {
      ...capture.metadata,
      genEngine: {
        fusionCaptureId: fusion.captureId,
        resonanceScore: normalizeScore(resonance.score),
        metaphorsMatched: resonance.metaphorsMatched,
        warnings: compactWarnings(fusion.warnings, resonance.warnings),
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function buildDynamicInnerWorldResonanceLinks({
  selectedArtifact,
  artifacts,
  scoreResonance = scoreResonanceDefault,
}: BuildDynamicInnerWorldResonanceLinksInput): Promise<DynamicInnerWorldResonanceLink[]> {
  const candidates = artifacts.filter((artifact) => artifact.id !== selectedArtifact.id);
  const selectedText = artifactText(selectedArtifact);

  const scored = await Promise.all(
    candidates.map(async (artifact) => {
      const response = await scoreResonance({
        text: [selectedText, artifactText(artifact)].join("\n\n"),
        plkContext: {
          selectedTitle: selectedArtifact.title,
          candidateTitle: artifact.title,
          sharedTags: selectedArtifact.tags.filter((tag) => artifact.tags.includes(tag)).join(", "),
        },
      });

      return {
        artifactId: artifact.id,
        title: artifact.title,
        score: normalizeScore(response.score),
        reason: linkReason(response),
      };
    }),
  );

  return scored
    .filter((link) => link.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 3);
}
