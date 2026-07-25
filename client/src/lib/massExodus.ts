import { zipSync } from "fflate";

import type { AuthProfile, AuthUser, UserTier } from "@/contexts/AuthContext";
import {
  readApprovedOrbs,
  readBlueprints,
  readInnerWorldCaptures,
  readSavedCaptures,
  readScaffoldQueue,
} from "@/components/Scaffold";
import { readArchivedApprovedOrbs, readArchivedBlueprints } from "@/lib/creationCorner";
import {
  loadArchivedInsightsFromServer,
  materializeArchivedInsight,
  mergeArchivedInsights,
  readArchivedInsights,
} from "@/lib/insightsContent";
import {
  loadInnerWorldArtifactsFromServer,
  loadUserFilesFromServer,
  readInnerWorldArtifacts,
  readUserFiles,
  type InnerWorldArtifactRecord,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";
import {
  loadSanctuaryJournalFromServer,
  loadSanctuaryScrapbookFromServer,
  type SanctuaryJournalRecord,
  type SanctuaryScrapbookRecord,
} from "@/lib/sanctuaryContent";

const JOURNAL_STORAGE_KEY = "gv.sanctuary.journal.v1";
const SCRAPBOOK_STORAGE_KEY = "gv.sanctuary.scrapbook.v1";
const SETTINGS_STORAGE_KEY = "gestaltview.settings.surface.v1";

const textEncoder = new TextEncoder();

type SourceSurface = "profile" | "settings";

type SurfaceSettingsSnapshot = {
  voiceCapture: boolean;
  motionHints: boolean;
  darkSurfaces: boolean;
  founderDebug: boolean;
  palette: string;
};

type LocalJournalSnapshot = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type LocalScrapbookItem = {
  id: string;
  fileId: string;
  name: string;
  caption: string;
  kind: "image" | "text" | "note" | "poem" | "binary";
  preview: string;
  mimeType: string;
  createdAt: string;
};

type ExportScrapbookItem = LocalScrapbookItem & {
  fileName: string | null;
  fileKind: UserFileRecord["kind"] | null;
  fileCreatedAt: string | null;
  userId: string | null;
};

type ProfileSnapshot = {
  id: string;
  email: string;
  tier: UserTier;
  isAdmin: boolean;
  billyQueryCount: number;
  subscriptionStatus: string;
};

type MassExodusContext = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  tier: UserTier;
  isAdmin: boolean;
  sourceSurface: SourceSurface;
};

export type MassExodusSummary = {
  exportedAt: string;
  sourceSurface: SourceSurface;
  fileCount: number;
  recordCount: number;
  counts: {
    journal: number;
    scrapbook: number;
    blueprintsActive: number;
    blueprintsArchived: number;
    capturesQueued: number;
    capturesApproved: number;
    capturesSaved: number;
    capturesInnerWorld: number;
    capturesArchivedApproved: number;
    userFiles: number;
    innerWorldArtifacts: number;
    insights: number;
  };
};

function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "export";
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseTimestamp(value?: string | null): number {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function mergeLatestById<T extends { id: string; createdAt: string; updatedAt?: string }>(
  local: T[],
  remote: T[],
): T[] {
  const merged = new Map<string, T>();

  const consider = (item: T) => {
    const existing = merged.get(item.id);
    const itemStamp = parseTimestamp(item.updatedAt ?? item.createdAt);
    const existingStamp = existing ? parseTimestamp(existing.updatedAt ?? existing.createdAt) : -1;

    if (!existing || itemStamp >= existingStamp) {
      merged.set(item.id, item);
    }
  };

  for (const item of remote) {
    consider(item);
  }

  for (const item of local) {
    consider(item);
  }

  return [...merged.values()].sort((left, right) => {
    const delta = parseTimestamp(right.updatedAt ?? right.createdAt) - parseTimestamp(left.updatedAt ?? left.createdAt);
    if (delta !== 0) {
      return delta;
    }

    return right.id.localeCompare(left.id);
  });
}

function readLocalJournalSnapshot(): LocalJournalSnapshot | null {
  return readJsonStorage<LocalJournalSnapshot | null>(JOURNAL_STORAGE_KEY, null);
}

function readLocalScrapbookItems(): LocalScrapbookItem[] {
  return readJsonStorage<LocalScrapbookItem[]>(SCRAPBOOK_STORAGE_KEY, []);
}

function readSurfaceSettingsSnapshot(): SurfaceSettingsSnapshot {
  return readJsonStorage<SurfaceSettingsSnapshot>(SETTINGS_STORAGE_KEY, {
    voiceCapture: true,
    motionHints: true,
    darkSurfaces: true,
    founderDebug: false,
    palette: "cyan",
  });
}

function deriveScrapbookKind(name: string, mimeType = ""): LocalScrapbookItem["kind"] {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("text/") || /\.(md|markdown|txt|poem|html|htm)$/i.test(name)) {
    if (/poem/i.test(name)) {
      return "poem";
    }

    if (/note/i.test(name)) {
      return "note";
    }

    return "text";
  }

  return "binary";
}

