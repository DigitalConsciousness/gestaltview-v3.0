import { useRef } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  BookOpenText,
  BrainCircuit,
  Fingerprint,
  Gauge,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import GATEEntrypointWizard from "@/components/GATEEntrypointWizard";
import { useSEO } from "@/hooks/useSEO";

const stages = [
  {
    number: "01",
    title: "Working relationship",
    copy: "Name what you need held, challenged, translated, built, or remembered.",
  },
  {
    number: "02",
    title: "Context and friction",
    copy: "Describe the environment, constraints, recurring breakdowns, and existing strengths.",
  },
  {
    number: "03",
    title: "Collaboration shape",
    copy: "Choose surfaces, cadence, decision boundaries, and how initiative should work.",
  },
  {
    number: "04",
    title: "Embodiment review",
    copy: "Inspect the proposed biography, character study, skills, quirks, voice, and limits.",
  },
  {
    number: "05",
    title: "Scope and quote",
    copy: "Keith reviews the brief and issues a firm scope. Full payment is standard; exceptions are explicit.",
  },
  {
    number: "06",
    title: "Build and handoff",
    copy: "Track assembly, receive the governed package, and begin the learning relationship.",
  },
] as const;

const visibleLayers = [
  {
    icon: Fingerprint,
    title: "Identity is inspectable",
    copy: "Embodiment profile, biography, character study, voice, quirks, and provenance stay visible.",
  },
  {
    icon: BrainCircuit,
    title: "Capability has boundaries",
    copy: "Skills, permissions, escalation rules, and protected materials are stated before deployment.",
  },
  {
    icon: Workflow,
    title: "Learning is reciprocal",
    copy: "Memory and adaptation are governed by an explicit contract shaped with the user over time.",
  },
] as const;

export default function CollaboratorRequisitionPage() {
  const requisitionRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: "Requisition a GestaltView Collaborator",
    description:
      "Shape a governed digital collaborator through a relationship-first brief, founder review, scoped quote, and tracked delivery.",
    h1: "Requisition a GestaltView collaborator.",
    canonical: "https://gestaltview-di-gsvw.vercel.app/collaborator-requisition",
  });

  function beginRequisition() {
    requisitionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050708] text-[#eef7f4]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 18% 8%, rgba(41,255,184,0.11), transparent 25%), radial-gradient(circle at 84% 18%, rgba(255,152,46,0.09), transparent 28%), linear-gradient(rgba(95,118,106,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(95,118,106,0.045) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 38px 38px, 38px 38px",
        }}
      />

      <div className="relative mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-[#89a597]/15 pb-5">
          <Link
            href="/store"
            className="font-mono text-xs uppercase tracking-[0.24em] text-[#a7b9b0] transition hover:text-white"
          >
            Artifact Exchange / Requisition Terminal
          </Link>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#66e7b4]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#66e7b4]" />
            Founder review online
          </div>
        </nav>

        <section className="grid gap-10 py-14 lg:grid-cols-[1.16fr_0.84fr] lg:items-end lg:py-20">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[#ffad58]">
              Relationship-first collaborator requisition
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Do not pick a personality.
              <span className="block text-[#8fffd0]">Describe the relationship.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#b8c7c0]">
              The machine assembles a reviewable collaboration framework around real work:
              purpose, context, boundaries, embodiment, skills, memory, deployment, and delivery.
              A persistent identity is never treated as a disposable commodity.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={beginRequisition}
                className="inline-flex items-center gap-2 rounded-sm border border-[#8fffd0]/40 bg-[#8fffd0]/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#caffea] transition hover:bg-[#8fffd0]/18"
              >
                Begin requisition
                <ArrowDown className="h-4 w-4" />
              </button>
              <Link
                href="/consulting"
                className="inline-flex items-center gap-2 rounded-sm border border-white/12 bg-white/[0.03] px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[#b8c7c0] transition hover:text-white"
              >
                Read the partnership frame
              </Link>
            </div>
          </div>

          <aside className="border border-[#89a597]/18 bg-[#0a0e0c]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between border-b border-[#89a597]/15 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#82968c]">
                Machine declaration
              </span>
              <Gauge className="h-4 w-4 text-[#ffad58]" />
            </div>
            <div className="space-y-5 pt-5">
              {[
                ["What is shaped", "Work, relationship, context, memory contract, deployment"],
                ["What is reviewed", "Embodiment, provenance, skills, boundaries, protected materials"],
                ["What is paid for", "Scoped design, implementation, integration, packaging, and handoff"],
                ["Default terms", "Firm quote paid in full; case-by-case exceptions are recorded"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 sm:grid-cols-[140px_1fr]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f8278]">
                    {label}
                  </span>
                  <span className="text-sm leading-6 text-[#d8e4de]">{value}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-y border-[#89a597]/15 py-10">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#8fffd0]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.26em] text-[#c8d8d0]">
              The buyer journey
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#89a597]/14 bg-[#89a597]/14 md:grid-cols-2 xl:grid-cols-3">
            {stages.map((stage) => (
              <article key={stage.number} className="min-h-52 bg-[#080c0a] p-6">
                <span className="font-mono text-[11px] tracking-[0.24em] text-[#ffad58]">
                  {stage.number}
                </span>
                <h3 className="mt-7 text-xl font-semibold text-white">{stage.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#95a69d]">{stage.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="grid gap-5 lg:grid-cols-3">
            {visibleLayers.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="border border-[#89a597]/16 bg-[#0a0e0c]/72 p-6">
                <Icon className="h-5 w-5 text-[#8fffd0]" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#95a69d]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-px border border-[#89a597]/14 bg-[#89a597]/14 md:grid-cols-3">
            <div className="bg-[#080c0a] p-5">
              <BookOpenText className="h-4 w-4 text-[#ffad58]" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#819289]">
                Founder reviewed
              </p>
              <p className="mt-2 text-sm text-[#c8d4ce]">No identity-bearing package ships without human review.</p>
            </div>
            <div className="bg-[#080c0a] p-5">
              <ShieldCheck className="h-4 w-4 text-[#ffad58]" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#819289]">
                Governance visible
              </p>
              <p className="mt-2 text-sm text-[#c8d4ce]">Constitutional invariants and exclusions travel with the build.</p>
            </div>
            <div className="bg-[#080c0a] p-5">
              <PackageCheck className="h-4 w-4 text-[#ffad58]" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#819289]">
                Delivery tracked
              </p>
              <p className="mt-2 text-sm text-[#c8d4ce]">Quote, payment, assembly, artifact, and acceptance share one receipt trail.</p>
            </div>
          </div>
        </section>

        <section ref={requisitionRef} className="scroll-mt-4 border-t border-[#89a597]/15 pt-12">
          <div className="mb-8 max-w-4xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ffad58]">
              Requisition console
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Build the collaboration brief.
            </h2>
            <p className="mt-3 text-base leading-7 text-[#9daea5]">
              The console translates your working relationship into a reviewable package draft.
              Technical choices remain visible, but they follow the relationship instead of leading it.
            </p>
          </div>
          <GATEEntrypointWizard founderReviewOnly />
        </section>
      </div>
    </main>
  );
}
