import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Mic,
  Palette,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { colorPalette, type ColorName } from "@/theme/colors";
import MassExodusButton from "@/components/MassExodusButton";
import {
  applyUserSurfaceSettings,
  readUserSurfaceSettings,
  writeUserSurfaceSettings,
  type UserSurfaceSettings,
} from "@/lib/userSurfaceSettings";

export default function SettingsPage() {
  const { tier, user } = useAuth();
  const [settings, setSettings] = useState<UserSurfaceSettings>(() => readUserSurfaceSettings());
  const accent = colorPalette[settings.palette].accent;

  useEffect(() => {
    writeUserSurfaceSettings(settings);
  }, [settings]);

  useEffect(() => {
    applyUserSurfaceSettings(settings);
  }, [settings]);

  const modeLabel = useMemo(() => {
    if (tier === "enterprise") return "Power user";
    return tier;
  }, [tier]);

  const update = (key: keyof UserSurfaceSettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const selectPalette = (paletteName: ColorName) => {
    setSettings((current) => ({ ...current, palette: paletteName }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070B] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 14%, rgba(18,214,255,0.16), transparent 22%), radial-gradient(circle at 84% 22%, rgba(191,0,255,0.12), transparent 20%), radial-gradient(circle at 50% 82%, rgba(0,255,102,0.08), transparent 24%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div className="space-y-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: accent }}>
              Settings
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Personal preferences live here. Nothing founder-only belongs in this view.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/66">
              This surface is for comfort, playback, and visibility preferences. Dangerous actions are
              deliberately separated and only shown when the runtime knows you can use them.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/profile">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition-colors hover:text-white">
                  <Brain className="size-4" style={{ color: accent }} />
                  Profile
                </a>
              </Link>
              <Link href="/blackboard-room">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition-colors hover:text-white">
                  <Mic className="size-4" style={{ color: accent }} />
                  Blackboard Room
                </a>
              </Link>
              <MassExodusButton sourceSurface="settings" />
            </div>
          </div>

          <GlassCard
            glow="none"
            intensity="medium"
            className="border-white/12 bg-white/[0.05] p-6 sm:p-7"
            hover={false}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                  Session
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{user?.email ?? "Guest"}</h2>
                <p className="mt-2 text-sm text-white/58">{modeLabel} view</p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/25 p-3" style={{ color: accent }}>
                <Palette className="size-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <ToggleRow
                icon={Mic}
                label="Voice capture"
                description="Mic buttons appear across rooms and save transcripts into memory."
                checked={settings.voiceCapture}
                onToggle={() => update("voiceCapture")}
                accent={accent}
              />
              <ToggleRow
                icon={Sparkles}
                label="Motion hints"
                description="Keep micro-motion on for confirmations and small state changes."
                checked={settings.motionHints}
                onToggle={() => update("motionHints")}
                accent={accent}
              />
              <ToggleRow
                icon={ChevronRight}
                label="Degraded mode"
                description="Disable the heavy motion layers when you want a lighter, lower-bandwidth surface."
                checked={settings.lowBandwidthMode}
                onToggle={() => update("lowBandwidthMode")}
                accent={accent}
              />
              <ToggleRow
                icon={Palette}
                label="Dark surfaces"
                description="Use the glass-heavy room palette and layered gradients."
                checked={settings.darkSurfaces}
                onToggle={() => update("darkSurfaces")}
                accent={accent}
              />
              <ToggleRow
                icon={Sparkles}
                label="Musical DNA ambient inference"
                description="Allow Musical DNA to infer patterns from journals, recap artifacts, file uploads, and profile signals."
                checked={settings.musicalDnaAmbientInference}
                onToggle={() => update("musicalDnaAmbientInference")}
                accent={accent}
              />
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                Colour palette
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(colorPalette).map(([name, palette]) => {
                  if (name === "none") return null;
                  const isSelected = settings.palette === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectPalette(name as ColorName)}
                      aria-label={name}
                      className={`h-8 w-8 rounded-full border-2 ${
                        isSelected ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: palette.accent }}
                    />
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard
            glow="none"
            intensity="medium"
            className="border-white/12 bg-white/[0.05] p-6 sm:p-7"
            hover={false}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
              Navigation
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Quick routes</h2>
            <div className="mt-4 grid gap-2">
              {[
                { href: "/sanctuary", label: "Sanctuary", copy: "Private return space" },
                { href: "/documents", label: "File Explorer", copy: "Central file library" },
                {
                  href: "/dynamic-inner-world",
                  label: "Dynamic Inner World",
                  copy: "Surface navigation and inspection",
                },
                { href: "/external-scaffold", label: "External Scaffold", copy: "Approval layer" },
                { href: "/creation-corner", label: "Creation Corner", copy: "Draft and export flow" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.05]">
                    <span>
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="block text-xs text-white/46">{item.copy}</span>
                    </span>
                    <ArrowRight className="size-4 text-white/40" />
                  </a>
                </Link>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard
              glow="none"
              intensity="medium"
              className="border-white/12 bg-white/[0.05] p-6 sm:p-7"
              hover={false}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                Privacy
              </p>
              <h2 className="mt-3 text-2xl font-semibold">No founder controls in this view</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/62">
                Settings stay focused on the user. Role-gated tools live elsewhere and do not surface here.
              </p>
            </GlassCard>

            <GlassCard
              glow="none"
              intensity="medium"
              className="border-white/12 bg-white/[0.05] p-6 sm:p-7"
              hover={false}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                Status
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Default-safe posture</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/62">
                GestaltView stays private by default. Settings here only tune how the room feels and how much of
                the runtime should speak back.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/74">
                <ChevronRight className="size-4" style={{ color: accent }} />
                Voice and memory continuity remain on.
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onToggle,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
    >
      <span className="flex items-start gap-3">
        <span className="rounded-full border border-white/10 bg-white/[0.04] p-2" style={{ color: accent }}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">{label}</span>
          <span className="block text-xs leading-relaxed text-white/46">{description}</span>
        </span>
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
          checked
            ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
            : "border border-white/10 bg-white/[0.03] text-white/48"
        }`}
      >
        {checked ? "on" : "off"}
      </span>
    </button>
  );
}
