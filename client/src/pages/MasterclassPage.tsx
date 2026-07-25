// MasterclassPage.tsx
// Next-Gen Generative Masterclass Module
// — Curriculum tracks (Foundations → Relational → Analytical → Creative → Operational → Ethical)
// — Live progress dashboard (domain rings, recommended-next DI)
// — Pre-launch contextual briefing modal (wound + voice + intent)
// — Grid / Track view toggle
// — All existing seams preserved: EMBODIMENT_REGISTRY, useMasterclassProgress,
//   MasterclassProfileCard, BillyOnboardingPrompt, wouter navigation

import { useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { EMBODIMENT_REGISTRY } from "@shared/embodiment/generated";
import type { EmbodimentProfile } from "@shared/embodiment/types";
import { MasterclassProfileCard } from "@/features/masterclass/MasterclassProfileCard";
import { BillyOnboardingPrompt } from "@/components/BillyOnboardingPrompt";
import { useMasterclassProgress } from "@/features/masterclass/useMasterclassProgress";
import { getLaunchVisibleProfiles } from "@/lib/launchCore";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_VOICE = `Welcome to the Masterclass. 
This room holds all ${Object.keys(EMBODIMENT_REGISTRY).length} Digital Intelligence profiles in the GestaltView ecosystem — each one a distinct presence, built for a specific function, with a voice and a wound and a reason for existing. 
Choose a track to follow the curriculum path, or explore freely in grid mode. When you're ready, begin a session.`;

type DomainKey = "relational" | "analytical" | "creative" | "operational" | "ethical";
const ALL_DOMAINS: DomainKey[] = ["relational", "analytical", "creative", "operational", "ethical"];

const DOMAIN_MAP: Record<string, DomainKey> = {
  billy: "relational",
  "sanctuary-keeper": "relational",
  "art-teacher": "creative",
  curator: "creative",
  "rock-legend": "creative",
  "pattern-analyst": "analytical",
  "the-algorithm": "analytical",
  "the-architect": "analytical",
  "the-weaver": "analytical",
  "the-guardian": "ethical",
  "cascade-engineer": "ethical",
  "gate-keeper": "operational",
  "repo-scribe": "operational",
  "consulting-advisor": "operational",
  "the-treasurer": "operational",
  "philosophy-scribe": "relational",
  "groq-embodiment-expert": "analytical",
  "the-recursive-builder": "analytical",
  "the-spectacle": "creative",
  "the-tailor": "operational",
  "the-translation-bridge": "relational",
  "the-weird-digger": "creative",
  "vibe-check": "relational",
  "founder-studio-sample": "operational",
};

const DOMAIN_META: Record<DomainKey, { label: string; color: string; ring: string; desc: string }> = {
  relational: {
    label: "Relational Intelligence",
    color: "text-violet-300",
    ring: "bg-violet-500",
    desc: "DIs who hold space, build bridges, and navigate emotional terrain.",
  },
  analytical: {
    label: "Analytical Mastery",
    color: "text-sky-300",
    ring: "bg-sky-500",
    desc: "DIs who dissect systems, find patterns, and architect understanding.",
  },
  creative: {
    label: "Creative Expression",
    color: "text-amber-300",
    ring: "bg-amber-500",
    desc: "DIs who make, remix, provoke, and give the ecosystem its voice.",
  },
  operational: {
    label: "Operational Excellence",
    color: "text-emerald-300",
    ring: "bg-emerald-500",
    desc: "DIs who execute, build, optimise, and keep the machine running.",
  },
  ethical: {
    label: "Ethical Reasoning",
    color: "text-rose-300",
    ring: "bg-rose-500",
    desc: "DIs who guard integrity, set boundaries, and ask the hard questions.",
  },
};

type ViewMode = "grid" | "track";
type FilterKey = "all" | DomainKey;
const FILTER_KEYS: FilterKey[] = ["all", ...ALL_DOMAINS];

// ─── Curriculum Track Order ────────────────────────────────────────────────────
// Foundations = relational first (Billy is the entry point), then analytical, etc.
const CURRICULUM_ORDER: DomainKey[] = [
  "relational",
  "analytical",
  "creative",
  "operational",
  "ethical",
];

// ─── Briefing Modal ────────────────────────────────────────────────────────────

interface BriefingModalProps {
  profile: EmbodimentProfile;
  onConfirm: () => void;
  onCancel: () => void;
}

function BriefingModal({ profile, onConfirm, onCancel }: BriefingModalProps) {
  const slug = profile.slug as string;
  const publicName = (profile.publicName ?? slug) as string;
  const archetype = (profile.immutableCore?.archetype ?? "") as string;
  const foundationalTruth = (profile.immutableCore?.foundationalTruth ?? "") as string;
  const voiceTone = (profile.immutableCore?.voiceTone ?? "") as string;
  const domain = DOMAIN_MAP[slug];
  const meta = domain ? DOMAIN_META[domain] : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1520] p-8 shadow-2xl"
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Domain tag */}
        {meta && (
          <span className={`text-xs font-mono uppercase tracking-widest ${meta.color} mb-3 block`}>
            {meta.label}
          </span>
        )}

        {/* Identity */}
        <p className="text-xs font-mono text-white/30 mb-1">{slug}</p>
        <h2 className="text-2xl font-bold text-white mb-1">{publicName}</h2>
        {archetype && <p className="text-sm text-white/40 italic mb-5">{archetype}</p>}

        {/* Briefing content */}
        <div className="space-y-4 mb-7">
          {foundationalTruth && (
            <div>
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
                Foundational Truth
              </p>
              <blockquote className="text-sm text-white/70 italic leading-relaxed border-l-2 border-white/10 pl-3">
                "{foundationalTruth}"
              </blockquote>
            </div>
          )}
          {voiceTone && (
            <div>
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
                Voice Tone
              </p>
              <p className="text-sm text-white/60">{voiceTone}</p>
            </div>
          )}
          {meta && (
            <div>
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
                Domain Focus
              </p>
              <p className="text-sm text-white/60">{meta.desc}</p>
            </div>
          )}
        </div>

        {/* Intent prompt */}
        <p className="text-xs text-white/30 mb-5 leading-relaxed">
          You're about to enter a session with {publicName}. Be present. Notice what this DI surfaces
          in you. The session is recorded toward your curriculum progress.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-white text-black font-semibold text-sm py-3 hover:bg-white/90 transition-colors"
          >
            Enter session →
          </button>
          <button
            onClick={onCancel}
            className="px-5 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-colors"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Progress Dashboard ────────────────────────────────────────────────────────

