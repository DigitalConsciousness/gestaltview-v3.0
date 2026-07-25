import {
  appendApprovedOrb,
  appendBlueprint,
  appendInnerWorldCapture,
  appendSavedCapture,
  appendScaffoldQueue,
  createCaptureOrb,
  readJson,
  removeApprovedOrb,
  removeBlueprint,
  removeInnerWorldCapture,
  removeSavedCapture,
  removeScaffoldQueueOrb,
  writeJson,
  type CaptureBlueprint,
  type CaptureOrb,
  type CaptureSource,
  type CaptureStatus,
  type CaptureAction,
  type InnerWorldSurface,
} from "@/components/Scaffold";

export const CREATION_CORNER_STORAGE_KEYS = {
  archivedApprovedOrbs: "gestaltview.creationCorner.archivedApprovedOrbs.v1",
  archivedBlueprints: "gestaltview.creationCorner.archivedBlueprints.v1",
} as const;

export type CreationCornerTargetRoom = "blackboard" | "dynamic-inner-world" | "external-scaffold";

export type CreationCornerSnapshot = {
  approvedOrbs: CaptureOrb[];
  blueprints: CaptureBlueprint[];
  archivedApprovedOrbs: CaptureOrb[];
  archivedBlueprints: CaptureBlueprint[];
  selectedBlueprintId: string | null;
  selectedOrbIds: string[];
  selectedArchivedOrbId: string | null;
  selectedArchivedBlueprintId: string | null;
  draftTitle: string;
  draftSummary: string;
  selectedOutput: string;
};

export function readArchivedApprovedOrbs(): CaptureOrb[] {
  return readJson<CaptureOrb[]>(CREATION_CORNER_STORAGE_KEYS.archivedApprovedOrbs, []);
}

export function writeArchivedApprovedOrbs(orbs: CaptureOrb[]): void {
  writeJson(CREATION_CORNER_STORAGE_KEYS.archivedApprovedOrbs, orbs);
}

export function readArchivedBlueprints(): CaptureBlueprint[] {
  return readJson<CaptureBlueprint[]>(CREATION_CORNER_STORAGE_KEYS.archivedBlueprints, []);
}

export function writeArchivedBlueprints(blueprints: CaptureBlueprint[]): void {
  writeJson(CREATION_CORNER_STORAGE_KEYS.archivedBlueprints, blueprints);
}

export function archiveApprovedOrb(orb: CaptureOrb): CaptureOrb[] {
  const next = [orb, ...readArchivedApprovedOrbs().filter((item) => item.id !== orb.id)];
  writeArchivedApprovedOrbs(next);
  removeApprovedOrb(orb.id);
  return next;
}

export function restoreArchivedApprovedOrb(orbId: string): CaptureOrb[] {
  const archived = readArchivedApprovedOrbs();
  const orb = archived.find((item) => item.id === orbId);
  const next = archived.filter((item) => item.id !== orbId);
  writeArchivedApprovedOrbs(next);

  if (orb) {
    appendApprovedOrb(orb);
  }

  return next;
}

export function deleteArchivedApprovedOrb(orbId: string): CaptureOrb[] {
  const next = readArchivedApprovedOrbs().filter((item) => item.id !== orbId);
  writeArchivedApprovedOrbs(next);
  return next;
}

export function archiveBlueprint(blueprint: CaptureBlueprint): CaptureBlueprint[] {
  const next = [blueprint, ...readArchivedBlueprints().filter((item) => item.id !== blueprint.id)];
  writeArchivedBlueprints(next);
  removeBlueprint(blueprint.id);
  return next;
}

export function restoreArchivedBlueprint(blueprintId: string): CaptureBlueprint[] {
  const archived = readArchivedBlueprints();
  const blueprint = archived.find((item) => item.id === blueprintId);
  const next = archived.filter((item) => item.id !== blueprintId);
  writeArchivedBlueprints(next);

  if (blueprint) {
    appendBlueprint(blueprint);
  }

  return next;
}

