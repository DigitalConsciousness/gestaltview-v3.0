import { Link } from "wouter";
import { ArrowLeft, BarChart3, Radar, ShieldCheck } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useSEO } from "@/hooks/useSEO";
import { GestaltViewMetricsDashboard } from "@/components/GestaltViewMetricsDashboard";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { getBetaAnalyticsAccess } from "@/lib/launchCore";

export default function AnalyticsPage() {
  const { tier, isAdmin } = useAuth();
  const access = getBetaAnalyticsAccess({ tier, isAdmin });

  useSEO({
    title: "Analytics | GestaltView",
    description:
      "Operational metrics and live queue visibility for GestaltView.",
    h1: "Analytics",
    canonical: "https://gestaltview-v2.vercel.app/analytics",
  });

  if (!access.visible) {
    return (
      <div className="min-h-screen bg-[#0A0F14] text-white">
        <NavBar />
        <div className="mx-auto flex min-h-[72vh] max-w-3xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-7" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
              Analytics beta
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Telemetry is staying behind the launch curtain for this account.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/62">
              {access.reason}
            </p>
            <Link href="/dashboard">
              <a className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </a>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

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
            telemetry
          </span>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Analytics surface
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Track what is stuck, not what is decorative.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Analytics exists to make queue behavior, access, and reliability easier to see. If the work is healthy, the surface should say so plainly.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00D4FF]/25 hover:text-white">
                  Manifest
                </a>
              </Link>
              <Link href="/agent-trainer/control-plane">
                <a className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-4 py-2 text-sm font-semibold text-[#D7FBFF]">
                  Control plane
                </a>
              </Link>
            </div>
          </GlassCard>

          <div className="grid gap-4">
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <BarChart3 className="h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Signal, not theater</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                See operational trends without burying the important lanes.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Radar className="h-5 w-5 text-[#7FE9FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Queue visibility</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                The point is to catch the stuck work early enough to matter.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <ShieldCheck className="h-5 w-5 text-[#A7F3D0]" />
              <p className="mt-3 text-lg font-semibold text-white">Reliability posture</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Better visibility is part of trust, not just reporting.
              </p>
            </GlassCard>
          </div>
        </section>

        <section className="mt-6">
          <GestaltViewMetricsDashboard />
        </section>
      </div>
    </div>
  );
}