function materializeLocalScrapbookItem(item: LocalScrapbookItem, fileIndex: Map<string, UserFileRecord>): ExportScrapbookItem {
  const file = fileIndex.get(item.fileId) ?? null;
  return {
    ...item,
    fileName: file?.name ?? null,
    fileKind: file?.kind ?? null,
    fileCreatedAt: file?.createdAt ?? null,
    userId: file?.userId ?? null,
  };
}

function materializeRemoteScrapbookItem(
  record: SanctuaryScrapbookRecord,
  fileIndex: Map<string, UserFileRecord>,
): ExportScrapbookItem {
  const file = record.file ?? fileIndex.get(record.fileId ?? "") ?? null;
  const name = file?.name ?? record.caption?.trim() ?? "Scrapbook item";
  const mimeType = file?.mimeType ?? "application/octet-stream";
  const preview = file?.previewUrl ?? file?.previewHtml ?? file?.previewText ?? record.caption ?? name;

  return {
    id: record.id,
    fileId: record.fileId ?? file?.id ?? "",
    name,
    caption: record.caption ?? "",
    kind: deriveScrapbookKind(name, mimeType),
    preview,
    mimeType,
    createdAt: record.createdAt,
    fileName: file?.name ?? null,
    fileKind: file?.kind ?? null,
    fileCreatedAt: file?.createdAt ?? null,
    userId: file?.userId ?? record.userId ?? null,
  };
}

function mergeScrapbookItems(
  localItems: LocalScrapbookItem[],
  remoteItems: SanctuaryScrapbookRecord[],
  fileIndex: Map<string, UserFileRecord>,
): ExportScrapbookItem[] {
  const merged = new Map<string, ExportScrapbookItem>();

  for (const record of remoteItems) {
    merged.set(record.id, materializeRemoteScrapbookItem(record, fileIndex));
  }

  for (const item of localItems) {
    const next = materializeLocalScrapbookItem(item, fileIndex);
    const existing = merged.get(item.id);
    const nextStamp = parseTimestamp(item.createdAt);
    const existingStamp = existing ? parseTimestamp(existing.createdAt) : -1;

    if (!existing || nextStamp >= existingStamp) {
      merged.set(item.id, next);
    }
  }

  return [...merged.values()].sort((left, right) => {
    const delta = parseTimestamp(right.createdAt) - parseTimestamp(left.createdAt);
    if (delta !== 0) {
      return delta;
    }

    return right.id.localeCompare(left.id);
  });
}

function buildJournalSnapshot(
  localJournal: LocalJournalSnapshot | null,
  remoteJournal: SanctuaryJournalRecord | null,
  user: AuthUser | null,
): {
  journal: Record<string, unknown> | null;
  source: "local" | "remote" | "merged" | "empty";
} {
  if (!localJournal && !remoteJournal) {
    return { journal: null, source: "empty" };
  }

  if (!remoteJournal) {
    return {
      journal: {
        ...localJournal,
        userId: user?.id ?? null,
      },
      source: "local",
    };
  }

  if (!localJournal) {
    return {
      journal: remoteJournal,
      source: "remote",
    };
  }

  const localStamp = parseTimestamp(localJournal.updatedAt);
  const remoteStamp = parseTimestamp(remoteJournal.updatedAt);

  if (localStamp >= remoteStamp) {
    return {
      journal: {
        ...localJournal,
        userId: remoteJournal.userId ?? user?.id ?? null,
      },
      source: localStamp > remoteStamp ? "local" : "merged",
    };
  }

  return {
    journal: remoteJournal,
    source: "remote",
  };
}

