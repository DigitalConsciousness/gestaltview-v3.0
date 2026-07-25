import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { OnboardingSessionRecord } from "../api/onboarding";
import { getOnboardingProgress } from "../api/onboarding";

const defaultSessionPath = resolve(".gsvw", "onboarding-session.json");

export function getSessionFilePath(customPath?: string): string {
  return customPath ? resolve(customPath) : defaultSessionPath;
}

export function loadOnboardingSession(customPath?: string): OnboardingSessionRecord | null {
  const filePath = getSessionFilePath(customPath);

  if (!existsSync(filePath)) {
    return null;
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as OnboardingSessionRecord;
}

export function saveOnboardingSession(
  session: OnboardingSessionRecord,
  customPath?: string
): string {
  const filePath = getSessionFilePath(customPath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(session, null, 2) + "\n", "utf8");
  return filePath;
}

export function formatSessionSummary(session: OnboardingSessionRecord): string[] {
  const progress = getOnboardingProgress(session);

  return [
    `- session: ${session.id}`,
    `- mode: ${session.entryMode}`,
    `- segment: ${session.segmentRecommendation}`,
    `- status: ${session.status}`,
    `- tasks: ${progress.completedTaskCount}/${progress.totalTaskCount} complete`,
    `- next: ${progress.nextTaskKey ?? "none"}`
  ];
}
