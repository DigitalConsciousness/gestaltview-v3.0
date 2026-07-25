/**
 * useEntrainmentPhase.ts — GestaltView Musical DNA Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Tracks binaural entrainment onset and emits visual enhancement signal
 *
 * Scientific basis: 3–7 min onset window for brainwave synchronization
 * The brain requires 3–7 minutes to synchronize with binaural beat frequencies.
 * This hook tracks elapsed time since onset and computes a strength parameter
 * (0–1) that drives visual enhancement feedback, creating a mirror of the
 * neural entrainment state.
 *
 * Phases:
 *   idle        — No binaural session active
 *   initializing — 0–3 min: subtle pre-onset warmup (strength 0 → 0.15)
 *   entraining  — 3–7 min: active entrainment ramp (strength 0.3 → 0.85)
 *   entrained   — 7+ min: deep entrainment with natural oscillation
 *
 * Usage:
 *   const entrainment = useEntrainmentPhase(binaural.isActive, binaural.currentPreset);
 *   visualizer.setEntrainmentStrength(entrainment.strength);
 *
 * © Keith Soyka · GestaltView · All Rights Reserved
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { BinauralPreset } from "./useBinauralBeats";

export type EntrainmentPhase = "idle" | "initializing" | "entraining" | "entrained";

export interface EntrainmentState {
  phase: EntrainmentPhase;
  strength: number; // 0–1, drives visual enhancement
  elapsedSeconds: number;
  onsetReached: boolean; // true once 3-min threshold crossed
  peakReached: boolean; // true once 7-min deep entrainment reached
  preset: BinauralPreset | null;
}

// Phase thresholds in seconds (peer-reviewed onset window)
const ONSET_SEC = 180; // 3 min — entrainment begins
const PEAK_SEC = 420; // 7 min — deep entrainment

export function useEntrainmentPhase(
  isActive: boolean,
  preset: BinauralPreset | null
): EntrainmentState {
  const [state, setState] = useState<EntrainmentState>({
    phase: "idle",
    strength: 0,
    elapsedSeconds: 0,
    onsetReached: false,
    peakReached: false,
    preset: null,
  });

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    let phase: EntrainmentPhase = "initializing";
    let strength = 0;

    if (elapsed >= PEAK_SEC) {
      phase = "entrained";
      // Strength oscillates gently at peak — natural brainwave rhythm
      strength = 0.85 + Math.sin(elapsed * 0.05) * 0.15;
    } else if (elapsed >= ONSET_SEC) {
      phase = "entraining";
      // Linear ramp from onset to peak, range 0.3 → 0.85
      strength =
        0.3 + ((elapsed - ONSET_SEC) / (PEAK_SEC - ONSET_SEC)) * 0.55;
    } else {
      phase = "initializing";
      // Subtle pre-onset warmup: 0 → 0.15 over first 3 min
      strength = (elapsed / ONSET_SEC) * 0.15;
    }

    setState({
      phase,
      strength,
      elapsedSeconds: elapsed,
      onsetReached: elapsed >= ONSET_SEC,
      peakReached: elapsed >= PEAK_SEC,
      preset,
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [preset]);

  useEffect(() => {
    if (isActive && preset) {
      startTimeRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
      setState({
        phase: "idle",
        strength: 0,
        elapsedSeconds: 0,
        onsetReached: false,
        peakReached: false,
        preset: null,
      });
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, preset, tick]);

  return state;
}
