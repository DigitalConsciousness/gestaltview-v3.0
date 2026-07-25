/**
 * useBinauralBeats.ts — GestaltView Musical DNA Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Binaural beat neurostimulation layer.
 *
 * Architecture (Web Audio API):
 *
 *   leftOsc  (base - beat/2) ──► ChannelMerger[input 0] ──► beatGain ──► ctx.destination
 *   rightOsc (base + beat/2) ──► ChannelMerger[input 1] ──┘
 *
 * The brain perceives the frequency DIFFERENCE as a pulsing beat, which
 * encourages brainwave entrainment toward the target frequency.
 *
 * Presets map directly to the therapeutic biofeedback states:
 *   stress    → Theta  (4 Hz)  — parasympathetic engagement, calm down
 *   baseline  → Alpha  (10 Hz) — relaxed focus, maintain
 *   flow      → Alpha  (12 Hz) — supported concentration
 *   recovery  → Delta  (2 Hz)  — deep rest, somatic settling
 *
 * Usage:
 *   const beats = useBinauralBeats(audioCtxRef);
 *   beats.start("theta");
 *   beats.setPreset("alpha");
 *   beats.setVolume(0.12);
 *   beats.stop();
 *
 * © Keith Soyka · GestaltView · All Rights Reserved
 */

import { useRef, useCallback, useEffect, useState } from "react";

// ─── Preset definitions ────────────────────────────────────────────────────

export type BinauralPreset =
  | "delta"    // 0.5–4 Hz  — deep sleep, profound rest
  | "theta"    // 4–8 Hz    — meditation, emotional processing, REM
  | "alpha"    // 8–14 Hz   — relaxed alertness, flow onset
  | "beta"     // 14–30 Hz  — active thinking, focus
  | "gamma";   // 30–50 Hz  — peak concentration, insight

interface PresetConfig {
  label: string;
  beatFreq: number;     // Hz — the L/R frequency difference
  baseFreq: number;     // Hz — carrier tone (inaudible when mixed softly)
  description: string;
  therapeuticUse: string;
}

export const BINAURAL_PRESETS: Record<BinauralPreset, PresetConfig> = {
  delta: {
    label: "Delta",
    beatFreq: 2,
    baseFreq: 100,
    description: "0.5–4 Hz · Deep rest & somatic settling",
    therapeuticUse: "Recovery, deep relaxation, trauma integration",
  },
  theta: {
    label: "Theta",
    beatFreq: 6,
    baseFreq: 200,
    description: "4–8 Hz · Meditative & emotional processing",
    therapeuticUse: "Stress reduction, emotional release, creative insight",
  },
  alpha: {
    label: "Alpha",
    beatFreq: 10,
    baseFreq: 200,
    description: "8–14 Hz · Relaxed focus & flow onset",
    therapeuticUse: "Anxiety relief, calm productivity, baseline maintenance",
  },
  beta: {
    label: "Beta",
    beatFreq: 20,
    baseFreq: 220,
    description: "14–30 Hz · Alert cognition & active focus",
    therapeuticUse: "Concentration, problem-solving, engagement",
  },
  gamma: {
    label: "Gamma",
    beatFreq: 40,
    baseFreq: 240,
    description: "30–50 Hz · Peak cognition & perceptual binding",
    therapeuticUse: "Information integration, heightened awareness",
  },
};

// ─── State → Preset mapping (used by biofeedback integration) ─────────────

export const STATE_TO_PRESET: Record<string, BinauralPreset> = {
  stress:   "theta",    // pull toward calm
  baseline: "alpha",    // maintain relaxed focus
  flow:     "alpha",    // support the flow state
  recovery: "delta",    // support deep rest
};

// ─── Hook ─────────────────────────────────────────────────────────────────

export interface BinauralBeatsControls {
  isActive: boolean;
  currentPreset: BinauralPreset | null;
  volume: number;                                    // 0–1
  start: (preset?: BinauralPreset) => void;
  stop: () => void;
  setPreset: (preset: BinauralPreset) => void;
  setVolume: (vol: number) => void;
  fadeIn: (durationSec?: number) => void;
  fadeOut: (durationSec?: number) => void;
}

