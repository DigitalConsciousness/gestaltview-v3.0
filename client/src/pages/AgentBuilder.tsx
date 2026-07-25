import { Link } from "wouter";
import { ArrowRight, Wrench, Workflow } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AgentBuilderPage() {
  useSEO({
    title: "Agent Builder | GestaltView",
    description:
      "The public entry point for the GestaltView builder and lair surfaces, routed to the operational synthesis workspace.",
    h1: "Agent Builder",
    canonical: "https://gestaltview-v2.vercel.app/agent_builder",
  });

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#BDF7FF]">
            builder
          </span>
        </div>

        <GlassCard glow="cyan" intensity="high" className="mt-12 p-6 md:p-8" hover={false}>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
            Operational surface
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            The builder should open into work, not theater.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            This route points visitors to the actual creation workspace. It is the public doorway to the builder / lair surfaces described in the handoff.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Workflow className="h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-lg font-semibold">Open the builder</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Use the synthesis workspace to weave context, build artifacts, and move toward a real output.
              </p>
              <Link href="/creation-corner">
                <a className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/12 px-4 py-2 text-sm font-semibold text-white">
                  Creation Corner
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
            </GlassCard>

            <GlassCard glow="purple" intensity="medium" className="p-5" hover={false}>
              <Wrench className="h-5 w-5 text-[#9945FF]" />
              <p className="mt-3 text-lg font-semibold">Need a route map?</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                The public demo and pricing flow are wired separately so people can enter through the right door.
              </p>
              <Link href="/demo">
                <a className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
                  View demo
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
            </GlassCard>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