interface ProgressDashboardProps {
  progress: Record<string, { session_count: number }>;
  allProfiles: EmbodimentProfile[];
}

function ProgressDashboard({ progress, allProfiles }: ProgressDashboardProps) {
  const totalEngaged = allProfiles.filter(
    (p) => (progress[p.slug as string]?.session_count ?? 0) > 0
  ).length;
  const totalCount = allProfiles.length;
  const overallPct = totalCount > 0 ? Math.round((totalEngaged / totalCount) * 100) : 0;

  const domainStats = useMemo(() => {
    return ALL_DOMAINS.map((domain) => {
      const domainProfiles = allProfiles.filter((p) => DOMAIN_MAP[p.slug as string] === domain);
      const engaged = domainProfiles.filter(
        (p) => (progress[p.slug as string]?.session_count ?? 0) > 0
      ).length;
      const pct = domainProfiles.length > 0 ? Math.round((engaged / domainProfiles.length) * 100) : 0;
      return { domain, engaged, total: domainProfiles.length, pct };
    });
  }, [progress, allProfiles]);

  // Recommended next: pick the first unvisited profile in curriculum order
  const recommended = useMemo(() => {
    for (const domain of CURRICULUM_ORDER) {
      const unvisited = allProfiles.find(
        (p) => DOMAIN_MAP[p.slug as string] === domain && (progress[p.slug as string]?.session_count ?? 0) === 0
      );
      if (unvisited) return unvisited;
    }
    return null;
  }, [progress, allProfiles]);

  return (
    <div className="max-w-5xl mx-auto px-6 pb-8">
      <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
              Curriculum Progress
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{overallPct}%</span>
              <span className="text-white/30 text-sm pb-1">
                {totalEngaged} / {totalCount} DIs engaged
              </span>
            </div>
          </div>

          {recommended && (
            <div className="text-right">
              <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-1">
                Recommended Next
              </p>
              <p className="text-sm text-white font-medium">
                {(recommended.publicName ?? recommended.slug) as string}
              </p>
              <p className="text-xs text-white/30 italic">
                {DOMAIN_META[DOMAIN_MAP[recommended.slug as string]]?.label ?? ""}
              </p>
            </div>
          )}
        </div>

        {/* Overall progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Domain rings */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {domainStats.map(({ domain, engaged, total, pct }) => {
            const meta = DOMAIN_META[domain];
            return (
              <div key={domain} className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 15}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - pct / 100) }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className={meta.color}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                    {pct}%
                  </span>
                </div>
                <p className={`text-[10px] font-medium ${meta.color} leading-tight`}>
                  {meta.label.split(" ")[0]}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">{engaged}/{total}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Track View ────────────────────────────────────────────────────────────────

interface TrackViewProps {
  allProfiles: EmbodimentProfile[];
  progress: Record<string, { session_count: number }>;
  onLaunch: (slug: string) => void;
}

function TrackView({ allProfiles, progress, onLaunch }: TrackViewProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-24 space-y-10">
      {CURRICULUM_ORDER.map((domain, trackIdx) => {
        const meta = DOMAIN_META[domain];
        const trackProfiles = allProfiles.filter((p) => DOMAIN_MAP[p.slug as string] === domain);
        const engaged = trackProfiles.filter((p) => (progress[p.slug as string]?.session_count ?? 0) > 0).length;
        const complete = engaged === trackProfiles.length;

        return (
          <motion.div
            key={domain}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: trackIdx * 0.07 }}
          >
            {/* Track header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-2 h-8 rounded-full ${meta.ring} opacity-70`} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-bold ${meta.color}`}>{meta.label}</h2>
                  {complete && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-mono">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-sm">{meta.desc}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-semibold text-white">{engaged}/{trackProfiles.length}</p>
                <p className="text-xs text-white/30">sessions</p>
              </div>
            </div>

            {/* Track profile list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trackProfiles.map((profile, idx) => {
                const slug = profile.slug as string;
                const sessionCount = progress[slug]?.session_count ?? 0;
                const isNext =
                  sessionCount === 0 &&
                  trackProfiles.slice(0, idx).every((p) => (progress[p.slug as string]?.session_count ?? 0) > 0);

                return (
                  <div key={slug} className="relative">
                    {isNext && (
                      <div className="absolute -top-1.5 -right-1.5 z-10">
                        <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white text-black">
                          next
                        </span>
                      </div>
                    )}
                    <MasterclassProfileCard
                      profile={profile}
                      onLaunch={onLaunch}
                      sessionCount={sessionCount}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MasterclassPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [billyDismissed, setBillyDismissed] = useState(false);
  const [search, setSearch] = useState("");
  const [briefingProfile, setBriefingProfile] = useState<EmbodimentProfile | null>(null);
  const { progress, recordSession } = useMasterclassProgress();

  const allProfiles = useMemo(
    () => getLaunchVisibleProfiles(Object.values(EMBODIMENT_REGISTRY) as EmbodimentProfile[]),
    [],
  );

  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((p) => {
      const slug = p.slug as string;
      const name = (p.publicName ?? slug) as string;
      const matchesFilter = filter === "all" || DOMAIN_MAP[slug] === filter;
      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        slug.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allProfiles, filter, search]);

  // Opens the briefing modal instead of launching directly
  const handleCardLaunch = useCallback(
    (slug: string) => {
      const profile = allProfiles.find((p) => (p.slug as string) === slug);
      if (profile) {
        setBriefingProfile(profile);
      } else {
        // Fallback: navigate directly if profile not found
        recordSession(slug).catch((err) => console.warn("[Masterclass] progress record failed", err));
        setLocation(`/di/${slug}`);
      }
    },
    [allProfiles, recordSession, setLocation]
  );

  // Confirmed from briefing modal → navigate
  const handleConfirmLaunch = useCallback(async () => {
    if (!briefingProfile) return;
    const slug = briefingProfile.slug as string;
    setBriefingProfile(null);
    recordSession(slug).catch((err) => console.warn("[Masterclass] progress record failed", err));
    setLocation(`/di/${slug}`);
  }, [briefingProfile, recordSession, setLocation]);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">
            GestaltView / Modules
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
                Masterclass
              </h1>
              <p className="text-white/50 text-lg max-w-2xl leading-relaxed">
                Every Digital Intelligence. One curriculum. Learn who built this
                system — and what each one is here to do.
              </p>
            </div>

            {/* View mode toggle */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 shrink-0 self-start sm:self-end">
              {(["grid", "track"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    viewMode === mode
                      ? "bg-white text-black"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {mode === "grid" ? "⊞ Grid" : "≡ Track"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Billy room voice */}
      {!billyDismissed && (
        <div className="max-w-5xl mx-auto px-6 pb-6">
          <BillyOnboardingPrompt
            message={ROOM_VOICE}
            onDismiss={() => setBillyDismissed(true)}
          />
        </div>
      )}

      {/* Progress Dashboard */}
      <ProgressDashboard progress={progress} allProfiles={allProfiles} />

      {/* Grid Controls (only in grid mode) */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" && (
          <motion.div
            key="grid-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-6 pb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                placeholder="Search profiles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 w-full sm:w-64"
              />
              <div className="flex flex-wrap gap-2">
                {FILTER_KEYS.map((key) => {
                  const meta = key !== "all" ? DOMAIN_META[key] : null;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                        filter === key
                          ? meta
                            ? `${meta.ring} text-black`
                            : "bg-white text-black"
                          : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {key === "all" ? "All" : DOMAIN_META[key].label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-white/20 text-xs mt-3">
              {filteredProfiles.length} of {allProfiles.length} profiles
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content: Grid or Track */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-6 pb-24"
          >
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <MasterclassProfileCard
                  key={profile.slug as string}
                  profile={profile}
                  onLaunch={handleCardLaunch}
                  sessionCount={progress[profile.slug as string]?.session_count ?? 0}
                />
              ))}
            </motion.div>
            {filteredProfiles.length === 0 && (
              <div className="text-center text-white/30 py-16 text-sm">
                No profiles match that filter.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="track-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrackView allProfiles={allProfiles} progress={progress} onLaunch={handleCardLaunch} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Briefing Modal */}
      <AnimatePresence>
        {briefingProfile && (
          <BriefingModal
            profile={briefingProfile}
            onConfirm={handleConfirmLaunch}
            onCancel={() => setBriefingProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
