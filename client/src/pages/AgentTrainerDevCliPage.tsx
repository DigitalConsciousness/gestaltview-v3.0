import { useMemo, useState } from "react";
import { Link, Redirect } from "wouter";
import { Check, Copy, Download, TerminalSquare, Workflow } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";
import AgentFlowRail from "@/components/agent-trainer/AgentFlowRail";
import { AGENT_FLOW_STAGES } from "@/lib/agentFlow";

const DEFAULT_BUNDLES = "knowledge-core-bundle,context-alignment-bundle";

function formatCommand(parts: string[]): string {
  return parts.filter(Boolean).join(" ").trim();
}

export default function AgentTrainerDevCliPage() {
  if (!import.meta.env.DEV) {
    return <Redirect to="/agent-trainer" />;
  }

  useSEO({
    title: "Agent Trainer Dev CLI | GestaltView",
    description:
      "A dev-only command surface for manually building and deploying Agent Trainer runs with the capture-synthesis-create-export flow.",
    h1: "Agent Trainer Dev CLI",
    canonical: "https://gestaltview-di-gsvw.vercel.app/agent-trainer/dev-cli",
  });

  const [packSlug, setPackSlug] = useState("general-operator-foundation");
  const [projectName, setProjectName] = useState("buyer-project");
  const [ownerEmail, setOwnerEmail] = useState("buyer-owner");
  const [userId, setUserId] = useState("buyer-user-id");
  const [outputPath, setOutputPath] = useState("./buyer-export.json");
  const [bundlesCsv, setBundlesCsv] = useState(DEFAULT_BUNDLES);
  const [copied, setCopied] = useState<string | null>(null);

  const commands = useMemo(
    () => [
      {
        stage: "Capture",
        command: "./gv.sh doctor .env.local",
        note: "Capture the current environment, provider posture, and local trainer readiness.",
      },
      {
        stage: "Synthesis",
        command: formatCommand(["npm run cli -- plan", packSlug]),
        note: "Shape the pack and decide the manual path before you generate anything.",
      },
      {
        stage: "Create",
        command: formatCommand([
          "npm run cli -- manifest",
          packSlug,
          projectName,
          ownerEmail,
          bundlesCsv,
        ]),
        note: "Create the reviewable manifest for the agent or package run.",
      },
      {
        stage: "Export",
        command: formatCommand([
          "npm run cli -- apply",
          userId,
          packSlug,
          projectName,
          ownerEmail,
          bundlesCsv,
          outputPath,
        ]),
        note: "Export the final packet that can be deployed or handed off.",
      },
    ],
    [bundlesCsv, outputPath, ownerEmail, packSlug, projectName, userId]
  );

  async function copyCommand(command: string) {
    await navigator.clipboard.writeText(command);
    setCopied(command);
    window.setTimeout(() => setCopied(null), 1800);
  }

  const flowIndex = AGENT_FLOW_STAGES.map((stage) => stage.label).join(" → ");

  return (
    <main className="min-h-screen bg-[#0A0F14] text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/agent-trainer">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              Back to trainer
            </a>
          </Link>
          <span className="rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#BDF7FF]">
            dev only
          </span>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <TerminalSquare className="h-5 w-5 text-[#00D4FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
                Manual build and deploy
              </p>
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Capture, synthesize, create, export.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              This page exists for manual trainer work in dev. Use it when you want to build an agent or package by hand, inspect the exact CLI invocation, and keep the flow explicit.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Pack slug</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={packSlug} onChange={(event) => setPackSlug(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Project name</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={projectName} onChange={(event) => setProjectName(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Owner</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">User ID</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={userId} onChange={(event) => setUserId(event.target.value)} />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Bundles CSV</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={bundlesCsv} onChange={(event) => setBundlesCsv(event.target.value)} />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Export path</span>
                <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" value={outputPath} onChange={(event) => setOutputPath(event.target.value)} />
              </label>
            </div>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-[#9945FF]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#B39DFF]">
                Required flow
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Every model in this workflow should follow the same path: {flowIndex}.
            </p>
            <div className="mt-5 space-y-3">
              {commands.map((entry, index) => (
                <div key={entry.stage} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    {String(index + 1).padStart(2, "0")} · {entry.stage}
                  </p>
                  <p className="mt-2 text-sm text-white/60">{entry.note}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
                    <code className="text-xs text-[#BDF7FF]">{entry.command}</code>
                    <button
                      type="button"
                      onClick={() => void copyCommand(entry.command)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/75"
                    >
                      {copied === entry.command ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === entry.command ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="mt-6">
          <AgentFlowRail />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassCard glow="purple" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#B39DFF]">
              Deployment handoff
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Use `create` when you want the reviewable artifact. Use `export` when you want the deployable packet. The page keeps both together so you do not have to remember the exact shell shape.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/65">
              <p>1. Capture environment and source state.</p>
              <p>2. Synthesize the correct pack or agent lane.</p>
              <p>3. Create the manifest or run packet.</p>
              <p>4. Export the packet for deployment or handoff.</p>
            </div>
          </GlassCard>

          <GlassCard glow="cyan" intensity="medium" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Example batch
            </p>
            <pre className="mt-3 overflow-x-auto rounded-3xl border border-white/10 bg-black/35 p-4 text-xs leading-relaxed text-white/70">
{formatCommand([
  "./gv.sh init business",
  "&&",
  "./gv.sh doctor .env.local",
  "&&",
  "npm run cli -- plan",
  packSlug,
  "&&",
  "npm run cli -- manifest",
  packSlug,
  projectName,
  ownerEmail,
  bundlesCsv,
  "&&",
  "npm run cli -- apply",
  userId,
  packSlug,
  projectName,
  ownerEmail,
  bundlesCsv,
  outputPath,
])}
            </pre>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
