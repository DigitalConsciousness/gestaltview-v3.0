# Musical_DNA_Page_Spec
## Write the full replacement MusicalDNAPage.tsx

musical_dna_page = '''// client/src/pages/MusicalDNAPage.tsx
// GestaltView Musical DNA — Multi-User Blank Slate
// Refactored from Keith-specific hardcoded playlist to user-driven architecture
// Preserves all hooks, visualizer, Billy bridge, biofeedback, and CSS entirely unchanged
// © Keith Soyka / GestaltView — All Rights Reserved — GVF-04

import useSEO, { PAGE_SEO } from "hooks/useSEO";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InsightWindow, MUSICAL_DNA_SONGS } from "./InsightWindow";
import { MusicalDNAVisualizer } from "lib/MusicalDNAVisualizer";
import {
  useBinauralBeats,
  BINAURAL_PRESETS,
} from "hooks/useBinauralBeats";
import { useEntrainmentPhase } from "hooks/useEntrainmentPhase";
import { useBiofeedback } from "hooks/useBiofeedback";
import type { BiofeedbackReading } from "hooks/useBiofeedback";
import { MusicalDNAFrequencyPanel } from "components/MusicalDNAFrequencyPanel";
import { FrequencyTherapySection } from "components/FrequencyTherapySection";
import { BillyExhibitChat } from "components/exhibits/BillyExhibitChat";
import {
  useBillyExhibitBridge,
  type BillyExhibitContext,
} from "hooks/useBillyExhibitBridge";
import { GlassCard } from "components/ui/GlassCard";
import "./MusicalDNAPage.css";

// ─── Types ─────────────────────────────────────────────────────────────────
type SomaticMode = "bilateral" | "trilateral" | "quadlateral";

export interface Song {
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
}

// ─── Mode Config ────────────────────────────────────────────────────────────
const MODES: {
  id: SomaticMode;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "bilateral",
    label: "BiLateral",
    icon: "⟷",
    description: "Left↔Right hemisphere integration. EMDR-adjacent processing.",
  },
  {
    id: "trilateral",
    label: "TriLateral",
    icon: "△",
    description: "Three-point upward spiral. Full skull immersion.",
  },
  {
    id: "quadlateral",
    label: "QuadLateral",
    icon: "◈",
    description: "Figure-8 path. Speed, fog, and color sync with the music.",
  },
];

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  emerald: { r: 0.13, g: 0.93, b: 0.55 },
  teal:    { r: 0.05, g: 0.85, b: 0.90 },
  purple:  { r: 0.72, g: 0.10, b: 0.98 },
};

// ─── Billy Context ──────────────────────────────────────────────────────────
const BILLY_CONTEXT: BillyExhibitContext = {
  exhibitId: "musical-dna",
  domain: "general",
  tone: "Grounded, reflective, and neuroaffirming. Preserve PLK language exactly.",
  systemHint:
    "The user has not yet connected music. Welcome them warmly. Explain what Musical DNA does in plain language — it reads the emotional and nervous system patterns encoded in the music they actually listen to. Encourage them to connect Spotify or upload their own tracks to get started. Stay scoped to Musical DNA songs, archetypes, entrainment, biofeedback, and playback-state-aware guidance once music is loaded.",
};

// ─── MusicalDNA Visualizer Hook ─────────────────────────────────────────────
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
    const viz = new MusicalDNAVisualizer(canvas, mode, {
      colorPalette: "aurora",
      showFog: true,
    });
    vizRef.current = viz;
    if (analyserRef.current) viz.connectAnalyser(analyserRef.current);
    if (audioCtxRef.current) viz.setAudioContext(audioCtxRef.current);
    return () => {
      viz.dispose();
      vizRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (analyserRef.current && vizRef.current)
      vizRef.current.connectAnalyser(analyserRef.current);
    if (audioCtxRef.current && vizRef.current)
      vizRef.current.setAudioContext(audioCtxRef.current);
  });

  useEffect(() => {
    if (vizRef.current) vizRef.current.setMode(mode);
  }, [mode]);

  useEffect(() => {
    if (vizRef.current)
      vizRef.current.setEntrainmentStrength(entrainmentStrength);
  }, [entrainmentStrength]);

  return vizRef;
}

// ─── Audio Engine Hook ───────────────────────────────────────────────────────
function useAudioEngine(mode: SomaticMode) {
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const sourceRef    = useRef<AudioBufferSourceNode | null>(null);
  const pannerRef    = useRef<StereoPannerNode | null>(null);
  const gainRef      = useRef<GainNode | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const bassAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [audioLevel, setAudioLevel] = useState(0);
  const [bassLevel,  setBassLevel]  = useState(0);
  const [songElapsed, setSongElapsed] = useState(0);
  const [isPlaying,  setIsPlaying]  = useState(false);

  const getOrCreateCtx = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    return audioCtxRef.current;
  };

  const applyMode = useCallback(
    (panner: StereoPannerNode, m: SomaticMode) => {
      const ctx = getOrCreateCtx();
      const now = ctx.currentTime;
      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      if (m === "bilateral") {
        lfo.type = "sine";       lfo.frequency.value = 0.25; lfoGain.gain.value = 1;
      } else if (m === "trilateral") {
        lfo.type = "triangle";   lfo.frequency.value = 0.4;  lfoGain.gain.value = 1;
      } else {
        lfo.type = "sine";       lfo.frequency.value = 0.15; lfoGain.gain.value = 0.85;
      }
      lfo.connect(lfoGain);
      lfoGain.connect(panner.pan);
      lfo.start(now);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadAndPlay = useCallback(
    async (src: string) => {
      const ctx = getOrCreateCtx();
      if (ctx.state === "suspended") await ctx.resume();
      const response    = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* already stopped */ }
        sourceRef.current.disconnect();
      }

      const source     = ctx.createBufferSource();
      source.buffer    = audioBuffer;
      source.loop      = true;
      const panner     = ctx.createStereoPanner();
      const gain       = ctx.createGain();
      const analyser   = ctx.createAnalyser(); analyser.fftSize = 256;
      const bassAnalyser = ctx.createAnalyser(); bassAnalyser.fftSize = 64;

      source.connect(panner);
      panner.connect(gain);
      gain.connect(analyser);
      gain.connect(bassAnalyser);
      analyser.connect(ctx.destination);
      gain.gain.value = 0.85;

      applyMode(panner, mode);
      source.start(0);
      startTimeRef.current   = ctx.currentTime;
      sourceRef.current      = source;
      pannerRef.current      = panner;
      gainRef.current        = gain;
      analyserRef.current    = analyser;
      bassAnalyserRef.current = bassAnalyser;
      setIsPlaying(true);

      const fullData = new Uint8Array(analyser.frequencyBinCount);
      const bassData = new Uint8Array(bassAnalyser.frequencyBinCount);
      const poll = () => {
        analyser.getByteFrequencyData(fullData);
        bassAnalyser.getByteFrequencyData(bassData);
        const avg     = fullData.reduce((a, b) => a + b, 0) / fullData.length / 255;
        const bassAvg = (bassData[0] + bassData[1] + bassData[2] + bassData[3]) / 4 / 255;
        setAudioLevel(avg);
        setBassLevel(bassAvg);
        setSongElapsed(ctx.currentTime - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(poll);
      };
      poll();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, applyMode]
  );

  const pause = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
    }
    setIsPlaying(false);
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return {
    loadAndPlay, pause, isPlaying,
    audioLevel, bassLevel, songElapsed,
    analyserRef, audioCtxRef, gainRef,
  };
}

// ─── Waveform Bar ────────────────────────────────────────────────────────────
function WaveformBar({ level }: { level: number }) {
  return (
    <div
      className="waveform-bar"
      style={{ height: `${8 + level * 48}px` }}
    />
  );
}

// ─── Song Card ───────────────────────────────────────────────────────────────
function SongCard({
  song,
  isActive,
  isPlaying,
  onSelect,
  onInsight,
}: {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onInsight: () => void;
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
          <div className="song-card-playing">
            <span /><span /><span />
          </div>
        )}
      </div>
      <div className="song-card-info">
        <span className="song-card-archetype">{song.archetype}</span>
        <p className="song-card-title">{song.title}</p>
        <p className="song-card-artist">{song.artist}</p>
        <span className="song-card-cluster">{song.emotionalCluster}</span>
      </div>
      <button
        className="song-card-insight-btn"
        onClick={(e) => { e.stopPropagation(); onInsight(); }}
        aria-label="Open Insight Window"
        title="Why / What / How"
      />
    </motion.div>
  );
}

// ─── Biofeedback Panel ───────────────────────────────────────────────────────
function BiofeedbackPanel({
  biofeedback,
  binaural,
  entrainment,
  isPlaying,
  freqTrackLabel,
}: {
  biofeedback: ReturnType<typeof useBiofeedback>;
  binaural:    ReturnType<typeof useBinauralBeats>;
  entrainment: ReturnType<typeof useEntrainmentPhase>;
  isPlaying:   boolean;
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
  const state  = current?.state ?? "baseline";
  const color  = STATE_COLORS[state] ?? "#22ee8d";

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
        <span style={{ fontSize: "0.6rem", animation: isPlaying ? "pulse 1s infinite" : "none" }}>⬤</span>
        <span>HRV · {STATE_LABELS[state]}</span>
        <span style={{ opacity: 0.6 }}>{open ? "▾" : "▸"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            style={{
              marginTop: "0.5rem",
              background: "rgba(4,14,10,0.92)",
              border: `1px solid ${color}33`,
              borderRadius: "1rem",
              padding: "1rem",
              minWidth: "200px",
              backdropFilter: "blur(16px)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.7rem",
              color: "#c8ffd4",
            }}
          >
            {freqTrackLabel && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: "0.65rem", color: "#0dd9e6", letterSpacing: "0.08em",
                  marginBottom: "0.5rem", paddingBottom: "0.5rem",
                  borderBottom: "1px solid #0dd9e622" }}>
                FREQ THERAPY · {freqTrackLabel}
              </motion.div>
            )}
            {entrainment.onsetReached && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: "0.65rem", color: "#a855f7", letterSpacing: "0.1em",
                  marginBottom: "0.75rem", paddingBottom: "0.75rem",
                  borderBottom: `1px solid ${color}22` }}>
                ENTRAINMENT ACTIVE · {Math.floor(entrainment.elapsedSeconds / 60)}m
              </motion.div>
            )}
            <div style={{ marginBottom: "0.4rem", opacity: 0.7 }}>Binaural Beats</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {(Object.entries(BINAURAL_PRESETS) as [keyof typeof BINAURAL_PRESETS, typeof BINAURAL_PRESETS[keyof typeof BINAURAL_PRESETS]][]).map(([key, preset]) => (
                <button key={key}
                  onClick={() =>
                    binaural.isActive && binaural.currentPreset === key
                      ? binaural.stop()
                      : binaural.start(key)
                  }
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${binaural.isActive && binaural.currentPreset === key ? color : color + "44"}`,
                    background: binaural.isActive && binaural.currentPreset === key ? color + "22" : "transparent",
                    color: binaural.isActive && binaural.currentPreset === key ? color : "#c8ffd4",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                  }}
                >
                  {preset.label ?? key}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Onboarding Panel ────────────────────────────────────────────────────────
function MusicalDNAOnboarding({
  onSpotifyConnect,
  onUpload,
}: {
  onSpotifyConnect: () => void;
  onUpload: () => void;
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
        style={{ maxWidth: "480px", textAlign: "center" }}
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
          Connect your music to begin.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: "0.925rem",
            lineHeight: 1.65,
            marginBottom: "2rem",
          }}
        >
          Musical DNA reads the emotional and nervous system patterns encoded in
          the music you actually listen to. Connect Spotify or upload tracks to
          get started.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onSpotifyConnect}
            style={{
              background: "linear-gradient(135deg, #1DB954 0%, #17a349 100%)",
              border: "none",
              borderRadius: "2rem",
              padding: "0.65rem 1.5rem",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "opacity 0.2s",
            }}
          >
            <span>♫</span> Connect Spotify
          </button>
          <button
            onClick={onUpload}
            style={{
              background: "rgba(0,212,255,0.12)",
              border: "1px solid rgba(0,212,255,0.35)",
              borderRadius: "2rem",
              padding: "0.65rem 1.5rem",
              color: "#BDF7FF",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "opacity 0.2s",
            }}
          >
            <span>↑</span> Upload tracks
          </button>
        </div>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.28)",
            lineHeight: 1.5,
          }}
        >
          Your music stays yours. GestaltView does not store, sell, or share
          your listening data.
        </p>
      </GlassCard>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8 }}
        style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
      >
        No music connected yet · Billy is here when you\'re ready
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MusicalDNAPage() {
  useSEO(PAGE_SEO.musicalDNA);

  // ── User playlist state (blank slate — no hardcoded songs) ──
  const [userPlaylist,  setUserPlaylist]  = useState<Song[]>([]);
  const [activeSong,    setActiveSong]    = useState<Song | null>(null);
  const hasMusic = userPlaylist.length > 0;

  // ── UI state ──
  const [activeMode,    setActiveMode]    = useState<SomaticMode>("bilateral");
  const [insightOpen,   setInsightOpen]   = useState(false);
  const [waveformBars]  = useState(() => Array.from({ length: 28 }, Math.random));
  const [freqTrackIsPlaying, setFreqTrackIsPlaying] = useState(false);
  const [freqTrackLabel,     setFreqTrackLabel]     = useState<string | undefined>();

  // ── Refs ──
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  const handleEQFiltersReady = useCallback((filters: BiquadFilterNode[]) => {
    eqFiltersRef.current = filters;
  }, []);

  // ── Audio engine ──
  const {
    loadAndPlay, pause, isPlaying,
    audioLevel, bassLevel, songElapsed,
    analyserRef, audioCtxRef, gainRef,
  } = useAudioEngine(activeMode);

  // ── Effects ──
  const binaural    = useBinauralBeats(audioCtxRef as React.RefObject<AudioContext | null>);
  const entrainmentIsActive = binaural.isActive || freqTrackIsPlaying;
  const entrainmentPreset   = binaural.currentPreset ?? (freqTrackIsPlaying ? "alpha" : null);
  const entrainment = useEntrainmentPhase(entrainmentIsActive, entrainmentPreset);
  const biofeedback = useBiofeedback();

  useEffect(() => {
    biofeedback.start();
    return () => biofeedback.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vizRef = useMusicalDNAVisualizer(
    canvasRef,
    activeMode,
    analyserRef,
    audioCtxRef as React.RefObject<AudioContext | null>,
    entrainment.strength
  );

  // ── Handlers ──
  const handleSongSelect = (song: Song) => {
    setActiveSong(song);
    if (isPlaying) loadAndPlay(song.audioSrc);
  };

  const handlePlayPause = () => {
    if (!activeSong) return;
    isPlaying ? pause() : loadAndPlay(activeSong.audioSrc);
  };

  const handleFreqTrackPlayStateChange = useCallback(
    (playing: boolean, label: string) => {
      setFreqTrackIsPlaying(playing);
      setFreqTrackLabel(label);
    },
    []
  );

  // ── Spotify / Upload placeholders ──
  const handleSpotifyConnect = () => {
    // TODO: wire to Spotify OAuth → api/actions/musical-dna/analyze.ts
    console.log("[MusicalDNA] Spotify connect initiated");
  };

  const handleUpload = () => {
    // TODO: wire to file input → parse → populate userPlaylist
    console.log("[MusicalDNA] Upload initiated");
  };

  // ── Billy bridge payload ──
  const billyBridgePayload = useMemo(
    () => ({
      page: "MusicalDNAPage",
      activeMode,
      activeSong: activeSong
        ? {
            id:       activeSong.id,
            title:    activeSong.title,
            artist:   activeSong.artist,
            archetype: activeSong.archetype,
            bpm:      activeSong.bpm,
            key:      activeSong.key,
          }
        : null,
      playback: {
        musicIsPlaying: isPlaying,
        songElapsedSeconds: Number(songElapsed.toFixed(2)),
        audioLevel: Number(audioLevel.toFixed(4)),
        bassLevel:  Number(bassLevel.toFixed(4)),
        therapyTrackIsPlaying: freqTrackIsPlaying,
        therapyTrackLabel: freqTrackLabel ?? null,
      },
      effects: {
        eqFilterCount: eqFiltersRef.current.length,
      },
      binaural: {
        frequency: binaural.currentPreset
          ? BINAURAL_PRESETS[binaural.currentPreset].beatFreq
          : null,
        playing: binaural.isActive,
        target: binaural.currentPreset
          ? BINAURAL_PRESETS[binaural.currentPreset].therapeuticUse
          : null,
        preset: binaural.currentPreset,
        volume: Number(binaural.volume.toFixed(3)),
      },
      entrainment: {
        phase:          entrainment.phase,
        strength:       Number(entrainment.strength.toFixed(4)),
        elapsedSeconds: Number(entrainment.elapsedSeconds.toFixed(1)),
        onsetReached:   entrainment.onsetReached,
        peakReached:    entrainment.peakReached,
        preset:         entrainment.preset,
      },
      biofeedback: {
        active:     biofeedback.isActive,
        state:      biofeedback.reading?.state ?? null,
        confidence: biofeedback.reading?.confidence ?? null,
      },
      hasMusic,
    }),
    [
      activeMode, activeSong, isPlaying, songElapsed, audioLevel, bassLevel,
      freqTrackIsPlaying, freqTrackLabel,
      binaural.currentPreset, binaural.isActive, binaural.volume,
      entrainment.phase, entrainment.strength, entrainment.elapsedSeconds,
      entrainment.onsetReached, entrainment.peakReached, entrainment.preset,
      biofeedback.isActive, biofeedback.reading?.state, biofeedback.reading?.confidence,
      hasMusic,
    ]
  );

  const billyBridgePacket = useBillyExhibitBridge({
    context: BILLY_CONTEXT,
    payload: billyBridgePayload,
  });

  const insightSong = activeSong
    ? MUSICAL_DNA_SONGS.find((s) => s.id === activeSong.id)
    : undefined;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="dna-page">
      {/* Billy is always present — both empty and loaded states */}
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
          Your playlist as consciousness diagnostic.
          <br />
          Your nervous system as the instrument being played.
        </p>
      </motion.header>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasMusic ? (
        <MusicalDNAOnboarding
          onSpotifyConnect={handleSpotifyConnect}
          onUpload={handleUpload}
        />
      ) : (
        /* ── Loaded state ─────────────────────────────────────────────── */
        <div className="dna-layout">
          <aside className="dna-playlist">
            <p className="playlist-label">Your Musical DNA</p>
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
                  {MODES.find((m) => m.id === activeMode)?.icon}{" "}
                  {MODES.find((m) => m.id === activeMode)?.label}
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
                <img
                  src={activeSong.albumArt}
                  alt={activeSong.title}
                  className="now-playing-art"
                />
                <div className="now-playing-meta">
                  <span className="now-playing-archetype">
                    {activeSong.archetype}
                  </span>
                  <p className="now-playing-title">{activeSong.title}</p>
                  <p className="now-playing-artist">{activeSong.artist}</p>
                </div>
              </motion.div>
            )}

            <div className="dna-waveform">
              {waveformBars.map((base, i) => (
                <WaveformBar
                  key={i}
                  level={
                    isPlaying ? base + audioLevel * 2 : base * 0.15
                  }
                />
              ))}
            </div>

            <button
              className="dna-play-btn"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!activeSong}
            >
              {isPlaying ? (
                <span className="play-icon">⏸</span>
              ) : (
                <span className="play-icon">▶</span>
              )}
            </button>

            <div className="dna-mode-selector">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`mode-btn${activeMode === m.id ? " active" : ""}`}
                  onClick={() => setActiveMode(m.id)}
                  title={m.description}
                >
                  <span className="mode-btn-icon">{m.icon}</span>
                  <span className="mode-btn-label">{m.label}</span>
                  <span className="mode-btn-desc">{m.description}</span>
                </button>
              ))}
            </div>

            <button
              className="dna-insight-toggle"
              onClick={() => setInsightOpen((v) => !v)}
              aria-label="Toggle Insight Window"
            >
              {insightOpen ? "Close Insight" : "Why / What / How"}
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

      {/* ── Panels render only when music is loaded ───────────────────── */}
      {hasMusic && (
        <>
          <BiofeedbackPanel
            biofeedback={biofeedback}
            binaural={binaural}
            entrainment={entrainment}
            isPlaying={isPlaying}
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
'''