export function deleteArchivedBlueprint(blueprintId: string): CaptureBlueprint[] {
  const next = readArchivedBlueprints().filter((item) => item.id !== blueprintId);
  writeArchivedBlueprints(next);
  return next;
}

export function createRecallCaptureFromBlueprint(
  blueprint: CaptureBlueprint,
  targetRoom: CreationCornerTargetRoom,
  selectedSurface: InnerWorldSurface = "forward",
) {
  const roomLabel =
    targetRoom === "blackboard"
      ? "Blackboard"
      : targetRoom === "dynamic-inner-world"
        ? "Dynamic Inner World"
        : "External Scaffold";

  return createCaptureOrb(
    {
      text: `${blueprint.summary}\n\n${blueprint.outputs.markdown}`,
      title: `${blueprint.title} Recall`,
      source: "typed",
      type: "context",
      surface: selectedSurface,
      action:
        targetRoom === "blackboard"
          ? "save"
          : targetRoom === "dynamic-inner-world"
            ? "send-to-dynamic-inner-world"
            : "send-to-external-scaffold",
      context: `Recalled from Creation Corner into ${roomLabel}.`,
      meaning: `Blueprint recalled into ${roomLabel}.`,
      memory: blueprint.summary,
      transcript: blueprint.outputs.markdown,
      tags: Array.from(new Set([...blueprint.tags, "blueprint", "recall"])),
    },
    "typed",
  );
}

export function routeBlueprintToRoom(
  blueprint: CaptureBlueprint,
  targetRoom: CreationCornerTargetRoom,
  selectedSurface: InnerWorldSurface = "forward",
): CaptureOrb | null {
  const capture = createRecallCaptureFromBlueprint(blueprint, targetRoom, selectedSurface);
  if (!capture) {
    return null;
  }

  if (targetRoom === "blackboard") {
    appendSavedCapture({ ...capture, status: "saved" });
    return capture;
  }

  if (targetRoom === "dynamic-inner-world") {
    appendInnerWorldCapture({ ...capture, status: "saved" });
    return capture;
  }

  appendScaffoldQueue({ ...capture, status: "pending" });
  return capture;
}

export function routeApprovedOrbToRoom(
  orb: CaptureOrb,
  targetRoom: CreationCornerTargetRoom,
  selectedSurface: InnerWorldSurface = "forward",
): CaptureOrb {
  const roomLabel =
    targetRoom === "blackboard"
      ? "Blackboard"
      : targetRoom === "dynamic-inner-world"
        ? "Dynamic Inner World"
        : "External Scaffold";
  const source: CaptureSource = targetRoom === "dynamic-inner-world" ? "dynamic-inner-world" : "typed";
  const status: CaptureStatus = targetRoom === "external-scaffold" ? "pending" : "saved";
  const originalAction: CaptureAction =
    targetRoom === "blackboard"
      ? "save"
      : targetRoom === "dynamic-inner-world"
        ? "send-to-dynamic-inner-world"
        : "send-to-external-scaffold";

  const routedOrb = {
    ...orb,
    source,
    status,
    metadata: {
      ...orb.metadata,
      surface: targetRoom === "dynamic-inner-world" ? selectedSurface : orb.metadata.surface,
      originalAction,
      context: `Moved from Creation Corner into ${roomLabel}.`,
      meaning: `Capture moved into ${roomLabel}.`,
      updatedAt: new Date().toISOString(),
    },
  };

  if (targetRoom === "blackboard") {
    appendSavedCapture(routedOrb);
    return routedOrb;
  }

  if (targetRoom === "dynamic-inner-world") {
    appendInnerWorldCapture(routedOrb);
    return routedOrb;
  }

  appendScaffoldQueue(routedOrb);
  return routedOrb;
}

export function cleanRoomArtifactsAfterDelete(orbId: string): void {
  removeApprovedOrb(orbId);
  removeSavedCapture(orbId);
  removeInnerWorldCapture(orbId);
  removeScaffoldQueueOrb(orbId);
}
