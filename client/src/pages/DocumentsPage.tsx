import { Link } from "wouter";
import { ArrowLeft, FileText, Upload, ShieldCheck } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import DocumentAnalysisInterface from "@/components/document-analysis-interface";
import { GlassCard } from "@/components/ui/GlassCard";

export default function DocumentsPage() {
  const { isLoading, isAuthenticated, user, tier, isAdmin } = useAuth();

  useSEO({
    title: "File Explorer | GestaltView",
    description:
      "The central library for uploaded files, previews, and room-linked materials.",
    h1: "File Explorer",
    canonical: "https://gestaltview-v2.vercel.app/documents",
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
            library
          </span>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <GlassCard glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              File surface
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              All uploads stay reachable from one place.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Drag in a file, inspect the result, and keep the signal available for the rooms that need it.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/workspaces">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00D4FF]/25 hover:text-white">
                  Workspaces
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
              <Upload className="h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Upload intent</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                This surface starts with a file and ends with a readable analysis trail.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <FileText className="h-5 w-5 text-[#7FE9FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Analysis view</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Review document status, topics, and generated summaries from one place.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <ShieldCheck className="h-5 w-5 text-[#A7F3D0]" />
              <p className="mt-3 text-lg font-semibold text-white">Authenticated lane</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Sign in to load document history and analysis actions.
              </p>
            </GlassCard>
          </div>
        </section>

        <section className="mt-6">
          {isLoading ? (
            <GlassCard glow="none" intensity="medium" className="p-6 md:p-8" hover={false}>
              <p className="text-sm text-white/55">Loading document access…</p>
            </GlassCard>
          ) : isAuthenticated && user ? (
            <DocumentAnalysisInterface userId={user.id} tier={tier} isAdmin={isAdmin} />
          ) : (
            <GlassCard glow="purple" intensity="high" className="p-6 md:p-8" hover={false}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#9945FF]">
                Sign in required
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Open document analysis with your account.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
                Document history is tied to the authenticated workspace. Sign in to upload and analyze files.
              </p>
              <Link href="/login?redirect=/documents">
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