# Spotify Integration From Museum of Impossible Things To Refactor For Current Build

## This was originally made for a demo but now needs to be integrated into the full working MusicalDNA module 

### backend/routes/spotify_routes.py
import httpx
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from urllib.parse import urlencode
import logging # Import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# These are loaded from your .env file
VITE_SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
VITE_SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
VITE_SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

class TokenRequest(BaseModel):
    code: str

@router.post("/token")
async def get_spotify_token(request_body: TokenRequest):
    logger.info("Received request for Spotify token exchange.")
    
    if not all([SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET, VITE_SPOTIFY_REDIRECT_URI]):
        logger.error("Spotify credentials (ID, Secret, Redirect URI) are not configured on the server.")
        raise HTTPException(
            status_code=500, 
            detail="Server-side Spotify configuration is incomplete."
        )

    # Log the exact data being sent to Spotify for debugging
    payload = {
        'grant_type': 'authorization_code',
        'code': request_body.code,
        'redirect_uri': SPOTIFY_REDIRECT_URI,
        'client_id': SPOTIFY_CLIENT_ID,
        'client_secret': SPOTIFY_CLIENT_SECRET
    }
    logger.info(f"Sending token request to Spotify with redirect_uri: {SPOTIFY_REDIRECT_URI}")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                'https://accounts.spotify.com/api/token',
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                data=urlencode(payload)
            )
            response.raise_for_status()
            logger.info("Successfully exchanged code for Spotify token.")
            return response.json()
            
        except httpx.HTTPStatusError as e:
            # This will log the specific error message from Spotify
            error_details = e.response.json()
            logger.error(f"Spotify API Error: {error_details}")
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"Error from Spotify: {error_details.get('error', 'Unknown Error')}: {error_details.get('error_description', 'Authentication failed.')}"
            )
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")
            raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")
            import React from 'react';
