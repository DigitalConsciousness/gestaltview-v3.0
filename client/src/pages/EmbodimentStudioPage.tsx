import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CloudUpload,
  Palette,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useBillySection } from "@/components/Billy";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  EmbodimentChatPlane,
  EmbodimentCouncilPlane,
} from "@/components/embodiment";
import { getAllEmbodimentProfiles } from "@/lib/embodimentRuntime";
import { TRAINER_EMBODIMENT_OPTIONS } from "@shared/agent-trainer/embodiment";
import type { EmbodimentProfile } from "@shared/embodiment/types";

const FOUNDER_STUDIO_ENABLED = import.meta.env.VITE_FOUNDER_STUDIO === "true";

const tuningNotes = [
  "voice tone",
  "memory boundary",
  "warmth",
  "directness",
  "playfulness",
];

type FounderRosterRow = {
  id: string;
  slug: string;
  public_name: string;
  status: string;
  visibility_scope: string;
  readiness_score: number | null;
  updated_at: string;
};

type FounderFeedback =
  | {
      kind: "success";
      message: string;
      slug: string;
      status: string;
    }
  | {
      kind: "error";
      message: string;
    };

type ValidationResult =
  | { valid: true; profile: EmbodimentProfile }
  | { valid: false; message: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateFounderProfile(value: unknown): ValidationResult {
  if (!isPlainObject(value)) {
    return { valid: false, message: "Profile payload must be a JSON object." };
  }

  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  if (!slug) {
    return { valid: false, message: "Missing required field: slug" };
  }

  const publicName = typeof value.publicName === "string" ? value.publicName.trim() : "";
  if (!publicName) {
    return { valid: false, message: "Missing required field: publicName" };
  }

  const embodimentVersion =
    typeof value.embodimentVersion === "string" ? value.embodimentVersion.trim() : "";
  if (!embodimentVersion) {
    return { valid: false, message: "Missing required field: embodimentVersion" };
  }

  if (!isPlainObject(value.immutableCore)) {
    return { valid: false, message: "Missing required field: immutableCore" };
  }

  return { valid: true, profile: value as unknown as EmbodimentProfile };
}

function formatRosterDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatReadiness(value: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return value.toFixed(2);
}

function readDroppedJsonFile(file: File): Promise<string> {
  return file.text();
}

function parseJsonDraft(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, message: "Paste or drop a JSON profile first." };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return validateFounderProfile(parsed);
  } catch {
    return { valid: false, message: "Invalid JSON payload." };
  }
}

