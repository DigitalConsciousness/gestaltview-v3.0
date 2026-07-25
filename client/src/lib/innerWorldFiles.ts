import { appFetchJson } from "@/lib/appFetch";
import { formatFileSize, isTextPreviewableFile } from "@/lib/artifact";

export type FileRoomOrigin = "blackboard" | "creation_corner" | "dynamic_inner_world" | "external_scaffold" | "unknown";

export type UserFileKind = "markdown" | "html" | "pdf" | "text" | "image" | "audio" | "video" | "binary";

export type UserFileRecord = {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  roomOrigin: FileRoomOrigin;
  tags: string[];
  kind: UserFileKind;
  previewText?: string;
  previewHtml?: string;
  dataUrl?: string;
  previewUrl?: string;
};

export type InnerWorldArtifactStatus =
  | "queued"
  | "rendering"
  | "ready"
  | "failed"
  | "draft"
  | "active"
  | "archived";

export type InnerWorldArtifactRecord = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  sourceFileId: string | null;
  html: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  originRoom: FileRoomOrigin;
  originDiId?: string | null;
  evidenceNodeIds: string[];
  tags: string[];
  status?: InnerWorldArtifactStatus;
};

export type ArtifactViewKind = "html" | "markdown" | "json_scene_graph" | "audio" | "image" | "raw";

export type InnerWorldArtifactView = {
  kind: ArtifactViewKind;
  primaryRenderable: boolean;
  rawSource: string;
  parsedJson?: unknown;
  mediaSrc?: string;
};

export type PersistedFilePayload = {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  roomOrigin: FileRoomOrigin;
  tags: string[];
  previewText?: string | null;
  previewHtml?: string | null;
  previewUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  kind: UserFileKind;
};

export type PersistedArtifactPayload = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  sourceFileId: string | null;
  html: string;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  originRoom: FileRoomOrigin;
  originDiId?: string | null;
  evidenceNodeIds: string[];
  tags: string[];
  status?: InnerWorldArtifactStatus | null;
};

export const FILE_STORAGE_KEYS = {
  userFiles: "gestaltview.userFiles.v1",
  innerWorldArtifacts: "gestaltview.innerWorldArtifacts.v1",
  selectedFile: "gestaltview.blackboard.selectedFile.v1",
} as const;

export const ARCHIVED_INNER_WORLD_ARTIFACTS_KEY = "gv.dynamicInnerWorld.archived.v1";

// Tombstone key — persists IDs of permanently deleted artifacts so the
// server-merge loop can never resurrect them.
export const DELETED_ARTIFACT_IDS_KEY = "gv.deletedArtifacts.v1";
const MAX_TOMBSTONES = 500;

export const FILE_EVENTS = {
  userFilesUpdated: "gestaltview:user-files-updated",
  innerWorldArtifactsUpdated: "gestaltview:inner-world-artifacts-updated",
} as const;

const MAX_USER_FILES = 300;
const MAX_ARTIFACTS = 300;

