/**
 * DeadlightsTrackSection.tsx
 * GestaltView — Musical DNA Engine — Deadlights Track Player
 * © 2026 Keith Soyka / GestaltView — All Rights Reserved
 *
 * A dedicated ambient track section for the Deadlights effect audio.
 * The track file is expected at: /shared/audio/effects/deadlights.mp3
 * (maps to client/src/shared/audio/effects/deadlights.mp3 → served as
 *  /shared/audio/effects/deadlights.mp3 via the public/ symlink or Vite asset)
 *
 * Features:
 *  - Play / Pause / Stop controls
 *  - Volume slider
 *  - Loop toggle
 *  - Animated waveform visualizer (Web Audio API AnalyserNode)
 *  - Fade-in / fade-out on play/stop (2s)
 *  - Collapsible panel matching the MusicalDNAFrequencyPanel style
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEADLIGHTS_SRC = "/shared/audio/effects/deadlights.mp3";
const FADE_DURATION_S = 2;
const BAR_COUNT = 32;

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayState = "stopped" | "playing" | "paused";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DeadlightsTrackSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [playState, setPlayState] = useState<PlayState>("stopped");
  const [volume, setVolume] = useState(0.65);
  const [loop, setLoop] = useState(true);
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const gainRef    = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef  = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef     = useRef<number>(0);
  const fadeRafRef = useRef<number>(0);

  // ── Audio graph setup ────────────────────────────────────────────────────

  const setupAudioGraph = useCallback(() => {
    if (audioCtxRef.current) return; // already set up
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;

    const gain = ctx.createGain();
    gain.gain.value = 0; // start silent for fade-in
    gainRef.current = gain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;

    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
  }, []);

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
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    audio.loop = loop;
    audio.volume = 1; // gain node controls volume

    if (playState === "paused") {
      await audio.play();
      fadeTo(volume);
      setPlayState("playing");
      startViz();
    } else {
      audio.currentTime = 0;
      await audio.play();
      fadeTo(volume);
      setPlayState("playing");
      startViz();
    }
  }, [playState, loop, volume, setupAudioGraph, fadeTo, startViz]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, () => {
      audio.pause();
      setPlayState("paused");
    });
    stopViz();
  }, [fadeTo, stopViz]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    fadeTo(0, () => {
      audio.pause();
      audio.currentTime = 0;
      setPlayState("stopped");
      setCurrentTime(0);
    });
    stopViz();
  }, [fadeTo, stopViz]);

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
    const onEnd  = () => { if (!loop) { setPlayState("stopped"); stopViz(); } };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [loop, stopViz]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(fadeRafRef.current);
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const accentColor = "#b81afa"; // deep violet — IT/horror aesthetic

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={DEADLIGHTS_SRC} preload="metadata" />

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
        {/* ── Toggle pill ──────────────────────────────────────────────── */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            width: "100%",
            background: "rgba(4,4,20,0.85)",
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
              color: playState === "playing" ? accentColor : "rgba(184,26,250,0.4)",
            }}>◉</span>
            <span style={{ letterSpacing: "0.1em", fontWeight: 600 }}>DEADLIGHTS</span>
            <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>Ambient Horror Track</span>
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

        {/* ── Expanded panel ───────────────────────────────────────────── */}
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
                background: "rgba(4,4,20,0.92)",
                border: `1px solid ${accentColor}33`,
                borderTop: "none",
                borderRadius: "0 0 1rem 1rem",
                padding: "1.25rem 1.5rem 1.5rem",
                backdropFilter: "blur(16px)",
              }}>

                {/* ── Waveform visualizer ──────────────────────────────── */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                  height: "56px",
                  marginBottom: "1.25rem",
                  padding: "0 4px",
                }}>
                  {bars.map((level, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${Math.max(4, level * 100)}%`,
                        background: playState === "playing"
                          ? `rgba(184,26,250,${0.3 + level * 0.7})`
                          : "rgba(184,26,250,0.15)",
                        borderRadius: "2px 2px 0 0",
                        transition: "height 0.05s ease",
                      }}
                    />
                  ))}
                </div>

                {/* ── Progress bar ─────────────────────────────────────── */}
                {duration > 0 && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{
                      height: "3px",
                      background: "rgba(184,26,250,0.15)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${(currentTime / duration) * 100}%`,
                        background: accentColor,
                        borderRadius: "2px",
                        transition: "width 0.5s linear",
                      }} />
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "0.25rem",
                      fontSize: "0.65rem",
                      fontFamily: "monospace",
                      color: "rgba(184,26,250,0.5)",
                    }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}

                {/* ── Transport controls ───────────────────────────────── */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.25rem",
                }}>
                  {/* Play / Pause */}
                  <button
                    onClick={playState === "playing" ? handlePause : handlePlay}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: playState === "playing"
                        ? `rgba(184,26,250,0.2)`
                        : `rgba(184,26,250,0.15)`,
                      border: `1px solid ${accentColor}66`,
                      color: accentColor,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    aria-label={playState === "playing" ? "Pause" : "Play"}
                  >
                    {playState === "playing" ? "❚❚" : "▶"}
                  </button>

                  {/* Stop */}
                  <button
                    onClick={handleStop}
                    disabled={playState === "stopped"}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(184,26,250,0.08)",
                      border: "1px solid rgba(184,26,250,0.25)",
                      color: playState === "stopped" ? "rgba(184,26,250,0.25)" : "rgba(184,26,250,0.7)",
                      fontSize: "0.75rem",
                      cursor: playState === "stopped" ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    aria-label="Stop"
                  >
                    ■
                  </button>

                  {/* Status label */}
                  <span style={{
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                    color: "rgba(184,26,250,0.6)",
                    letterSpacing: "0.08em",
                    flex: 1,
                  }}>
                    {playState === "playing" ? "TRANSMITTING" : playState === "paused" ? "SUSPENDED" : "DORMANT"}
                  </span>

                  {/* Loop toggle */}
                  <button
                    onClick={handleLoopToggle}
                    title={loop ? "Loop: On" : "Loop: Off"}
                    style={{
                      padding: "0.3rem 0.6rem",
                      borderRadius: "0.4rem",
                      background: loop ? "rgba(184,26,250,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${loop ? accentColor + "55" : "rgba(255,255,255,0.1)"}`,
                      color: loop ? accentColor : "rgba(255,255,255,0.3)",
                      fontSize: "0.65rem",
                      fontFamily: "monospace",
                      cursor: "pointer",
                      letterSpacing: "0.08em",
                      transition: "all 0.2s",
                    }}
                  >
                    ↻ {loop ? "LOOP ON" : "LOOP OFF"}
                  </button>
                </div>

                {/* ── Volume ───────────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.65rem",
                    fontFamily: "monospace",
                    color: "rgba(184,26,250,0.5)",
                    letterSpacing: "0.08em",
                    minWidth: "52px",
                  }}>
                    VOL {Math.round(volume * 100)}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    style={{
                      flex: 1,
                      accentColor,
                      height: "3px",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* ── Description ──────────────────────────────────────── */}
                <p style={{
                  marginTop: "1.25rem",
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "rgba(184,26,250,0.4)",
                  lineHeight: 1.6,
                  letterSpacing: "0.03em",
                }}>
                  The Deadlights. Not a song. Not a sound effect. A transmission.
                  Place this beneath any somatic session to shift the nervous system
                  into the liminal space where deep processing happens.
                </p>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
