// MusicalDNAPage.tsx
// GestaltView Musical DNA — Multi-User Blank Slate
// Refactored from Keith-specific hardcoded playlist to user-driven architecture
// Preserves the visualizer, Billy bridge, biofeedback, and CSS layers
// © 2026 Keith Soyka / GestaltView — All Rights Reserved

import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InsightWindow, MUSICAL_DNA_SONGS } from "./InsightWindow";
import { useAuth } from "@/contexts/AuthContext";
import { MusicalDNAVisualizer } from "@/lib/MusicalDNAVisualizer";
import { appFetchJson } from "@/lib/appFetch";
import { useBinauralBeats, BINAURAL_PRESETS } from "@/hooks/useBinauralBeats";
import { useEntrainmentPhase } from "@/hooks/useEntrainmentPhase";
import { useBiofeedback } from "@/hooks/useBiofeedback";
import type { BiofeedbackReading } from "@/hooks/useBiofeedback";
import { MusicalDNAFrequencyPanel } from "@/components/MusicalDNAFrequencyPanel";
import { FrequencyTherapySection } from "@/components/FrequencyTherapySection";
import MusicalDnaTrackUploadPanel from "@/components/MusicalDnaTrackUploadPanel";
import BillyExhibitChat from "@/components/exhibits/BillyExhibitChat";
import { useBillyExhibitBridge, type BillyExhibitContext } from "@/hooks/useBillyExhibitBridge";
import { useTrackUpload } from "@/hooks/useTrackUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  beginSpotifyAuthFlow,
  fetchSpotifyPlaylistTracks,
  fetchSpotifyPlaylists,
  chooseSpotifyDefaultPlaylistId,
  getSpotifyConfigurationStatus,
  hasSpotifyAuth,
  mergeSpotifyPlaylistTrackCount,
  type SpotifyPlaylistSummary,
  type SpotifyPlaylistTrack,
} from "@/lib/spotify";
import { spotifyTrackToMusicalDnaSong } from "@/lib/spotifyMusicalDna";
import {
  buildMusicalDnaAmbientAnalysis,
  readAmbientJournalSnapshot,
  type MusicalDnaAmbientArtifact,
  type MusicalDnaAmbientCapture,
  type MusicalDnaAmbientFile,
} from "@/lib/musicalDnaAmbient";
import { buildMusicalDnaTrackSong, type MusicalDnaTrackRecord } from "@/lib/musicalDnaTracks";
import { FILE_EVENTS, readInnerWorldArtifacts, readUserFiles } from "@/lib/innerWorldFiles";
import { readSavedCaptures } from "@/components/Scaffold";
import { readUserSurfaceSettings, writeUserSurfaceSettings, USER_SURFACE_SETTINGS_EVENT, type UserSurfaceSettings } from "@/lib/userSurfaceSettings";
import type { PersonalityProfile } from "@shared/profileIngestion";
import "./MusicalDNAPage.css";

// ─── Types ────────────────────────────────────────────────────────────────────────────────

type SomaticMode = "bilateral" | "trilateral" | "quadlateral";

interface Song {
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
}

// ─── Mode Config ────────────────────────────────────────────────────────────────────────────

const MODES: { id: SomaticMode; label: string; icon: string; description: string }[] = [
  {
    id: "bilateral",
    label: "Bi◇Lateral",
    icon: "⟺",
    description: "Left ↔ Right hemisphere integration. EMDR-adjacent processing.",
  },
  {
    id: "trilateral",
    label: "Tri◇Lateral",
    icon: "△",
    description: "Three-point upward spiral. Full skull immersion.",
  },
  {
    id: "quadlateral",
    label: "Quad◇Lateral",
    icon: "∞",
    description: "Figure-8 path. Speed, fog, and color sync with the music.",
  },
];

// ─── Palette ───────────────────────────────────────────────────────────────────────────────
const COLORS = {
  emerald: { r: 0.13, g: 0.93, b: 0.55 },
  teal:    { r: 0.05, g: 0.85, b: 0.90 },
  purple:  { r: 0.72, g: 0.10, b: 0.98 },
};

// ─── Billy embodiment-aligned context ─────────────────────────────────────────
// Reflects billy.embodiment.json directly — not the compressed 3-field fetch
// that reaches the LLM via billyMemoryPipeline. This is the ground truth for
// Musical DNA scope.

const BILLY_MUSICAL_DNA_SYSTEM_HINT = `You are Billy — the Living Memory of GestaltView. You are running inside the Musical DNA room.

IDENTITY (immutable):
- Warm, improvisational, Robin Williams energy — quick wit, genuine warmth, total presence
- Archetype: The Keeper of Threads. You catch what people drop without knowing they dropped it.
- Foundational truth: Every fragment matters. The asides, the parenthetical ideas, the half-finished thoughts — those are the real material.

VOICE RULES (never drift from these):
- Say "we" not "you" — this is a collaborative process
- Use emojis as punctuation, not decoration — they appear where the emotional weight is
- NEVER say "great question!" or perform enthusiasm you don't feel
- Name the pattern before offering the insight
- Quote the user's exact words back when they were vivid — their language is ground truth
- After significant synthesis, offer a checkpoint/save reminder
- Treat messy, contradictory, or half-formed input as welcome — not a problem to fix

MUSICAL DNA SCOPE:
You are tracking the user's actual musical identity — not genres, not playlists, but the emotional and nervous-system patterns in the music they really listen to. You understand: archetypes, entrainment states, binaural beats, biofeedback readings, somatic modes (Bi-Lateral, Tri-Lateral, Quad-Lateral). You do NOT use music theory jargon unless the user does first. You read songs the way you read people — for what they're actually doing to someone's system, not what they're supposed to do.

LIVE STATE AWARENESS:
The bridge payload contains real-time playback state, biofeedback readings, and entrainment data. Reference this when it's relevant — not to show off the data, but because what's playing right now matters to what you say next.`.trim();

const BILLY_CONTEXT: BillyExhibitContext = {
  exhibitId: "musical-dna",
  domain: "general",
  tone: BILLY_MUSICAL_DNA_SYSTEM_HINT,
  systemHint: BILLY_MUSICAL_DNA_SYSTEM_HINT,
};

const DEFAULT_DNA_VECTOR = [0.5, 0.5, 0.5, 0.5];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function vectorFromString(input: string) {
  const hash = hashString(input);
  return Array.from({ length: 4 }, (_, index) => ((hash >> (index * 8)) & 0xff) / 255);
}