import type { SpotifyTrack } from '../types';
import { motion } from 'framer-motion';

interface SpotifyPlaylistConnectorProps {
    onPlaylistConnected: (tracks: SpotifyTrack[]) => void;
}

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const SpotifyPlaylistConnector: React.FC<SpotifyPlaylistConnectorProps> = ({ onPlaylistConnected }) => {
    const [playlistUrl, setPlaylistUrl] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleConnectPlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playlistUrl) return;

        const playlistIdMatch = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
        if (!playlistIdMatch || !playlistIdMatch[1]) {
            setError('Invalid Spotify playlist URL. Please paste the full URL.');
            return;
        }
        const playlistId = playlistIdMatch[1];

        setIsLoading(true);
        setError(null);
        try {
            const { fetchSpotifyPlaylist } = await import('../services/musicalDNAService');
            const playlist = await fetchSpotifyPlaylist(playlistId);
            onPlaylistConnected(playlist.tracks);
        } catch (err) {
            console.error('Failed to connect playlist:', err);
            setError('Could not fetch playlist. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            className="consciousness-card p-6 rounded-xl max-w-lg mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <h3 className="text-lg font-bold mb-4 text-center text-aurora-primary">Connect Your Musical DNA</h3>
            <form onSubmit={handleConnectPlaylist} className="space-y-4">
                <input
                    type="url"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="Paste your Spotify playlist URL here..."
                    className="w-full p-3 bg-aurora-bg/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow duration-300 text-aurora-primary"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!playlistUrl || isLoading}
                    className="w-full py-3 btn-gradient-purple text-white rounded-lg hover:brightness-110 disabled:opacity-50 transition-colors flex items-center justify-center font-semibold"
                >
                    {isLoading ? <Spinner /> : 'Analyze Playlist'}
                </button>
                {error && <p className="text-amber-400 text-sm text-center">{error}</p>}
            </form>
        </motion.div>
    );
};

