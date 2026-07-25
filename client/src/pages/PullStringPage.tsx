import { Link } from "wouter";
import { ArrowRight, HandHelping, ShieldAlert, Wind } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PullStringPage() {
  useSEO({
    title: "Pull String | GestaltView",
    description:
      "The grounding and recovery lane for the platform, designed for stability and non-judgmental support.",
    h1: "Pull String",
    canonical: "https://gestaltview-v2.vercel.app/pull-string",
  });

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full border border-[#FF6B9D]/25 bg-[#FF6B9D]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#FFB8D0]">
            stabilization
          </span>
        </div>

        <header className="mt-14 max-w-4xl space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF8FA3]">Tier 1</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">For Life&apos;s Hard Parts: Pull String</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-white/68">
            This surface meets overwhelm with grounding, not shame. The work here is to stay present and make the next move possible.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldAlert, title: "Non-judgment", copy: "Reduce the pressure to perform before you are ready." },
            { icon: Wind, title: "Grounding", copy: "Slow down the room so the person can get oriented again." },
            { icon: HandHelping, title: "Support", copy: "Make help feel usable and immediate." },
          ].map((item) => (
            <GlassCard key={item.title} glow="purple" intensity="medium" className="p-5" hover={false}>
              <item.icon className="h-5 w-5 text-[#FF8FA3]" />
              <p className="mt-3 text-lg font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.copy}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard glow="purple" intensity="high" className="mt-6 p-6 md:p-8" hover={false}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FF8FA3]">Next module</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Stable enough to remember, create, or continue.</h2>
            </div>
            <Link href="/heirloom-companion">
              <a className="inline-flex items-center gap-2 rounded-full border border-[#FF8FA3]/25 bg-[#FF8FA3]/12 px-4 py-2 text-sm font-semibold text-white">
                Memory Continuity
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