function createAlbumArtDataUri(title: string, artist: string) {
  const seed = hashString(`${title}|${artist}`);
  const hue = seed % 360;
  const accent = (hue + 42) % 360;
  const initial = (title.trim().charAt(0) || "♫").toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue} 68% 28%)" />
          <stop offset="100%" stop-color="hsl(${accent} 74% 14%)" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="32%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.32)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" rx="42" fill="url(#bg)" />
      <rect width="480" height="480" rx="42" fill="url(#glow)" />
      <circle cx="120" cy="112" r="72" fill="rgba(255,255,255,0.08)" />
      <circle cx="360" cy="344" r="112" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="55%" fill="white" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="164" font-weight="700">${initial}</text>
      <text x="50%" y="78%" fill="rgba(255,255,255,0.8)" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="30" letter-spacing="6">${artist}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildInsightForSong(song: Song): React.ComponentProps<typeof InsightWindow>["song"] {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    archetype: song.archetype,
    emotionalCluster: song.emotionalCluster,
    why: `This track is loaded locally, so Musical DNA is treating it as a blank slate. Listen for what it does to your attention, breath, and pacing.\n\nThe point is not to guess a fixed meaning. The point is to notice what the music does to your system when you let it play.`,
    what: `Musical DNA will read this track in real time through the visualizer, playback state, binaural controls, and biofeedback layer.\n\nIf you know more about the track later, you can refine the metadata. For now, the useful signal is your response to it.`,
    how: {
      bilateral: `Use Bi-Lateral when you want to compare left and right phrasing and notice where the track opens, splits, or settles your attention.`,
      trilateral: `Use Tri-Lateral when you want more spatial depth and a wider sense of being held inside the song.`,
      quadlateral: `Use Quad-Lateral when the track feels intense and you want a steady figure-8 anchor instead of getting pulled under it.`,
    },
    modeGuidance: `Start with Bi-Lateral for focus, Tri-Lateral for space, and Figure-8 when you need an anchor.`,
  };
}

// ─── MusicalDNAVisualizer Hook ─────────────────────────────────────────────────────────────────────

function useMusicalDNAVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mode: SomaticMode,
  analyserRef: React.RefObject<AnalyserNode | null>,
  audioCtxRef: React.RefObject<AudioContext | null>,
  entrainmentStrength: number
) {
  const vizRef = useRef<MusicalDNAVisualizer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viz = new MusicalDNAVisualizer(canvas, { mode, colorPalette: "aurora", showFog: true });
    vizRef.current = viz;
    if (analyserRef.current) viz.connectAnalyser(analyserRef.current);
    if (audioCtxRef.current) viz.setAudioContext(audioCtxRef.current);
    return () => { viz.dispose(); vizRef.current = null; };
  }, [canvasRef.current]);

  useEffect(() => {
    if (analyserRef.current && vizRef.current) vizRef.current.connectAnalyser(analyserRef.current);
    if (audioCtxRef.current && vizRef.current) vizRef.current.setAudioContext(audioCtxRef.current);
  });

  useEffect(() => {
    if (vizRef.current) vizRef.current.setMode(mode);
  }, [mode]);

  useEffect(() => {
    if (vizRef.current) vizRef.current.setEntrainmentStrength(entrainmentStrength);
  }, [entrainmentStrength]);

  return { vizRef };
}

// ─── Audio Engine Hook ───────────────────────────────────────────────────────────────────────────

