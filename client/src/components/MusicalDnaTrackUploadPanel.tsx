import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import {
  buildMusicalDnaTrackSong,
  MUSICAL_DNA_TRACK_ACCEPT,
  type UploadSyncState,
  type MusicalDnaTrackDraft,
  type MusicalDnaTrackRecord,
} from "@/lib/musicalDnaTracks";

type MusicalDnaTrackUploadPanelProps = {
  compact?: boolean;
  tracks: MusicalDnaTrackRecord[];
  upload: (input: MusicalDnaTrackDraft & { file: File }) => Promise<MusicalDnaTrackRecord>;
  retry?: (fileId: string) => Promise<MusicalDnaTrackRecord | null>;
  remove: (fileId: string) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  onTrackActivate?: (track: ReturnType<typeof buildMusicalDnaTrackSong>) => void;
};

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function isUploadableAudioFile(file: File): boolean {
  return file.type.startsWith("audio/") || [".mp3", ".wav", ".flac", ".aac", ".m4a"].some((extension) => file.name.toLowerCase().endsWith(extension));
}

function syncStateLabel(syncState: UploadSyncState): string {
  switch (syncState) {
    case "local_ready":
      return "Local only";
    case "syncing":
      return "Syncing";
    case "failed_remote":
      return "Cloud failed";
    case "rejected":
      return "Rejected";
    case "selected":
      return "Selected";
    default:
      return "Synced";
  }
}

export default function MusicalDnaTrackUploadPanel({
  compact = false,
  tracks,
  upload,
  retry,
  remove,
  isUploading,
  error,
  onTrackActivate,
}: MusicalDnaTrackUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<MusicalDnaTrackDraft>({
    title: "",
    artist: "",
    note: "",
  });
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    setDraft((current) => ({
      ...current,
      title: current.title.trim() || stripExtension(selectedFile.name),
    }));
  }, [selectedFile]);

  const accept = MUSICAL_DNA_TRACK_ACCEPT;

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!isUploadableAudioFile(file)) {
      setPanelError("Audio files only (.mp3, .wav, .flac, .aac, .m4a)");
      return;
    }

    setPanelError(null);
    setSelectedFile(file);
    setDraft({
      title: stripExtension(file.name) || "Untitled Track",
      artist: "",
      note: "",
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = Array.from(event.dataTransfer.files).find(isUploadableAudioFile) ?? null;
    handleFileSelection(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setPanelError("Choose an audio file first.");
      return;
    }

    try {
      const persisted = await upload({
        file: selectedFile,
        title: draft.title,
        artist: draft.artist,
        note: draft.note,
      });
      onTrackActivate?.(buildMusicalDnaTrackSong(persisted));
      setSelectedFile(null);
      setDraft({ title: "", artist: "", note: "" });
      setPanelError(null);
    } catch (uploadError) {
      setPanelError(uploadError instanceof Error ? uploadError.message : "Failed to upload track.");
    }
  };

  const combinedError = panelError ?? error;

  return (
    <section className={`dna-track-upload${compact ? " compact" : ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
      />

      <div className="dna-track-upload-header">
        <div>
          <p className="dna-track-upload-eyebrow">Manual upload</p>
          <h2 className="dna-track-upload-title">Add a local track</h2>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="dna-track-upload-button secondary"
        >
          Choose file
        </button>
      </div>

      <button
        type="button"
        className={`dna-track-dropzone${isDragActive ? " active" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <span className="dna-track-dropzone-icon">↑</span>
        <span className="dna-track-dropzone-title">
          Drop an audio file here or tap to browse
        </span>
        <span className="dna-track-dropzone-note">
          Accepts .mp3, .wav, .flac, .aac, and .m4a files up to 50MB.
        </span>
      </button>

      {selectedFile ? (
        <div className="dna-track-form">
          <div className="dna-track-selected-file">
            <span className="dna-track-selected-pill">Selected</span>
            <div>
              <p className="dna-track-selected-name">{selectedFile.name}</p>
              <p className="dna-track-selected-meta">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>

          <div className="dna-track-fields">
            <label className="dna-track-field">
              <span>Track title</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Track title"
                className="dna-track-input"
              />
            </label>

            <label className="dna-track-field">
              <span>Artist</span>
              <input
                type="text"
                value={draft.artist}
                onChange={(event) => setDraft((current) => ({ ...current, artist: event.target.value }))}
                placeholder="Optional artist"
                className="dna-track-input"
              />
            </label>

            <label className="dna-track-field full">
              <span>Why this track?</span>
              <textarea
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="What this song does to your system"
                className="dna-track-textarea"
                rows={compact ? 3 : 4}
              />
            </label>
          </div>

          <button
            type="button"
            className="dna-track-upload-button primary"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Adding..." : "Add to My Musical DNA"}
          </button>
        </div>
      ) : (
        <p className="dna-track-upload-hint">
          Pick one track to preload its title, artist, and note. If cloud sync fails, the local track stays visible here.
        </p>
      )}

      {selectedFile ? (
        <p className="dna-track-upload-hint">
          The track lands locally first, then syncs to the server when available.
        </p>
      ) : null}

      <div className="dna-track-list-wrap">
        <div className="dna-track-list-header">
          <span>Uploaded tracks</span>
          <span>{tracks.length}</span>
        </div>

        <div className="dna-track-list">
          {tracks.length === 0 ? (
            <div className="dna-track-empty">
              No local uploads yet. Add one track and it will appear here.
            </div>
          ) : (
            tracks.map((track) => {
              const song = buildMusicalDnaTrackSong(track);
              return (
                <article key={track.file.id} className="dna-track-item">
                  <img
                    src={song.albumArt}
                    alt={track.title}
                    className="dna-track-art"
                  />
                  <div className="dna-track-meta">
                    <p className="dna-track-title">{track.title}</p>
                    <p className="dna-track-artist">{track.artist}</p>
                    <p className="dna-track-artist">Sync state: {syncStateLabel(track.syncState)}</p>
                    {track.note && <p className="dna-track-note">{track.note}</p>}
                  </div>
                  <div className="dna-track-actions">
                    <button
                      type="button"
                      onClick={() => onTrackActivate?.(song)}
                      className="dna-track-upload-button secondary"
                    >
                      Open
                    </button>
                    {track.syncState === "failed_remote" && retry ? (
                      <button
                        type="button"
                        onClick={() => void retry(track.file.id)}
                        className="dna-track-upload-button secondary"
                      >
                        Retry sync
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void remove(track.file.id)}
                      className="dna-track-remove"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {combinedError && (
        <p className="dna-track-upload-error">{combinedError}</p>
      )}
    </section>
  );
}
