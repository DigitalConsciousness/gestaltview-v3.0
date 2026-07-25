import {
  appendApprovedOrb,
  appendInnerWorldCapture,
  appendSavedCapture,
  appendScaffoldQueue,
  readJson,
  readApprovedOrbs,
  readBlueprints,
  readInnerWorldCaptures,
  readSavedCaptures,
  readScaffoldQueue,
  removeInnerWorldCapture,
  removeSavedCapture,
  removeScaffoldQueueOrb,
  SOURCE_LABELS,
  type CaptureOrb,
  writeApprovedOrbs,
  writeJson,
  writeScaffoldQueue,
} from "@/components/Scaffold";

export const ARCHIVED_SCAFFOLD_ORBS_KEY = "gestaltview.externalScaffold.archived.v1";

export type ScaffoldPreviewState = "pending" | "approved" | "archived" | "rejected";

export type ScaffoldPreviewRow = {
  label: "Source" | "Type" | "Presentation" | "Context" | "Anchor" | "Meaning" | "Memory" | "Tags" | "Resonance" | "Related" | "Decision";
  value: string;
};

export type ScaffoldPreviewDetails = {
  state: ScaffoldPreviewState;
  stateLabel: string;
  rows: ScaffoldPreviewRow[];
};

export type ScaffoldLifecycleResult = {
  pending: CaptureOrb[];
  approved: CaptureOrb[];
  archived: CaptureOrb[];
};

const BILLY_TAG_PATTERN = /\bbilly\b/i;

function cleanTags(tags: string[]): string[] {
  return tags.filter((tag) => !BILLY_TAG_PATTERN.test(tag));
}

function previewStateLabel(state: ScaffoldPreviewState): string {
  switch (state) {
    case "approved":
      return "Approved artifact";
    case "archived":
      return "Archived artifact";
    case "rejected":
      return "Denied from scaffold";
    default:
      return "Pending review";
  }
}

function decisionText(state: ScaffoldPreviewState): string {
  switch (state) {
    case "approved":
      return "Already compressed into the External Scaffold. Further promotion still needs an explicit user action.";
    case "archived":
      return "Removed from active scaffold views. Restore brings it back to its previous lane.";
    case "rejected":
      return "Denied from the pending rack without deleting the original source capture.";
    default:
      return "User approval is required before this becomes scaffold memory.";
  }
}

function summarizeRelated(orb: CaptureOrb, relatedOrbs: CaptureOrb[]): string {
  const related = relatedOrbs
    .filter((item) => item.id !== orb.id)
    .map((item) => {
      const sharedTags = cleanTags(item.tags).filter((tag) => cleanTags(orb.tags).includes(tag));
      return sharedTags.length > 0 ? `${item.title} (${sharedTags.slice(0, 3).join(", ")})` : null;
    })
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);

  return related.length > 0 ? related.join("; ") : "No related scaffold items yet.";
}

export function readArchivedScaffoldOrbs(): CaptureOrb[] {
  return readJson<CaptureOrb[]>(ARCHIVED_SCAFFOLD_ORBS_KEY, []);
}

export function writeArchivedScaffoldOrbs(orbs: CaptureOrb[]): void {
  writeJson(ARCHIVED_SCAFFOLD_ORBS_KEY, orbs);
}

