/**
 * useBiofeedback.ts — GestaltView Musical DNA Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HRV-based biofeedback state classifier + audio parameter mapping.
 *
 * Pipeline (as described in the PDF spec):
 *   Sensor → Preprocessing → Classification → Parameter Mapping → Synthesis
 *
 * In production: replace simulateHRV() with a real wearable data stream.
 * Supported real sources: Apple Watch (HealthKit), Whoop 4.0 API, Garmin Connect IQ.
 * The state classifier interface is intentionally provider-agnostic.
 *
 * State classification (rule-based, Phase 1):
 *   stress    → HR > 90 bpm  AND RMSSD < 22 ms
 *   flow      → HR 65–80 bpm AND RMSSD > 45 ms AND rising trend
 *   recovery  → HR < 65 bpm  AND RMSSD > 55 ms
 *   baseline  → everything else
 *
 * Audio parameter targets per state:
 *   stress   → BPM ↓ to 72, binaural "theta", reverb ↑, gain ↓ slightly
 *   flow     → BPM unchanged, binaural "alpha", reverb mid
 *   baseline → BPM unchanged, binaural "alpha", reverb mid
 *   recovery → BPM ↓ to 60, binaural "delta", reverb ↑↑, gain ↓↓
 *
 * © Keith Soyka · GestaltView · All Rights Reserved
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { BinauralPreset } from "./useBinauralBeats";

// ─── Types ─────────────────────────────────────────────────────────────────

export type BiofeedbackState = "stress" | "baseline" | "flow" | "recovery";

export interface HRVSample {
  timestamp: number;    // AudioContext.currentTime or Date.now() / 1000
  heartRate: number;    // bpm
  rmssd: number;        // ms — root mean square of successive R-R differences
  rrInterval: number;   // ms — current R-R interval
}

export interface AudioTargetParams {
  suggestedBPM: number;             // target tempo
  binauralPreset: BinauralPreset;   // binaural beat target
  reverbDepth: number;              // 0–1, wetness of reverb layer
  gainMultiplier: number;           // 0.5–1.0, master volume adjustment
  panningWidth: number;             // 0–1, stereo field width
  description: string;              // human-readable rationale
}

export interface BiofeedbackReading {
  state: BiofeedbackState;
  sample: HRVSample;
  audioTargets: AudioTargetParams;
  confidence: number;               // 0–1, classifier confidence
  stateHistory: BiofeedbackState[]; // last 10 states
  trend: "rising" | "falling" | "stable"; // HRV trend
}

// ─── Audio target definitions per state ───────────────────────────────────

const AUDIO_TARGETS: Record<BiofeedbackState, AudioTargetParams> = {
  stress: {
    suggestedBPM:   72,
    binauralPreset: "theta",
    reverbDepth:    0.7,
    gainMultiplier: 0.8,
    panningWidth:   0.6,
    description:    "Stress detected → activating theta entrainment & slower tempo to engage parasympathetic response",
  },
  baseline: {
    suggestedBPM:   78,          // neutral, let song's own BPM lead
    binauralPreset: "alpha",
    reverbDepth:    0.45,
    gainMultiplier: 0.9,
    panningWidth:   0.85,
    description:    "Baseline state → alpha entrainment supporting relaxed awareness",
  },
  flow: {
    suggestedBPM:   84,
    binauralPreset: "alpha",
    reverbDepth:    0.35,
    gainMultiplier: 1.0,
    panningWidth:   1.0,
    description:    "Flow state detected → alpha entrainment with full stereo field, supporting sustained focus",
  },
  recovery: {
    suggestedBPM:   60,
    binauralPreset: "delta",
    reverbDepth:    0.85,
    gainMultiplier: 0.65,
    panningWidth:   0.5,
    description:    "Recovery mode → delta entrainment, reduced volume, deep reverb for somatic settling",
  },
};

// ─── State classifier ────────────────────────────────────────────────────

function classifyState(
  sample: HRVSample,
  history: HRVSample[],
  trend: "rising" | "falling" | "stable"
): { state: BiofeedbackState; confidence: number } {
  const { heartRate: hr, rmssd } = sample;

  // Recovery: low HR + high HRV
  if (hr < 65 && rmssd > 55) {
    return { state: "recovery", confidence: 0.85 };
  }

  // Stress: elevated HR + suppressed HRV
  if (hr > 90 && rmssd < 22) {
    const confidence = Math.min(0.95, 0.7 + (hr - 90) / 100 + (22 - rmssd) / 100);
    return { state: "stress", confidence };
  }

  // Mild stress threshold
  if (hr > 85 && rmssd < 30) {
    return { state: "stress", confidence: 0.65 };
  }

  // Flow: moderate HR, high HRV, rising trend
  if (hr >= 65 && hr <= 82 && rmssd > 45 && trend === "rising") {
    return { state: "flow", confidence: 0.80 };
  }

  // Baseline: everything else
  return { state: "baseline", confidence: 0.70 };
}

function computeTrend(history: HRVSample[]): "rising" | "falling" | "stable" {
  if (history.length < 4) return "stable";
  const recent = history.slice(-4).map(s => s.rmssd);
  const delta = recent[recent.length - 1] - recent[0];
  if (delta > 5)  return "rising";
  if (delta < -5) return "falling";
  return "stable";
}

// ─── Simulator (replace with real wearable stream in production) ──────────

function simulateHRV(
  prevSample: HRVSample | null,
  stressPhase: number  // 0–1 internal simulation param
): HRVSample {
  const t = Date.now() / 1000;

  // Simulate natural HR variability: slow oscillation with noise
  const baseHR = 72 + Math.sin(stressPhase * Math.PI * 2) * 18;
  const hrNoise = (Math.random() - 0.5) * 3;
  const heartRate = Math.max(55, Math.min(110, baseHR + hrNoise));

  // RMSSD inversely correlated with HR (simplified HRV model)
  const baseRMSSD = 55 - (heartRate - 60) * 0.8;
  const rmssdNoise = (Math.random() - 0.5) * 6;
  const rmssd = Math.max(10, Math.min(80, baseRMSSD + rmssdNoise));

  // RR interval from HR
  const rrInterval = (60 / heartRate) * 1000;

  return { timestamp: t, heartRate, rmssd, rrInterval };
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export interface UseBiofeedbackOptions {
  /** Sampling interval in ms. Default 3000 (3s window as per PDF spec). */
  sampleIntervalMs?: number;
  /** If true, use real wearable data via the provided sampleFn instead of simulation. */
  useRealSensor?: boolean;
  /** Custom sensor data provider. Return null if data is unavailable. */
  sampleFn?: () => Promise<HRVSample | null>;
  /** Called whenever state changes, so callers can react immediately. */
  onStateChange?: (reading: BiofeedbackReading) => void;
}