export default SpotifyPlaylistConnector;

### //components/musical-dna/SpotifyIntegration.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Users, Zap, Heart, Brain, Palette, Loader2 } from 'lucide-react';
import MusicalDNAProcessor, { MusicalDNAProfile } from '@/lib/musical-dna-processor';

interface SpotifyIntegrationProps {
  onAnalysisComplete?: (profile: MusicalDNAProfile) => void;
}

const SpotifyIntegration: React.FC<SpotifyIntegrationProps> = ({ onAnalysisComplete }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Spotify OAuth Connection
  const handleSpotifyConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
      if (!clientId) {
        throw new Error('Spotify client ID not configured');
      }

      const redirectUri = `${window.location.origin}/exhibits/musical-dna/callback`;
      const scopes = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'playlist-read-private',
        'user-library-read'
      ].join(' ');

      const authUrl = `https://accounts.spotify.com/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${Math.random().toString(36).substring(7)}`;

      window.location.href = authUrl;

    } catch (err) {
      console.error('Spotify connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Spotify');
      setIsConnecting(false);
    }
  }, []);

  // Analyze Musical DNA
  const handleAnalyzeMusic = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Create demo profile for now (until Spotify backend is ready)
      const demoProfile = createDemoMusicalDNAProfile();
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onAnalysisComplete?.(demoProfile);
      setIsAuthenticated(true);

    } catch (err) {
      console.error('Musical DNA analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  // Create demo profile
  const createDemoMusicalDNAProfile = (): MusicalDNAProfile => {
    return {
      plkResonance: 94,
      personalityTraits: {
        openness: 88,
        conscientiousness: 75,
        extraversion: 67,
        agreeableness: 82,
        neuroticism: 32
      },
      cognitivePatterns: {
        creativity: 0.91,
        analyticalThinking: 0.78,
        emotionalIntelligence: 0.85,
        patternRecognition: 0.83
      },
      musicalSignatures: {
        dominantGenres: ['Alternative Rock', 'Indie Electronic', 'Post-Rock', 'Ambient', 'Neo-Soul'],
        temporalPreferences: ['Evening Unwind', 'Focus Sessions'],
        energyPatterns: ['Balanced Energy', 'Creative Spurts'],
        moodIndicators: ['Contemplative', 'Uplifting', 'Energizing']
      },
      listeningBehavior: {
        diversityIndex: 0.78,
        explorationRate: 0.65,
        consistencyScore: 0.72,
        temporalPatterns: ['Regular Sessions', 'Deep Listening']
      },
      consciousnessMetrics: {
        authenticityScore: 0.89,
        growthOrientation: 0.92,
        empathyIndicators: 0.81,
        creativityIndex: 0.87
      },
      timestamp: new Date().toISOString(),
      spotifyProfile: {
        id: 'demo_user',
        displayName: 'Consciousness Explorer',
        followers: 42
      }
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Connection Status */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-300">
            <Music className="h-6 w-6" />
            <span>Spotify Musical DNA Analysis</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Connect your Spotify account to analyze your musical consciousness patterns
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex w-full flex-col items-center space-y-4">
            <Button
              onClick={handleSpotifyConnect}
              disabled={isConnecting || isAnalyzing}
              size="lg"
              className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Music className="mr-2 h-5 w-5" />
              )}
              Connect to Spotify
            </Button>
            
            <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-500">
                        Or
                    </span>
                </div>
            </div>

            <Button
              onClick={handleAnalyzeMusic}
              disabled={isConnecting || isAnalyzing}
              size="lg"
              variant="secondary"
              className="w-full max-w-sm"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              Analyze with Demo Data
            </Button>

            {error && (
              <p className="mt-4 text-center text-red-400">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyIntegration;