const GALLERY_STATUS_LABELS: Record<InnerWorldArtifactStatus, string> = {
  queued: "Queued",
  rendering: "Rendering",
  ready: "Ready",
  failed: "Failed",
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[innerWorldFiles] local storage write failed for ${key}`, error);
  }
}

function emit(name: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

export function emitUserFilesUpdated(): void {
  emit(FILE_EVENTS.userFilesUpdated);
}

export function emitInnerWorldArtifactsUpdated(): void {
  emit(FILE_EVENTS.innerWorldArtifactsUpdated);
}

export function createId(prefix = "gv"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function slugifyFileName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isMarkdownFile(name: string, mimeType = ""): boolean {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  return lowerName.endsWith(".md") || lowerName.endsWith(".markdown") || lowerMime.includes("markdown");
}

export function isHtmlFile(name: string, mimeType = ""): boolean {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  return lowerName.endsWith(".html") || lowerName.endsWith(".htm") || lowerMime.includes("html");
}

export function isPdfFile(name: string, mimeType = ""): boolean {
  const lowerName = name.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  return lowerName.endsWith(".pdf") || lowerMime === "application/pdf";
}

export function detectFileKind(name: string, mimeType = ""): UserFileKind {
  const lowerMime = mimeType.toLowerCase();
  if (isMarkdownFile(name, mimeType)) return "markdown";
  if (isHtmlFile(name, mimeType)) return "html";
  if (isPdfFile(name, mimeType)) return "pdf";
  if (lowerMime.startsWith("image/")) return "image";
  if (lowerMime.startsWith("audio/")) return "audio";
  if (lowerMime.startsWith("video/")) return "video";
  if (isTextPreviewableFile(mimeType, name)) return "text";
  return "binary";
}

export function roomOriginLabel(origin: FileRoomOrigin): string {
  switch (origin) {
    case "blackboard":
      return "Blackboard Room";
    case "creation_corner":
      return "Creation Corner";
    case "dynamic_inner_world":
      return "Dynamic Inner World";
    case "external_scaffold":
      return "External Scaffold";
    default:
      return "Unknown";
  }
}

export function fileKindLabel(kind: UserFileKind): string {
  switch (kind) {
    case "markdown":
      return "Markdown";
    case "html":
      return "HTML";
    case "pdf":
      return "PDF";
    case "image":
      return "Image";
    case "audio":
      return "Audio";
    case "video":
      return "Video";
    case "text":
      return "Text";
    default:
      return "Binary";
  }
}

export function artifactStatusLabel(status?: InnerWorldArtifactStatus | null): string {
  if (!status) {
    return "Ready";
  }

  return GALLERY_STATUS_LABELS[status] ?? status;
}

export function isMuseumVisibleArtifact(artifact: Pick<InnerWorldArtifactRecord, "status">): boolean {
  const status = artifact.status ?? "ready";
  return status === "ready" || status === "active";
}

export function isGalleryStagingStatus(status?: InnerWorldArtifactStatus | null): boolean {
  const resolved = status ?? "ready";
  return resolved === "queued" || resolved === "rendering" || resolved === "failed" || resolved === "draft";
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isSceneGraphPayload(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.schema === "nextgen.scene-graph.v1" || (Array.isArray(record.nodes) && Array.isArray(record.edges));
}

export function classifyInnerWorldArtifactView(artifact: InnerWorldArtifactRecord): InnerWorldArtifactView {
  const rawSource = artifact.html.trim();
  const lowered = rawSource.toLowerCase();
  const parsedJson = rawSource && /^[\[{]/.test(rawSource) ? safeParseJson(rawSource) : null;

  if (lowered.startsWith("data:image/")) {
    return {
      kind: "image",
      primaryRenderable: true,
      rawSource,
      mediaSrc: rawSource,
    };
  }

  if (lowered.startsWith("data:audio/") || (lowered.startsWith("blob:") && artifact.tags.includes("audio"))) {
    return {
      kind: "audio",
      primaryRenderable: true,
      rawSource,
      mediaSrc: rawSource,
    };
  }

  if (/^</.test(rawSource)) {
    return {
      kind: "html",
      primaryRenderable: true,
      rawSource,
    };
  }

  if (isSceneGraphPayload(parsedJson)) {
    return {
      kind: "json_scene_graph",
      primaryRenderable: true,
      rawSource,
      parsedJson,
    };
  }

  if (/^[\[{]/.test(rawSource)) {
    return {
      kind: "raw",
      primaryRenderable: false,
      rawSource,
      parsedJson,
    };
  }

  return {
    kind: "markdown",
    primaryRenderable: true,
    rawSource,
  };
}

function fileTagsFromRecord(name: string, kind: UserFileKind, roomOrigin: FileRoomOrigin): string[] {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() ?? "" : "";
  return Array.from(
    new Set(
      [
        roomOrigin,
        kind,
        extension ? `.${extension}` : null,
        isMarkdownFile(name) ? "markdown" : null,
        isHtmlFile(name) ? "html" : null,
        isPdfFile(name) ? "pdf" : null,
      ].filter((tag): tag is string => Boolean(tag)),
    ),
  );
}

export function formatFileRecordSize(record: Pick<UserFileRecord, "sizeBytes">): string {
  return formatFileSize(record.sizeBytes);
}

export function createUserFileRecord(input: {
  userId: string;
  file: File;
  roomOrigin?: FileRoomOrigin;
  previewText?: string;
  previewHtml?: string;
  dataUrl?: string;
  previewUrl?: string;
}): UserFileRecord {
  const now = new Date().toISOString();
  const id = createId("file");
  const kind = detectFileKind(input.file.name, input.file.type);
  const roomOrigin = input.roomOrigin ?? "blackboard";
  return {
    id,
    userId: input.userId,
    name: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
    storagePath: `user-files/${input.userId}/${id}/${slugifyFileName(input.file.name) || "file"}`,
    createdAt: now,
    updatedAt: now,
    roomOrigin,
    tags: fileTagsFromRecord(input.file.name, kind, roomOrigin),
    kind,
    previewText: input.previewText,
    previewHtml: input.previewHtml,
    dataUrl: input.dataUrl,
    previewUrl: input.previewUrl,
  };
}

export function readUserFiles(): UserFileRecord[] {
  return readJson<UserFileRecord[]>(FILE_STORAGE_KEYS.userFiles, []);
}

export function writeUserFiles(files: UserFileRecord[]): void {
  writeJson(FILE_STORAGE_KEYS.userFiles, files.slice(0, MAX_USER_FILES));
  emitUserFilesUpdated();
}

export function appendUserFile(file: UserFileRecord): UserFileRecord[] {
  const next = [file, ...readUserFiles().filter((item) => item.id !== file.id)].slice(0, MAX_USER_FILES);
  writeUserFiles(next);
  return next;
}

export function updateUserFile(fileId: string, updater: (file: UserFileRecord) => UserFileRecord): UserFileRecord[] {
  const next = readUserFiles().map((file) => (file.id === fileId ? updater(file) : file));
  writeUserFiles(next);
  return next;
}

export function removeUserFile(fileId: string): UserFileRecord[] {
  const next = readUserFiles().filter((file) => file.id !== fileId);
  writeUserFiles(next);
  removeArtifactsForSourceFile(fileId);
  return next;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeInlineHtml(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    document.querySelectorAll("script, iframe, object, embed").forEach((node) => node.remove());
    document.querySelectorAll("*").forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.toLowerCase();
        if (name.startsWith("on") || value.startsWith("javascript:")) {
          node.removeAttribute(attribute.name);
        }
      });
    });
    return document.body.innerHTML;
  } catch {
    return html;
  }
}

export function buildArtifactHtmlDocument(file: UserFileRecord): string {
  const safePreviewText = escapeHtml(file.previewText ?? "");
  const safeInlineHtml = sanitizeInlineHtml(file.previewHtml ?? file.previewText ?? "");

  if (file.kind === "html" && safeInlineHtml) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      :root { color-scheme: dark; }
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #05060a; color: #f7fbff; }
      .shell { min-height: 100vh; padding: 32px; background: radial-gradient(circle at top, rgba(18,214,255,0.16), transparent 30%), radial-gradient(circle at 80% 0%, rgba(191,0,255,0.14), transparent 28%), #05060a; }
      .frame { max-width: 1040px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; background: rgba(255,255,255,0.035); box-shadow: 0 0 80px rgba(18,214,255,0.08); overflow: hidden; }
      .chrome { display:flex; justify-content: space-between; align-items:center; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
      .meta { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: rgba(255,255,255,0.48); }
      .body { padding: 28px; line-height: 1.7; }
    </style></head><body><div class="shell"><div class="frame"><div class="chrome"><div><div class="meta">${escapeHtml(file.name)}</div><h1 style="margin:10px 0 0;font-size:28px;">${escapeHtml(file.name)}</h1></div><div class="meta">${escapeHtml(fileKindLabel(file.kind))}</div></div><div class="body">${safeInlineHtml}</div></div></div></body></html>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #05060a; color: #f7fbff; }
    .shell { min-height: 100vh; padding: 32px; background: radial-gradient(circle at top, rgba(18,214,255,0.16), transparent 30%), radial-gradient(circle at 80% 0%, rgba(191,0,255,0.14), transparent 28%), #05060a; }
    .frame { max-width: 1040px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; background: rgba(255,255,255,0.035); box-shadow: 0 0 80px rgba(18,214,255,0.08); overflow: hidden; }
    .chrome { display:flex; justify-content: space-between; align-items:center; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
    .meta { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: rgba(255,255,255,0.48); }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; line-height: 1.7; padding: 28px; }
  </style></head><body><div class="shell"><div class="frame"><div class="chrome"><div><div class="meta">${escapeHtml(file.name)}</div><h1 style="margin:10px 0 0;font-size:28px;">${escapeHtml(file.name)}</h1></div><div class="meta">${escapeHtml(fileKindLabel(file.kind))}</div></div><pre>${safePreviewText}</pre></div></div></body></html>`;
}

