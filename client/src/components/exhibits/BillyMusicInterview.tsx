// © 2026 Keith Soyka — GestaltView
import { FormEvent, useMemo, useState } from "react";

export interface BillyMusicInterviewSong {
  title: string;
  artist: string;
  context: string;
}

export interface BillyMusicInterviewResult {
  songs: BillyMusicInterviewSong[];
  summary: string;
  plkFragments: string[];
}

interface BillyMusicInterviewProps {
  colorHex: string;
  onComplete: (result: BillyMusicInterviewResult) => void;
  onCancel: () => void;
}

interface SongDraft {
  title: string;
  artist: string;
  context: string;
}

const emptySongDraft = (): SongDraft => ({
  title: "",
  artist: "",
  context: "",
});

const parseSongLine = (line: string): BillyMusicInterviewSong | null => {
  const normalized = line.trim().replace(/^[-•*]\s*/, "");
  if (!normalized) return null;

  const separators = [" — ", " – ", " - ", " by "];
  const separator = separators.find((candidate) => normalized.includes(candidate));

  if (!separator) {
    return {
      title: normalized,
      artist: "Unknown artist",
      context: "Captured from Billy's Musical DNA interview.",
    };
  }

  const [first, ...rest] = normalized.split(separator);
  const second = rest.join(separator).trim();

  if (!first.trim() || !second) return null;

  return {
    title: first.trim(),
    artist: second,
    context: "Captured from Billy's Musical DNA interview.",
  };
};

const parseSongsFromFragments = (fragments: string): BillyMusicInterviewSong[] => {
  return fragments
    .split(/\n+/)
    .map(parseSongLine)
    .filter((song): song is BillyMusicInterviewSong => song !== null)
    .slice(0, 6);
};

export default function BillyMusicInterview({
  colorHex,
  onComplete,
  onCancel,
}: BillyMusicInterviewProps) {
  const [summary, setSummary] = useState("");
  const [fragments, setFragments] = useState("");
  const [songDrafts, setSongDrafts] = useState<SongDraft[]>([emptySongDraft()]);

  const parsedSongs = useMemo(() => parseSongsFromFragments(fragments), [fragments]);

  const updateSongDraft = (index: number, field: keyof SongDraft, value: string): void => {
    setSongDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft
      )
    );
  };

  const addSongDraft = (): void => {
    setSongDrafts((current) => (current.length >= 6 ? current : [...current, emptySongDraft()]));
  };

  const removeSongDraft = (index: number): void => {
    setSongDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const explicitSongs = songDrafts
      .map((draft) => ({
        title: draft.title.trim(),
        artist: draft.artist.trim() || "Unknown artist",
        context: draft.context.trim() || summary.trim() || "Captured from Billy's Musical DNA interview.",
      }))
      .filter((song) => song.title.length > 0)
      .slice(0, 6);

    onComplete({
      songs: explicitSongs.length > 0 ? explicitSongs : parsedSongs,
      summary: summary.trim() || "Musical DNA interview capture",
      plkFragments: fragments
        .split(/\n+/)
        .map((fragment) => fragment.trim())
        .filter((fragment) => fragment.length > 0),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-3xl border p-5 shadow-2xl sm:p-6"
      style={{
        borderColor: `${colorHex}70`,
        background: "linear-gradient(180deg, rgba(10,14,24,0.98) 0%, rgba(5,8,14,0.96) 100%)",
        boxShadow: `0 0 42px ${colorHex}24`,
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: colorHex }}>
            Billy Music Interview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Name the songs that shaped the thread.</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Capture exact titles, artists, and any body-memory context. Billy will turn the first six tracks into Musical DNA entries.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/70 transition hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">Interview summary</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-white/30"
            placeholder="What theme did Billy catch? Grief, courage, focus, devotion, repair…"
          />
        </label>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">Specific tracks</span>
            <button
              type="button"
              onClick={addSongDraft}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: `${colorHex}66`, color: colorHex }}
              disabled={songDrafts.length >= 6}
            >
              Add track
            </button>
          </div>

          {songDrafts.map((draft, index) => (
            <div key={index} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={draft.title}
                  onChange={(event) => updateSongDraft(index, "title", event.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-white/30"
                  placeholder="Song title"
                />
                <input
                  value={draft.artist}
                  onChange={(event) => updateSongDraft(index, "artist", event.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-white/30"
                  placeholder="Artist"
                />
              </div>
              <input
                value={draft.context}
                onChange={(event) => updateSongDraft(index, "context", event.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-white/30"
                placeholder="Why this one matters / where it lands in the body"
              />
              {songDrafts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSongDraft(index)}
                  className="justify-self-start text-xs text-white/45 transition hover:text-white/75"
                >
                  Remove track
                </button>
              )}
            </div>
          ))}
        </div>

        <label className="grid gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">PLK fragments / quick capture</span>
          <textarea
            value={fragments}
            onChange={(event) => setFragments(event.target.value)}
            rows={4}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-white/30"
            placeholder={"Optional exact lines, one per row. Example:\nBoth Sides Now - Joni Mitchell\nHeroes by David Bowie"}
          />
          {parsedSongs.length > 0 && (
            <span className="text-xs text-white/45">Quick capture found {parsedSongs.length} possible track{parsedSongs.length === 1 ? "" : "s"}.</span>
          )}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full px-5 py-2 text-sm font-semibold text-black transition hover:scale-[1.01]"
          style={{ background: colorHex }}
        >
          Weave interview
        </button>
      </div>
    </form>
  );
}
