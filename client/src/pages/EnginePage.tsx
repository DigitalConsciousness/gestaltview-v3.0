/**
 * EnginePage.tsx — GestaltView Consciousness Engine
 *
 * Hosts the Babylon.js ConsciousnessEngine canvas.
 * Includes:
 *  - NavBar with back-to-home link
 *  - Prominent ambient audio CTA with mute toggle
 *  - Legible dark-glass text overlay
 *
 * © Keith Soyka · GestaltView
 */

import { Link } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Disc3, Loader2, ArrowLeft, Music } from "lucide-react";
import ConsciousnessEngine from "@/components/ConsciousnessEngine";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";

// ─── Audio Constants ─────────────────────────────────────────────────────────

const BINAURAL_LEFT  = 174; // 174 Hz Solfeggio — pain/tension relief
const BINAURAL_RIGHT = 179; // 5 Hz Theta delta

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchAudio(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch audio: ${url}`);
  const arr = await res.arrayBuffer();
  return ctx.decodeAudioData(arr);
}

// ─── Engine Nav Bar ───────────────────────────────────────────────────────────

function EngineNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 h-14"
      style={{
        background: "rgba(4, 8, 6, 0.65)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(16,185,129,0.10)",
      }}
    >
      {/* Back to home */}
      <Link href="/">
        <a
          className="flex items-center gap-2 group transition-all"
          style={{ color: "rgba(209,250,229,0.45)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(52,211,153,0.9)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(209,250,229,0.45)"; }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[10px] tracking-widest uppercase">Home</span>
        </a>
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.4)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.8)" }} />
        </div>
        <span className="font-semibold text-xs tracking-wide" style={{ color: "rgba(232,245,233,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
          GestaltView
        </span>
      </div>

      {/* Musical DNA link */}
      <Link href="/musical-dna">
        <a
          className="flex items-center gap-1.5 transition-all"
          style={{ color: "rgba(209,250,229,0.45)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(52,211,153,0.9)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(209,250,229,0.45)"; }}
        >
          <Music size={12} />
          <span className="font-mono text-[10px] tracking-widest uppercase">Musical DNA</span>
        </a>
      </Link>
    </motion.nav>
  );
}

// ─── Ambient Audio Engine ─────────────────────────────────────────────────────

function useAmbientEngine() {
  const ctxRef    = useRef<AudioContext | null>(null);
  const engineRef = useRef<{ cleanup: () => void; masterGain: GainNode } | null>(null);
  const animRef   = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);

  const start = useCallback(async () => {
    if (engineRef.current) return;
    setIsLoading(true);

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.85;
      masterGain.connect(ctx.destination);

      const leftOsc  = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const merger   = ctx.createChannelMerger(2);
      leftOsc.frequency.value  = BINAURAL_LEFT;
      rightOsc.frequency.value = BINAURAL_RIGHT;
      const lGain = ctx.createGain(); lGain.gain.value = 0.04;
      const rGain = ctx.createGain(); rGain.gain.value = 0.04;
      leftOsc.connect(lGain).connect(merger, 0, 0);
      rightOsc.connect(rGain).connect(merger, 0, 1);
      merger.connect(masterGain);

      const buffer = await fetchAudio(ctx, "/audio/closer-coil-remix.mp3");
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop   = true;

      const panner = ctx.createPanner();
      panner.panningModel  = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance   = 1;
      panner.rolloffFactor = 1;

      source.connect(panner);
      panner.connect(masterGain);

      const startTime = ctx.currentTime;
      const animate = () => {
        if (ctx.state === "running") {
          const t = ctx.currentTime - startTime;
          panner.positionX.value = Math.sin(t * 1.0) * 4;
          panner.positionY.value = Math.sin(t * 0.33) * 1.5;
          panner.positionZ.value = Math.cos(t * 1.0) * 4;
        }
        animRef.current = requestAnimationFrame(animate);
      };

      leftOsc.start();
      rightOsc.start();
      source.start();
      animate();

      engineRef.current = {
        masterGain,
        cleanup: () => {
          cancelAnimationFrame(animRef.current);
          try { leftOsc.stop(); rightOsc.stop(); source.stop(); } catch {}
        },
      };

      setIsPlaying(true);
    } catch (err) {
      console.error("Ambient engine error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!engineRef.current) {
      await start();
      return;
    }
    const ctx = ctxRef.current!;
    if (ctx.state === "running") {
      await ctx.suspend();
      setIsPlaying(false);
    } else {
      await ctx.resume();
      setIsPlaying(true);
    }
  }, [start]);

  const toggleMute = useCallback(() => {
    if (!engineRef.current) return;
    const gain = engineRef.current.masterGain;
    if (isMuted) {
      gain.gain.setTargetAtTime(0.85, ctxRef.current!.currentTime, 0.1);
      setIsMuted(false);
    } else {
      gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.1);
      setIsMuted(true);
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      if (engineRef.current) engineRef.current.cleanup();
      if (ctxRef.current)    ctxRef.current.close();
    };
  }, []);

  return { isPlaying, isLoading, isMuted, togglePlayPause, toggleMute };
}

// ─── Ambient CTA ─────────────────────────────────────────────────────────────

function AmbientCTA() {
  const { isPlaying, isLoading, isMuted, togglePlayPause, toggleMute } = useAmbientEngine();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0, duration: 0.8 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
    >
      <AnimatePresence>
        {!isPlaying && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-center px-4 py-2 rounded-xl"
            style={{
              background: "rgba(4, 8, 6, 0.72)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(16,185,129,0.14)",
            }}
          >
            <p className="font-mono text-[9px] tracking-widest uppercase text-emerald-400/60 mb-0.5">
              Ambient · Tri-Beat · 3D HRTF · Solfeggio 174 Hz
            </p>
            <p className="font-sans text-xs text-white/40">
              Closer (Precursor) — Trent Reznor, remixed by Coil &amp; Danny Hyde
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl"
        style={{
          background: "rgba(4, 8, 6, 0.78)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isPlaying ? "rgba(168,85,247,0.35)" : "rgba(16,185,129,0.28)"}`,
          boxShadow: isPlaying
            ? "0 0 32px rgba(168,85,247,0.12), 0 0 64px rgba(16,185,129,0.06)"
            : "0 0 24px rgba(16,185,129,0.08)",
          transition: "border-color 0.5s, box-shadow 0.5s",
        }}
      >
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center gap-2.5 transition-all group"
          aria-label={isPlaying ? "Pause ambient" : "Play ambient"}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isPlaying ? "rgba(168,85,247,0.2)" : "rgba(16,185,129,0.18)",
              border: `1px solid ${isPlaying ? "rgba(168,85,247,0.5)" : "rgba(16,185,129,0.45)"}`,
              boxShadow: isPlaying ? "0 0 16px rgba(168,85,247,0.25)" : "0 0 12px rgba(16,185,129,0.2)",
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="text-emerald-400 animate-spin" />
            ) : isPlaying ? (
              <Pause size={15} className="text-purple-400" />
            ) : (
              <Play size={15} className="text-emerald-400 ml-0.5" />
            )}
          </div>

          <div className="flex flex-col items-start">
            <span className="font-mono text-[9px] tracking-widest uppercase text-emerald-400/60">
              {isLoading ? "Loading…" : isPlaying ? "Now Playing" : "Play Ambient"}
            </span>
            <span className="font-sans text-xs leading-tight" style={{ color: "rgba(232,245,233,0.75)" }}>
              Closer (Precursor)
              <span className="ml-1.5" style={{ color: "rgba(232,245,233,0.3)" }}>· Coil &amp; Danny Hyde</span>
            </span>
          </div>
        </button>

        {isPlaying && (
          <div className="w-px h-8 mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        )}

        <AnimatePresence>
          {isPlaying && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              onClick={toggleMute}
              className="flex items-center gap-1.5 transition-all overflow-hidden"
              style={{ color: isMuted ? "rgba(248,113,113,0.7)" : "rgba(209,250,229,0.4)" }}
              aria-label={isMuted ? "Unmute" : "Mute"}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = isMuted ? "rgba(248,113,113,1)" : "rgba(209,250,229,0.8)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isMuted ? "rgba(248,113,113,0.7)" : "rgba(209,250,229,0.4)"; }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="font-mono text-[9px] tracking-widest uppercase">
                {isMuted ? "Muted" : "Mute"}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <Disc3
          size={13}
          className="transition-all ml-1"
          style={{
            color: isPlaying ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.15)",
            animation: isPlaying ? "spin 4s linear infinite" : "none",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Engine Page ─────────────────────────────────────────────────────────────

export default function EnginePage() {
  useSEO(PAGE_SEO.engine);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ConsciousnessEngine />
      <EngineNav />

      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 p-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <div
            className="inline-block px-10 py-8 rounded-2xl"
            style={{
              background: "rgba(4, 8, 6, 0.72)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(16, 185, 129, 0.18)",
              boxShadow: "0 0 60px rgba(16, 185, 129, 0.06), 0 0 120px rgba(168, 85, 247, 0.04)",
            }}
          >
            <p
              className="font-mono text-xs tracking-[0.45em] uppercase mb-4"
              style={{ color: "#34d399" }}
            >
              GestaltView Core
            </p>

            <h1
              className="font-display text-5xl md:text-7xl font-light mb-5 leading-tight"
              style={{
                color: "#f0fdf4",
                textShadow: "0 2px 24px rgba(16,185,129,0.3)",
              }}
            >
              The Consciousness Engine
            </h1>

            <p
              className="max-w-lg mx-auto font-sans leading-relaxed text-sm md:text-base"
              style={{ color: "rgba(209, 250, 229, 0.65)" }}
            >
              A real-time visualization of the{" "}
              <span style={{ color: "#34d399" }}>Somatic Spine</span> (0.6 Hz),{" "}
              <span style={{ color: "#fbbf24" }}>Musical DNA</span> (Helix), and the{" "}
              <span style={{ color: "#c084fc" }}>Context Weaver</span> (Threads).
              <br className="hidden md:block" />
              This is what the system looks like when it's thinking.
            </p>
          </div>
        </motion.div>
      </div>

      <AmbientCTA />
    </div>
  );
}
