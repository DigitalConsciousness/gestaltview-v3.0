import { useEffect, useState, useCallback } from "react";
import type { AmbientCoherenceSignal } from "@shared/gen-engine/index";
import { scanAmbientCoherence } from "@/lib/genEngineClient";

export interface UseAmbientOrbsOptions {
  userId?: string;
  room?: "dynamic-inner-world" | "creation-corner" | "all";
  maxSignals?: number;
  pollIntervalMs?: number;
}

export function useAmbientOrbs(options: UseAmbientOrbsOptions = {}) {
  const { userId, room = "creation-corner", maxSignals = 5, pollIntervalMs = 30000 } = options;

  const [signals, setSignals] = useState<AmbientCoherenceSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await scanAmbientCoherence({
        userId,
        room,
        maxSignals,
      });

      setSignals(result.signals || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan for ambient orbs");
    } finally {
      setIsLoading(false);
    }
  }, [userId, room, maxSignals]);

  useEffect(() => {
    refresh();

    if (pollIntervalMs > 0) {
      const interval = setInterval(() => {
        refresh();
      }, pollIntervalMs);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [refresh, pollIntervalMs]);

  return {
    signals,
    isLoading,
    error,
    lastRefresh,
    refresh,
  };
}
