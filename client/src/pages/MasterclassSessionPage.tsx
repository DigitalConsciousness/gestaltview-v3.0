/**
 * MasterclassSessionPage.tsx
 * ==========================
 * Full-screen DI session page for the Masterclass curriculum.
 * Mounted at:  /di/:slug
 *              /module/masterclass/:slug
 *
 * Resolves the 404 that occurred when MasterclassPage navigated to /di/:slug
 * after a user confirmed a session launch from the BriefingModal.
 *
 * Architecture:
 *  - Reads the :slug param from wouter
 *  - Looks up the EmbodimentProfile from EMBODIMENT_REGISTRY
 *  - Sets the Billy section to "di-session" so Billy greets with the
 *    correct framing and routes prompts to the right DI context
 *  - Renders a full-screen immersive session UI with:
 *      • DI identity header (name, archetype, foundational truth)
 *      • Billy chat panel (opened automatically on mount)
 *      • Session progress badge (session count from masterclass_progress)
 *      • Back-to-Masterclass breadcrumb
 */

import { useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { EMBODIMENT_REGISTRY } from "@shared/embodiment/generated";
import { useBilly, useBillySection } from "@/components/Billy";
import { useMasterclassProgress } from "@/features/masterclass/useMasterclassProgress";
import { buildMasterclassSessionOpening } from "@/lib/launchCore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProfileColor(slug: string): string {
  // Deterministic accent colour per slug so each DI has a unique visual identity
  const palette = [
    "#00E5FF", // electric cyan
    "#7C3AED", // violet
    "#059669", // emerald
    "#D97706", // amber
    "#DC2626", // red
    "#2563EB", // blue
    "#DB2777", // pink
    "#0891B2", // sky
    "#65A30D", // lime
    "#9333EA", // purple
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff;
  }
  return palette[Math.abs(hash) % palette.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MasterclassSessionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [, setLocation] = useLocation();

  // Register with Billy as the "di-session" section so Billy's framing is correct
  useBillySection("di-session");

  const { openPanel } = useBilly();
  const { progress, recordSession } = useMasterclassProgress();

  // Look up the profile from the registry
  const profile = useMemo(
    () => Object.values(EMBODIMENT_REGISTRY).find((p) => (p.slug as string) === slug) ?? null,
    [slug]
  );

  const publicName = useMemo(
    () =>
      profile
        ? ((profile.publicName ?? profile.immutableCore?.archetype ?? slug) as string)
        : slug,
    [profile, slug]
  );

  const archetype = (profile?.immutableCore?.archetype ?? "") as string;
  const foundationalTruth = (profile?.immutableCore?.foundationalTruth ?? "") as string;
  const voiceTone = (profile?.immutableCore?.voiceTone ?? "") as string;
  const accentColor = getProfileColor(slug);
  const sessionCount = progress[slug]?.session_count ?? 0;

  // Record the session and open Billy on mount
  useEffect(() => {
    if (!slug) return;
    recordSession(slug).catch((err) =>
      console.warn("[MasterclassSession] progress record failed", err)
    );
    // Billy supports the room, while the selected DI profile keeps its own lane.
    if (profile) {
      openPanel(buildMasterclassSessionOpening(profile), "synthesize");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 404 guard — unknown slug
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0F14] text-white flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-white/30 text-sm font-mono">404 · Profile not found</p>
        <h1 className="text-2xl font-bold text-center">
          No Digital Intelligence found for &ldquo;{slug}&rdquo;
        </h1>
        <p className="text-white/40 text-sm max-w-sm text-center">
          This profile may not exist or may not have been compiled into the registry yet.
        </p>
        <button
          onClick={() => setLocation("/module/masterclass")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Masterclass
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      {/* ── Breadcrumb ── */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button
          onClick={() => setLocation("/module/masterclass")}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-xs font-mono uppercase tracking-widest transition-colors mb-8"
        >
          <ArrowLeft className="size-3" />
          Masterclass
        </button>
      </div>

      {/* ── DI Identity Header ── */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12"
          style={{ borderColor: `${accentColor}22` }}
        >
          {/* Accent line */}
          <div
            className="w-12 h-0.5 mb-6 rounded-full"
            style={{ backgroundColor: accentColor }}
          />

          {/* Name + archetype */}
          <div className="mb-6">
            <p className="text-xs font-mono mb-2" style={{ color: `${accentColor}99` }}>
              {slug}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
              {publicName}
            </h1>
            {archetype && (
              <p className="text-white/40 text-sm italic">{archetype}</p>
            )}
          </div>

          {/* Foundational truth */}
          {foundationalTruth && (
            <blockquote
              className="text-base md:text-lg text-white/60 italic leading-relaxed border-l-2 pl-5 mb-6"
              style={{ borderColor: `${accentColor}55` }}
            >
              &ldquo;{foundationalTruth}&rdquo;
            </blockquote>
          )}

          {/* Voice tone */}
          {voiceTone && (
            <p className="text-xs text-white/30 mb-6">
              <span className="text-white/50 not-italic">Tone: </span>
              {voiceTone}
            </p>
          )}

          {/* Session badge */}
          <div className="flex items-center gap-4 flex-wrap">
            {sessionCount > 0 ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border"
                style={{ color: accentColor, borderColor: `${accentColor}44`, backgroundColor: `${accentColor}11` }}
              >
                <GraduationCap className="size-3" />
                {sessionCount} {sessionCount === 1 ? "session" : "sessions"} logged
              </span>
            ) : (
              <span className="text-xs font-mono uppercase tracking-widest text-white/20">
                First session
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Session guidance ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
        >
          <p className="text-white/40 text-sm leading-relaxed">
            Your session with <span className="text-white/70 font-medium">{publicName}</span> is
            now open. Billy is here as guide and thread-keeper while this Digital Intelligence keeps
            its own lane. Be present. Notice what surfaces.
          </p>
          <p className="text-white/20 text-xs mt-3 font-mono">
            Session progress is recorded toward your Masterclass curriculum.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
