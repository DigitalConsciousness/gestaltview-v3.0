import { appFetchJson } from "@/lib/appFetch";
import type { CaptureBlueprint, CaptureBlueprintOutput } from "@/components/Scaffold";

export type CreationCornerBlueprintContent = {
  summary: string;
  sourceOrbIds: string[];
  captureCount: number;
  tags: string[];
  outputs: CaptureBlueprintOutput;
  createdAt: string;
  updatedAt: string;
};

export type CreationCornerBlueprintRecord = {
  id: string;
  userId: string;
  title: string;
  status: CaptureBlueprint["status"];
  content: CreationCornerBlueprintContent;
  createdAt: string;
  updatedAt: string;
};

const EMPTY_OUTPUTS: CaptureBlueprintOutput = {
  markdown: "",
  html: "",
  code: "",
  agentPrompt: "",
  imagePrompt: "",
  marketingCopy: "",
  shareCard: "",
  pdfHtml: "",
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function asOutputs(value: unknown): CaptureBlueprintOutput {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_OUTPUTS };
  }

  const record = value as Partial<CaptureBlueprintOutput>;
  return {
    markdown: typeof record.markdown === "string" ? record.markdown : "",
    html: typeof record.html === "string" ? record.html : "",
    code: typeof record.code === "string" ? record.code : "",
    agentPrompt: typeof record.agentPrompt === "string" ? record.agentPrompt : "",
    imagePrompt: typeof record.imagePrompt === "string" ? record.imagePrompt : "",
    marketingCopy: typeof record.marketingCopy === "string" ? record.marketingCopy : "",
    shareCard: typeof record.shareCard === "string" ? record.shareCard : "",
    pdfHtml: typeof record.pdfHtml === "string" ? record.pdfHtml : "",
  };
}

function parseTimestamp(value: string | null | undefined): number {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? time : 0;
}

function resolveContent(record: CreationCornerBlueprintRecord): CreationCornerBlueprintContent {
  const content = record.content as Partial<CreationCornerBlueprintContent> | undefined;

  return {
    summary: typeof content?.summary === "string" ? content.summary : "",
    sourceOrbIds: asStringArray(content?.sourceOrbIds),
    captureCount:
      typeof content?.captureCount === "number" && Number.isFinite(content.captureCount)
        ? Math.max(0, Math.floor(content.captureCount))
        : asStringArray(content?.sourceOrbIds).length,
    tags: asStringArray(content?.tags),
    outputs: asOutputs(content?.outputs),
    createdAt:
      typeof content?.createdAt === "string" && content.createdAt.trim().length > 0
        ? content.createdAt
        : record.createdAt,
    updatedAt:
      typeof content?.updatedAt === "string" && content.updatedAt.trim().length > 0
        ? content.updatedAt
        : record.updatedAt || record.createdAt,
  };
}

export function materializeCreationCornerBlueprint(record: CreationCornerBlueprintRecord): CaptureBlueprint {
  const content = resolveContent(record);
  return {
    id: record.id,
    title: record.title,
    summary: content.summary,
    sourceOrbIds: content.sourceOrbIds,
    captureCount: content.captureCount,
    tags: content.tags,
    status: record.status,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
    outputs: content.outputs,
  };
}

export function mergeCreationCornerBlueprints(
  localBlueprints: CaptureBlueprint[],
  remoteBlueprints: CaptureBlueprint[],
): CaptureBlueprint[] {
  const merged = new Map<string, CaptureBlueprint>();

  for (const blueprint of [...remoteBlueprints, ...localBlueprints]) {
    const existing = merged.get(blueprint.id);
    if (!existing || parseTimestamp(blueprint.updatedAt) >= parseTimestamp(existing.updatedAt)) {
      merged.set(blueprint.id, blueprint);
    }
  }

  return [...merged.values()].sort((a, b) => {
    const updatedAtDelta = parseTimestamp(b.updatedAt) - parseTimestamp(a.updatedAt);
    if (updatedAtDelta !== 0) {
      return updatedAtDelta;
    }

    return parseTimestamp(b.createdAt) - parseTimestamp(a.createdAt);
  });
}

export async function loadCreationCornerBlueprintsFromServer(): Promise<CreationCornerBlueprintRecord[] | null> {
  const result = await appFetchJson<{ blueprints: CreationCornerBlueprintRecord[] }>("/api/creation-corner/blueprints", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.blueprints ?? [];
}

export async function saveCreationCornerBlueprintToServer(input: {
  blueprint: CaptureBlueprint;
}): Promise<CreationCornerBlueprintRecord | null> {
  const result = await appFetchJson<{ blueprint: CreationCornerBlueprintRecord | null }>("/api/creation-corner/blueprints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blueprint: input.blueprint,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.blueprint ?? null;
}

export async function deleteCreationCornerBlueprintFromServer(input: {
  blueprintId: string;
}): Promise<boolean> {
  const result = await appFetchJson<{ deletedId: string | null }>("/api/creation-corner/blueprints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operation: "delete",
      blueprintId: input.blueprintId,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return false;
  }

  return result.data.deletedId === input.blueprintId;
}
