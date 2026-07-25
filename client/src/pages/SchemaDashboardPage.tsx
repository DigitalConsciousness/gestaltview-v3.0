import React from "react";
import { Redirect } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";

import NavBar from "@/components/NavBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import dashboardHtml from "@/components/gestaltview_schema_dashboard.html?raw";

export default function SchemaDashboardPage() {
  const { isLoading, isAdmin } = useAuth();

  useSEO(PAGE_SEO.schemaDashboard);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white">
        <NavBar />
        <div className="mx-auto flex min-h-[72vh] max-w-5xl items-center justify-center px-4 py-12">
          <GlassCard glow="cyan" intensity="medium" className="flex items-center gap-3 px-5 py-4" hover={false}>
            <Loader2 className="size-4 animate-spin text-cyan-300" />
            <span className="text-sm text-white/75">Loading schema dashboard access…</span>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <GlassCard glow="cyan" intensity="high" className="overflow-hidden p-0" hover={false}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                Live schema surface
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                GestaltView schema dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/60">
                The embedded shell below calls the live schema snapshot endpoint on the
                same origin, so the counts and table health reflect the current database.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-emerald-200">
              <ShieldAlert className="size-3.5" />
              Admin only
            </div>
          </div>
          <iframe
            title="GestaltView Schema Dashboard"
            srcDoc={dashboardHtml}
            className="h-[82vh] w-full border-0 bg-[#F8F7F4]"
            loading="eager"
          />
        </GlassCard>
      </div>
    </div>
  );
}
