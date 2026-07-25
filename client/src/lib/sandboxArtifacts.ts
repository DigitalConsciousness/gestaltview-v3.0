import type { ArtifactSynthesisResponse, GeneratedArtifact, SourceRoom } from "@shared/gen-engine";

export type SandboxMode = "html" | "python" | "three";

export interface SandboxState {
  htmlCode: string;
  pythonCode: string;
  threeCode: string;
  lastMode: SandboxMode;
}

export interface SandboxArtifactPayload {
  type: "sandbox";
  mode: SandboxMode;
  title: string;
  sourceCode: string;
  previewSnapshot?: string;
  metadata: {
    sandboxVersion: "1.0";
    createdAt: string;
    modeContext: {
      htmlCode: string;
      pythonCode: string;
      threeCode: string;
    };
  };
}

export interface SandboxArtifactRecord {
  artifactId: string;
  payload: SandboxArtifactPayload;
  response: ArtifactSynthesisResponse;
  savedAt: string;
}

const SANDBOX_ARTIFACTS_STORAGE_KEY = "gestaltview:sandbox:artifacts:v1";
const MAX_SAVED_ARTIFACTS = 25;

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
    console.warn(`[sandboxArtifacts] local storage write failed for ${key}`, error);
  }
}

function isSandboxMode(value: unknown): value is SandboxMode {
  return value === "html" || value === "python" || value === "three";
}

function formatTimestampForTitle(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

export function buildSandboxArtifactTitle(mode: SandboxMode, createdAt = new Date()): string {
  return `Sandbox · ${mode.toUpperCase()} · ${formatTimestampForTitle(createdAt)}`;
}

export function buildSandboxArtifactPayload(
  mode: SandboxMode,
  sandboxState: SandboxState,
  previewSnapshot?: string,
): SandboxArtifactPayload {
  const sourceCode =
    mode === "html"
      ? sandboxState.htmlCode
      : mode === "python"
        ? sandboxState.pythonCode
        : sandboxState.threeCode;

  return {
    type: "sandbox",
    mode,
    title: buildSandboxArtifactTitle(mode),
    sourceCode,
    previewSnapshot,
    metadata: {
      sandboxVersion: "1.0",
      createdAt: new Date().toISOString(),
      modeContext: {
        htmlCode: sandboxState.htmlCode,
        pythonCode: sandboxState.pythonCode,
        threeCode: sandboxState.threeCode,
      },
    },
  };
}

export function readSandboxArtifacts(): SandboxArtifactRecord[] {
  const records = readJson<SandboxArtifactRecord[]>(SANDBOX_ARTIFACTS_STORAGE_KEY, []);
  return Array.isArray(records) ? records : [];
}

export function writeSandboxArtifacts(records: SandboxArtifactRecord[]): void {
  writeJson(SANDBOX_ARTIFACTS_STORAGE_KEY, records.slice(0, MAX_SAVED_ARTIFACTS));
}

export function storeSandboxArtifactRecord(record: SandboxArtifactRecord): void {
  const current = readSandboxArtifacts();
  const next = [record, ...current.filter((entry) => entry.artifactId !== record.artifactId)].slice(0, MAX_SAVED_ARTIFACTS);
  writeSandboxArtifacts(next);
}

export function readSandboxArtifactRecord(artifactId: string): SandboxArtifactRecord | null {
  return readSandboxArtifacts().find((record) => record.artifactId === artifactId) ?? null;
}

export function readSandboxState(fallback: SandboxState): SandboxState {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem("gestaltview:sandbox:state");
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<SandboxState> | null;
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    return {
      htmlCode: typeof parsed.htmlCode === "string" ? parsed.htmlCode : fallback.htmlCode,
      pythonCode: typeof parsed.pythonCode === "string" ? parsed.pythonCode : fallback.pythonCode,
      threeCode: typeof parsed.threeCode === "string" ? parsed.threeCode : fallback.threeCode,
      lastMode: isSandboxMode(parsed.lastMode) ? parsed.lastMode : fallback.lastMode,
    };
  } catch {
    return fallback;
  }
}

export function writeSandboxState(state: SandboxState): void {
  writeJson("gestaltview:sandbox:state", state);
}

export function artifactResponseToScreenModel(artifact: GeneratedArtifact) {
  const contentType = artifact.contentFormat === "html" || /<\/?[a-z][\s\S]*>/i.test(artifact.content)
    ? "html"
    : "text";
  const metadata = artifact.metadata as Record<string, unknown>;
  const summary = typeof metadata.summary === "string" ? metadata.summary : undefined;

  return {
    id: artifact.id,
    title: artifact.title,
    contentType,
    contentRef: artifact.content,
    contentHtml: contentType === "html" ? artifact.content : undefined,
    summary,
    createdAt: artifact.createdAt,
  } as const;
}

export function resolveSandboxArtifactId(
  response: ArtifactSynthesisResponse & { codexArtifactId?: string },
): string {
  return response.codexArtifactId ?? response.artifact.id;
}

export function buildSandboxSourceRoom(): SourceRoom {
  return "import";
}
