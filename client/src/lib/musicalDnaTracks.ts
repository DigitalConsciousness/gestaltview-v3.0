import type { UserFileRecord } from "@/lib/innerWorldFiles";

export const MUSICAL_DNA_TRACK_TAG = "musical-dna-track";
export const MUSICAL_DNA_TRACK_MAX_BYTES = 50 * 1024 * 1024;
export const MUSICAL_DNA_TRACK_ACCEPT = "audio/*,.mp3,.wav,.flac,.aac,.m4a";

export type MusicalDnaTrackDraft = {
  title: string;
  artist: string;
  note: string;
};

export type MusicalDnaTrackRecord = {
  file: UserFileRecord;
  title: string;
  artist: string;
  note: string;
  syncState: UploadSyncState;
};

export type UploadSyncState =
  | "selected"
  | "local_ready"
  | "syncing"
  | "synced"
  | "failed_remote"
  | "rejected";

export type MusicalDnaPlayableTrack = {
  id: string;
  title: string;
  artist: string;
  archetype: string;
  emotionalCluster: string;
  audioSrc: string;
  albumArt: string;
  bpm: number;
  key: string;
  dnaVector: number[];
  provenance: string[];
};

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function vectorFromString(input: string): number[] {
  const hash = hashString(input);
  return Array.from({ length: 4 }, (_, index) =>
    Number((((hash >> (index * 8)) & 0xff) / 255).toFixed(3)),
  );
}

export function createMusicalDnaTrackArtworkDataUri(title: string, artist: string): string {
  const seed = hashString(`${title}|${artist}|musical-dna`);
  const hue = seed % 360;
  const accent = (hue + 52) % 360;
  const initial = (title.trim().charAt(0) || "♫").toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue} 72% 26%)" />
          <stop offset="100%" stop-color="hsl(${accent} 76% 14%)" />
        </linearGradient>
        <radialGradient id="glow" cx="52%" cy="24%" r="72%">
          <stop offset="0%" stop-color="rgba(13,217,230,0.4)" />
          <stop offset="100%" stop-color="rgba(13,217,230,0)" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" rx="42" fill="url(#bg)" />
      <rect width="480" height="480" rx="42" fill="url(#glow)" />
      <circle cx="118" cy="122" r="76" fill="rgba(255,255,255,0.08)" />
      <circle cx="358" cy="350" r="112" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="55%" fill="white" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="164" font-weight="700">${initial}</text>
      <text x="50%" y="78%" fill="rgba(255,255,255,0.78)" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="28">${artist}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function parseMusicalDnaArtist(tags: string[]): string {
  const artistTag = tags.find((tag) => tag.startsWith("musical-dna-artist:"));
  if (!artistTag) {
    return "Local upload";
  }

  return artistTag.slice("musical-dna-artist:".length).trim() || "Local upload";
}

export function parseTrackSyncState(tags: string[]): UploadSyncState {
  const tag = tags.find((value) => value.startsWith("sync:"));
  return (tag?.slice(5) as UploadSyncState) || "synced";
}

export function setTrackSyncState(tags: string[], syncState: UploadSyncState): string[] {
  return [...tags.filter((tag) => !tag.startsWith("sync:")), `sync:${syncState}`];
}

export function isMusicalDnaTrackFile(file: UserFileRecord): boolean {
  return file.kind === "audio" && file.tags.includes(MUSICAL_DNA_TRACK_TAG);
}

export function buildMusicalDnaTrackRecord(file: UserFileRecord): MusicalDnaTrackRecord {
  return {
    file,
    title: file.name,
    artist: parseMusicalDnaArtist(file.tags),
    note: file.previewText?.trim() ?? "",
    syncState: parseTrackSyncState(file.tags),
  };
}

export function buildMusicalDnaTrackSong(track: MusicalDnaTrackRecord): MusicalDnaPlayableTrack {
  const audioSrc = track.file.previewUrl ?? track.file.dataUrl ?? "";
  const title = track.title.trim() || stripExtension(track.file.name) || "Untitled Track";
  const artist = track.artist.trim() || "Local upload";

  return {
    id: `musical-dna-track-${track.file.id}`,
    title,
    artist,
    archetype: "Manual upload",
    emotionalCluster: track.note.trim() || "Awaiting analysis",
    audioSrc,
    albumArt: createMusicalDnaTrackArtworkDataUri(title, artist),
    bpm: 0,
    key: "Unknown",
    dnaVector: vectorFromString(`${track.file.id}:${title}:${artist}:${track.note}`),
    provenance: [
      "Manual musical DNA upload",
      track.note ? `Note: ${track.note}` : "No note added",
    ],
  };
}
