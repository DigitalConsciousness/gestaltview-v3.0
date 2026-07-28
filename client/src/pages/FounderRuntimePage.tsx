import { Link, Redirect } from "wouter";
import { ArrowLeft, Activity, Bot, Mic, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useBillyRuntimeReadiness } from "@/hooks/useBillyRuntimeReadiness";
import { FounderRequisitionQuotePanel } from "@/components/FounderRequisitionQuotePanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { TopNav } from "@/components/TopNav";

const quickLinks = [
  { href: "/dashboard", label: "Open Manifest", icon: ShieldCheck, copy: "Control plane, founder persistence, admin overrides, and health checks." },
  { href: "/orientation", label: "Open orientation", icon: PlayCircle, copy: "The plain-language front door for the live system." },
  { href: "/billy", label: "Open Billy", icon: Bot, copy: "Direct conversation with the embodied platform presence." },
  { href: "/billy/voicestudio", label: "Voice Studio", icon: Mic, copy: "Speech capture, spoken response, and voice tools." },
  { href: "/app", label: "Open settings", icon: Activity, copy: "User-facing app shell and session controls." },
];

export default function FounderRuntimePage() {
  useSEO(PAGE_SEO.founderRuntime);
  const { isLoading, isAuthenticated, isAdmin, user } = useAuth();
  const runtimeReady = useBillyRuntimeReadiness();
  const founderEmail = import.meta.env.VITE_FOUNDER_EMAIL?.trim().toLowerCase() || "";
  const isFounder = Boolean(founderEmail && user?.email?.trim().toLowerCase() === founderEmail);

  if (isLoading) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  if (!isFounder) {
    return <Redirect to="/" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <TopNav />
        <div className="mx-auto flex max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <GlassCard glow="cyan" intensity="medium" className="w-full border-white/10 bg-white/[0.05] p-6" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">Founder Manifest</p>
            <h1 className="mt-3 text-3xl font-semibold">Sign in to open the Founder Manifest.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62">
              This page sits in front of the control surface, Billy, and admin tooling for the current GestaltView environment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?redirect=/founder-runtime">
                <a className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-white">
                  Open sign-in
                </a>
              </Link>
              <Link href="/">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/78">
                  Back to GestaltView
                </a>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_#07111a_0%,_#020617_100%)] text-white">
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard">
            <a className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
            <ArrowLeft className="size-4" />
            Back to Manifest
          </a>
        </Link>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard glow="cyan" intensity="high" className="border-white/10 bg-white/[0.05] p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">Founder Manifest</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              The founder surface for the live GestaltView environment.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/68">
              This page is the operational front door for the system: it points to the live Billy workflow,
              the public orientation path, the manifest control plane, and the voice tools that support them.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Billy readiness", runtimeReady ? "Verified" : "Pending"],
                ["Founder access", isAdmin ? "Admin active" : "Signed in"],
                ["Billy guide", "Loaded and checked"],
                ["Public front door", "Orientation first"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{label}</p>
                  <p className="mt-2 text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow="cyan" intensity="medium" className="border-white/10 bg-white/[0.05] p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">Quick links</p>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 transition-colors hover:border-cyan-300/25 hover:bg-black/30">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.label}</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/58">{item.copy}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <GlassCard glow="none" intensity="medium" className="border-white/10 bg-white/[0.05] p-5" hover={false}>
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <h2 className="mt-3 text-lg font-semibold">Billy embodiment</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/62">
              Billy now opens only after the guide verifies and the first-contact flag is ready.
            </p>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="border-white/10 bg-white/[0.05] p-5" hover={false}>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h2 className="mt-3 text-lg font-semibold">Founder controls</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/62">
              The Manifest retains the admin overrides, persistence tools, and health checks.
            </p>
          </GlassCard>

          <GlassCard glow="none" intensity="medium" className="border-white/10 bg-white/[0.05] p-5" hover={false}>
            <Activity className="h-5 w-5 text-amber-300" />
            <h2 className="mt-3 text-lg font-semibold">Manifest flow</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/62">
              Sanctuary, Blackboard Room, Dynamic Inner World, and External Scaffold remain the live spine.
            </p>
          </GlassCard>
        </section>

        <FounderRequisitionQuotePanel />
      </div>
    </main>
  );
}
