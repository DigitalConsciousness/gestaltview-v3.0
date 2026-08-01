import { Link } from "wouter";
import { ArrowLeft, ArrowRight, ShieldCheck, Scale, Radar, Handshake } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";

const sections = [
  {
    id: "origin-story",
    title: "Origin Story",
    copy:
      "GestaltView started from a practical problem: the work was never simply software, and never simply therapy, consulting, or content. The platform exists to preserve the complexity of a person and give it an interface that can hold the full signal.",
  },
  {
    id: "recognition-gap",
    title: "Recognition Gap",
    copy:
      "The Recognition Gap is the distance between an internal world and the way institutions reduce it. GestaltView closes that gap by keeping the language, sequence, and nuance of a person intact while still turning the work into something operational.",
  },
  {
    id: "forensic-moat",
    title: "Forensic Moat",
    copy:
      "The moat is not hype. It is evidence: documented architecture choices, preserved language, reusable modules, and a governance trail that shows how the platform thinks. That combination is difficult to copy because it is built from the founder's actual cognition and years of embodied work.",
  },
  {
    id: "governance",
    title: "Governance",
    copy:
      "Billy, the Tribunal posture, and the Constitutional Invariants govern what can be said, copied, reduced, or externalized. The point is not compliance theater. The point is to keep the system honest when the work becomes valuable.",
  },
  {
    id: "partnerships",
    title: "Partnerships",
    copy:
      "Partnership conversations are appropriate when the other party wants a serious architecture relationship, not a pitch deck. GestaltView can support product strategy, implementation, or a longer advisory relationship if the scope protects the work and respects the source language.",
  },
];

export default function ConsultingPage() {
  useSEO({
    title: "GestaltView Consulting | Keith Soyka",
    description:
      "A direct narrative page for the founder biography, Recognition Gap thesis, forensic moat, governance structure, and partnership framing behind GestaltView.",
    h1: "GestaltView Consulting",
    canonical: "https://gestaltview-v2.vercel.app/consulting",
  });

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(0,212,255,0.12), transparent 24%), radial-gradient(circle at 80% 20%, rgba(153,69,255,0.14), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 25%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/store">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Artifact Exchange
            </a>
          </Link>
          <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40 md:flex">
            <span>Founder narrative</span>
            <span>•</span>
            <span>Authoritative tone</span>
          </div>
        </div>

        <header className="mt-16 space-y-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">
            Consulting archive
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            GestaltView consulting exists to protect the work, not market a commodity.
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-white/68">
            This page holds the deeper frame: founder biography, the Recognition Gap thesis, the forensic moat, the governance structure, and the kind of partnership this company is built to support.
          </p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassCard glow="cyan" intensity="medium" className="p-4" hover={false}>
            <ShieldCheck className="h-5 w-5 text-[#00E5FF]" />
            <p className="mt-3 text-sm font-semibold text-white">Protected language</p>
            <p className="mt-1 text-sm text-white/55">The system keeps the source voice intact.</p>
          </GlassCard>
          <GlassCard glow="electricPurple" intensity="medium" className="p-4" hover={false}>
            <Scale className="h-5 w-5 text-[#B026FF]" />
            <p className="mt-3 text-sm font-semibold text-white">Governed output</p>
            <p className="mt-1 text-sm text-white/55">Constitutional invariants constrain reduction.</p>
          </GlassCard>
          <GlassCard glow="teal" intensity="medium" className="p-4" hover={false}>
            <Radar className="h-5 w-5 text-[#00FFD4]" />
            <p className="mt-3 text-sm font-semibold text-white">Evidence-backed</p>
            <p className="mt-1 text-sm text-white/55">The moat is built from operational proof.</p>
          </GlassCard>
          <GlassCard glow="emerald" intensity="medium" className="p-4" hover={false}>
            <Handshake className="h-5 w-5 text-[#32CD32]" />
            <p className="mt-3 text-sm font-semibold text-white">Partnership ready</p>
            <p className="mt-1 text-sm text-white/55">Advisory, build, or architectural collaboration.</p>
          </GlassCard>
        </div>

        <div className="mt-14 grid gap-6">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
                      {section.id.replace(/-/g, " ")}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{section.title}</h2>
                  </div>
                  <a href={`#${sections[(sections.indexOf(section) + 1) % sections.length].id}`} className="inline-flex items-center gap-2 text-sm text-[#00E5FF]">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">{section.copy}</p>
              </GlassCard>
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            Start with an asynchronous relationship brief. Keith reviews the work,
            issues a firm scope and quote, and requests a call only when the request
            genuinely needs one.
          </p>
          <Link
            href="/collaborator-requisition"
            className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-5 py-3 text-sm font-semibold text-[#C8F8FF]"
          >
            Begin collaborator requisition
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