export function useBinauralBeats(
  audioCtxRef: React.RefObject<AudioContext | null>
): BinauralBeatsControls {
  const leftOscRef   = useRef<OscillatorNode | null>(null);
  const rightOscRef  = useRef<OscillatorNode | null>(null);
  const mergerRef    = useRef<ChannelMergerNode | null>(null);
  const beatGainRef  = useRef<GainNode | null>(null);

  const [isActive, setIsActive]           = useState(false);
  const [currentPreset, setCurrentPreset] = useState<BinauralPreset | null>(null);
  const [volume, setVolumeState]          = useState(0.08); // subtle default

  // ── Internal: build/tear down the audio graph ─────────────────────────

  const _buildGraph = useCallback((preset: BinauralPreset, vol: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Tear down any existing graph first
    _tearDown();

    const config = BINAURAL_PRESETS[preset];
    const halfBeat = config.beatFreq / 2;

    // Left oscillator: base − half_beat
    const leftOsc = ctx.createOscillator();
    leftOsc.type = "sine";
    leftOsc.frequency.value = config.baseFreq - halfBeat;

    // Right oscillator: base + half_beat
    const rightOsc = ctx.createOscillator();
    rightOsc.type = "sine";
    rightOsc.frequency.value = config.baseFreq + halfBeat;

    // ChannelMerger: input[0] → left, input[1] → right
    const merger = ctx.createChannelMerger(2);

    // Master gain for volume / fade
    const beatGain = ctx.createGain();
    beatGain.gain.value = 0; // start silent; fadeIn will ramp up

    // Wire: leftOsc → merger input 0 (left channel)
    leftOsc.connect(merger, 0, 0);
    // Wire: rightOsc → merger input 1 (right channel)
    rightOsc.connect(merger, 0, 1);
    // Wire: merger → gain → destination
    merger.connect(beatGain);
    beatGain.connect(ctx.destination);

    // Start oscillators
    leftOsc.start(ctx.currentTime);
    rightOsc.start(ctx.currentTime);

    leftOscRef.current  = leftOsc;
    rightOscRef.current = rightOsc;
    mergerRef.current   = merger;
    beatGainRef.current = beatGain;
  }, [audioCtxRef]);

  const _tearDown = useCallback(() => {
    try { leftOscRef.current?.stop();  } catch {}
    try { rightOscRef.current?.stop(); } catch {}
    leftOscRef.current?.disconnect();
    rightOscRef.current?.disconnect();
    mergerRef.current?.disconnect();
    beatGainRef.current?.disconnect();
    leftOscRef.current  = null;
    rightOscRef.current = null;
    mergerRef.current   = null;
    beatGainRef.current = null;
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────

  const start = useCallback((preset: BinauralPreset = "alpha") => {
    _buildGraph(preset, volume);
    setCurrentPreset(preset);
    setIsActive(true);
    // Gentle fade in
    const ctx = audioCtxRef.current;
    const gain = beatGainRef.current;
    if (ctx && gain) {
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.5);
    }
  }, [_buildGraph, volume, audioCtxRef]);

  const stop = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gain = beatGainRef.current;
    if (ctx && gain) {
      // Fade out first, then tear down
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => {
        _tearDown();
        setIsActive(false);
        setCurrentPreset(null);
      }, 1600);
    } else {
      _tearDown();
      setIsActive(false);
      setCurrentPreset(null);
    }
  }, [_tearDown, audioCtxRef]);

  const setPreset = useCallback((preset: BinauralPreset) => {
    if (!isActive) return;
    const ctx = audioCtxRef.current;
    if (!ctx || !leftOscRef.current || !rightOscRef.current) return;

    const config = BINAURAL_PRESETS[preset];
    const halfBeat = config.beatFreq / 2;
    const now = ctx.currentTime;

    // Smooth frequency glide over 1.5s — avoids jarring clicks
    leftOscRef.current.frequency.linearRampToValueAtTime(
      config.baseFreq - halfBeat,
      now + 1.5
    );
    rightOscRef.current.frequency.linearRampToValueAtTime(
      config.baseFreq + halfBeat,
      now + 1.5
    );

    setCurrentPreset(preset);
  }, [isActive, audioCtxRef]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    const ctx = audioCtxRef.current;
    const gain = beatGainRef.current;
    if (ctx && gain && isActive) {
      gain.gain.linearRampToValueAtTime(clamped, ctx.currentTime + 0.5);
    }
    setVolumeState(clamped);
  }, [isActive, audioCtxRef]);

  const fadeIn = useCallback((durationSec = 3.0) => {
    const ctx = audioCtxRef.current;
    const gain = beatGainRef.current;
    if (!ctx || !gain) return;
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + durationSec);
  }, [volume, audioCtxRef]);

  const fadeOut = useCallback((durationSec = 3.0) => {
    const ctx = audioCtxRef.current;
    const gain = beatGainRef.current;
    if (!ctx || !gain) return;
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);
  }, [audioCtxRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { _tearDown(); };
  }, [_tearDown]);

  return {
    isActive,
    currentPreset,
    volume,
    start,
    stop,
    setPreset,
    setVolume,
    fadeIn,
    fadeOut,
  };
}
