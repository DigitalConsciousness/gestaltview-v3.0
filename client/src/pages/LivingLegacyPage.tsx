import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import DaydreamerMode from "@/components/alzheimers/DaydreamerMode";
import HeirloomCompanion from "@/components/HeirloomCompanion";
import { GlassCard } from "@/components/ui/GlassCard";

type Mode = "Life Tapestry" | "Heirloom Companion" | "Daydreamer";

const tapestryThreads = [
  {
    title: "Love Letters to Carl",
    description: "A long relationship held together by ritual, voice, and repetition.",
  },
  {
    title: "Maggie's Map",
    description: "The places that taught the family how to belong to one another.",
  },
  {
    title: "Bucket Drops",
    description: "Messages, recipes, and future instructions that should survive the moment.",
  },
];

export default function LivingLegacyPage() {
  useSEO({
    title: "Memory Continuity | GestaltView",
    description:
      "A warm continuity surface with Life Tapestry, Heirloom Companion, and Daydreamer modes.",
    h1: "Memory Continuity",
    canonical: "https://gestaltview-v2.vercel.app/heirloom-companion",
  });

  const [mode, setMode] = useState<Mode>("Life Tapestry");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#10080D] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,190,130,0.20), transparent 24%), radial-gradient(circle at 80% 10%, rgba(255,128,160,0.18), transparent 22%), radial-gradient(circle at 45% 80%, rgba(255,220,160,0.12), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 25%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <Link href="/heirloom-companion">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Open Heirloom Companion
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        </div>

        <header className="mt-14 max-w-4xl space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FFD8A8]">Warm aurora</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Memory Continuity keeps the person intact across memory, voice, and time.
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-white/68">
            Three modes sit on the same surface: Life Tapestry for threads, Heirloom Companion for voice, and Daydreamer for softer return.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap gap-3">
          {(["Life Tapestry", "Heirloom Companion", "Daydreamer"] as Mode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full border px-5 py-3 text-sm transition-colors ${
                mode === item
                  ? "border-[#FFB36B]/30 bg-[#FFB36B]/14 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/68 hover:bg-white/[0.05]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <GlassCard glow="teal" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#8CEBFF]">Mode summary</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 space-y-4"
              >
                {mode === "Life Tapestry" ? (
                  <>
                    <h2 className="text-2xl font-semibold">A chronological weave of life threads.</h2>
                    <p className="text-sm leading-relaxed text-white/60">
                      The tapestry mode emphasizes stories, anchors, and emotional continuity instead of diagnosis.
                    </p>
                    <div className="space-y-3">
                      {tapestryThreads.map((thread) => (
                        <div key={thread.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                          <p className="font-semibold">{thread.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/62">{thread.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}

                {mode === "Heirloom Companion" ? (
                  <>
                    <h2 className="text-2xl font-semibold">A companion voice that never replaces the person.</h2>
                    <p className="text-sm leading-relaxed text-white/60">
                      The surface gives space for gentle echo, family context, and careful language preservation.
                    </p>
                  </>
                ) : null}

                {mode === "Daydreamer" ? (
                  <>
                    <h2 className="text-2xl font-semibold">A softer room for fragments and return.</h2>
                    <p className="text-sm leading-relaxed text-white/60">
                      Daydreamer slows the interaction down, offers a fragment, and lets the person answer or skip without pressure.
                    </p>
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <Sparkles className="h-5 w-5 text-[#8CEBFF]" />
                      <p className="mt-3 text-sm text-white/62">Warm aurora palette, gentle transitions, no correction pressure.</p>
                    </div>
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {mode === "Life Tapestry" ? (
                  <div className="space-y-4">
                    {tapestryThreads.map((thread, index) => (
                      <GlassCard key={thread.title} glow="teal" intensity="low" className="p-4" hover={false}>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/35">Thread {index + 1}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{thread.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/62">{thread.description}</p>
                      </GlassCard>
                    ))}
                  </div>
                ) : null}

                {mode === "Heirloom Companion" ? <HeirloomCompanion userName="Your Loved One" /> : null}

                {mode === "Daydreamer" ? <DaydreamerMode /> : null}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
