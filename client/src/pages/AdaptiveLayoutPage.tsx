import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Save, Send } from "lucide-react";
import AdaptiveLayoutSystem from "@/components/AdaptiveLayoutSystem";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";
import { colorPalette, type ColorName } from "@/theme/colors";
import type { LayoutPreferences } from "../../../types";

const STORAGE_KEY = "gestaltview.settings.surface.v1";

function hexToRgb(hex: string) {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((value) => value + value)
      .join("");
  }

  const numeric = Number.parseInt(sanitized, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function toHex(component: number) {
  return Math.round(component).toString(16).padStart(2, "0");
}

function lightenColor(hex: string, percent: number) {
  const { r, g, b } = hexToRgb(hex);
  const nextR = Math.min(255, r + (255 - r) * percent);
  const nextG = Math.min(255, g + (255 - g) * percent);
  const nextB = Math.min(255, b + (255 - b) * percent);
  return `#${toHex(nextR)}${toHex(nextG)}${toHex(nextB)}`;
}

function toRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

type CognitiveState = "Focused" | "Scattered" | "Creative" | "Low Energy";

const stateMeta = {
  Focused: {
    summary: "Tighter spacing, clearer hierarchy, less noise.",
    energy: 8,
    lighten: 0,
    alpha: 0.22,
  },
  Scattered: {
    summary: "Soften the density and keep the page easier to parse.",
    energy: 4,
    lighten: 0.2,
    alpha: 0.12,
  },
  Creative: {
    summary: "Let the page breathe and expose more connective tissue.",
    energy: 7,
    lighten: 0.4,
    alpha: 0.18,
  },
  "Low Energy": {
    summary: "Reduce motion and hold the interface steady.",
    energy: 2,
    lighten: 0.6,
    alpha: 0.16,
  },
} as const;

function readSelectedPalette(): ColorName {
  if (typeof window === "undefined") return "cyan";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "cyan";

    const parsed = JSON.parse(raw) as { palette?: string } | null;
    const candidate = parsed?.palette as ColorName | undefined;
    if (candidate && candidate in colorPalette) {
      return candidate;
    }
  } catch {
    // Ignore malformed persisted settings and fall back to the default palette.
  }

  return "cyan";
}

