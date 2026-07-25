import { Link } from "wouter";

import GATEEntrypointWizard from "@/components/GATEEntrypointWizard";
import { useSEO } from "@/hooks/useSEO";

export default function GATEPackageBuilderPage() {
  useSEO({
    title: "GATE Entrypoint Package Builder",
    description:
      "Configure a bespoke GestaltView Agent Trainer package, validate combinations, and generate tailored deliverables.",
    h1: "Build your package before you pay.",
    canonical: "https://gestaltview-di-gsvw.vercel.app/agent-trainer/package-builder",
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,60,172,0.12),transparent_32%),radial-gradient(circle_at_20%_20%,rgba(18,214,255,0.12),transparent_28%),#04070d] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/agent-trainer"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:text-white"
          >
            Back to Agent Trainer
          </Link>
          <div className="rounded-full border border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.06)] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--gv-electric-cyan)]">
            Builder Gate Staffed
          </div>
        </div>

        <GATEEntrypointWizard />
      </div>
    </div>
  );
}
