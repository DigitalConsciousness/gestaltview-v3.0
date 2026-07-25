import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "gv-billy-voice-enabled:";
const SHARED_STORAGE_KEY = `${STORAGE_PREFIX}shared`;
const LEGACY_SURFACE_IDS = ["panel", "live", "voice-studio", "greeter"] as const;

function readStoredPreference(surfaceId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const sharedValue = window.localStorage.getItem(SHARED_STORAGE_KEY);
    if (sharedValue !== null) {
      return sharedValue === "true";
    }

    for (const legacySurfaceId of LEGACY_SURFACE_IDS) {
      const legacyValue = window.localStorage.getItem(`${STORAGE_PREFIX}${legacySurfaceId}`);
      if (legacyValue !== null) {
        return legacyValue === "true";
      }
    }

    return window.localStorage.getItem(`${STORAGE_PREFIX}${surfaceId}`) === "true";
  } catch {
    return false;
  }
}

function writeStoredPreference(surfaceId: string, enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serializedValue = enabled ? "true" : "false";
    window.localStorage.setItem(SHARED_STORAGE_KEY, serializedValue);
    window.localStorage.setItem(`${STORAGE_PREFIX}${surfaceId}`, serializedValue);

    if (surfaceId === "shared") {
      for (const legacySurfaceId of LEGACY_SURFACE_IDS) {
        window.localStorage.setItem(`${STORAGE_PREFIX}${legacySurfaceId}`, serializedValue);
      }
    }
  } catch {
    // Ignore storage failures and keep the in-memory preference.
  }
}

export function useBillyVoicePreference(
  surfaceId: string
): [boolean, (value: boolean | ((current: boolean) => boolean)) => void] {
  const [enabled, setEnabledState] = useState<boolean>(() => readStoredPreference(surfaceId));

  useEffect(() => {
    setEnabledState(readStoredPreference(surfaceId));
  }, [surfaceId]);

  useEffect(() => {
    writeStoredPreference(surfaceId, enabled);
  }, [enabled, surfaceId]);

  const setEnabled = useCallback(
    (value: boolean | ((current: boolean) => boolean)) => {
      setEnabledState((current) => {
        const nextValue = typeof value === "function" ? value(current) : value;

        writeStoredPreference(surfaceId, nextValue);

        return nextValue;
      });
    },
    [surfaceId]
  );

  return [enabled, setEnabled];
}