function buildIndexMarkdown(
  context: MassExodusContext,
  exportedAt: string,
  fileNames: string[],
  counts: MassExodusSummary["counts"],
): string {
  const profileLabel = context.profile?.email || context.user?.email || "Guest collaborator";
  const profileTier = context.profile?.tier ?? context.tier;
  const exportSurface = context.sourceSurface === "profile" ? "Profile" : "Settings";

  return [
    "# GestaltView Export",
    "",
    `Requested from: ${exportSurface}`,
    `Generated at: ${exportedAt}`,
    `Profile: ${profileLabel}`,
    `Tier: ${profileTier}`,
    `Access: ${context.isAdmin ? "founder" : "member"}`,
    "",
    "## Included files",
    ...fileNames.map((fileName) => `- \`${fileName}\``),
    "",
    "## Counts",
    `- Journal snapshots: ${counts.journal}`,
    `- Scrapbook items: ${counts.scrapbook}`,
    `- Blueprints: ${counts.blueprintsActive} active, ${counts.blueprintsArchived} archived`,
    `- Captures: ${counts.capturesQueued} queued, ${counts.capturesApproved} approved, ${counts.capturesSaved} saved, ${counts.capturesInnerWorld} inner-world`,
    `- Archived approved orbs: ${counts.capturesArchivedApproved}`,
    `- User files: ${counts.userFiles}`,
    `- Inner-world artifacts: ${counts.innerWorldArtifacts}`,
    `- Insights: ${counts.insights}`,
    "",
    "All files in this archive are plain text, JSON, or markdown so they can be read without a GestaltView account.",
  ].join("\n");
}

function createBlobUrlDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1_000);
}

function buildProfileSnapshot(context: MassExodusContext): ProfileSnapshot {
  const profile = context.profile;
  return {
    id: profile?.id ?? context.user?.id ?? "guest",
    email: profile?.email ?? context.user?.email ?? "",
    tier: profile?.tier ?? context.tier,
    isAdmin: profile?.isAdmin ?? context.isAdmin,
    billyQueryCount: profile?.billyQueryCount ?? 0,
    subscriptionStatus: profile?.subscriptionStatus ?? (context.user ? "active" : "inactive"),
  };
}

