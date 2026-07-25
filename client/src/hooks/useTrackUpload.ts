import { useCallback, useEffect, useState } from "react";

import { uploadUserFileToServer, deleteUserFileFromServer } from "@/lib/fileStorage";
import {
  appendUserFile,
  createUserFileRecord,
  FILE_EVENTS,
  loadUserFilesFromServer,
  readUserFiles,
  removeUserFile,
  updateUserFile,
  writeUserFiles,
} from "@/lib/innerWorldFiles";
import {
  buildMusicalDnaTrackRecord,
  MUSICAL_DNA_TRACK_ACCEPT,
  MUSICAL_DNA_TRACK_MAX_BYTES,
  MUSICAL_DNA_TRACK_TAG,
  parseTrackSyncState,
  setTrackSyncState,
  type MusicalDnaTrackDraft,
  type MusicalDnaTrackRecord,
} from "@/lib/musicalDnaTracks";
import type { UserFileRecord } from "@/lib/innerWorldFiles";

const MAX_TRACKS = 10;

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read the audio file."));
    reader.readAsDataURL(file);
  });
}

function isAllowedAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) {
    return true;
  }

  const name = file.name.toLowerCase();
  return [".mp3", ".wav", ".flac", ".aac", ".m4a"].some((extension) => name.endsWith(extension));
}

function readMusicalDnaTracks(): MusicalDnaTrackRecord[] {
  return readUserFiles()
    .filter((file) => file.kind === "audio" && file.tags.includes(MUSICAL_DNA_TRACK_TAG))
    .map(buildMusicalDnaTrackRecord);
}

