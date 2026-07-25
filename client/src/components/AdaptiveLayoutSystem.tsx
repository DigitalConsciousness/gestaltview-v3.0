import { useEffect, useMemo } from "react";
import type { LayoutPreferences } from "../../../types";

type AdaptiveLayoutSystemProps = {
  consciousnessState: string;
  energyLevel: number;
  onPreferencesChange?: (next: LayoutPreferences) => void;
};

export default function AdaptiveLayoutSystem({
  consciousnessState,
  energyLevel,
  onPreferencesChange,
}: AdaptiveLayoutSystemProps) {
  const preferences = useMemo<LayoutPreferences>(
    () => ({
      theme: energyLevel <= 3 ? "dark" : "auto",
      density: energyLevel >= 7 ? "compact" : energyLevel <= 3 ? "comfortable" : "spacious",
      animations: energyLevel > 2,
      reducedMotion: energyLevel <= 2,
      highContrast: consciousnessState === "Focused",
      fontSize: energyLevel <= 3 ? 15 : 14,
      consciousnessAdaptive: true,
      energyResponsive: true,
      focusMode: consciousnessState === "Focused",
    }),
    [consciousnessState, energyLevel]
  );

  useEffect(() => {
    onPreferencesChange?.(preferences);
  }, [onPreferencesChange, preferences]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-white/35">Adaptive mode</p>
        <p className="mt-2 text-sm text-white/70">{consciousnessState}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-white/35">Energy level</p>
        <p className="mt-2 text-sm text-white/70">{energyLevel}/10</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-white/35">Density</p>
        <p className="mt-2 text-sm text-white/70">{preferences.density}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-white/35">Motion</p>
        <p className="mt-2 text-sm text-white/70">{preferences.animations ? "enabled" : "reduced"}</p>
      </div>
    </div>
  );
}
