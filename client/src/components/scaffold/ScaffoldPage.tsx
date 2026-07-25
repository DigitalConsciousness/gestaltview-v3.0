import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/GlassCard";

export type ScaffoldCard = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

export type ScaffoldPageProps = {
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  seed?: string;
  seedLabel?: string;
  seedCopy?: string;
  cards: ScaffoldCard[];
  nextLabel: string;
  nextHref: string;
  nextEyebrow: string;
  nextTitle: string;
  nextCopy: string;
  nextButtonLabel?: string;
};

function summarizeSeed(seed: string, maxLength = 180) {
  const compact = seed.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
}

export default function ScaffoldPage({
  badge,
  eyebrow,
  title,
  description,
  seed,
  seedLabel = "Incoming fragment",
  seedCopy = "This is the payload arriving from another room. It can be used as a seed, a reminder, or a launch point.",
  cards,
  nextLabel,
  nextHref,
  nextEyebrow,
  nextTitle,
  nextCopy,
  nextButtonLabel,
}: ScaffoldPageProps) {
  const summary = seed ? summarizeSeed(seed) : "";

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(0,212,255,0.14), transparent 22%), radial-gradient(circle at 82% 10%, rgba(153,69,255,0.12), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 18%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <span className="rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#BDF7FF]">
            {badge}
          </span>
        </div>

        <header className="mt-14 max-w-4xl space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-white/68">{description}</p>
        </header>

        {seed ? (
          <GlassCard glow="cyan" intensity="medium" className="mt-8 p-5 md:p-6" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8CEBFF]">
              {seedLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/62">{seedCopy}</p>
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-white/80">
              {summary}
            </p>
          </GlassCard>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((item) => (
            <GlassCard key={item.title} glow="cyan" intensity="medium" className="p-5" hover={false}>
              <item.icon className="h-5 w-5 text-[#00E5FF]" />
              <p className="mt-3 text-lg font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.copy}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard glow="cyan" intensity="high" className="mt-6 p-6 md:p-8" hover={false}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">
                {nextEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{nextTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{nextCopy}</p>
            </div>
            <Link href={nextHref}>
              <a className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white">
                {nextButtonLabel ?? nextLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