function mergeStoredFiles(localFiles: ReturnType<typeof readUserFiles>, remoteFiles: ReturnType<typeof readUserFiles>): ReturnType<typeof readUserFiles> {
  const merged = new Map<string, (typeof localFiles)[number]>();

  for (const file of [...remoteFiles, ...localFiles]) {
    const existing = merged.get(file.id);
    if (!existing) {
      merged.set(file.id, file);
      continue;
    }

    if (Date.parse(file.updatedAt) >= Date.parse(existing.updatedAt)) {
      merged.set(file.id, file);
    }
  }

  return [...merged.values()].sort((left, right) => {
    const updatedDelta = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    if (updatedDelta !== 0) {
      return updatedDelta;
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  });
}

export function useTrackUpload(userId: string | null | undefined) {
  const [tracks, setTracks] = useState<MusicalDnaTrackRecord[]>(() => readMusicalDnaTracks());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTracks = useCallback(() => {
    setTracks(readMusicalDnaTracks());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refreshTracks();
    handleUpdate();
    window.addEventListener(FILE_EVENTS.userFilesUpdated, handleUpdate);
    return () => window.removeEventListener(FILE_EVENTS.userFilesUpdated, handleUpdate);
  }, [refreshTracks]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    const syncRemoteFiles = async () => {
      const remoteFiles = await loadUserFilesFromServer();
      if (cancelled || !remoteFiles) {
        return;
      }

      const mergedFiles = mergeStoredFiles(readUserFiles(), remoteFiles);
      writeUserFiles(mergedFiles);
      refreshTracks();
    };

    void syncRemoteFiles();

    return () => {
      cancelled = true;
    };
  }, [refreshTracks, userId]);

  const retry = useCallback(async (fileId: string): Promise<MusicalDnaTrackRecord | null> => {
    if (!userId) {
      return null;
    }

    const existing = readUserFiles().find((file) => file.id === fileId);
    if (!existing?.dataUrl) {
      setError("This track is missing its local audio payload, so cloud sync cannot be retried.");
      return null;
    }

    setIsUploading(true);
    setError(null);
    updateUserFile(fileId, (file) => ({
      ...file,
      tags: setTrackSyncState(file.tags, "syncing"),
      updatedAt: new Date().toISOString(),
    }));
    refreshTracks();

    try {
      const persisted = await uploadUserFileToServer({
        file: existing,
        base64DataUrl: existing.dataUrl,
      });
      if (!persisted) {
        throw new Error("Cloud sync did not return a persisted file record.");
      }
      removeUserFile(fileId);
      const syncedFile: UserFileRecord = {
        ...persisted,
        name: existing.name,
        previewText: existing.previewText,
        tags: setTrackSyncState(
          Array.from(new Set([...persisted.tags, ...existing.tags, MUSICAL_DNA_TRACK_TAG])),
          "synced",
        ),
      };
      appendUserFile(syncedFile);
      refreshTracks();
      return buildMusicalDnaTrackRecord(syncedFile);
    } catch (uploadError) {
      updateUserFile(fileId, (file) => ({
        ...file,
        tags: setTrackSyncState(file.tags, "failed_remote"),
        updatedAt: new Date().toISOString(),
      }));
      setError("Track is saved locally for this browser. Cloud sync failed. Retry sync or export local copy.");
      refreshTracks();
      return buildMusicalDnaTrackRecord(
        readUserFiles().find((file) => file.id === fileId) ?? existing,
      );
    } finally {
      setIsUploading(false);
    }
  }, [refreshTracks, userId]);

  const upload = useCallback(async (input: {
    file: File;
    title: string;
    artist: string;
    note: string;
  }): Promise<MusicalDnaTrackRecord> => {
    const title = input.title.trim() || input.file.name.replace(/\.[^.]+$/, "") || "Untitled Track";
    const artist = input.artist.trim() || "Local upload";
    const note = input.note.trim();

    if (!isAllowedAudioFile(input.file)) {
      throw new Error("Audio files only (.mp3, .wav, .flac, .aac, .m4a)");
    }

    if (input.file.size > MUSICAL_DNA_TRACK_MAX_BYTES) {
      throw new Error("Max 50MB for audio uploads");
    }

    if (tracks.length >= MAX_TRACKS) {
      throw new Error(`Musical DNA is capped at ${MAX_TRACKS} tracks. Remove one to add another.`);
    }

    setIsUploading(true);
    setError(null);

    try {
      const dataUrl = await fileToDataUrl(input.file);
      const baseRecord = createUserFileRecord({
        userId: userId ?? "local-musical-dna",
        file: input.file,
        roomOrigin: "unknown",
        previewText: note || undefined,
        dataUrl,
      });
      const trackFile = {
        ...baseRecord,
        name: title,
        previewText: note || undefined,
        tags: Array.from(
          new Set([
            ...baseRecord.tags,
            MUSICAL_DNA_TRACK_TAG,
            `musical-dna-artist:${artist}`,
          ]),
        ),
      };
      const localFile = {
        ...trackFile,
        tags: setTrackSyncState(trackFile.tags, "local_ready"),
      };

      appendUserFile(localFile);
      refreshTracks();

      if (!userId) {
        return buildMusicalDnaTrackRecord(localFile);
      }

      updateUserFile(localFile.id, (file) => ({
        ...file,
        tags: setTrackSyncState(file.tags, "syncing"),
        updatedAt: new Date().toISOString(),
      }));
      refreshTracks();

      try {
        const persisted = await uploadUserFileToServer({
          file: localFile,
          base64DataUrl: dataUrl,
        });
        if (!persisted) {
          throw new Error("Cloud sync did not return a persisted file record.");
        }
        removeUserFile(localFile.id);
        const syncedFile: UserFileRecord = {
          ...persisted,
          name: title,
          previewText: note || undefined,
          tags: setTrackSyncState(
            Array.from(
              new Set([
                ...persisted.tags,
                MUSICAL_DNA_TRACK_TAG,
                `musical-dna-artist:${artist}`,
              ]),
            ),
            "synced",
          ),
        };
        appendUserFile(syncedFile);
        refreshTracks();
        return buildMusicalDnaTrackRecord(syncedFile);
      } catch (uploadError) {
        updateUserFile(localFile.id, (file) => ({
          ...file,
          tags: setTrackSyncState(file.tags, "failed_remote"),
          updatedAt: new Date().toISOString(),
        }));
        setError("Track is saved locally for this browser. Cloud sync failed. Retry sync or export local copy.");
        refreshTracks();
        const failedLocalFile: UserFileRecord =
          readUserFiles().find((file) => file.id === localFile.id) ??
          ({
            ...localFile,
            tags: setTrackSyncState(localFile.tags, "failed_remote"),
          } as UserFileRecord);
        return buildMusicalDnaTrackRecord(failedLocalFile);
      }
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload track.";
      setError(message);
      throw uploadError instanceof Error ? uploadError : new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, [refreshTracks, tracks.length, userId]);

  const remove = useCallback(async (fileId: string): Promise<void> => {
    setIsUploading(true);
    setError(null);

    try {
      const existing = readUserFiles().find((file) => file.id === fileId);
      if (userId && existing && parseTrackSyncState(existing.tags) === "synced") {
        await deleteUserFileFromServer(fileId);
      }
      removeUserFile(fileId);
      refreshTracks();
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : "Failed to remove track.";
      setError(message);
      throw removeError instanceof Error ? removeError : new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, [refreshTracks, userId]);

  return {
    tracks,
    upload,
    retry,
    remove,
    isUploading,
    error,
    accept: MUSICAL_DNA_TRACK_ACCEPT,
  };
}