export default function AdaptiveLayoutPage() {
  useSEO({
    title: "Adaptive Layout UI | GestaltView",
    description:
      "A cognitive-adaptive layout surface with state selection, preview, session application, and profile saving.",
    h1: "Adaptive Layout UI",
    canonical: "https://gestaltview-v2.vercel.app/adaptive-layout",
  });

  const [paletteName, setPaletteName] = useState<ColorName>("cyan");
  const [state, setState] = useState<CognitiveState>("Focused");
  const [profileName, setProfileName] = useState("Default cognitive profile");
  const [preferences, setPreferences] = useState<LayoutPreferences | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [sessionState, setSessionState] = useState("Awaiting application");

  useEffect(() => {
    setPaletteName(readSelectedPalette());
  }, []);

  const config = useMemo(
    () =>
      ({
        theme: state === "Low Energy" ? "dark" : state === "Creative" ? "auto" : "dark",
        density:
          state === "Focused"
            ? "compact"
            : state === "Low Energy"
              ? "comfortable"
              : "spacious",
        animations: state !== "Low Energy",
        reducedMotion: state === "Low Energy",
        highContrast: state === "Focused",
        fontSize: state === "Focused" ? 14 : 15,
        consciousnessAdaptive: true,
        energyResponsive: true,
        focusMode: state === "Focused",
      }) as LayoutPreferences,
    [state],
  );

  const baseAccent = colorPalette[paletteName].accent;
  const derivedStates = useMemo(() => {
    const result = {} as Record<
      CognitiveState,
      { accent: string; glow: string; summary: string; energy: number }
    >;

    (Object.keys(stateMeta) as CognitiveState[]).forEach((key) => {
      const meta = stateMeta[key];
      const accent = lightenColor(baseAccent, meta.lighten);
      result[key] = {
        accent,
        glow: toRgba(accent, meta.alpha),
        summary: meta.summary,
        energy: meta.energy,
      };
    });

    return result;
  }, [baseAccent]);

  const theme = derivedStates[state];

  const badgeStyle = useMemo(() => {
    const accentTint = lightenColor(baseAccent, 0.1);
    return {
      borderColor: toRgba(accentTint, 0.25),
      backgroundColor: toRgba(accentTint, 0.1),
      color: lightenColor(baseAccent, 0.4),
    };
  }, [baseAccent]);

  const primaryButtonStyle = useMemo(() => {
    return {
      borderColor: toRgba(baseAccent, 0.25),
      backgroundColor: toRgba(baseAccent, 0.12),
      color: "#FFFFFF",
    };
  }, [baseAccent]);

  const getStateButtonStyle = (option: CognitiveState, selected: boolean) => {
    if (selected) {
      const accent = derivedStates[option].accent;
      return {
        borderColor: toRgba(accent, 0.3),
        backgroundColor: toRgba(accent, 0.12),
        color: "#FFFFFF",
      };
    }

    return {
      borderColor: "rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.03)",
      color: "rgba(255,255,255,0.7)",
    };
  };

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: `radial-gradient(circle at 20% 10%, ${theme.glow}, transparent 28%), linear-gradient(180deg, #0A0F14 0%, #071016 100%)`,
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.26em]" style={badgeStyle}>
            adaptive
          </span>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <GlassCard glow={paletteName} intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: theme.accent }}>
              Cognitive state
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              The page should adapt to the person, not the other way around.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{theme.summary}</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(Object.keys(stateMeta) as CognitiveState[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setState(option)}
                  className="rounded-2xl border px-4 py-3 text-left transition-colors"
                  style={getStateButtonStyle(option, state === option)}
                >
                  <span className="block text-sm font-semibold">{option}</span>
                  <span className="mt-1 block text-xs text-white/45">
                    {option === "Focused"
                      ? "Tight and precise"
                      : option === "Scattered"
                        ? "Gentler navigation"
                        : option === "Creative"
                          ? "More connective tissue"
                          : "Quiet the motion"}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
              <span className="rounded-full border border-white/10 px-3 py-1">Energy {theme.energy}/10</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Accent {theme.accent}</span>
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
                  Live preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">The interface restyles as state changes.</h2>
              </div>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55"
              >
                {state}
              </motion.div>
            </div>
            <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/30 p-4">
              <AdaptiveLayoutSystem
                consciousnessState={state}
                energyLevel={theme.energy}
                onPreferencesChange={(next: LayoutPreferences) => setPreferences(next)}
              />
            </div>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard glow={paletteName} intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: theme.accent }}>
              Profile builder
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                placeholder="Profile name"
              />
              <button
                type="button"
                onClick={() => setSaveState("saved")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold"
                style={primaryButtonStyle}
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setSessionState("Applied to Billy session")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70"
              >
                <Send className="h-4 w-4" />
                Apply to session
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Profile state</p>
                <p className="mt-2 text-sm text-white/70">
                  {saveState === "saved" ? `Saved ${profileName}` : "Not saved yet"}
                </p>
              </GlassCard>
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Session state</p>
                <p className="mt-2 text-sm text-white/70">{sessionState}</p>
              </GlassCard>
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">Snapshot</p>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <p>Theme: {config.theme}</p>
              <p>Density: {config.density}</p>
              <p>Motion: {config.animations ? "enabled" : "reduced"}</p>
              <p>Focus mode: {config.focusMode ? "on" : "off"}</p>
              <p>High contrast: {config.highContrast ? "on" : "off"}</p>
              {preferences ? (
                <p>Adaptive profile: {preferences.density} / {preferences.fontSize}px</p>
              ) : null}
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
              <span className="rounded-full border border-white/10 px-3 py-1">State: {state}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Energy {theme.energy}/10</span>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
