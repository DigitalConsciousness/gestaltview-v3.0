import { describe, expect, it } from "vitest";

import {
  buildMusicalDnaTrackRecord,
  buildMusicalDnaTrackSong,
  isMusicalDnaTrackFile,
  parseMusicalDnaArtist,
  parseTrackSyncState,
} from "@/lib/musicalDnaTracks";
import type { UserFileRecord } from "@/lib/innerWorldFiles";

function createAudioFileRecord(overrides: Partial<UserFileRecord> = {}): UserFileRecord {
  return {
    id: "file-123",
    userId: "user-123",
    name: "Midnight Signal.wav",
    mimeType: "audio/wav",
    sizeBytes: 1024,
    storagePath: "user-files/user-123/file-123/midnight-signal",
    createdAt: "2026-06-13T00:00:00.000Z",
    updatedAt: "2026-06-13T00:00:00.000Z",
    roomOrigin: "unknown",
    tags: ["audio", "musical-dna-track", "musical-dna-artist:Haley"],
    kind: "audio",
    previewText: "A note about how this track steadies the room.",
    previewHtml: undefined,
    dataUrl: "data:audio/wav;base64,AAAA",
    previewUrl: undefined,
    ...overrides,
  };
}

describe("Musical DNA track helpers", () => {
  it("reads the embedded musical DNA artist tag with a safe fallback", () => {
    expect(parseMusicalDnaArtist(["musical-dna-track", "musical-dna-artist:Haley"])).toBe("Haley");
    expect(parseMusicalDnaArtist(["musical-dna-track"])).toBe("Local upload");
  });

  it("identifies manual musical DNA uploads by file kind and tag", () => {
    expect(isMusicalDnaTrackFile(createAudioFileRecord())).toBe(true);
    expect(isMusicalDnaTrackFile(createAudioFileRecord({ kind: "image" }))).toBe(false);
    expect(isMusicalDnaTrackFile(createAudioFileRecord({ tags: ["audio"] }))).toBe(false);
  });

  it("builds a playable song record from a stored manual track", () => {
    const file = createAudioFileRecord();
    const track = buildMusicalDnaTrackRecord(file);
    const song = buildMusicalDnaTrackSong(track);

    expect(track).toMatchObject({
      title: "Midnight Signal.wav",
      artist: "Haley",
      note: "A note about how this track steadies the room.",
      syncState: "synced",
    });
    expect(song).toMatchObject({
      id: "musical-dna-track-file-123",
      title: "Midnight Signal.wav",
      artist: "Haley",
      archetype: "Manual upload",
      emotionalCluster: "A note about how this track steadies the room.",
      audioSrc: "data:audio/wav;base64,AAAA",
    });
    expect(song.dnaVector).toHaveLength(4);
    expect(song.provenance).toEqual([
      "Manual musical DNA upload",
      "Note: A note about how this track steadies the room.",
    ]);
  });

  it("preserves a failed remote upload as a local_ready or failed_remote track record", () => {
    const record = buildMusicalDnaTrackRecord(
      createAudioFileRecord({ tags: ["audio", "musical-dna-track", "sync:failed_remote"] }),
    );

    expect(record.syncState).toBe("failed_remote");
    expect(parseTrackSyncState(["audio", "sync:local_ready"])).toBe("local_ready");
  });
});