export function getFilePreviewText(file: UserFileRecord): string {
  if (file.kind === "html") {
    return stripHtml(file.previewHtml ?? file.previewText ?? "");
  }

  return file.previewText ?? "";
}

export function getFileInsertText(file: UserFileRecord): string {
  const baseText = getFilePreviewText(file).trim();
  if (baseText) {
    return baseText;
  }

  if (file.kind === "pdf") {
    return `[PDF attachment: ${file.name}]`;
  }

  if (file.kind === "image" || file.kind === "audio" || file.kind === "video" || file.kind === "binary") {
    return `[${fileKindLabel(file.kind)} attachment: ${file.name}]`;
  }

  return file.name;
}

export function fileReferenceToken(file: UserFileRecord): string {
  return `[[file:${file.id}|${file.name}]]`;
}

function stripHtml(html: string): string {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  } catch {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
}

export function readInnerWorldArtifacts(): InnerWorldArtifactRecord[] {
  return readJson<InnerWorldArtifactRecord[]>(FILE_STORAGE_KEYS.innerWorldArtifacts, []);
}

export function writeInnerWorldArtifacts(artifacts: InnerWorldArtifactRecord[]): void {
  writeJson(FILE_STORAGE_KEYS.innerWorldArtifacts, artifacts.slice(0, MAX_ARTIFACTS));
  emitInnerWorldArtifactsUpdated();
}

