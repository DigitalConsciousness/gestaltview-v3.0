import { Link } from "wouter";
import { ArrowRight, PlayCircle, Sparkles, TabletSmartphone } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";

const demoEntrypoints = [
  {
    href: "/",
    title: "Public home",
    blurb: "Start with the main platform story and route map.",
  },
  {
    href: "/pricing",
    title: "Pricing",
    blurb: "See the tiers before you commit time or money.",
  },
  {
    href: "/consulting",
    title: "Consulting",
    blurb: "Read the founder narrative and partnership frame.",
  },
  {
    href: "/creation-corner",
    title: "Builder / lair",
    blurb: "Open the operational synthesis surface.",
  },
];

export default function DemoPage() {
  useSEO({
    title: "Demo | GestaltView",
    description:
      "A direct public demo entry point for GestaltView, with immediate access to the home surface, pricing, consulting, and the builder/lair.",
    h1: "GestaltView Demo",
    canonical: "https://gestaltview-v2.vercel.app/demo",
  });

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(0,212,255,0.16), transparent 24%), radial-gradient(circle at 75% 15%, rgba(153,69,255,0.18), transparent 22%), radial-gradient(circle at 45% 82%, rgba(0,255,212,0.1), transparent 26%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#BDF7FF]">
            public demo
          </span>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Immediate entry
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              The demo should be obvious, not buried.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              This route exists to give new visitors a direct, low-friction path into the platform without hunting through the old legacy framing.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/pricing">
                <a className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/12 px-5 py-3 text-sm font-semibold text-white">
                  View pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
              <Link href="/signup">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/75">
                  Continue to signup
                  <Sparkles className="h-4 w-4" />
                </a>
              </Link>
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <PlayCircle className="h-5 w-5 text-[#00D4FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
                Demo entry points
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              {demoEntrypoints.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/6">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{item.blurb}</p>
                  </a>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/45">
              <span className="rounded-full border border-white/10 px-3 py-1">mobile-first</span>
              <span className="rounded-full border border-white/10 px-3 py-1">conversion-ready</span>
              <span className="rounded-full border border-white/10 px-3 py-1">functional routes</span>
            </div>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <GlassCard glow="purple" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <TabletSmartphone className="h-5 w-5 text-[#9945FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#B39DFF]">
                What a visitor can do
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/60">
              <li>1. Review the public platform story.</li>
              <li>2. Compare pricing before asking for access.</li>
              <li>3. Open consulting if they want the deeper frame.</li>
              <li>4. Enter the builder when they need to make something real.</li>
            </ul>
          </GlassCard>

          <GlassCard glow="cyan" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Route map
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["/", "/pricing", "/signup", "/consulting", "/creation-corner", "/agent_builder"].map((path) => (
                <Link key={path} href={path}>
                  <a className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition-colors hover:border-[#00D4FF]/30 hover:text-white">
                    {path}
                  </a>
                </Link>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