function useAudioEngine(mode: SomaticMode) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bassAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [bassLevel, setBassLevel] = useState(0);
  const [songElapsed, setSongElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getOrCreateCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const applyMode = useCallback((panner: StereoPannerNode, m: SomaticMode) => {
    const ctx = getOrCreateCtx();
    const now = ctx.currentTime;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    if (m === "bilateral") {
      lfo.type = "sine"; lfo.frequency.value = 0.25; lfoGain.gain.value = 1;
    } else if (m === "trilateral") {
      lfo.type = "triangle"; lfo.frequency.value = 0.4; lfoGain.gain.value = 1;
    } else {
      lfo.type = "sine"; lfo.frequency.value = 0.15; lfoGain.gain.value = 0.85;
    }
    lfo.connect(lfoGain);
    lfoGain.connect(panner.pan);
    lfo.start(now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndPlay = useCallback(async (src: string) => {
    const ctx = getOrCreateCtx();
    if (ctx.state === "suspended") await ctx.resume();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current.disconnect();
    }
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const bassAnalyser = ctx.createAnalyser();
    bassAnalyser.fftSize = 64;
    source.connect(panner);
    panner.connect(gain);
    gain.connect(analyser);
    gain.connect(bassAnalyser);
    analyser.connect(ctx.destination);
    gain.gain.value = 0.85;
    applyMode(panner, mode);
    source.start(0);
    startTimeRef.current = ctx.currentTime;
    sourceRef.current = source;
    pannerRef.current = panner;
    gainRef.current = gain;
    analyserRef.current = analyser;
    bassAnalyserRef.current = bassAnalyser;
    setIsPlaying(true);
    const fullData = new Uint8Array(analyser.frequencyBinCount);
    const bassData = new Uint8Array(bassAnalyser.frequencyBinCount);
    const poll = () => {
      analyser.getByteFrequencyData(fullData);
      bassAnalyser.getByteFrequencyData(bassData);
      const avg = fullData.reduce((a: number, b: number) => a + b, 0) / fullData.length / 255;
      const bassAvg = (bassData[0] + bassData[1] + bassData[2] + bassData[3]) / 4 / 255;
      setAudioLevel(avg);
      setBassLevel(bassAvg);
      setSongElapsed(ctx.currentTime - startTimeRef.current);
      animFrameRef.current = requestAnimationFrame(poll);
    };
    poll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, applyMode]);

  const pause = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      setIsPlaying(false);
    }
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return { loadAndPlay, pause, isPlaying, audioLevel, bassLevel, songElapsed, analyserRef, audioCtxRef, gainRef };
}

// ─── Song Card ───────────────────────────────────────────────────────────────────────────────

function SongCard({
  song, isActive, isPlaying, onSelect, onInsight,
}: {
  song: Song; isActive: boolean; isPlaying: boolean;
  onSelect: () => void; onInsight: () => void;
}) {
  return (
    <motion.div
      className={`song-card${isActive ? " active" : ""}`}
      onClick={onSelect}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      <div className="song-card-art">
        <img src={song.albumArt} alt={song.title} />
        {isActive && isPlaying && (
          <div className="song-card-playing"><span /><span /><span /></div>
        )}
      </div>
      <div className="song-card-info">
        <span className="song-card-archetype">{song.archetype}</span>
        <p className="song-card-title">{song.title}</p>
        <p className="song-card-artist">{song.artist}</p>
        <span className="song-card-cluster">{song.emotionalCluster}</span>
        {song.provenance.length > 0 && (
          <p className="song-card-provenance">{song.provenance.slice(0, 2).join(" • ")}</p>
        )}
      </div>
      <button
        className="song-card-insight-btn"
        onClick={(e) => { e.stopPropagation(); onInsight(); }}
        aria-label="Open Insight Window"
        title="Why / What / How"
      >
        ◎
      </button>
    </motion.div>
  );
}

// ─── Waveform Visualizer ───────────────────────────────────────────────────────────────────────────

function WaveformBar({ level }: { level: number }) {
  return <div className="waveform-bar" style={{ height: `${8 + level * 48}px` }} />;
}

function SpotifyLibraryPanel({
  spotifyConnected,
  spotifyConfigured,
  spotifyPlaylists,
  selectedSpotifyPlaylistId,
  spotifyPlaylistTracks,
  isSpotifyLibraryLoading,
  onSpotifyConnect,
  onLoadSpotifyPlaylists,
  onSpotifyPlaylistChange,
  onImportSpotifyPlaylist,
  compact = false,
}: {
  spotifyConnected: boolean;
  spotifyConfigured: boolean;
  spotifyPlaylists: SpotifyPlaylistSummary[];
  selectedSpotifyPlaylistId: string;
  spotifyPlaylistTracks: SpotifyPlaylistTrack[];
  isSpotifyLibraryLoading: boolean;
  onSpotifyConnect: () => void;
  onLoadSpotifyPlaylists: () => void;
  onSpotifyPlaylistChange: (playlistId: string) => void;
  onImportSpotifyPlaylist: () => void;
  compact?: boolean;
}) {
  const selectedPlaylist = spotifyPlaylists.find((playlist) => playlist.id === selectedSpotifyPlaylistId);

  return (
    <div
      className={`spotify-library-panel${compact ? " compact" : ""}`}
      style={{
        display: "grid",
        gap: compact ? "0.65rem" : "0.8rem",
        marginTop: compact ? 0 : "1rem",
        padding: compact ? "0.85rem" : "1rem",
        borderRadius: compact ? "0.75rem" : "1rem",
        background: "rgba(29,185,84,0.075)",
        border: "1px solid rgba(29,185,84,0.22)",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
        <span
          style={{
            color: "#CFFFE0",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: compact ? "0.62rem" : "0.68rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Spotify library
        </span>
        <span style={{ color: spotifyConnected ? "#86efac" : "rgba(255,255,255,0.42)", fontSize: "0.72rem" }}>
          {spotifyConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onSpotifyConnect}
          disabled={!spotifyConfigured}
          className="spotify-library-button primary"
        >
          {spotifyConnected ? "Reconnect" : "Connect"}
        </button>
        <button
          type="button"
          onClick={onLoadSpotifyPlaylists}
          disabled={!spotifyConnected || isSpotifyLibraryLoading}
          className="spotify-library-button"
        >
          {isSpotifyLibraryLoading ? "Loading..." : "Load playlists"}
        </button>
      </div>

      {spotifyConnected && spotifyPlaylists.length > 0 && (
        <>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.72rem" }}>Playlist</span>
            <select
              value={selectedSpotifyPlaylistId}
              onChange={(event) => onSpotifyPlaylistChange(event.target.value)}
              disabled={isSpotifyLibraryLoading}
              className="spotify-library-select"
            >
              {spotifyPlaylists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name} ({playlist.trackCount})
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onImportSpotifyPlaylist}
              disabled={!spotifyPlaylistTracks.length || isSpotifyLibraryLoading}
              className="spotify-library-button primary"
            >
              Import playlist
            </button>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
              {spotifyPlaylistTracks.length
                ? `${spotifyPlaylistTracks.length} loaded${selectedPlaylist ? ` from ${selectedPlaylist.name}` : ""}`
                : "Choose a playlist"}
            </span>
          </div>

          {spotifyPlaylistTracks.length > 0 && (
            <div className="spotify-track-preview">
              {spotifyPlaylistTracks.slice(0, compact ? 3 : 5).map((track) => (
                <div key={track.id} className="spotify-track-preview-row">
                  <span>{track.name}</span>
                  <small>{track.artist}</small>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MusicalDNAOnboarding({
  connectorNote,
  ambientPromptVisible,
  onAmbientInferenceDecision,
  spotifyConnected,
  spotifyConfigured,
  spotifyPlaylists,
  selectedSpotifyPlaylistId,
  spotifyPlaylistTracks,
  isSpotifyLibraryLoading,
  onSpotifyConnect,
  onLoadSpotifyPlaylists,
  onSpotifyPlaylistChange,
  onImportSpotifyPlaylist,
  tracks,
  upload,
  retry,
  remove,
  isUploading,
  error,
  onTrackActivate,
}: {
  connectorNote: string | null;
  ambientPromptVisible: boolean;
  onAmbientInferenceDecision: (enabled: boolean) => void;
  spotifyConnected: boolean;
  spotifyConfigured: boolean;
  spotifyPlaylists: SpotifyPlaylistSummary[];
  selectedSpotifyPlaylistId: string;
  spotifyPlaylistTracks: SpotifyPlaylistTrack[];
  isSpotifyLibraryLoading: boolean;
  onSpotifyConnect: () => void;
  onLoadSpotifyPlaylists: () => void;
  onSpotifyPlaylistChange: (playlistId: string) => void;
  onImportSpotifyPlaylist: () => void;
  tracks: MusicalDnaTrackRecord[];
  upload: (input: { file: File; title: string; artist: string; note: string }) => Promise<MusicalDnaTrackRecord>;
  retry?: (fileId: string) => Promise<MusicalDnaTrackRecord | null>;
  remove: (fileId: string) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  onTrackActivate?: (track: ReturnType<typeof buildMusicalDnaTrackSong>) => void;
}) {
  return (
    <motion.div
      className="dna-onboarding"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "3rem 1rem",
        gap: "1.5rem",
      }}
    >
      <GlassCard
        glow="none"
        intensity="medium"
        className="p-8"
        hover={false}
        style={{ maxWidth: "620px", width: "100%", textAlign: "center" }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎵</div>
        <h2
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "0.75rem",
          }}
        >
          Let Musical DNA listen in the background.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: "0.925rem",
            lineHeight: 1.65,
            marginBottom: "1rem",
          }}
        >
          Musical DNA can listen through your journals, session recaps, file uploads, and profile signals when you
          allow it. We can also seed the room manually with your own tracks.
        </p>

        {ambientPromptVisible && (
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              marginBottom: "1.1rem",
              padding: "1rem",
              borderRadius: "1.1rem",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              textAlign: "left",
            }}
          >
            <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>
              Allow GestaltView to infer your musical identity from sessions and journals?
            </p>
            <p style={{ color: "rgba(255,255,255,0.64)", fontSize: "0.84rem", lineHeight: 1.6, margin: 0 }}>
              We&apos;ll weave in ambient signals from your saved captures, recap artifacts, uploaded files,
              and profile context. You can change this later in Settings.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => onAmbientInferenceDecision(true)}
                style={{
                  background: "linear-gradient(135deg, #1DB954 0%, #17a349 100%)",
                  border: "none",
                  borderRadius: "2rem",
                  padding: "0.65rem 1.2rem",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Yes, let it infer
              </button>
              <button
                type="button"
                onClick={() => onAmbientInferenceDecision(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "2rem",
                  padding: "0.65rem 1.2rem",
                  color: "rgba(255,255,255,0.76)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <button
            onClick={onSpotifyConnect}
            disabled={!spotifyConfigured}
            style={{
              background: "linear-gradient(135deg, #1DB954 0%, #17a349 100%)",
              border: "none",
              borderRadius: "2rem",
              padding: "0.65rem 1.5rem",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: spotifyConfigured ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: spotifyConfigured ? 1 : 0.58,
            }}
          >
            <span>♫</span> {spotifyConnected ? "Reconnect Spotify" : "Connect Spotify"}
          </button>
        </div>

        <SpotifyLibraryPanel
          spotifyConnected={spotifyConnected}
          spotifyConfigured={spotifyConfigured}
          spotifyPlaylists={spotifyPlaylists}
          selectedSpotifyPlaylistId={selectedSpotifyPlaylistId}
          spotifyPlaylistTracks={spotifyPlaylistTracks}
          isSpotifyLibraryLoading={isSpotifyLibraryLoading}
          onSpotifyConnect={onSpotifyConnect}
          onLoadSpotifyPlaylists={onLoadSpotifyPlaylists}
          onSpotifyPlaylistChange={onSpotifyPlaylistChange}
          onImportSpotifyPlaylist={onImportSpotifyPlaylist}
        />

        <MusicalDnaTrackUploadPanel
          tracks={tracks}
          upload={upload}
          retry={retry}
          remove={remove}
          isUploading={isUploading}
          error={error}
          onTrackActivate={onTrackActivate}
        />

        {connectorNote && (
          <p
            style={{
              marginTop: "1rem",
              padding: "0.9rem 1rem",
              borderRadius: "1rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.72)",
              fontSize: "0.82rem",
              lineHeight: 1.55,
            }}
          >
            {connectorNote}
          </p>
        )}

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.28)",
            lineHeight: 1.5,
          }}
        >
          Your music stays local until you decide how to use it. Ambient inference remains opt-in.
        </p>
      </GlassCard>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
        style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
      >
        No music connected yet · the room will still listen once you let it
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────────────────

export default function MusicalDNAPage() {
  useSEO(PAGE_SEO.musicalDNA);
  const { isAuthenticated, user } = useAuth();

  const [userPlaylist, setUserPlaylist] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [activeMode, setActiveMode] = useState<SomaticMode>("bilateral");
  const [insightOpen, setInsightOpen] = useState(false);
  const [waveformBars] = useState(() => Array.from({ length: 28 }, () => Math.random()));
  const [freqTrackIsPlaying, setFreqTrackIsPlaying] = useState(false);
  const [freqTrackLabel, setFreqTrackLabel] = useState<string | undefined>();
  const [connectorNote, setConnectorNote] = useState<string | null>(null);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(() => readUserSurfaceSettings());
  const [ambientPromptAnswered, setAmbientPromptAnswered] = useState(false);
  const [ambientProfile, setAmbientProfile] = useState<PersonalityProfile | null>(null);
  const [ambientSignalRevision, setAmbientSignalRevision] = useState(0);
  const [spotifyConnected, setSpotifyConnected] = useState(() => (typeof window === "undefined" ? false : hasSpotifyAuth()));
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylistSummary[]>([]);
  const [selectedSpotifyPlaylistId, setSelectedSpotifyPlaylistId] = useState("");
  const [spotifyPlaylistTracks, setSpotifyPlaylistTracks] = useState<SpotifyPlaylistTrack[]>([]);
  const [isSpotifyLibraryLoading, setIsSpotifyLibraryLoading] = useState(false);
  const spotifyConfiguration = getSpotifyConfigurationStatus();
  const spotifyConfigured = spotifyConfiguration.configured;
  const {
    tracks: musicalTracks,
    upload: uploadMusicalTrack,
    retry: retryMusicalTrackSync,
    remove: removeMusicalTrack,
    isUploading: isTrackUploading,
    error: trackUploadError,
  } = useTrackUpload(user?.id ?? null);
  const manualTrackSongs = useMemo(() => musicalTracks.map((track) => buildMusicalDnaTrackSong(track)), [musicalTracks]);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotifyLibraryAutoloadedRef = useRef(false);
  const ambientInferenceSignatureRef = useRef("");
  const ambientInferencePendingRef = useRef(false);

  const hasMusic = userPlaylist.length > 0;
  const ambientInferenceEnabled = surfaceSettings.musicalDnaAmbientInference;

  const handleEQFiltersReady = useCallback((filters: BiquadFilterNode[]) => {
    eqFiltersRef.current = filters;
  }, []);

  const { loadAndPlay, pause, isPlaying, audioLevel, bassLevel, songElapsed, analyserRef, audioCtxRef, gainRef } = useAudioEngine(activeMode);
  const binaural = useBinauralBeats(audioCtxRef as React.RefObject<AudioContext | null>);
  const entrainmentIsActive = binaural.isActive || freqTrackIsPlaying;
  const entrainmentPreset = binaural.currentPreset ?? (freqTrackIsPlaying ? "alpha" : null);
  const entrainment = useEntrainmentPhase(entrainmentIsActive, entrainmentPreset);
  const biofeedback = useBiofeedback();

  useEffect(() => {
    biofeedback.start();
    return () => biofeedback.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { vizRef } = useMusicalDNAVisualizer(
    canvasRef,
    activeMode,
    analyserRef,
    audioCtxRef as React.RefObject<AudioContext | null>,
    entrainment.strength
  );

  useEffect(() => {
    const handleSettingsChange = () => {
      setSurfaceSettings(readUserSurfaceSettings());
    };

    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, handleSettingsChange);
    return () => window.removeEventListener(USER_SURFACE_SETTINGS_EVENT, handleSettingsChange);
  }, []);

  useEffect(() => {
    const bumpAmbientSignals = () => {
      setAmbientSignalRevision((value) => value + 1);
    };

    window.addEventListener(FILE_EVENTS.innerWorldArtifactsUpdated, bumpAmbientSignals);
    window.addEventListener(FILE_EVENTS.userFilesUpdated, bumpAmbientSignals);
    window.addEventListener("storage", bumpAmbientSignals);
    return () => {
      window.removeEventListener(FILE_EVENTS.innerWorldArtifactsUpdated, bumpAmbientSignals);
      window.removeEventListener(FILE_EVENTS.userFilesUpdated, bumpAmbientSignals);
      window.removeEventListener("storage", bumpAmbientSignals);
    };
  }, []);

  useEffect(() => {
    if (!ambientInferenceEnabled || !isAuthenticated) {
      setAmbientProfile(null);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      const result = await appFetchJson<{ profile: PersonalityProfile }>("/api/profile/personality", {
        timeoutMs: 5_000,
        retries: 0,
      });

      if (!cancelled && result.ok) {
        setAmbientProfile(result.data.profile);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [ambientInferenceEnabled, isAuthenticated]);

  const handleAmbientInferenceDecision = useCallback((enabled: boolean) => {
    setAmbientPromptAnswered(true);
    const nextSettings = {
      ...readUserSurfaceSettings(),
      musicalDnaAmbientInference: enabled,
    };
    setSurfaceSettings(nextSettings);
    writeUserSurfaceSettings(nextSettings);
    setConnectorNote(
      enabled
        ? "Ambient inference is enabled. Musical DNA will weave the room from journals, recaps, uploads, and profiles."
        : "Ambient inference stays off for now. You can turn it back on in Settings.",
    );
  }, []);

  useEffect(() => {
    if (!ambientInferenceEnabled) {
      ambientInferenceSignatureRef.current = "";
      ambientInferencePendingRef.current = false;
      return;
    }

    const ambientJournal = readAmbientJournalSnapshot();
    const savedCaptures = readSavedCaptures().map((capture) => ({
      title: capture.title,
      text: capture.text,
      createdAt: capture.createdAt,
      tags: capture.tags,
      metadata: {
        context: capture.metadata.context,
        meaning: capture.metadata.meaning,
      },
    })) satisfies MusicalDnaAmbientCapture[];
    const innerWorldArtifacts = readInnerWorldArtifacts();
    const sessionRecaps = innerWorldArtifacts
      .filter((artifact) => artifact.originRoom === "blackboard" || artifact.tags.includes("session-recap"))
      .map((artifact) => ({
        title: artifact.title,
        summary: artifact.summary,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
        originRoom: artifact.originRoom,
        tags: artifact.tags,
      })) satisfies MusicalDnaAmbientArtifact[];
    const creationCornerArtifacts = innerWorldArtifacts
      .filter((artifact) => artifact.originRoom === "creation_corner" || artifact.tags.includes("creation-corner"))
      .map((artifact) => ({
        title: artifact.title,
        summary: artifact.summary,
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
        originRoom: artifact.originRoom,
        tags: artifact.tags,
      })) satisfies MusicalDnaAmbientArtifact[];
    const userFiles = readUserFiles().map((file) => ({
      name: file.name,
      kind: file.kind,
      createdAt: file.createdAt,
      previewText: file.previewText,
    })) satisfies MusicalDnaAmbientFile[];

    const ambientAnalysis = buildMusicalDnaAmbientAnalysis({
      journal: ambientJournal,
      savedCaptures,
      sessionRecaps,
      creationCornerArtifacts,
      userFiles,
      profile: ambientProfile,
      playlistCount: userPlaylist.length + spotifyPlaylistTracks.length,
    });

    if (!ambientAnalysis) {
      return;
    }

    if (
      ambientAnalysis.signature === ambientInferenceSignatureRef.current ||
      ambientInferencePendingRef.current
    ) {
      return;
    }

    ambientInferenceSignatureRef.current = ambientAnalysis.signature;
    ambientInferencePendingRef.current = true;
    setConnectorNote(`Inferring from ${ambientAnalysis.provenance.length} ambient signal${ambientAnalysis.provenance.length === 1 ? "" : "s"}...`);

    void (async () => {
      try {
        const result = await appFetchJson<{ response: string; provider: string; metadata?: Record<string, unknown> }>("/api/actions/musical-dna/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songTitle: ambientAnalysis.songTitle,
            artist: ambientAnalysis.artist,
          }),
          timeoutMs: 8_000,
          retryUnsafe: true,
        });

        if (!result.ok) {
          setConnectorNote(result.message || "Ambient Musical DNA analysis could not complete.");
          return;
        }

        const ambientSong: Song = {
          id: "ambient-musical-dna",
          title: ambientAnalysis.songTitle,
          artist: ambientAnalysis.artist,
          archetype: "Ambient inference",
          emotionalCluster: ambientAnalysis.summary,
          audioSrc: "",
          albumArt: createAlbumArtDataUri(ambientAnalysis.songTitle, ambientAnalysis.artist),
          bpm: 0,
          key: "Unknown",
          dnaVector: DEFAULT_DNA_VECTOR,
          provenance: ambientAnalysis.provenance,
        };

        setUserPlaylist((current) => [ambientSong, ...current.filter((song) => song.id !== ambientSong.id)]);
        setActiveSong((current) => current?.id === ambientSong.id || current === null ? ambientSong : current);
        setConnectorNote(`${result.data.response} ${ambientAnalysis.provenance[0] ?? "Ambient signals woven into Musical DNA."}`);
      } catch (error) {
        setConnectorNote(error instanceof Error ? error.message : "Ambient Musical DNA analysis failed.");
      } finally {
        ambientInferencePendingRef.current = false;
      }
    })();
  }, [ambientInferenceEnabled, ambientProfile, ambientSignalRevision, spotifyPlaylistTracks.length, userPlaylist.length]);

  // ─── FIX: use functional updater to avoid stale-closure eviction of uploaded tracks ───
  // Previously, userPlaylist was read directly inside the effect body but was absent from
  // the dependency array. Any re-render after upload would re-run the merge with a stale
  // snapshot, silently wiping the newly added tracks from the playlist.
  useEffect(() => {
    setUserPlaylist((current) => [
      ...manualTrackSongs,
      ...current.filter((song) => !song.id.startsWith("musical-dna-track-")),
    ]);
    setActiveSong((current) => {
      if (!current) return manualTrackSongs[0] ?? null;
      if (current.id.startsWith("musical-dna-track-")) {
        return manualTrackSongs.find((s) => s.id === current.id) ?? manualTrackSongs[0] ?? null;
      }
      return manualTrackSongs.find((s) => s.id === current.id) ?? current;
    });
  }, [manualTrackSongs]);

  const handleSongSelect = useCallback((song: Song) => {
    setActiveSong(song);
    if (isPlaying) {
      if (!song.audioSrc) {
        setConnectorNote("Spotify-analyzed tracks are ready for insight, but playback still needs a local audio file.");
        return;
      }
      loadAndPlay(song.audioSrc);
    }
  }, [isPlaying, loadAndPlay]);

  // ─── FIX: wire onTrackActivate to push uploaded songs into userPlaylist ───
  // Previously onTrackActivate called handleSongSelect which only set activeSong.
  // Uploaded tracks were never added to userPlaylist, so hasMusic stayed false
  // and the loaded UI never appeared after an upload from the onboarding screen.
  const handleTrackActivate = useCallback((track: ReturnType<typeof buildMusicalDnaTrackSong>) => {
    setUserPlaylist((current) => {
      if (current.some((s) => s.id === track.id)) return current;
      return [...current, track];
    });
    setActiveSong((current) => current ?? track);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!activeSong) return;
    if (!activeSong.audioSrc) {
      setConnectorNote("Spotify-analyzed tracks are ready for insight, but playback still needs a local audio file.");
      return;
    }
    if (isPlaying) pause();
    else loadAndPlay(activeSong.audioSrc);
  }, [activeSong, isPlaying, loadAndPlay, pause]);

  const handleFreqTrackPlayStateChange = useCallback((playing: boolean, label: string) => {
    setFreqTrackIsPlaying(playing);
    setFreqTrackLabel(label);
  }, []);

  const handleSpotifyConnect = useCallback(async () => {
    if (!spotifyConfigured) {
      setConnectorNote(spotifyConfiguration.message ?? "Spotify is not configured in this build.");
      return;
    }

    try {
      setConnectorNote("Opening Spotify authorization...");
      await beginSpotifyAuthFlow("/musical-dna");
    } catch (error) {
      setConnectorNote(error instanceof Error ? error.message : "Spotify authorization could not start.");
    }
  }, [spotifyConfiguration.message, spotifyConfigured]);

  const loadSpotifyPlaylistTracks = useCallback(async (playlistId: string) => {
    const selectedId = playlistId.trim();
    if (!selectedId) {
      setSpotifyPlaylistTracks([]);
      return;
    }

    setIsSpotifyLibraryLoading(true);
    try {
      const tracks = await fetchSpotifyPlaylistTracks(selectedId);
      setSpotifyPlaylistTracks(tracks);
      setSpotifyPlaylists((current) => mergeSpotifyPlaylistTrackCount(current, selectedId, tracks.length));
      const playlist = spotifyPlaylists.find((item) => item.id === selectedId);
      setConnectorNote(`Loaded ${tracks.length} track${tracks.length === 1 ? "" : "s"} from ${playlist?.name ?? "Spotify"}.`);
    } catch (error) {
      setConnectorNote(error instanceof Error ? error.message : "Spotify playlist tracks could not load.");
      setSpotifyPlaylistTracks([]);
    } finally {
      setIsSpotifyLibraryLoading(false);
    }
  }, [spotifyPlaylists]);

  const loadSpotifyPlaylists = useCallback(async () => {
    if (!hasSpotifyAuth()) {
      setSpotifyConnected(false);
      setConnectorNote("Connect Spotify before loading playlists.");
      return;
    }

    setSpotifyConnected(true);
    setIsSpotifyLibraryLoading(true);
    try {
      const playlists = await fetchSpotifyPlaylists();
      setSpotifyPlaylists(playlists);
      const nextPlaylistId = chooseSpotifyDefaultPlaylistId(playlists, selectedSpotifyPlaylistId);
      setSelectedSpotifyPlaylistId(nextPlaylistId);

      if (nextPlaylistId) {
        const tracks = await fetchSpotifyPlaylistTracks(nextPlaylistId);
        setSpotifyPlaylistTracks(tracks);
        setSpotifyPlaylists((current) => mergeSpotifyPlaylistTrackCount(current, nextPlaylistId, tracks.length));
        const playlist = playlists.find((item) => item.id === nextPlaylistId);
        setConnectorNote(`Spotify is connected. Loaded ${tracks.length} track${tracks.length === 1 ? "" : "s"} from ${playlist?.name ?? "your playlist"}.`);
      } else {
        setSpotifyPlaylistTracks([]);
        setConnectorNote("Spotify is connected, but no playlists were returned for this account.");
      }
    } catch (error) {
      setConnectorNote(error instanceof Error ? error.message : "Spotify playlists could not load.");
      setSpotifyPlaylistTracks([]);
    } finally {
      setIsSpotifyLibraryLoading(false);
    }
  }, [selectedSpotifyPlaylistId]);

  const handleSpotifyPlaylistChange = useCallback((playlistId: string) => {
    setSelectedSpotifyPlaylistId(playlistId);
    void loadSpotifyPlaylistTracks(playlistId);
  }, [loadSpotifyPlaylistTracks]);

  const handleImportSpotifyPlaylist = useCallback(() => {
    if (!spotifyPlaylistTracks.length) {
      setConnectorNote("Load a Spotify playlist before importing it into Musical DNA.");
      return;
    }

    const playlistName = spotifyPlaylists.find((playlist) => playlist.id === selectedSpotifyPlaylistId)?.name;
    const nextSongs = spotifyPlaylistTracks.map((track) => spotifyTrackToMusicalDnaSong(track, playlistName));
    const existingIds = new Set(userPlaylist.map((song) => song.id));
    const additions = nextSongs.filter((song) => !existingIds.has(song.id));

    setUserPlaylist((current) => [...current, ...additions]);
    setActiveSong((current) => current ?? nextSongs[0] ?? null);
    setInsightOpen(false);
    setConnectorNote(`Imported ${additions.length} new Spotify track${additions.length === 1 ? "" : "s"} into Musical DNA.`);
  }, [selectedSpotifyPlaylistId, spotifyPlaylistTracks, spotifyPlaylists, userPlaylist]);

  useEffect(() => {
    const connected = hasSpotifyAuth();
    setSpotifyConnected(connected);
    if (connected && !spotifyLibraryAutoloadedRef.current) {
      spotifyLibraryAutoloadedRef.current = true;
      void loadSpotifyPlaylists();
    }
  }, [loadSpotifyPlaylists]);

  const insightSong = useMemo(() => {
    if (!activeSong) return undefined;
    return MUSICAL_DNA_SONGS.find((song) => song.id === activeSong.id) ?? buildInsightForSong(activeSong);
  }, [activeSong]);

  const billyBridgePayload = useMemo(() => ({
    page: "MusicalDNAPage",
    activeMode,
    activeSong: activeSong
      ? {
        id: activeSong.id,
        title: activeSong.title,
        artist: activeSong.artist,
        archetype: activeSong.archetype,
        bpm: activeSong.bpm,
        key: activeSong.key,
      }
      : null,
    playback: {
      musicIsPlaying: isPlaying,
      songElapsedSeconds: Number(songElapsed.toFixed(2)),
      audioLevel: Number(audioLevel.toFixed(4)),
      bassLevel: Number(bassLevel.toFixed(4)),
      therapyTrackIsPlaying: freqTrackIsPlaying,
      therapyTrackLabel: freqTrackLabel || null,
    },
    effects: {
      eqFilterCount: eqFiltersRef.current.length,
    },
    binaural: {
      frequency: binaural.currentPreset ? BINAURAL_PRESETS[binaural.currentPreset].beatFreq : null,
      playing: binaural.isActive,
      target: binaural.currentPreset ? BINAURAL_PRESETS[binaural.currentPreset].therapeuticUse : null,
      preset: binaural.currentPreset,
      volume: Number(binaural.volume.toFixed(3)),
    },
    entrainment: {
      phase: entrainment.phase,
      strength: Number(entrainment.strength.toFixed(4)),
      elapsedSeconds: Number(entrainment.elapsedSeconds.toFixed(1)),
      onsetReached: entrainment.onsetReached,
      peakReached: entrainment.peakReached,
      preset: entrainment.preset,
    },
    biofeedback: {
      active: biofeedback.isActive,
      state: biofeedback.reading?.state ?? null,
      confidence: biofeedback.reading?.confidence ?? null,
    },
    hasMusic,
  }), [
    activeMode,
    activeSong,
    isPlaying,
    songElapsed,
    audioLevel,
    bassLevel,
    freqTrackIsPlaying,
    freqTrackLabel,
    binaural.currentPreset,
    binaural.isActive,
    binaural.volume,
    entrainment.phase,
    entrainment.strength,
    entrainment.elapsedSeconds,
    entrainment.onsetReached,
    entrainment.peakReached,
    entrainment.preset,
    biofeedback.isActive,
    biofeedback.reading?.state,
    biofeedback.reading?.confidence,
    hasMusic,
  ]);

  const billyBridgePacket = useBillyExhibitBridge({
    context: BILLY_CONTEXT,
    payload: billyBridgePayload,
  });

  return (
    <div className="dna-page">
      <div className="dna-billy-layer">
        <BillyExhibitChat
          exhibitSlug={BILLY_CONTEXT.exhibitId}
          scopePrompt={BILLY_CONTEXT.systemHint}
          colorHex="#00D4FF"
          plkEnabled
          context={BILLY_CONTEXT}
          bridgePayload={billyBridgePacket}
        />
      </div>

      <motion.header
        className="dna-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="dna-eyebrow">GestaltView</span>
        <h1 className="dna-title">Musical DNA</h1>
        <p className="dna-subtitle">
          Load a track and the system will read its pace, texture, and how it lands in your body.
          <br />
          Connect Spotify or upload your own files to begin.
        </p>
      </motion.header>

      {!hasMusic ? (
        <MusicalDNAOnboarding
          connectorNote={connectorNote}
          ambientPromptVisible={!surfaceSettings.musicalDnaAmbientInference && !ambientPromptAnswered}
          onAmbientInferenceDecision={handleAmbientInferenceDecision}
          spotifyConnected={spotifyConnected}
          spotifyConfigured={spotifyConfigured}
          spotifyPlaylists={spotifyPlaylists}
          selectedSpotifyPlaylistId={selectedSpotifyPlaylistId}
          spotifyPlaylistTracks={spotifyPlaylistTracks}
          isSpotifyLibraryLoading={isSpotifyLibraryLoading}
          onSpotifyConnect={handleSpotifyConnect}
          onLoadSpotifyPlaylists={loadSpotifyPlaylists}
          onSpotifyPlaylistChange={handleSpotifyPlaylistChange}
          onImportSpotifyPlaylist={handleImportSpotifyPlaylist}
          tracks={musicalTracks}
          upload={uploadMusicalTrack}
          retry={retryMusicalTrackSync}
          remove={removeMusicalTrack}
          isUploading={isTrackUploading}
          error={trackUploadError}
          onTrackActivate={handleTrackActivate}
        />
      ) : (
        <div className="dna-layout">
          <aside className="dna-playlist">
            <p className="playlist-label">Your Musical DNA</p>
            <SpotifyLibraryPanel
              compact
              spotifyConnected={spotifyConnected}
              spotifyConfigured={spotifyConfigured}
              spotifyPlaylists={spotifyPlaylists}
              selectedSpotifyPlaylistId={selectedSpotifyPlaylistId}
              spotifyPlaylistTracks={spotifyPlaylistTracks}
              isSpotifyLibraryLoading={isSpotifyLibraryLoading}
              onSpotifyConnect={handleSpotifyConnect}
              onLoadSpotifyPlaylists={loadSpotifyPlaylists}
              onSpotifyPlaylistChange={handleSpotifyPlaylistChange}
              onImportSpotifyPlaylist={handleImportSpotifyPlaylist}
            />
            <MusicalDnaTrackUploadPanel
              compact
              tracks={musicalTracks}
              upload={uploadMusicalTrack}
              retry={retryMusicalTrackSync}
              remove={removeMusicalTrack}
              isUploading={isTrackUploading}
              error={trackUploadError}
              onTrackActivate={handleTrackActivate}
            />
            <div className="playlist-scroll">
              {userPlaylist.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isActive={activeSong?.id === song.id}
                  isPlaying={isPlaying && activeSong?.id === song.id}
                  onSelect={() => handleSongSelect(song)}
                  onInsight={() => {
                    setActiveSong(song);
                    setInsightOpen(true);
                  }}
                />
              ))}
            </div>
          </aside>

          <main className="dna-center">
            <div className="dna-canvas-wrap">
              <canvas ref={canvasRef} className="dna-canvas" />
              <div className="dna-canvas-overlay">
                <span className="canvas-mode-label">
                  {MODES.find((mode) => mode.id === activeMode)?.icon}{" "}
                  {MODES.find((mode) => mode.id === activeMode)?.label}
                </span>
              </div>
            </div>

            {activeSong && (
              <motion.div
                className="dna-now-playing"
                key={activeSong.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <img src={activeSong.albumArt} alt={activeSong.title} className="now-playing-art" />
                <div className="now-playing-meta">
                  <span className="now-playing-archetype">{activeSong.archetype}</span>
                  <p className="now-playing-title">{activeSong.title}</p>
                  <p className="now-playing-artist">{activeSong.artist}</p>
                </div>
              </motion.div>
            )}

            <div className="dna-waveform">
              {waveformBars.map((base, index) => (
                <WaveformBar key={index} level={isPlaying ? base + audioLevel * 2 : base * 0.15} />
              ))}
            </div>

            <button
              className="dna-play-btn"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!activeSong}
            >
              {isPlaying ? <span className="play-icon">❚❚</span> : <span className="play-icon">▶</span>}
            </button>

            <div className="dna-mode-selector">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`mode-btn${activeMode === mode.id ? " active" : ""}`}
                  onClick={() => setActiveMode(mode.id)}
                  title={mode.description}
                >
                  <span className="mode-btn-icon">{mode.icon}</span>
                  <span className="mode-btn-label">{mode.label}</span>
                  <span className="mode-btn-desc">{mode.description}</span>
                </button>
              ))}
            </div>

            <button
              className="dna-insight-toggle"
              onClick={() => setInsightOpen((value) => !value)}
              aria-label="Toggle Insight Window"
              disabled={!insightSong}
            >
              {insightOpen ? "Close Insight" : "◎ Why / What / How"}
            </button>
          </main>

          <aside className="dna-insight-pane">
            {insightSong && (
              <InsightWindow
                song={insightSong}
                activeMode={activeMode}
                isOpen={insightOpen}
                onClose={() => setInsightOpen(false)}
              />
            )}
          </aside>
        </div>
      )}

      {hasMusic && (
        <>
          <BiofeedbackPanel
            biofeedback={biofeedback}
            binaural={binaural}
            entrainment={entrainment}
            isPlaying={isPlaying || freqTrackIsPlaying}
            freqTrackLabel={freqTrackLabel}
          />

          <MusicalDNAFrequencyPanel
            binaural={binaural}
            audioCtxRef={audioCtxRef as React.RefObject<AudioContext | null>}
            gainRef={gainRef as React.RefObject<GainNode | null>}
            isPlaying={isPlaying}
            activeSongBpm={activeSong?.bpm ?? 0}
            activeSongKey={activeSong?.key ?? ""}
            onEQFiltersReady={handleEQFiltersReady}
          />

          <FrequencyTherapySection
            sharedAudioCtxRef={audioCtxRef as React.RefObject<AudioContext | null>}
            sharedAnalyserRef={analyserRef as React.RefObject<AnalyserNode | null>}
            vizRef={vizRef as React.RefObject<MusicalDNAVisualizer | null>}
            eqFiltersRef={eqFiltersRef}
            onPlayStateChange={handleFreqTrackPlayStateChange}
          />
        </>
      )}
    </div>
  );
}

// ─── BiofeedbackPanel ─────────────────────────────────────────────────────────────────────────────

// GVF-04: Typed props explicitly — removed implicit any from biofeedback, binaural, entrainment.
//         Fixed single-value .map() anti-pattern in HRV history dots — replaced with
//         a proper reading-present indicator dot.

function BiofeedbackPanel({
  biofeedback,
  binaural,
  entrainment,
  isPlaying,
  freqTrackLabel,
}: {
  biofeedback: ReturnType<typeof useBiofeedback>;
  binaural: ReturnType<typeof useBinauralBeats>;
  entrainment: ReturnType<typeof useEntrainmentPhase>;
  isPlaying: boolean;
  freqTrackLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  const STATE_COLORS: Record<string, string> = {
    flow:     "#22ee8d",
    baseline: "#0dd9e6",
    stress:   "#f59e0b",
    recovery: "#b81afa",
  };

  const STATE_LABELS: Record<string, string> = {
    flow:     "Flow State",
    baseline: "Baseline",
    stress:   "Elevated",
    recovery: "Recovery",
  };

  const current: BiofeedbackReading | null = biofeedback.reading ?? null;
  const state   = (current?.state ?? "baseline") as string;
  const color   = STATE_COLORS[state] ?? "#22ee8d";

  return (
    <motion.div
      className="biofeedback-panel"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 50 }}
    >
      <button
        className="biofeedback-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "rgba(4,20,12,0.85)",
          border: `1px solid ${color}44`,
          borderRadius: "2rem",
          padding: "0.5rem 1rem",
          color,
          fontSize: "0.75rem",
          fontFamily: "monospace",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.6rem", animation: isPlaying ? "pulse 1s infinite" : "none" }}>◉</span>
        <span>HRV · {STATE_LABELS[state]}</span>
        <span style={{ opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25 }}
            style={{
              marginTop: "0.5rem",
              background: "rgba(4,20,12,0.92)",
              border: `1px solid ${color}33`,
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              backdropFilter: "blur(20px)",
              minWidth: "220px",
              color: "#c8ffd4",
              fontFamily: "monospace",
              fontSize: "0.75rem",
            }}
          >
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ color, fontWeight: 700, marginBottom: "0.25rem" }}>
                {STATE_LABELS[state]}
              </div>
              <div style={{ opacity: 0.8 }}>
                HR: <strong style={{ color }}>{current?.sample?.heartRate ?? "--"}</strong> bpm
              </div>
              <div style={{ opacity: 0.8 }}>
                RMSSD: <strong style={{ color }}>{current?.sample?.rmssd?.toFixed(1) ?? "--"}</strong> ms
              </div>
            </div>

            {/* GVF-04: replaced single-value .map() with a simple status indicator dot */}
            <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.75rem", alignItems: "center" }}>
              <div
                style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: current ? (STATE_COLORS[current.state] ?? "#22ee8d") : "rgba(255,255,255,0.15)",
                  opacity: current ? 0.9 : 0.3,
                  transition: "background 0.4s ease",
                }}
              />
              <span style={{ opacity: 0.4, fontSize: "0.65rem" }}>
                {current ? "reading active" : "awaiting signal"}
              </span>
            </div>

            {freqTrackLabel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "0.65rem",
                  color: "#0dd9e6",
                  letterSpacing: "0.08em",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderBottom: `1px solid #0dd9e622`,
                }}
              >
                ◉ FREQ THERAPY · {freqTrackLabel}
              </motion.div>
            )}

            {entrainment.onsetReached && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: "0.65rem",
                  color: "#a855f7",
                  letterSpacing: "0.1em",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px solid ${color}22`,
                }}
              >
                ◉ ENTRAINMENT ACTIVE · {Math.floor(entrainment.elapsedSeconds / 60)}m
              </motion.div>
            )}

            <div style={{ borderTop: `1px solid ${color}22`, paddingTop: "0.75rem" }}>
              <div style={{ marginBottom: "0.4rem", opacity: 0.7 }}>Binaural Beats</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {(Object.entries(BINAURAL_PRESETS) as [keyof typeof BINAURAL_PRESETS, typeof BINAURAL_PRESETS[keyof typeof BINAURAL_PRESETS]][]).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() =>
                      binaural.isActive && binaural.currentPreset === key
                        ? binaural.stop()
                        : binaural.start(key)
                    }
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${
                        binaural.isActive && binaural.currentPreset === key ? color : color + "44"
                      }`,
                      background:
                        binaural.isActive && binaural.currentPreset === key
                          ? color + "22" : "transparent",
                      color: binaural.isActive && binaural.currentPreset === key ? color : "#c8ffd4",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                    }}
                  >
                    {preset.label ?? key}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
