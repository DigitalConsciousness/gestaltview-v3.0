/**
 * useAudioEffects.ts — GestaltView Sound Effects Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Manages the IT Deadlights and Laser Etching audio effects.
 *
 * Effects:
 *   - deadlights-full:  Full 5-second IT Deadlights ambient horror effect
 *   - deadlights-flash: Short 1.5-second Deadlights flash/sting
 *   - laser-etching:    Laser etching/engraving sound effect
 *
 * Usage:
 *   const fx = useAudioEffects();
 *   fx.playDeadlights();
 *   fx.playDeadlightsFlash();
 *   fx.playLaserEtching();
 *
 * © Keith Soyka · GestaltView · All Rights Reserved
 */

import { useRef, useCallback } from "react";

// ─── Effect Definitions ───────────────────────────────────────────────────────

export type AudioEffectId = "deadlights-full" | "deadlights-flash" | "laser-etching";

const EFFECT_SRCS: Record<AudioEffectId, string> = {
  "deadlights-full":  "/audio/effects/deadlights-full.wav",
  "deadlights-flash": "/audio/effects/deadlights-flash.wav",
  "laser-etching":    "/audio/effects/laser-etching.wav",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface AudioEffectsControls {
  playEffect: (id: AudioEffectId, volume?: number) => void;
  playDeadlights: (volume?: number) => void;
  playDeadlightsFlash: (volume?: number) => void;
  playLaserEtching: (volume?: number) => void;
  stopAll: () => void;
}

export function useAudioEffects(): AudioEffectsControls {
  const audioRefs = useRef<Map<AudioEffectId, HTMLAudioElement>>(new Map());

  const getOrCreate = useCallback((id: AudioEffectId): HTMLAudioElement => {
    if (!audioRefs.current.has(id)) {
      const audio = new Audio(EFFECT_SRCS[id]);
      audio.preload = "auto";
      audioRefs.current.set(id, audio);
    }
    return audioRefs.current.get(id)!;
  }, []);

  const playEffect = useCallback((id: AudioEffectId, volume = 0.7) => {
    try {
      const audio = getOrCreate(id);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0;
      audio.play().catch((e) => {
        // Autoplay policy — requires user gesture; silently fail
        console.debug(`[AudioEffects] Could not play ${id}:`, e.message);
      });
    } catch (e) {
      console.debug(`[AudioEffects] Error playing ${id}:`, e);
    }
  }, [getOrCreate]);

  const playDeadlights     = useCallback((volume = 0.65) => playEffect("deadlights-full", volume), [playEffect]);
  const playDeadlightsFlash = useCallback((volume = 0.75) => playEffect("deadlights-flash", volume), [playEffect]);
  const playLaserEtching   = useCallback((volume = 0.6)  => playEffect("laser-etching", volume), [playEffect]);

  const stopAll = useCallback(() => {
    audioRefs.current.forEach((audio) => {
      try { audio.pause(); audio.currentTime = 0; } catch {}
    });
  }, []);

  return {
    playEffect,
    playDeadlights,
    playDeadlightsFlash,
    playLaserEtching,
    stopAll,
  };
}
