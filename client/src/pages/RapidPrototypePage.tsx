import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileCode2, PackagePlus, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";

type Scope = {
  function: string;
  dependencies: string[];
  outputs: string[];
  tier: number;
};

const fallbackScope = (idea: string): Scope => ({
  function: idea ? `Clarify and package: ${idea.slice(0, 72)}` : "Clarify a rough idea and turn it into a buildable slice",
  dependencies: ["Billy synthesis", "route map", "corpus alignment"],
  outputs: ["scope summary", "blueprint", "corpus payload"],
  tier: 2,
});

export default function RapidPrototypePage() {
  useSEO({
    title: "Rapid Prototype Engine | GestaltView",
    description:
      "Idea intake, scope extraction, prototype blueprinting, and push-to-corpus support for the Rapid Prototype Engine.",
    h1: "Rapid Prototype Engine",
    canonical: "https://gestaltview-v2.vercel.app/rapid-prototype",
  });

  const [ideaText, setIdeaText] = useState("");
  const [scope, setScope] = useState<Scope | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [blueprint, setBlueprint] = useState<string[]>([]);
  const [pushState, setPushState] = useState<"idle" | "pushed">("idle");

  const ideaSummary = useMemo(() => ideaText.trim() || "Describe the thing you are trying to make.", [ideaText]);

  const extractScope = async () => {
    setIsExtracting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 850));
    const nextScope = fallbackScope(ideaText.trim());
    setScope(nextScope);
    setBlueprint([
      "Capture intent in one sentence.",
      "Extract the smallest buildable user flow.",
      "Map dependencies, outputs, and a first route.",
      "Prepare a corpus-ready markdown brief.",
    ]);
    setIsExtracting(false);
  };

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,145,0,0.14), transparent 24%), radial-gradient(circle at 80% 10%, rgba(255,122,0,0.16), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 18%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full border border-[#FF8A00]/25 bg-[#FF8A00]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#FFC46B]">
            orange accent
          </span>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard glow="electricPurple" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C89BFF]">Idea intake</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Move from a spark to a scope.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Write the raw idea in your own language. The scope pass keeps the phrasing intact and turns it into the smallest useful build slice.
            </p>

            <div className="mt-6 space-y-4">
              <textarea
                value={ideaText}
                onChange={(event) => setIdeaText(event.target.value)}
                rows={6}
                className="w-full rounded-3xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white outline-none placeholder:text-white/25"
                placeholder="What do you want to prototype?"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={extractScope}
                className="inline-flex items-center gap-2 rounded-full border border-[#B026FF]/25 bg-[#B026FF]/14 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B026FF]/22"
                >
                  <Zap className="h-4 w-4" />
                  {isExtracting ? "Extracting scope..." : "Extract scope"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/70"
                >
                  Voice capture
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
              Scope reveal
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The extracted shape animates into view.</h2>
            <AnimatePresence mode="wait">
              {scope ? (
                <motion.div
                  key="scope"
                  initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-5 space-y-4"
                >
                  <GlassCard glow="electricPurple" intensity="medium" className="p-4" hover={false}>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#C89BFF]">Function</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{scope.function}</p>
                  </GlassCard>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <GlassCard glow="none" intensity="medium" className="p-4" hover={false}>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/35">Dependencies</p>
                      <ul className="mt-2 space-y-1 text-sm text-white/65">
                        {scope.dependencies.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </GlassCard>
                    <GlassCard glow="none" intensity="medium" className="p-4" hover={false}>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/35">Outputs</p>
                      <ul className="mt-2 space-y-1 text-sm text-white/65">
                        {scope.outputs.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>
                </motion.div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                  Submit an idea to reveal the scope.
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <GlassCard glow="electricPurple" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C89BFF]">
                  Prototype blueprint
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Blueprint-ready output</h2>
              </div>
              <FileCode2 className="h-5 w-5 text-[#C89BFF]" />
            </div>
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4">
              {blueprint.length > 0 ? (
                <ol className="space-y-2 text-sm text-white/65">
                  {blueprint.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="font-mono text-[#C89BFF]">{String(index + 1).padStart(2, "0")}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-white/45">Blueprint will appear after scope extraction.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
              Push to corpus
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Package the prototype as a markdown record.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              The push action would hand the scope, blueprint, and raw idea into the corpus repository. In this implementation it is a local intent capture with a visible success state.
            </p>
            <button
              type="button"
              onClick={() => setPushState("pushed")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#B026FF]/25 bg-[#B026FF]/14 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B026FF]/22"
            >
              <PackagePlus className="h-4 w-4" />
              Push to corpus
            </button>
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Markdown payload</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
                {`# ${scope?.function ?? "Prototype brief"}\n\n- Idea: ${ideaSummary}\n- Tier: ${scope?.tier ?? 2}\n- Dependencies: ${(scope?.dependencies ?? []).join(", ")}\n- Outputs: ${(scope?.outputs ?? []).join(", ")}`}
              </p>
            </div>
            {pushState === "pushed" ? <p className="mt-4 text-sm text-[#C89BFF]">Recorded locally as a corpus-ready draft.</p> : null}
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
