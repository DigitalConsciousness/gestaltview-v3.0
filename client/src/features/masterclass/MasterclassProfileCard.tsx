// MasterclassProfileCard.tsx
// Displays a single embodiment profile in the Masterclass room.
// Slice 1: static card with hover expand. Session launch wired in Slice 2.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmbodimentProfile } from "@shared/embodiment/types";

interface Props {
  profile: EmbodimentProfile;
  onLaunch?: (slug: string) => void | Promise<void>;
  sessionCount?: number;
}

export function MasterclassProfileCard({ profile, onLaunch, sessionCount = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const slug = profile.slug as string;
  const publicName = (profile.publicName ?? profile.immutableCore?.archetype ?? slug) as string;
  const archetype = (profile.immutableCore?.archetype ?? "") as string;
  const foundationalTruth = (profile.immutableCore?.foundationalTruth ?? "") as string;
  const voiceTone = (profile.immutableCore?.voiceTone ?? "") as string;

  return (
    <motion.div
      layout
      className="relative rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer overflow-hidden"
      onClick={() => setExpanded((v) => !v)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-white/30 mb-1 truncate">{slug}</p>
            <h3 className="text-white font-semibold text-base leading-snug">{publicName}</h3>
            {archetype && (
              <p className="text-white/40 text-xs mt-0.5 italic">{archetype}</p>
            )}
            {sessionCount > 0 && (
              <p className="mt-2 text-[0.68rem] font-mono uppercase tracking-[0.18em] text-emerald-200/60">
                {sessionCount} {sessionCount === 1 ? "session" : "sessions"} logged
              </p>
            )}
          </div>
          <motion.span
            className="text-white/30 text-xs mt-1 shrink-0"
            animate={{ rotate: expanded ? 180 : 0 }}
          >
            ▾
          </motion.span>
        </div>
      </div>

      {/* Expand panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-white/[0.06] pt-3">
              {foundationalTruth && (
                <blockquote className="text-sm text-white/60 italic leading-relaxed">
                  &ldquo;{foundationalTruth}&rdquo;
                </blockquote>
              )}
              {voiceTone && (
                <p className="text-xs text-white/30">
                  <span className="text-white/50 not-italic">Tone: </span>
                  {voiceTone}
                </p>
              )}
              {onLaunch && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunch(slug);
                  }}
                  className="mt-2 w-full rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 transition-colors font-medium"
                >
                  Begin session with {publicName}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