export function buildScaffoldPreviewDetails(
  orb: CaptureOrb,
  options: { state?: ScaffoldPreviewState; relatedOrbs?: CaptureOrb[] } = {},
): ScaffoldPreviewDetails {
  const state = options.state ?? (orb.status === "approved" ? "approved" : orb.status === "rejected" ? "rejected" : "pending");
  const tags = cleanTags(orb.tags);
  const metadata = orb.metadata;

  return {
    state,
    stateLabel: previewStateLabel(state),
    rows: [
      { label: "Source", value: SOURCE_LABELS[orb.source] },
      { label: "Type", value: orb.type },
      { label: "Presentation", value: orb.metadata.presentation ? `${orb.metadata.presentation.mode} · ${orb.metadata.presentation.motion}` : "Default orbit" },
      { label: "Context", value: metadata.context ?? "No context supplied yet." },
      { label: "Anchor", value: metadata.anchor ?? "No anchor supplied yet." },
      { label: "Meaning", value: metadata.meaning ?? "Meaning has not been user-confirmed." },
      { label: "Memory", value: metadata.memory ?? orb.text },
      { label: "Tags", value: tags.length > 0 ? tags.join(", ") : "No tags yet." },
      { label: "Resonance", value: `${orb.resonance}` },
      { label: "Related", value: summarizeRelated(orb, options.relatedOrbs ?? []) },
      { label: "Decision", value: decisionText(state) },
    ],
  };
}

export function archiveScaffoldOrb(orbId: string): ScaffoldLifecycleResult {
  const pending = readScaffoldQueue();
  const approved = readApprovedOrbs();
  const archived = readArchivedScaffoldOrbs();
  const orb = pending.find((item) => item.id === orbId) ?? approved.find((item) => item.id === orbId);

  if (!orb) {
    return { pending, approved, archived };
  }

  const archivedOrb: CaptureOrb = {
    ...orb,
    metadata: {
      ...orb.metadata,
      updatedAt: new Date().toISOString(),
      scaffoldArchive: {
        previousStatus: orb.status,
      },
    },
  };
  const nextPending = pending.filter((item) => item.id !== orbId);
  const nextApproved = approved.filter((item) => item.id !== orbId);
  const nextArchived = [archivedOrb, ...archived.filter((item) => item.id !== orbId)];

  writeScaffoldQueue(nextPending);
  writeApprovedOrbs(nextApproved);
  writeArchivedScaffoldOrbs(nextArchived);

  return { pending: nextPending, approved: nextApproved, archived: nextArchived };
}

export function restoreScaffoldOrb(orbId: string): ScaffoldLifecycleResult {
  const pending = readScaffoldQueue();
  const approved = readApprovedOrbs();
  const archived = readArchivedScaffoldOrbs();
  const orb = archived.find((item) => item.id === orbId);

  if (!orb) {
    return { pending, approved, archived };
  }

  const previousStatus = orb.metadata.scaffoldArchive?.previousStatus ?? orb.status;
  const restoredOrb: CaptureOrb = {
    ...orb,
    status: previousStatus === "approved" ? "approved" : "pending",
    metadata: {
      ...orb.metadata,
      scaffoldArchive: undefined,
      updatedAt: new Date().toISOString(),
    },
  };
  const nextArchived = archived.filter((item) => item.id !== orbId);
  const nextPending = restoredOrb.status === "pending" ? [restoredOrb, ...pending.filter((item) => item.id !== orbId)] : pending;
  const nextApproved = restoredOrb.status === "approved" ? [restoredOrb, ...approved.filter((item) => item.id !== orbId)] : approved;

  writeScaffoldQueue(nextPending);
  writeApprovedOrbs(nextApproved);
  writeArchivedScaffoldOrbs(nextArchived);

  return { pending: nextPending, approved: nextApproved, archived: nextArchived };
}

export const scaffoldStorage = {
  readScaffoldQueue,
  readApprovedOrbs,
  readSavedCaptures,
  readInnerWorldCaptures,
  readBlueprints,
  readArchivedScaffoldOrbs,
  appendScaffoldQueue,
  appendApprovedOrb,
  appendSavedCapture,
  appendInnerWorldCapture,
  removeScaffoldQueueOrb,
  removeSavedCapture,
  removeInnerWorldCapture,
  archiveScaffoldOrb,
  restoreScaffoldOrb,
  buildScaffoldPreviewDetails,
};

export type ScaffoldStorage = typeof scaffoldStorage;
export type StoredCapture = CaptureOrb;