export async function buildMassExodusArchive(context: MassExodusContext): Promise<{
  blob: Blob;
  fileName: string;
  summary: MassExodusSummary;
}> {
  const exportedAt = new Date().toISOString();
  const sourceLabel = context.sourceSurface === "profile" ? "Profile" : "Settings";

  const remoteResults = context.user
    ? await Promise.allSettled([
        loadSanctuaryJournalFromServer(),
        loadSanctuaryScrapbookFromServer(),
        loadArchivedInsightsFromServer(),
        loadUserFilesFromServer(),
        loadInnerWorldArtifactsFromServer(),
      ])
    : [];
  const remoteJournalResult = remoteResults[0];
  const remoteScrapbookResult = remoteResults[1];
  const remoteInsightsResult = remoteResults[2];
  const remoteUserFilesResult = remoteResults[3];
  const remoteArtifactsResult = remoteResults[4];

  const remoteJournal = remoteJournalResult?.status === "fulfilled" ? remoteJournalResult.value : null;
  const remoteScrapbook = remoteScrapbookResult?.status === "fulfilled" ? remoteScrapbookResult.value : null;
  const remoteInsights = remoteInsightsResult?.status === "fulfilled" ? remoteInsightsResult.value : null;
  const remoteUserFiles = remoteUserFilesResult?.status === "fulfilled" ? remoteUserFilesResult.value : null;
  const remoteArtifacts = remoteArtifactsResult?.status === "fulfilled" ? remoteArtifactsResult.value : null;

  const localJournal = readLocalJournalSnapshot();
  const localScrapbookItems = readLocalScrapbookItems();
  const localUserFiles = readUserFiles();
  const localArtifacts = readInnerWorldArtifacts();
  const localInsights = readArchivedInsights();

  const mergedUserFiles = mergeLatestById(localUserFiles, remoteUserFiles ?? []);
  const mergedInnerWorldArtifacts = mergeLatestById(localArtifacts, remoteArtifacts ?? []);
  const fileIndex = new Map(mergedUserFiles.map((file) => [file.id, file] as const));

  const scrapbookItems = mergeScrapbookItems(localScrapbookItems, remoteScrapbook ?? [], fileIndex);
  const journalSnapshot = buildJournalSnapshot(localJournal, remoteJournal ?? null, context.user);
  const mergedInsights =
    remoteInsights && remoteInsights.length > 0
      ? mergeArchivedInsights(localInsights, remoteInsights.map((record) => materializeArchivedInsight(record)))
      : localInsights;

  const scaffoldQueue = readScaffoldQueue();
  const approvedOrbs = readApprovedOrbs();
  const savedCaptures = readSavedCaptures();
  const innerWorldCaptures = readInnerWorldCaptures();
  const archivedApprovedOrbs = readArchivedApprovedOrbs();
  const activeBlueprints = readBlueprints();
  const archivedBlueprints = readArchivedBlueprints();

  const profileSnapshot = buildProfileSnapshot(context);

  const settingsSnapshot = readSurfaceSettingsSnapshot();

  const counts: MassExodusSummary["counts"] = {
    journal: journalSnapshot.journal ? 1 : 0,
    scrapbook: scrapbookItems.length,
    blueprintsActive: activeBlueprints.length,
    blueprintsArchived: archivedBlueprints.length,
    capturesQueued: scaffoldQueue.length,
    capturesApproved: approvedOrbs.length,
    capturesSaved: savedCaptures.length,
    capturesInnerWorld: innerWorldCaptures.length,
    capturesArchivedApproved: archivedApprovedOrbs.length,
    userFiles: mergedUserFiles.length,
    innerWorldArtifacts: mergedInnerWorldArtifacts.length,
    insights: mergedInsights.length,
  };

  const profileJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    user: context.user,
    profile: profileSnapshot,
    counts,
  };

  const settingsJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    settings: settingsSnapshot,
  };

  const journalJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    source: journalSnapshot.source,
    journal: journalSnapshot.journal,
  };

  const scrapbookJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    items: scrapbookItems,
  };

  const blueprintsJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    active: activeBlueprints,
    archived: archivedBlueprints,
  };

  const artifactsJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    queue: scaffoldQueue,
    approved: approvedOrbs,
    saved: savedCaptures,
    innerWorld: innerWorldCaptures,
    archivedApproved: archivedApprovedOrbs,
    userFiles: mergedUserFiles,
    innerWorldArtifacts: mergedInnerWorldArtifacts,
  };

  const insightsJson = {
    requestedFrom: sourceLabel,
    exportedAt,
    insights: mergedInsights,
  };

  const files: Record<string, Uint8Array> = {
    "index.md": textEncoder.encode(
      buildIndexMarkdown(context, exportedAt, [
        "profile/profile.json",
        "settings/settings.json",
        "journals/journal.json",
        "scrapbook/index.json",
        "blueprints/index.json",
        "artifacts/index.json",
        "insights/index.json",
      ], counts),
    ),
    "profile/profile.json": textEncoder.encode(toJson(profileJson)),
    "settings/settings.json": textEncoder.encode(toJson(settingsJson)),
    "journals/journal.json": textEncoder.encode(toJson(journalJson)),
    "scrapbook/index.json": textEncoder.encode(toJson(scrapbookJson)),
    "blueprints/index.json": textEncoder.encode(toJson(blueprintsJson)),
    "artifacts/index.json": textEncoder.encode(toJson(artifactsJson)),
    "insights/index.json": textEncoder.encode(toJson(insightsJson)),
  };

  const zipped = zipSync(files, { level: 6 });
  const blob = new Blob([new Uint8Array(zipped).buffer], {
    type: "application/zip",
  });
  const fileName = `gestaltview-exodus-${sanitizeFilePart(sourceLabel)}-${sanitizeFilePart(exportedAt)}.zip`;

  return {
    blob,
    fileName,
    summary: {
      exportedAt,
      sourceSurface: context.sourceSurface,
      fileCount: Object.keys(files).length,
      recordCount:
        counts.journal +
        counts.scrapbook +
        counts.blueprintsActive +
        counts.blueprintsArchived +
        counts.capturesQueued +
        counts.capturesApproved +
        counts.capturesSaved +
        counts.capturesInnerWorld +
        counts.capturesArchivedApproved +
        counts.userFiles +
        counts.innerWorldArtifacts +
        counts.insights +
        2,
      counts,
    },
  };
}

export async function downloadMassExodusArchive(context: MassExodusContext): Promise<MassExodusSummary> {
  const { blob, fileName, summary } = await buildMassExodusArchive(context);
  createBlobUrlDownload(blob, fileName);
  return summary;
}
