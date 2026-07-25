/**
 * FrequencyTherapySection.tsx
 * GestaltView — Musical DNA Engine — Resonant Frequency Therapy
 * © 2026 Keith Soyka / GestaltView — All Rights Reserved
 *
 * v2 — Full Integration Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from v1:
 *   • Accepts sharedAudioCtxRef / sharedAnalyserRef from MusicalDNAPage so that
 *     frequency therapy tracks feed the SAME MusicalDNAVisualizer canvas.
 *   • Accepts vizRef so it can call connectAnalyser() on the visualizer directly.
 *   • Accepts onPlayStateChange callback so MusicalDNAPage can wire the
 *     useEntrainmentPhase hook to frequency-track play state.
 *   • Accepts eqFiltersRef so the 6-band EQ from MusicalDNAFrequencyPanel is
 *     inserted into the signal chain when active.
 *   • All props are optional — component degrades gracefully to standalone mode
 *     when no shared context is provided (backwards-compatible).
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MusicalDNAVisualizer } from "@/lib/MusicalDNAVisualizer";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREQUENCY_TRACKS = [
  { id: "agar", label: "Agar-Agar", duration: "20m", src: "/audio/frequencies/Agar-Agar_20m_session.mp3" },
  { id: "astaxanthin", label: "Astaxanthin", duration: "20m", src: "/audio/frequencies/Astaxanthin_20m_session.mp3" },
  { id: "brain_stim", label: "Brain Stimulation", duration: "32m", src: "/audio/frequencies/Brain_Stimulation_32m_session.mp3" },
  { id: "breathing", label: "Breathing Deep", duration: "15m", src: "/audio/frequencies/Breathing_Deep_15m_session.mp3" },
  { id: "calcium_mag", label: "Calcium + Magnesium", duration: "32m", src: "/audio/frequencies/Calcium_Plus_Magnesium_32m_session.mp3" },
  { id: "calea", label: "Calea Ternifolia", duration: "30m", src: "/audio/frequencies/Calea_Ternifolia_30m_session.mp3" },
  { id: "copper63_zinc", label: "Copper63 + Zinc", duration: "32m", src: "/audio/frequencies/Copper63_Plus_Zinc_32m_session.mp3" },
  { id: "copper65_zinc", label: "Copper65 + Zinc", duration: "32m", src: "/audio/frequencies/Copper65_Plus_Zinc_32m_session.mp3" },
  { id: "dmt_stim", label: "DMT Stimulation", duration: "16m", src: "/audio/frequencies/Dimethyltryptamine_Stimulation_16m_session.mp3" },
  { id: "drug_detox", label: "Drug Detox", duration: "5m", src: "/audio/frequencies/Drug_Detox_5m_session.mp3" },
  { id: "electrolyte", label: "Electrolyte Levels", duration: "15m", src: "/audio/frequencies/Electrolyte_Levels_15m_session.mp3" },
  { id: "emotional_rigidity", label: "Emotional Rigidity", duration: "24m", src: "/audio/frequencies/Emotional_Rigidity_24m_session.mp3" },
  { id: "facial_toning", label: "Facial Toning", duration: "15m", src: "/audio/frequencies/Facial_Toning_15m_session.mp3" },
  { id: "fat_metabolism", label: "Fat Metabolism", duration: "40m", src: "/audio/frequencies/Fat_Metabolism_40m_session.mp3" },
  { id: "happiness", label: "Happiness", duration: "40m", src: "/audio/frequencies/Happiness_40m_session.mp3" },
  { id: "hgh_prod", label: "HGH Production", duration: "32m", src: "/audio/frequencies/Human_Growth_Hormone_Production_32m_session.mp3" },
  { id: "hydroxyl", label: "Hydroxyl Radical", duration: "32m", src: "/audio/frequencies/Hydroxyl_Radical_32m_session.mp3" },
  { id: "intel_enhance", label: "Intelligence Enhancement", duration: "27m", src: "/audio/frequencies/Intelligence_Enhancement_27m_session.mp3" },
  { id: "interleukin", label: "Interleukin Production", duration: "21m", src: "/audio/frequencies/Interleukin_Production_21m_session.mp3" },
  { id: "iron_moly95", label: "Iron + Molybdenum95", duration: "32m", src: "/audio/frequencies/Iron_Plus_Molybdenum95_32m_session.mp3" },
  { id: "iron_moly97", label: "Iron + Molybdenum97", duration: "32m", src: "/audio/frequencies/Iron_Plus_Molybdenum97_32m_session.mp3" },
  { id: "limit_caffeine", label: "Limit Caffeine Craving", duration: "10m", src: "/audio/frequencies/Limit_Caffeine_Craving_10m_session.mp3" },
  { id: "limit_smoking", label: "Limit Smoking Craving", duration: "10m", src: "/audio/frequencies/Limit_Smoking_Craving_10m_session.mp3" },
  { id: "lucid_dreams", label: "Lucid Dreams", duration: "10m", src: "/audio/frequencies/Lucid_Dreams_10m_session.mp3" },
  { id: "manganese_calcium", label: "Manganese + Calcium", duration: "32m", src: "/audio/frequencies/Manganese_Plus_Calcium_32m_session.mp3" },
  { id: "n14_oxygen", label: "Nitrogen14 + Oxygen", duration: "32m", src: "/audio/frequencies/Nitrogen14_Plus_Oxygen_32m_session.mp3" },
  { id: "n15_oxygen", label: "Nitrogen15 + Oxygen", duration: "32m", src: "/audio/frequencies/Nitrogen15_Plus_Oxygen_32m_session.mp3" },
  { id: "hormone_normalize", label: "Normalize Hormone Levels", duration: "32m", src: "/audio/frequencies/Normalize_Hormone_Levels_32m_session.mp3" },
  { id: "vitamin_b5", label: "Vitamin B5", duration: "20m", src: "/audio/frequencies/Pantothenic_Acid-Vitamin_B5_20m_session.mp3" },
  { id: "potassium_bicarb", label: "Potassium Bicarbonate", duration: "40m", src: "/audio/frequencies/Potassium_Bicarbonate_40m_session.mp3" },
  { id: "potassium_iodine", label: "Potassium + Iodine", duration: "32m", src: "/audio/frequencies/Potassium_Plus_Iodine_32m_session.mp3" },
  { id: "regeneration", label: "Regeneration & Healing", duration: "32m", src: "/audio/frequencies/Regeneration_And_Healing_32m_session.mp3" },
  { id: "rubidium_chlorine", label: "Rubidium87 + Chlorine37", duration: "32m", src: "/audio/frequencies/Rubidium87_Plus_Chlorine37_32m_session.mp3" },
  { id: "schumann", label: "Schumann Resonance", duration: "40m", src: "/audio/frequencies/Schumann_Resonance_40m_session.mp3" },
  { id: "skin_enhance", label: "Skin Enhancement", duration: "21m", src: "/audio/frequencies/Skin_Enhancement_21m_session.mp3" },
  { id: "sodium_bicarb", label: "Sodium Bicarbonate", duration: "40m", src: "/audio/frequencies/Sodium_Bicarbonate_40m_session.mp3" },
  { id: "sodium_chloride35", label: "Sodium Chloride35 + Water", duration: "32m", src: "/audio/frequencies/Sodium_Chloride35_Plus_Water_32m_session.mp3" },
  { id: "sodium_chloride37", label: "Sodium Chloride37 + Water", duration: "32m", src: "/audio/frequencies/Sodium_Chloride37_Plus_Water_32m_session.mp3" },
  { id: "sodium_iodine", label: "Sodium + Iodine", duration: "32m", src: "/audio/frequencies/Sodium_Plus_Iodine_32m_session.mp3" },
  { id: "super_hydrated", label: "Super-Hydrated Water", duration: "40m", src: "/audio/frequencies/Super-Hydrated_Water_40m_session.mp3" },
  { id: "tomatis", label: "Tomatis Ear Sensitization", duration: "5m", src: "/audio/frequencies/Tomatis_Ear_Sensitization-1_5m_session.mp3" },
  { id: "vitamag", label: "Vitamag Set", duration: "30m", src: "/audio/frequencies/Vitamag_Set_30m_session.mp3" },
];

const FADE_DURATION_S = 2;
const BAR_COUNT = 32;

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayState = "stopped" | "playing" | "paused";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FrequencyTherapySectionProps {
  /**
   * Shared AudioContext from MusicalDNAPage's useAudioEngine.
   * When provided, the frequency track is routed through the shared context
   * so the MusicalDNAVisualizer can analyse it.
   */
  sharedAudioCtxRef?: React.RefObject<AudioContext | null>;
  /**
   * Shared AnalyserNode ref. When provided, the component writes its own
   * analyser here so the visualizer always has the latest source.
   */
  sharedAnalyserRef?: React.RefObject<AnalyserNode | null>;
  /**
   * Direct ref to the MusicalDNAVisualizer instance.
   * When provided, connectAnalyser() is called on play so the canvas
   * immediately reflects the frequency track.
   */
  vizRef?: React.RefObject<MusicalDNAVisualizer | null>;
  /**
   * EQ filter chain from MusicalDNAFrequencyPanel.
   * When provided, the signal is routed through the EQ before the analyser.
   */
  eqFiltersRef?: React.RefObject<BiquadFilterNode[]>;
  /**
   * Called whenever the play state changes so MusicalDNAPage can wire
   * useEntrainmentPhase to the frequency track session.
   */
  onPlayStateChange?: (isPlaying: boolean, trackLabel: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FrequencyTherapySection({
  sharedAudioCtxRef,
  sharedAnalyserRef,
  vizRef,
  eqFiltersRef,
  onPlayStateChange,
}: FrequencyTherapySectionProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(FREQUENCY_TRACKS[0]);
  const [playState, setPlayState] = useState<PlayState>("stopped");
  const [volume, setVolume] = useState(0.65);
  const [loop, setLoop] = useState(true);
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const gainRef     = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Own AudioContext — only used when no sharedAudioCtxRef is provided
  const ownAudioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef   = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef      = useRef<number>(0);
  const fadeRafRef  = useRef<number>(0);

  // Resolve which AudioContext to use
  const getCtx = useCallback((): AudioContext | null => {
    if (sharedAudioCtxRef?.current) return sharedAudioCtxRef.current;
    return ownAudioCtxRef.current;
  }, [sharedAudioCtxRef]);

  // ── Audio graph setup ────────────────────────────────────────────────────
  // Builds: <audio> → MediaElementSource → [EQ chain] → Gain → Analyser → destination
  // The analyser is also written to sharedAnalyserRef and connected to the visualizer.

  const setupAudioGraph = useCallback(() => {
    // Only set up once per audio element
    if (sourceRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Use shared context if available, otherwise create own
    let ctx = sharedAudioCtxRef?.current ?? null;
    if (!ctx) {
      if (!ownAudioCtxRef.current) {
        ownAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      ctx = ownAudioCtxRef.current;
    }

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;

    const gain = ctx.createGain();
    gain.gain.value = 0; // start silent for fade-in
    gainRef.current = gain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    // Write to shared analyser ref so the visualizer can pick it up
    if (sharedAnalyserRef) {
      (sharedAnalyserRef as React.MutableRefObject<AnalyserNode | null>).current = analyser;
    }

    // Build signal chain: source → [EQ filters if present] → gain → analyser → destination
    const eqFilters = eqFiltersRef?.current ?? [];
    if (eqFilters.length > 0) {
      // Connect source → first EQ filter
      source.connect(eqFilters[0]);
      // EQ chain is already internally connected by MusicalDNAFrequencyPanel
      // Connect last EQ filter → gain
      eqFilters[eqFilters.length - 1].connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(analyser);
    analyser.connect(ctx.destination);

    // Immediately connect to visualizer if available
    if (vizRef?.current) {
      vizRef.current.connectAnalyser(analyser);
      vizRef.current.setAudioContext(ctx);
    }
  }, [sharedAudioCtxRef, sharedAnalyserRef, vizRef, eqFiltersRef]);

  // ── Waveform animation loop ───────────────────────────────────────────────

  const startViz = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
        const idx = Math.floor((i / BAR_COUNT) * data.length);
        return data[idx] / 255;
      });
      setBars(newBars);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopViz = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setBars(Array(BAR_COUNT).fill(0));
  }, []);

  // ── Fade helpers ─────────────────────────────────────────────────────────

  const fadeTo = useCallback((targetGain: number, onComplete?: () => void) => {
    const gain = gainRef.current;
    if (!gain) { onComplete?.(); return; }
    cancelAnimationFrame(fadeRafRef.current);
    const start = performance.now();
    const startGain = gain.gain.value;
    const step = () => {
      const elapsed = (performance.now() - start) / (FADE_DURATION_S * 1000);
      const t = Math.min(elapsed, 1);
      gain.gain.value = lerp(startGain, targetGain, t);
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        gain.gain.value = targetGain;
        onComplete?.();
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  }, []);

  // ── Playback controls ────────────────────────────────────────────────────

  const handlePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setupAudioGraph();

    const ctx = getCtx();
    if (ctx?.state === "suspended") await ctx.resume();

    audio.loop = loop;

    if (playState === "paused") {
      await audio.play();
      fadeTo(volume);
      setPlayState("playing");
      startViz();
      onPlayStateChange?.(true, activeTrack.label);
    } else {
      audio.currentTime = 0;
      await audio.play();
      fadeTo(volume);
      setPlayState("playing");
      startViz();
      onPlayStateChange?.(true, activeTrack.label);
    }

    // Re-connect analyser to visualizer on every play (handles mode switches)
    if (vizRef?.current && analyserRef.current) {
      vizRef.current.connectAnalyser(analyserRef.current);
      if (ctx) vizRef.current.setAudioContext(ctx);
    }
  }, [playState, loop, volume, setupAudioGraph, getCtx, fadeTo, startViz, onPlayStateChange, activeTrack.label, vizRef]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, () => {
      audio.pause();
      setPlayState("paused");
      onPlayStateChange?.(false, activeTrack.label);
    });
    stopViz();
  }, [fadeTo, stopViz, onPlayStateChange, activeTrack.label]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, () => {
      audio.pause();
      audio.currentTime = 0;
      setPlayState("stopped");
      setCurrentTime(0);
      onPlayStateChange?.(false, activeTrack.label);
    });
    stopViz();
  }, [fadeTo, stopViz, onPlayStateChange, activeTrack.label]);

  const handleTrackSelect = useCallback((track: typeof FREQUENCY_TRACKS[0]) => {
    setActiveTrack(track);
    if (playState !== "stopped") {
      handleStop();
    }
    // Reset source so setupAudioGraph re-runs for the new track
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch {}
      sourceRef.current = null;
    }
  }, [playState, handleStop]);

  // ── Volume change ─────────────────────────────────────────────────────────

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    if (gainRef.current && playState === "playing") {
      gainRef.current.gain.value = v;
    }
  }, [playState]);

  // ── Loop toggle ───────────────────────────────────────────────────────────

  const handleLoopToggle = useCallback(() => {
    setLoop((l) => {
      const next = !l;
      if (audioRef.current) audioRef.current.loop = next;
      return next;
    });
  }, []);

  // ── Time tracking ─────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd  = () => { if (!loop) { setPlayState("stopped"); stopViz(); onPlayStateChange?.(false, activeTrack.label); } };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [loop, stopViz, onPlayStateChange, activeTrack.label]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(fadeRafRef.current);
      // Only close own context — never close the shared one
      if (ownAudioCtxRef.current) {
        ownAudioCtxRef.current.close();
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const accentColor = "#10b981"; // emerald — therapeutic/healing aesthetic
  const isIntegrated = !!(sharedAudioCtxRef || vizRef);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <audio ref={audioRef} src={activeTrack.src} preload="metadata" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto 2rem",
          padding: "0 1.5rem",
        }}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            width: "100%",
            background: "rgba(4,20,12,0.85)",
            border: `1px solid ${accentColor}44`,
            borderRadius: isOpen ? "1rem 1rem 0 0" : "1rem",
            padding: "0.75rem 1.25rem",
            color: accentColor,
            fontSize: "0.8rem",
            fontFamily: "monospace",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "border-radius 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{
              fontSize: "0.55rem",
              animation: playState === "playing" ? "pulse 1.5s infinite" : "none",
              color: playState === "playing" ? accentColor : "rgba(16,185,129,0.4)",
            }}>◉</span>
            <span style={{ letterSpacing: "0.1em", fontWeight: 600 }}>RESONANT FREQUENCY THERAPY</span>
            <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>Healing Sessions</span>
            {isIntegrated && (
              <span style={{
                fontSize: "0.6rem",
                color: "#a855f7",
                opacity: 0.7,
                letterSpacing: "0.08em",
                border: "1px solid #a855f744",
                borderRadius: "0.3rem",
                padding: "0.1rem 0.35rem",
              }}>
                ◈ VISUALIZER LINKED
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {playState === "playing" && (
              <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>
                {formatTime(currentTime)}{duration > 0 ? ` / ${formatTime(duration)}` : ""}
              </span>
            )}
            <span style={{ opacity: 0.5 }}>{isOpen ? "▲" : "▼"}</span>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                background: "rgba(4,20,12,0.75)",
                border: `1px solid ${accentColor}44`,
                borderTop: "none",
                borderRadius: "0 0 1rem 1rem",
                padding: "1.5rem",
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                  {/* Track List */}
                  <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }} className="custom-scrollbar">
                    {FREQUENCY_TRACKS.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackSelect(track)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.6rem 0.8rem",
                          marginBottom: "0.4rem",
                          borderRadius: "0.5rem",
                          background: activeTrack.id === track.id ? `${accentColor}22` : "transparent",
                          border: `1px solid ${activeTrack.id === track.id ? accentColor + "44" : "transparent"}`,
                          color: activeTrack.id === track.id ? accentColor : "#e8f5e9",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{track.label}</span>
                        <span style={{ opacity: 0.5, fontSize: "0.65rem" }}>{track.duration}</span>
                      </button>
                    ))}
                  </div>

                  {/* Controls & Viz */}
                  <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ fontSize: "0.9rem", color: accentColor, fontWeight: 600, marginBottom: "0.25rem" }}>
                        {activeTrack.label}
                      </div>
                      <div style={{ fontSize: "0.7rem", opacity: 0.6, marginBottom: "0.25rem" }}>
                        Active Therapeutic Session • {activeTrack.duration}
                      </div>

                      {/* Integration status badge */}
                      {isIntegrated && (
                        <div style={{
                          fontSize: "0.62rem",
                          color: "#a855f7",
                          opacity: 0.8,
                          marginBottom: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}>
                          <span style={{ fontSize: "0.5rem" }}>◈</span>
                          Feeding main visualizer · EQ active · Entrainment tracking
                        </div>
                      )}

                      {/* Waveform */}
                      <div style={{
                        height: "60px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "2px",
                        marginBottom: "1.5rem",
                        padding: "0 0.5rem",
                        borderBottom: `1px solid ${accentColor}22`,
                      }}>
                        {bars.map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: `${Math.max(4, h * 100)}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                            style={{
                              flex: 1,
                              background: `linear-gradient(to top, ${accentColor}aa, ${accentColor}22)`,
                              borderRadius: "1px 1px 0 0",
                            }}
                          />
                        ))}
                      </div>

                      {/* Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        {playState !== "playing" ? (
                          <button
                            onClick={handlePlay}
                            style={{
                              background: accentColor,
                              color: "#0a0a0f",
                              border: "none",
                              borderRadius: "50%",
                              width: "3rem",
                              height: "3rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                            }}
                          >▶</button>
                        ) : (
                          <button
                            onClick={handlePause}
                            style={{
                              background: "transparent",
                              color: accentColor,
                              border: `1px solid ${accentColor}`,
                              borderRadius: "50%",
                              width: "3rem",
                              height: "3rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                            }}
                          >Ⅱ</button>
                        )}
                        <button
                          onClick={handleStop}
                          style={{
                            background: "transparent",
                            color: "#e8f5e9",
                            border: "1px solid rgba(232,245,233,0.2)",
                            borderRadius: "50%",
                            width: "2.5rem",
                            height: "2.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >■</button>

                        <div style={{ flex: 1, marginLeft: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", marginBottom: "0.4rem", opacity: 0.6 }}>
                            <span>VOLUME</span>
                            <span>{Math.round(volume * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            style={{
                              width: "100%",
                              accentColor: accentColor,
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.7rem" }}>
                        <button
                          onClick={handleLoopToggle}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: loop ? accentColor : "#e8f5e9",
                            opacity: loop ? 1 : 0.5,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <span style={{ fontSize: "1rem" }}>∞</span>
                          LOOP {loop ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(16,185,129,0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(16,185,129,0.2);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(16,185,129,0.4);
          }
        `}</style>
      </motion.div>
    </>
  );
}
