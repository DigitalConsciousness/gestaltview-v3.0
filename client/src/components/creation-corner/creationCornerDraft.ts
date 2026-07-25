import { buildCreationCornerOutputs } from "@/lib/genEngineClient";
import type { CaptureBlueprint } from "@/components/Scaffold";

function createId(prefix = "blueprint"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function firstLineTitle(value: string): string {
  const firstLine = value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .find(Boolean);

  return (firstLine?.slice(0, 72) || "Untitled Blueprint").trim();
}

export function createFreshBlueprintFromText(text: string): CaptureBlueprint | null {
  const summary = text.trim();
  if (!summary) {
    return null;
  }

  const title = firstLineTitle(summary);
  const now = new Date().toISOString();
  const outputs = buildCreationCornerOutputs({
    title,
    summary,
    tags: [],
    status: "draft",
    note: "",
    sourceMarkdown: summary,
    sourceBlueprintJson: "{}",
    sourceCaptureIds: [],
    captureCount: 1,
    sourceRoom: "creation-corner",
  });

  return {
    id: createId("blueprint"),
    title,
    summary,
    sourceOrbIds: [],
    captureCount: 1,
    tags: [],
    status: "draft",
    createdAt: now,
    updatedAt: now,
    outputs,
  };
}