export function readArchivedInnerWorldArtifacts(): InnerWorldArtifactRecord[] {
  return readJson<InnerWorldArtifactRecord[]>(ARCHIVED_INNER_WORLD_ARTIFACTS_KEY, []);
}

export function writeArchivedInnerWorldArtifacts(artifacts: InnerWorldArtifactRecord[]): void {
  writeJson(ARCHIVED_INNER_WORLD_ARTIFACTS_KEY, artifacts.slice(0, MAX_ARTIFACTS));
  emitInnerWorldArtifactsUpdated();
}

// ---------------------------------------------------------------------------
// Tombstone helpers — permanently track deleted IDs so mergeInnerWorldArtifacts
// can never resurrect them from the server even if DELETE races or fails.
// ---------------------------------------------------------------------------

export function readDeletedArtifactIds(): Set<string> {
  return new Set(readJson<string[]>(DELETED_ARTIFACT_IDS_KEY, []));
}

function writeDeletedArtifactId(artifactId: string): void {
  const current = readDeletedArtifactIds();
  current.add(artifactId);
  // Keep the most-recently-deleted IDs; trim oldest if we exceed the cap.
  const arr = Array.from(current).slice(-MAX_TOMBSTONES);
  writeJson(DELETED_ARTIFACT_IDS_KEY, arr);
}

function clearAllTombstones(): void {
  writeJson(DELETED_ARTIFACT_IDS_KEY, []);
}

// ---------------------------------------------------------------------------

export type InnerWorldArtifactLifecycleResult = {
  active: InnerWorldArtifactRecord[];
  archived: InnerWorldArtifactRecord[];
};

