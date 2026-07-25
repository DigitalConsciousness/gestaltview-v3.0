import { Link } from "wouter";
import { ArrowLeft, Blocks, ShieldCheck, Workflow } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import WorkspacesInterface from "@/components/workspaces-interface";
import { GlassCard } from "@/components/ui/GlassCard";
import { canUseWorkspaceMutations, workspaceLockText } from "@/lib/entitlements";

export default function WorkspacesPage() {
  const { isLoading, isAuthenticated, user, tier, isAdmin } = useAuth();
  const canManageWorkspaces = canUseWorkspaceMutations({ tier, isAdmin });

  useSEO({
    title: "Workspaces | GestaltView",
    description:
      "Collaborative workspaces for research, tribunal sessions, documents, and knowledge graph work.",
    h1: "Workspaces",
    canonical: "https://gestaltview-v2.vercel.app/workspaces",
  });

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      <NavBar />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/app">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              App
            </a>
          </Link>
          <span className="rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#BDF7FF]">
            collaboration
          </span>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Workspace surface
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Shared rooms for actual work.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Research, tribunal sessions, documents, and knowledge graph work live here. The surface is meant for coordination, not ornament.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/documents">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00D4FF]/25 hover:text-white">
                  Documents
                </a>
              </Link>
              <Link href="/analytics">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00D4FF]/25 hover:text-white">
                  Analytics
                </a>
              </Link>
              <Link href="/voice">
                <a className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-4 py-2 text-sm font-semibold text-[#D7FBFF]">
                  Voice capture
                </a>
              </Link>
            </div>
          </GlassCard>

          <div className="grid gap-4">
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Workflow className="h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Coordination first</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Use shared spaces to move from note to context to action without losing the thread.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Blocks className="h-5 w-5 text-[#7FE9FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Room structure</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Workspaces are the place to gather people, artifacts, and decisions into one coherent surface.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <ShieldCheck className="h-5 w-5 text-[#A7F3D0]" />
              <p className="mt-3 text-lg font-semibold text-white">Access posture</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Sign in to load saved workspace state and collaboration history.
              </p>
            </GlassCard>
          </div>
        </section>

        <section className="mt-6">
          {isLoading ? (
            <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
              <p className="text-sm text-white/55">Loading workspace access…</p>
            </GlassCard>
          ) : isAuthenticated && user && canManageWorkspaces ? (
            <WorkspacesInterface userId={user.id} />
          ) : isAuthenticated && user ? (
            <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
                Core workspace lane
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Shared rooms open on Core.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                {workspaceLockText(tier)}
              </p>
              <Link href="/pricing">
                <a className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/12 px-4 py-2 text-sm font-semibold text-white">
                  View plans
                </a>
              </Link>
            </GlassCard>
          ) : (
            <GlassCard glow="purple" intensity="high" className="p-6 md:p-8" hover={false}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#9945FF]">
                Sign in required
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Open the workspace shell with your account.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                Workspaces load the shared collaboration state for authenticated users. Sign in to continue.
              </p>
              <Link href="/login?redirect=/workspaces">
                <a className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#9945FF]/25 bg-[#9945FF]/12 px-4 py-2 text-sm font-semibold text-white">
                  Sign in
                </a>
              </Link>
            </GlassCard>
          )}
        </section>
      </div>
    </div>
  );
}
