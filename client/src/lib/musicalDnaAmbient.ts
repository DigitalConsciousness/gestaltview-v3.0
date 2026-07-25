import type { PersonalityProfile } from "@shared/profileIngestion";

export type MusicalDnaAmbientJournalSnapshot = {
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MusicalDnaAmbientCapture = {
  title: string;
  text: string;
  createdAt: string;
  tags?: string[];
  metadata?: {
    context?: string;
    meaning?: string;
  };
};

export type MusicalDnaAmbientArtifact = {
  title: string;
  summary: string;
  createdAt: string;
  updatedAt?: string;
  originRoom?: string;
  tags?: string[];
};

export type MusicalDnaAmbientFile = {
  name: string;
  kind: string;
  createdAt: string;
  previewText?: string;
};

export type MusicalDnaAmbientInput = {
  journal?: MusicalDnaAmbientJournalSnapshot | null;
  savedCaptures?: MusicalDnaAmbientCapture[];
  sessionRecaps?: MusicalDnaAmbientArtifact[];
  creationCornerArtifacts?: MusicalDnaAmbientArtifact[];
  userFiles?: MusicalDnaAmbientFile[];
  profile?: PersonalityProfile | null;
  playlistCount?: number;
};

export type MusicalDnaAmbientSignal = {
  source: string;
  label: string;
  detail: string;
};

export type MusicalDnaAmbientAnalysis = {
  songTitle: string;
  artist: string;
  summary: string;
  signature: string;
  provenance: string[];
  signals: MusicalDnaAmbientSignal[];
};

const JOURNAL_STORAGE_KEY = "gv.sanctuary.journal.v1";

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function stripMarkup(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function hashString(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function pushSignal(
  signals: MusicalDnaAmbientSignal[],
  source: string,
  label: string,
  detail: string,
): void {
  const normalizedDetail = detail.trim();
  if (!normalizedDetail) {
    return;
  }

  signals.push({
    source,
    label,
    detail: normalizedDetail,
  });
}

export function readAmbientJournalSnapshot(): MusicalDnaAmbientJournalSnapshot | null {
  if (!hasBrowserStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<MusicalDnaAmbientJournalSnapshot> | null;
    const content = typeof parsed?.content === "string" ? parsed.content.trim() : "";
    if (!content) {
      return null;
    }

    return {
      content,
      createdAt: typeof parsed?.createdAt === "string" ? parsed.createdAt : undefined,
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function buildMusicalDnaAmbientAnalysis(input: MusicalDnaAmbientInput): MusicalDnaAmbientAnalysis | null {
  const signals: MusicalDnaAmbientSignal[] = [];
  const provenance: string[] = [];
  const sourceLabels: string[] = [];

  const journalSummary = input.journal?.content ? truncate(stripMarkup(input.journal.content), 140) : "";
  if (journalSummary) {
    pushSignal(signals, "journal", "Journal", journalSummary);
    provenance.push(`Journal note: ${journalSummary}`);
    sourceLabels.push("journal");
  }

  for (const capture of input.savedCaptures ?? []) {
    const context = capture.metadata?.context?.trim() || capture.metadata?.meaning?.trim() || "";
    const detail = [truncate(stripMarkup(capture.text), 100), context ? `(${truncate(context, 60)})` : ""]
      .filter(Boolean)
      .join(" ");
    pushSignal(signals, "capture", `Saved capture · ${truncate(capture.title, 42)}`, detail);
    provenance.push(`Saved capture: ${truncate(capture.title, 42)}${context ? ` — ${truncate(context, 72)}` : ""}`);
    sourceLabels.push("saved captures");
    if (provenance.length >= 4) break;
  }

  for (const recap of input.sessionRecaps ?? []) {
    const detail = truncate(recap.summary, 120);
    pushSignal(signals, "session-recap", `Session recap · ${truncate(recap.title, 42)}`, detail);
    provenance.push(`Session recap: ${truncate(recap.title, 42)} — ${detail}`);
    sourceLabels.push("recap artifacts");
    if (provenance.length >= 5) break;
  }

  for (const artifact of input.creationCornerArtifacts ?? []) {
    const detail = truncate(artifact.summary, 120);
    pushSignal(signals, "creation-corner", `Creation Corner · ${truncate(artifact.title, 42)}`, detail);
    provenance.push(`Creation Corner: ${truncate(artifact.title, 42)} — ${detail}`);
    sourceLabels.push("creation corner");
    if (provenance.length >= 6) break;
  }

  for (const file of input.userFiles ?? []) {
    const detail = [truncate(file.name, 48), file.previewText ? truncate(file.previewText, 72) : file.kind]
      .filter(Boolean)
      .join(" · ");
    pushSignal(signals, "file-upload", `File upload · ${truncate(file.name, 42)}`, detail);
    provenance.push(`File upload: ${truncate(file.name, 42)} (${file.kind})`);
    sourceLabels.push("file uploads");
    if (provenance.length >= 7) break;
  }

  if (input.profile) {
    const theme = truncate(input.profile.keyThemes[0] ?? input.profile.coreNarrative, 110);
    const tension = truncate(input.profile.unresolvedTensions[0] ?? "", 90);
    const detail = tension ? `${theme} / ${tension}` : theme;
    pushSignal(signals, "profile", "Personality profile", detail);
    provenance.push(`Personality profile: ${detail}`);
    sourceLabels.push("profile signals");
  }

  if (typeof input.playlistCount === "number" && input.playlistCount > 0) {
    const detail = `${input.playlistCount} playlist${input.playlistCount === 1 ? "" : "s"} available for comparison`;
    pushSignal(signals, "playlist", "Playlist library", detail);
    provenance.push(`Playlist library: ${detail}`);
    sourceLabels.push("playlist library");
  }

  if (signals.length === 0) {
    return null;
  }

  const uniqueSourceLabels = Array.from(new Set(sourceLabels));
  const titleRoot = uniqueSourceLabels.slice(0, 2).map((value) => value.replace(/\b\w/g, (char) => char.toUpperCase())).join(" + ");
  const songTitle = `${titleRoot || "Ambient"} Resonance`;
  const artist = `Inferred from ${uniqueSourceLabels.slice(0, 3).join(" / ") || "ambient signals"}`;
  const summary = `Ambient inference woven from ${signals.length} signal${signals.length === 1 ? "" : "s"}.`;
  const signature = hashString(
    [
      input.journal?.updatedAt ?? input.journal?.createdAt ?? "",
      input.journal?.content ?? "",
      ...(input.savedCaptures ?? []).map((capture) => `${capture.title}:${capture.createdAt}:${capture.metadata?.context ?? capture.metadata?.meaning ?? ""}`),
      ...(input.sessionRecaps ?? []).map((artifact) => `${artifact.title}:${artifact.createdAt}:${artifact.updatedAt ?? ""}`),
      ...(input.creationCornerArtifacts ?? []).map((artifact) => `${artifact.title}:${artifact.createdAt}:${artifact.updatedAt ?? ""}`),
      ...(input.userFiles ?? []).map((file) => `${file.name}:${file.createdAt}:${file.kind}`),
      input.profile?.coreNarrative ?? "",
      ...(input.profile?.keyThemes ?? []),
      ...(input.profile?.unresolvedTensions ?? []),
      String(input.playlistCount ?? 0),
    ].join("|"),
  );

  return {
    songTitle: truncate(songTitle, 72),
    artist: truncate(artist, 88),
    summary,
    signature,
    provenance,
    signals,
  };
}