function parseArtifactTimestamp(value: string | undefined): number {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Merges local and remote artifact lists, always preferring the newer
 * updatedAt. Critically: any ID recorded in the tombstone set is stripped
 * from remote data before merging, preventing deleted artifacts from
 * resurf acing after a failed or slow server DELETE.
 */
export function mergeInnerWorldArtifacts(
  localArtifacts: InnerWorldArtifactRecord[],
  remoteArtifacts: InnerWorldArtifactRecord[],
): InnerWorldArtifactRecord[] {
  const deleted = readDeletedArtifactIds();
  const filteredRemote = remoteArtifacts.filter((a) => !deleted.has(a.id));

  const merged = new Map<string, InnerWorldArtifactRecord>();

  for (const artifact of [...filteredRemote, ...localArtifacts]) {
    const existing = merged.get(artifact.id);
    if (
      !existing ||
      parseArtifactTimestamp(artifact.updatedAt) >= parseArtifactTimestamp(existing.updatedAt)
    ) {
      merged.set(artifact.id, artifact);
    }
  }

  return [...merged.values()].sort((a, b) => {
    const updatedDelta = parseArtifactTimestamp(b.updatedAt) - parseArtifactTimestamp(a.updatedAt);
    if (updatedDelta !== 0) {
      return updatedDelta;
    }

    return parseArtifactTimestamp(b.createdAt) - parseArtifactTimestamp(a.createdAt);
  });
}

export function appendInnerWorldArtifact(artifact: InnerWorldArtifactRecord): InnerWorldArtifactRecord[] {
  const next = [artifact, ...readInnerWorldArtifacts().filter((item) => item.id !== artifact.id)].slice(0, MAX_ARTIFACTS);
  writeInnerWorldArtifacts(next);
  void createInnerWorldArtifactOnServer({ artifact });
  return next;
}

export function updateInnerWorldArtifact(
  artifactId: string,
  updater: (artifact: InnerWorldArtifactRecord) => InnerWorldArtifactRecord,
): InnerWorldArtifactRecord[] {
  const next = readInnerWorldArtifacts().map((artifact) => (artifact.id === artifactId ? updater(artifact) : artifact));
  writeInnerWorldArtifacts(next);
  const updatedArtifact = next.find((artifact) => artifact.id === artifactId);
  if (updatedArtifact) {
    void createInnerWorldArtifactOnServer({ artifact: updatedArtifact });
  }
  return next;
}

/**
 * Permanently deletes an artifact:
 * 1. Writes a tombstone so mergeInnerWorldArtifacts can never bring it back.
 * 2. Removes from localStorage.
 * 3. Fires DELETE to the server (best-effort; tombstone survives even if this races).
 */
export function removeInnerWorldArtifact(artifactId: string): InnerWorldArtifactRecord[] {
  writeDeletedArtifactId(artifactId);
  const next = readInnerWorldArtifacts().filter((artifact) => artifact.id !== artifactId);
  writeInnerWorldArtifacts(next);
  void deleteInnerWorldArtifactFromServer(artifactId);
  return next;
}

export function archiveInnerWorldArtifact(artifactId: string): InnerWorldArtifactLifecycleResult {
  const active = readInnerWorldArtifacts();
  const artifact = active.find((item) => item.id === artifactId);
  const archived = readArchivedInnerWorldArtifacts();

  if (!artifact) {
    return { active, archived };
  }

  const archivedArtifact = {
    ...artifact,
    status: "archived" as const,
    updatedAt: new Date().toISOString(),
  };
  const nextActive = active.filter((item) => item.id !== artifactId);
  const nextArchived = [archivedArtifact, ...archived.filter((item) => item.id !== artifactId)].slice(0, MAX_ARTIFACTS);

  writeInnerWorldArtifacts(nextActive);
  writeArchivedInnerWorldArtifacts(nextArchived);
  void deleteInnerWorldArtifactFromServer(artifactId);

  return { active: nextActive, archived: nextArchived };
}

export function restoreInnerWorldArtifact(artifactId: string): InnerWorldArtifactLifecycleResult {
  const active = readInnerWorldArtifacts();
  const archived = readArchivedInnerWorldArtifacts();
  const artifact = archived.find((item) => item.id === artifactId);

  if (!artifact) {
    return { active, archived };
  }

  const restoredArtifact = {
    ...artifact,
    status: artifact.status === "archived" ? "ready" : artifact.status ?? "ready",
    updatedAt: new Date().toISOString(),
  };
  const nextActive = [restoredArtifact, ...active.filter((item) => item.id !== artifactId)].slice(0, MAX_ARTIFACTS);
  const nextArchived = archived.filter((item) => item.id !== artifactId);

  writeInnerWorldArtifacts(nextActive);
  writeArchivedInnerWorldArtifacts(nextArchived);
  void createInnerWorldArtifactOnServer({ artifact: restoredArtifact });

  return { active: nextActive, archived: nextArchived };
}

/**
 * Hard-deletes from both active and archived lists plus the server.
 * Tombstones the ID so it cannot return via merge.
 */
export function clearInnerWorldArtifact(artifactId: string): InnerWorldArtifactLifecycleResult {
  writeDeletedArtifactId(artifactId);
  const nextActive = readInnerWorldArtifacts().filter((artifact) => artifact.id !== artifactId);
  const nextArchived = readArchivedInnerWorldArtifacts().filter((artifact) => artifact.id !== artifactId);

  writeInnerWorldArtifacts(nextActive);
  writeArchivedInnerWorldArtifacts(nextArchived);
  void deleteInnerWorldArtifactFromServer(artifactId);

  return { active: nextActive, archived: nextArchived };
}

/**
 * GOD MODE — founder/admin only.
 * Wipes ALL artifacts from localStorage (active + archived + tombstones)
 * and fires a bulk purge request to the server.
 * Returns the number of artifacts that were purged.
 */
export async function purgeAllInnerWorldArtifacts(): Promise<number> {
  const active = readInnerWorldArtifacts();
  const archived = readArchivedInnerWorldArtifacts();
  const total = active.length + archived.length;

  // Wipe localStorage first so the UI is clean even if server call fails.
  writeJson(FILE_STORAGE_KEYS.innerWorldArtifacts, []);
  writeJson(ARCHIVED_INNER_WORLD_ARTIFACTS_KEY, []);
  clearAllTombstones();
  emitInnerWorldArtifactsUpdated();

  // Best-effort server purge — delete every known ID individually.
  const allIds = [...active, ...archived].map((a) => a.id);
  await Promise.allSettled(allIds.map((id) => deleteInnerWorldArtifactFromServer(id)));

  return total;
}

export function removeArtifactsForSourceFile(sourceFileId: string): InnerWorldArtifactRecord[] {
  const removed = readInnerWorldArtifacts().filter((artifact) => artifact.sourceFileId === sourceFileId);
  const next = readInnerWorldArtifacts().filter((artifact) => artifact.sourceFileId !== sourceFileId);
  writeInnerWorldArtifacts(next);
  for (const artifact of removed) {
    writeDeletedArtifactId(artifact.id);
    void deleteInnerWorldArtifactFromServer(artifact.id);
  }
  return next;
}

function sanitizeSummary(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function createInnerWorldArtifactFromFile(file: UserFileRecord, userId: string): InnerWorldArtifactRecord {
  const now = new Date().toISOString();
  const summarySource = sanitizeSummary(getFileInsertText(file));
  const summary = summarySource.length > 120 ? `${summarySource.slice(0, 117)}...` : summarySource || `${fileKindLabel(file.kind)} artifact`;
  const artifactBody = file.kind === "html" ? sanitizeInlineHtml(file.previewHtml ?? file.previewText ?? "") : escapeHtml(file.previewText ?? "");
  const bodyHtml = file.kind === "html"
    ? artifactBody
    : `<pre style="margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:14px;line-height:1.7;">${artifactBody}</pre>`;

  return {
    id: createId("artifact"),
    userId,
    title: file.name.replace(/\.[^.]+$/, "") || file.name,
    summary,
    sourceFileId: file.id,
    html: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      :root { color-scheme: dark; }
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #05060a; color: #f7fbff; }
      .shell { min-height: 100vh; padding: 32px; background: radial-gradient(circle at top, rgba(18,214,255,0.16), transparent 30%), radial-gradient(circle at 80% 0%, rgba(191,0,255,0.14), transparent 28%), #05060a; }
      .frame { max-width: 1100px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; background: rgba(255,255,255,0.035); box-shadow: 0 0 80px rgba(18,214,255,0.08); overflow: hidden; }
      .chrome { display:flex; justify-content: space-between; align-items:center; gap: 18px; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
      .title { font-size: 28px; line-height: 1.15; margin: 0; }
      .meta { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: rgba(255,255,255,0.48); }
      .body { padding: 28px; line-height: 1.7; }
      .body pre { margin: 0; }
    </style></head><body><div class="shell"><div class="frame"><div class="chrome"><div><div class="meta">${escapeHtml(fileKindLabel(file.kind))} · ${escapeHtml(roomOriginLabel(file.roomOrigin))}</div><h1 class="title">${escapeHtml(file.name)}</h1></div><div class="meta">${escapeHtml(file.createdAt)}</div></div><div class="body">${bodyHtml}</div></div></div></body></html>`,
    thumbnailUrl: file.previewUrl ?? file.dataUrl,
    createdAt: now,
    updatedAt: now,
    originRoom: file.roomOrigin,
    originDiId: null,
    evidenceNodeIds: [file.id],
    tags: Array.from(new Set([file.kind, file.roomOrigin, ...file.tags])).slice(0, 12),
    status: "ready",
  };
}

export function pinFileToInnerWorld(file: UserFileRecord, userId: string): InnerWorldArtifactRecord[] {
  const artifact = createInnerWorldArtifactFromFile(file, userId);
  const next = appendInnerWorldArtifact(artifact);
  return next.filter((item) => item.sourceFileId !== file.id || item.id === artifact.id).slice(0, MAX_ARTIFACTS);
}

export function getUserFileById(fileId: string): UserFileRecord | null {
  return readUserFiles().find((file) => file.id === fileId) ?? null;
}

export function getInnerWorldArtifactById(artifactId: string): InnerWorldArtifactRecord | null {
  return readInnerWorldArtifacts().find((artifact) => artifact.id === artifactId) ?? null;
}

function normalizeServerFile(record: PersistedFilePayload): UserFileRecord {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    storagePath: record.storagePath,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    roomOrigin: record.roomOrigin,
    tags: record.tags,
    kind: record.kind,
    previewText: record.previewText ?? undefined,
    previewHtml: record.previewHtml ?? undefined,
    previewUrl: record.previewUrl ?? undefined,
  };
}

function normalizeServerArtifact(record: PersistedArtifactPayload): InnerWorldArtifactRecord {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    summary: record.summary,
    sourceFileId: record.sourceFileId,
    html: record.html,
    thumbnailUrl: record.thumbnailUrl ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    originRoom: record.originRoom,
    originDiId: record.originDiId ?? undefined,
    evidenceNodeIds: record.evidenceNodeIds,
    tags: record.tags,
    status: record.status ?? undefined,
  };
}

export async function loadUserFilesFromServer(): Promise<UserFileRecord[] | null> {
  const result = await appFetchJson<{ files: PersistedFilePayload[] }>("/api/inner-world/files", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.files.map(normalizeServerFile);
}

export async function uploadUserFileToServer(input: {
  file: UserFileRecord;
  content?: string;
  base64DataUrl?: string;
}): Promise<UserFileRecord | null> {
  const result = await appFetchJson<{ file: PersistedFilePayload }>("/api/inner-world/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: input.file,
      content: input.content ?? null,
      base64DataUrl: input.base64DataUrl ?? null,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return normalizeServerFile(result.data.file);
}

export async function deleteUserFileFromServer(fileId: string): Promise<boolean> {
  const result = await appFetchJson<{ ok: boolean }>(`/api/inner-world/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    timeoutMs: 15_000,
    retryUnsafe: true,
  });

  return result.ok && result.data.ok;
}

export async function getUserFileShareUrlFromServer(fileId: string): Promise<string | null> {
  const result = await appFetchJson<{ signedUrl: string }>(`/api/inner-world/files/${encodeURIComponent(fileId)}/share`, {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.signedUrl || null;
}

export async function loadInnerWorldArtifactsFromServer(): Promise<InnerWorldArtifactRecord[] | null> {
  const result = await appFetchJson<{ artifacts: PersistedArtifactPayload[] }>("/api/inner-world/artifacts", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.artifacts.map(normalizeServerArtifact);
}

export async function createInnerWorldArtifactOnServer(input: {
  artifact: InnerWorldArtifactRecord;
}): Promise<InnerWorldArtifactRecord | null> {
  const result = await appFetchJson<{ artifact: PersistedArtifactPayload }>("/api/inner-world/artifacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artifact: input.artifact,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return normalizeServerArtifact(result.data.artifact);
}

export async function deleteInnerWorldArtifactFromServer(artifactId: string): Promise<boolean> {
  const result = await appFetchJson<{ ok: boolean }>(`/api/inner-world/artifacts/${encodeURIComponent(artifactId)}`, {
    method: "DELETE",
    timeoutMs: 15_000,
    retryUnsafe: true,
  });

  return result.ok && result.data.ok;
}
