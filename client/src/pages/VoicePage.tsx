import { Link } from "wouter";
import { ArrowLeft, Mic, Speech, Sparkles } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useSEO } from "@/hooks/useSEO";
import { VoiceInterface } from "@/components/voice-interface";
import { VoiceReadinessPanel } from "@/components/operation-render";
import { GlassCard } from "@/components/ui/GlassCard";

export default function VoicePage() {
  useSEO({
    title: "Voice | GestaltView",
    description:
      "Voice capture and speech controls for GestaltView.",
    h1: "Voice",
    canonical: "https://gestaltview-v2.vercel.app/voice",
  });

  return (
    <div className="operation-render-shell min-h-screen bg-[#0A0F14] text-white">
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
            voice
          </span>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <GlassCard surfaceRole="active" glow="cyan" intensity="high" className="p-6 md:p-8" hover={false}>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00D4FF]">
              Voice surface
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Speak, listen, and keep the thread.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Voice is the quick capture lane for live speech input, playback, and accessibility controls. It stays useful even when the rest of the workspace is busy.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/documents">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00D4FF]/25 hover:text-white">
                  Documents
                </a>
              </Link>
              <Link href="/workspaces">
                <a className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/25 bg-[#00D4FF]/10 px-4 py-2 text-sm font-semibold text-[#D7FBFF]">
                  Workspaces
                </a>
              </Link>
            </div>
          </GlassCard>

          <div className="grid gap-4">
            <VoiceReadinessPanel />
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Mic className="h-5 w-5 text-[#00D4FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Capture mode</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Use the browser mic when you want to get the thought out fast.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Speech className="h-5 w-5 text-[#7FE9FF]" />
              <p className="mt-3 text-lg font-semibold text-white">Playback mode</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Read the transcript back aloud when you want to inspect the wording.
              </p>
            </GlassCard>
            <GlassCard glow="none" intensity="medium" className="p-5" hover={false}>
              <Sparkles className="h-5 w-5 text-[#A7F3D0]" />
              <p className="mt-3 text-lg font-semibold text-white">Accessibility</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Voice is designed to reduce friction, not add another maze.
              </p>
            </GlassCard>
          </div>
        </section>

        <section className="mt-6">
          <VoiceInterface />
        </section>
      </div>
    </div>
  );
}