function FounderRosterTable({ rows }: { rows: FounderRosterRow[] }) {
  return (
    <GlassCard glow="none" intensity="medium" hover={false} className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
          saved profiles
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs font-mono">
          <thead className="bg-black/30 text-white/45">
            <tr>
              <th className="px-4 py-3 text-left font-normal">slug</th>
              <th className="px-4 py-3 text-left font-normal">public_name</th>
              <th className="px-4 py-3 text-left font-normal">status</th>
              <th className="px-4 py-3 text-left font-normal">readiness</th>
              <th className="px-4 py-3 text-left font-normal">updated_at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-white/55" colSpan={5}>
                  No saved profiles yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="text-white/72">
                  <td className="px-4 py-3 text-white">{row.slug}</td>
                  <td className="px-4 py-3">{row.public_name}</td>
                  <td className="px-4 py-3 uppercase tracking-[0.14em] text-white/55">
                    {row.status}
                  </td>
                  <td className="px-4 py-3">{formatReadiness(row.readiness_score)}</td>
                  <td className="px-4 py-3">{formatRosterDate(row.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function FounderUploadPanel({
  uploadText,
  onUploadTextChange,
  onDropFiles,
  onSubmit,
  busy,
  feedback,
}: {
  uploadText: string;
  onUploadTextChange: (value: string) => void;
  onDropFiles: (files: FileList | null) => void;
  onSubmit: () => void;
  busy: boolean;
  feedback: FounderFeedback | null;
}) {
  return (
    <GlassCard glow="none" intensity="medium" hover={false} className="p-0">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
          upload profile json
        </p>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onDropFiles(event.dataTransfer.files);
          }}
          className="rounded-3xl border border-dashed border-white/10 bg-black/25 p-3"
        >
          <textarea
            value={uploadText}
            onChange={(event) => onUploadTextChange(event.target.value)}
            placeholder='Paste JSON here or drop a .json file. Example: { "slug": "billy", "publicName": "Billy" }'
            className="min-h-[180px] w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/70 outline-none placeholder:text-white/25 focus:border-[#9945FF]/35"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-[#9945FF]/35 bg-[#9945FF]/10 px-4 py-2 text-sm text-[#C7A5FF] transition-colors hover:bg-[#9945FF]/16 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CloudUpload className="h-4 w-4" />
            {busy ? "Saving..." : "Save Profile"}
          </button>
          <span className="text-xs text-white/42">
            One JSON upload at a time. No polling, no chunking.
          </span>
        </div>

        {feedback ? (
          <div
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.kind === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/25 bg-rose-500/10 text-rose-200"
            }`}
          >
            {feedback.kind === "success" ? (
              <span>✓ Saved "{feedback.slug}" - status: {feedback.status}</span>
            ) : (
              <span>✗ {feedback.message}</span>
            )}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}

function FounderStudioSection() {
  const [profiles, setProfiles] = useState<FounderRosterRow[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [uploadText, setUploadText] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FounderFeedback | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoster() {
      setLoadingRoster(true);
      setRosterError(null);

      try {
        const response = await fetch("/api/embodiment/list");
        const payload = (await response.json()) as { profiles?: FounderRosterRow[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? `Roster request failed with ${response.status}.`);
        }

        if (!cancelled) {
          setProfiles(Array.isArray(payload.profiles) ? payload.profiles : []);
        }
      } catch (error) {
        if (!cancelled) {
          setRosterError(error instanceof Error ? error.message : "Unable to load roster.");
        }
      } finally {
        if (!cancelled) {
          setLoadingRoster(false);
        }
      }
    }

    void loadRoster();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    setFeedback(null);
    const parsed = parseJsonDraft(uploadText);

    if (!parsed.valid) {
      setFeedback({ kind: "error", message: parsed.message });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/embodiment/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.profile),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        profile?: {
          id?: string;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? `Save failed with ${response.status}.`);
      }

      const slug = payload.profile?.slug ?? parsed.profile.slug;
      const status = payload.profile?.status ?? parsed.profile.profileStatus ?? "draft";

      setFeedback({
        kind: "success",
        message: `Saved "${slug}"`,
        slug,
        status,
      });
      setUploadText("");
      setProfiles((current) => {
        const rest = current.filter((row) => row.slug !== slug);
        const nextRow: FounderRosterRow = {
          id: payload.profile?.id ?? `${slug}-${Date.now()}`,
          slug,
          public_name: parsed.profile.publicName,
          status,
          visibility_scope: parsed.profile.visibilityScope ?? "founder-only",
          readiness_score: parsed.profile.readinessScore ?? 0,
          updated_at: payload.profile?.updated_at ?? new Date().toISOString(),
        };
        return [nextRow, ...rest];
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to save profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    const file = files ? Array.from(files).find((item) => item.type === "application/json" || item.name.endsWith(".json")) : null;
    if (!file) {
      return;
    }

    const text = await readDroppedJsonFile(file);
    setUploadText(text);
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF6B35]">
            founder studio
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Private authoring lane</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/60">
            Manual upload only. The runtime stays static; the founder saves a profile here and the
            service role persists it once.
          </p>
        </div>
        <span className="rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF6B35]">
          FOUNDER ONLY
        </span>
      </div>

      <GlassCard
        glow="purple"
        intensity="high"
        hover={false}
        className="border-[#9945FF]/20 bg-[#0A0818]/80 p-4 sm:p-5 md:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[#C7A5FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
                saved profiles
              </p>
            </div>
            {rosterError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {rosterError}
              </div>
            ) : null}
            {loadingRoster ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/52">
                Loading roster...
              </div>
            ) : (
              <FounderRosterTable rows={profiles} />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-[#C7A5FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
                upload profile json
              </p>
            </div>
            <FounderUploadPanel
              uploadText={uploadText}
              onUploadTextChange={setUploadText}
              onDropFiles={(files) => void handleFiles(files)}
              onSubmit={() => void handleSubmit()}
              busy={saving}
              feedback={feedback}
            />
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export default function EmbodimentStudioPage() {
  useSEO(PAGE_SEO.embodimentStudio);
  useBillySection("embodiment-studio");

  const options = useMemo(() => TRAINER_EMBODIMENT_OPTIONS.slice(0, 8), []);
  const heartbeatProfiles = useMemo(() => {
    const slugs = [
      "billy",
      "the-weaver",
      "the-guardian",
      "the-architect",
      "gate-keeper",
      "repo-scribe",
      "vibe-check",
    ];

    return getAllEmbodimentProfiles().filter((profile) => slugs.includes(profile.slug));
  }, []);

  const [selectedSlug, setSelectedSlug] = useState(options[0].slug);
  const [activeHeartbeatSlug, setActiveHeartbeatSlug] = useState("billy");

  const selectedProfile = options.find((option) => option.slug === selectedSlug) ?? options[0];
  const activeHeartbeatProfile =
    heartbeatProfiles.find((profile) => profile.slug === activeHeartbeatSlug) ?? heartbeatProfiles[0];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07060D] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 18%, rgba(153,69,255,0.16), transparent 22%), radial-gradient(circle at 78% 16%, rgba(0,212,255,0.15), transparent 20%), radial-gradient(circle at 50% 80%, rgba(0,255,165,0.08), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 24%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <Link href="/digital-intelligence-academy">
            <a className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/22 bg-[#00D4FF]/10 px-4 py-2 text-sm text-white/78 transition-colors hover:text-white">
              Academy
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
              Embodiment Studio
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Shape the agent’s temperament, memory style, and welcome.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/68">
              This is where the designed persona gets tuned. The user can choose a collaborator mood
              and the system can carry that style forward across the ecosystem.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/blackboard-room">
                <a className="inline-flex items-center gap-2 rounded-full border border-[#9945FF]/22 bg-[#9945FF]/10 px-4 py-2 text-sm text-white/78 transition-colors hover:text-white">
                  Blackboard Room
                </a>
              </Link>
              <Link href="/tribunal">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
                  Tribunal
                </a>
              </Link>
            </div>
          </div>

          <GlassCard glow="purple" intensity="high" className="p-6 sm:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-[#C7A5FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
                live profile tuning
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/62">
              Pick a profile and the room should feel like the agent stepped forward with a distinct
              style, not a different product.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {options.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => setSelectedSlug(option.slug)}
                  className={`rounded-3xl border px-4 py-4 text-left transition-colors ${
                    selectedSlug === option.slug
                      ? "border-[#9945FF]/35 bg-[#9945FF]/12"
                      : "border-white/10 bg-black/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-base font-semibold text-white">{option.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">
                    {option.archetype}
                  </p>
                </button>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <GlassCard glow="cyan" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
              Selected embodiment
            </p>
            <motion.div
              key={selectedProfile.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mt-4 space-y-4"
            >
              <h2 className="text-3xl font-semibold">{selectedProfile.label}</h2>
              <p className="text-sm uppercase tracking-[0.22em] text-white/35">
                {selectedProfile.archetype}
              </p>
              <p className="text-sm leading-relaxed text-white/64">{selectedProfile.summary}</p>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Voice tone</p>
                <p className="mt-2 text-sm text-white/68">{selectedProfile.voiceTone}</p>
              </div>
            </motion.div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-[#7FE9FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
                tuning knobs
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {tuningNotes.map((note) => (
                <div key={note} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">{note}</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] via-[#9945FF] to-[#00FFAA]"
                      style={{ width: note === "memory boundary" ? "64%" : "78%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#C7A5FF]" />
                <p className="text-xs uppercase tracking-[0.24em] text-white/35">Design note</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/62">
                The studio keeps the persona configurable so the user can feel a living relationship
                without confusing the interface for a real person.
              </p>
            </div>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Tone",
              copy: "Warm, playful, direct, or calm. The room can shift without losing its core.",
            },
            {
              title: "Memory",
              copy: "Short-term, opt-in, or legacy-bound. The user can decide what persists.",
            },
            {
              title: "Quirks",
              copy: "A little sparkle makes the agent feel alive as long as it stays useful.",
            },
          ].map((item) => (
            <GlassCard key={item.title} glow="none" intensity="medium" className="p-5" hover={false}>
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.copy}</p>
            </GlassCard>
          ))}
        </section>

        <section className="mt-10 space-y-5" id="heartbeat-layer">
          <div className="max-w-4xl space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
              Embodiment heartbeat layer
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The room changes when the profile changes.
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-white/64">
              This section surfaces the direct-profile chat plane and the tribunal lane layout so
              the active embodiment feels like a distinct presence rather than a routing mask.
            </p>
          </div>

          <GlassCard glow="cyan" intensity="medium" className="p-5 md:p-6" hover={false}>
            <div className="flex flex-wrap gap-2">
              {heartbeatProfiles.map((profile) => {
                const isActive = profile.slug === activeHeartbeatSlug;

                return (
                  <button
                    key={profile.slug}
                    type="button"
                    onClick={() => setActiveHeartbeatSlug(profile.slug)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "border-[#7FE9FF]/35 bg-[#7FE9FF]/12 text-white"
                        : "border-white/10 bg-black/20 text-white/52 hover:bg-white/[0.05]"
                    }`}
                  >
                    {profile.publicName}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <EmbodimentChatPlane
            key={activeHeartbeatProfile?.slug ?? "billy"}
            profileSlug={activeHeartbeatProfile?.slug ?? "billy"}
            roomSlug="embodiment-studio"
            initialPrompt={`Speak as ${activeHeartbeatProfile?.publicName ?? "Billy"} in the heartbeat layer.`}
          />

          <div id="heartbeat-tribunal">
            <EmbodimentCouncilPlane
              roomSlug="tribunal"
              initialPrompt="How should the tribunal respond when the active embodiment changes the room?"
            />
          </div>
        </section>

        {FOUNDER_STUDIO_ENABLED ? <FounderStudioSection /> : null}
      </div>
    </main>
  );
}