export function useBiofeedback(options: UseBiofeedbackOptions = {}) {
  const {
    sampleIntervalMs = 3000,
    useRealSensor    = false,
    sampleFn,
    onStateChange,
  } = options;

  const [reading, setReading]   = useState<BiofeedbackReading | null>(null);
  const [isActive, setIsActive] = useState(false);

  const historyRef      = useRef<HRVSample[]>([]);
  const stateHistoryRef = useRef<BiofeedbackState[]>([]);
  const stressPhaseRef  = useRef(0);        // for simulation
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStateRef      = useRef(onStateChange);
  onStateRef.current    = onStateChange;    // always fresh callback

  const _tick = useCallback(async () => {
    let sample: HRVSample | null = null;

    if (useRealSensor && sampleFn) {
      sample = await sampleFn();
    }

    if (!sample) {
      // Advance simulation phase slowly (full cycle over ~60s)
      stressPhaseRef.current = (stressPhaseRef.current + sampleIntervalMs / 60000) % 1;
      sample = simulateHRV(
        historyRef.current[historyRef.current.length - 1] ?? null,
        stressPhaseRef.current
      );
    }

    // Rolling window: keep last 20 samples (~60s at 3s intervals)
    historyRef.current = [...historyRef.current.slice(-19), sample];

    const trend = computeTrend(historyRef.current);
    const { state, confidence } = classifyState(sample, historyRef.current, trend);

    stateHistoryRef.current = [...stateHistoryRef.current.slice(-9), state];

    const newReading: BiofeedbackReading = {
      state,
      sample,
      audioTargets: AUDIO_TARGETS[state],
      confidence,
      stateHistory: [...stateHistoryRef.current],
      trend,
    };

    setReading(newReading);
    onStateRef.current?.(newReading);
  }, [useRealSensor, sampleFn, sampleIntervalMs]);

  const start = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
    _tick(); // immediate first sample
    intervalRef.current = setInterval(_tick, sampleIntervalMs);
  }, [isActive, _tick, sampleIntervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { reading, isActive, start, stop, audioTargets: AUDIO_TARGETS };
}
