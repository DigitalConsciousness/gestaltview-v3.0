import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SkipForward, CloudMoon } from "lucide-react";
import { VoiceMicButton } from "@/components/VoiceMicButton";

type Fragment = {
  id: string;
  fragmentText: string;
};

const fallbackFragments: Fragment[] = [
  { id: "dream-1", fragmentText: "You are standing in a familiar room. The light on the wall feels warm and kind." },
  { id: "dream-2", fragmentText: "A voice you trust is near. It does not rush you." },
  { id: "dream-3", fragmentText: "The next memory does not have to be complete. It only has to arrive." },
];

export default function DaydreamerMode() {
  const [fragment, setFragment] = useState<Fragment>(fallbackFragments[0]);
  const [resonance, setResonance] = useState(42);
  const [note, setNote] = useState("Take your time.");

  useEffect(() => {
    let active = true;

    async function loadFragment() {
      try {
        const response = await fetch("/api/alzheimers/daydreamer-fragment");
        if (!response.ok) throw new Error("fragment fetch failed");
        const data = (await response.json()) as Fragment;
        if (active && data?.fragmentText) {
          setFragment(data);
          return;
        }
      } catch {
        // fall through to local fallback
      }

      if (active) {
        setFragment(fallbackFragments[Math.floor(Math.random() * fallbackFragments.length)]);
      }
    }

    void loadFragment();
    const timer = window.setInterval(() => setResonance((value) => Math.min(100, value + 3)), 3500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const resonanceLabel = useMemo(
    () => (resonance > 75 ? "open" : resonance > 45 ? "steady" : "soft"),
    [resonance]
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#130B14] p-6 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,190,130,0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(255,120,120,0.18), transparent 24%), radial-gradient(circle at 50% 80%, rgba(255,212,140,0.12), transparent 30%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 42px, 42px 100%",
          maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        }}
      />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FFD8A8]">Daydreamer</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">A slower room for memory, implication, and gentle return.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
            The fragment can arrive from the server or fall back locally. The point is to keep a soft, non-corrective surface where the person can answer, skip, or simply remain.
          </p>

          <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={fragment.id}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg leading-relaxed text-white/90"
              >
                {fragment.fragmentText}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <VoiceMicButton theme="purple" />
            <button
              type="button"
              onClick={() => setNote("You can skip this one and return later.")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
          <p className="mt-3 text-xs text-white/45">{note}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Resonance</p>
                <p className="mt-2 text-2xl font-semibold text-white">{resonance}%</p>
              </div>
              <CloudMoon className="h-5 w-5 text-[#FFD8A8]" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFB36B] via-[#FF7F7F] to-[#FFD8A8]"
                style={{ width: `${resonance}%`, transition: "width 300ms ease" }}
              />
            </div>
            <p className="mt-3 text-sm text-white/55">State: {resonanceLabel}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Soft signals</p>
            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>• No correction pressure.</li>
              <li>• Voice, skip, or pause are all valid.</li>
              <li>• The fragment can be revisited later.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
