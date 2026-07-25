"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Castle,
  ClipboardList,
  FolderOpen,
  Layers3,
  PenSquare,
  Settings2,
  Shield,
  UserRound,
} from "lucide-react";
import FloatingEmbers from "../components/FloatingEmbers";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { GlassCard } from "../components/ui/GlassCard";
import { useBillySection } from "../components/Billy";
import { buildOnboardingExplainerPrompt } from "@/lib/launchCore";
import FogOverlay from "../components/FogOverlay";
import {
  readUserSurfaceSettings,
  USER_SURFACE_SETTINGS_EVENT,
  type UserSurfaceSettings,
} from "@/lib/userSurfaceSettings";

// Define the room cards and their glow colors
const ROOM_CARDS = [
  { href: "/blackboard-room", label: "Blackboard Room", copy: "Capture and chat stay together here.", icon: ClipboardList, glow: "cyan" as const },
  { href: "/sanctuary", label: "Sanctuary", copy: "A private room for resting, writing, and staying present.", icon: Castle, glow: "electricPurple" as const },
  { href: "/dynamic-inner-world", label: "Dynamic Inner World", copy: "Finished artifacts stay alive here.", icon: Layers3, glow: "neonPink" as const },
  { href: "/artifact-gallery", label: "Artifact Gallery", copy: "Queue unfinished work before it reaches the museum.", icon: Layers3, glow: "blue" as const },
  { href: "/creation-corner", label: "Creation Corner", copy: "Blueprints become tangible artifacts here.", icon: PenSquare, glow: "emerald" as const },
  { href: "/external-scaffold", label: "External Scaffold", copy: "A living map of patterns, links, and signal.", icon: Shield, glow: "blue" as const },
  { href: "/documents", label: "File Explorer", copy: "All uploads stay reachable in one library.", icon: FolderOpen, glow: "gold" as const },
  { href: "/profile", label: "Profile", copy: "A private mirror of what has taken shape.", icon: UserRound, glow: "teal" as const },
  { href: "/settings", label: "Settings", copy: "Adjust the surface without dragging admin clutter into view.", icon: Settings2, glow: "none" as const },
];

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function Home() {
  useBillySection("home");
  const [, setLocation] = useLocation();
  const explainerPrompt = buildOnboardingExplainerPrompt();
  const [loading, setLoading] = useState(true);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(() =>
    readUserSurfaceSettings()
  );
  const heroClickCountRef = useRef(0);
  const heroResetTimerRef = useRef<number | null>(null);
  const lowBandwidthMode = surfaceSettings.lowBandwidthMode || !surfaceSettings.motionHints;
  const shouldAnimate = !lowBandwidthMode;

  // Map glow names to actual neon colors
  const glowColorMap: Record<string, string> = {
    cyan: "#00E5FF",
    teal: "#00FFD4",
    emerald: "#00FF66",
    electricPurple: "#B026FF",
    neonPink: "#FF007F",
    neonRed: "#FF2D55",
    midnightBlue: "#4169E1",
    blue: "#0088FF",
    gold: "#FFD700",
    purple: "#9945FF",
    none: "#6B7280",
  };

  // Load fonts for the home surface.
  useEffect(() => {
    // Dancing Script
    if (!document.getElementById("dancing-script-font")) {
      const link = document.createElement("link");
      link.id = "dancing-script-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&display=swap";
      document.head.appendChild(link);
    }
    // Cabin Sketch
    if (!document.getElementById("cabin-sketch-font")) {
      const cabinLink = document.createElement("link");
      cabinLink.id = "cabin-sketch-font";
      cabinLink.rel = "stylesheet";
      cabinLink.href = "https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap";
      document.head.appendChild(cabinLink);
    }
    if (!document.getElementById("geist-font")) {
      const geistLink = document.createElement("link");
      geistLink.id = "geist-font";
      geistLink.rel = "stylesheet";
      geistLink.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap";
      document.head.appendChild(geistLink);
    }
    const timer = setTimeout(() => setLoading(false), 1400);
    const onSettingsChanged = (event: Event) => {
      const next = (event as CustomEvent<UserSurfaceSettings>).detail ?? readUserSurfaceSettings();
      setSurfaceSettings(next);
    };
    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    return () => {
      clearTimeout(timer);
      if (heroResetTimerRef.current) {
        clearTimeout(heroResetTimerRef.current);
      }
      window.removeEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    };
  }, []);

  const handleHeroClick = () => {
    heroClickCountRef.current += 1;

    if (heroResetTimerRef.current) {
      clearTimeout(heroResetTimerRef.current);
    }

    heroResetTimerRef.current = window.setTimeout(() => {
      heroClickCountRef.current = 0;
    }, 1100);

    if (heroClickCountRef.current >= 3) {
      heroClickCountRef.current = 0;
      setLocation("/origin");
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#030509] text-white selection:bg-[#00E5FF]/30 selection:text-white">
      {/* Background with subtle film scratches */}
      {!lowBandwidthMode ? (
        <>
          <FloatingEmbers
            colors={["#2e374d", "#3c4a62", "#4a596f", "#5a6780", "#6b7691"]}
            count={18}
            intervalMs={750}
            sizeRange={[2, 5]}
            driftRange={12}
            durationRange={[14, 28]}
          />
          <FogOverlay />
        </>
      ) : null}

      {/* Container for hero and grid */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-20 pt-32 lg:px-8">
        {/* Animated hero section */}
        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mx-auto w-full max-w-5xl text-center lg:mx-0 lg:text-left"
        >
          <div className="space-y-6">
            {/* Gradient animated header */}
            <motion.h1
              className="mx-auto max-w-full text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter select-none"
              style={{
                fontFamily: "'Cabin Sketch', cursive",
                backgroundImage: "linear-gradient(120deg, #00E5FF, #B026FF, #FF007F, #FFD700, #00FFD4)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(176,38,255,0.25)",
              }}
              animate={
                shouldAnimate
                  ? {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      textShadow: [
                        "0 0 30px rgba(0,229,255,0.4), 0 0 60px rgba(176,38,255,0.2)",
                        "0 0 50px rgba(0,229,255,0.6), 0 0 90px rgba(176,38,255,0.4)",
                        "0 0 30px rgba(0,229,255,0.4), 0 0 60px rgba(176,38,255,0.2)",
                      ],
                    }
                  : undefined
              }
              transition={shouldAnimate ? { duration: 12, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              role="button"
              tabIndex={0}
              aria-label="GestaltView hero"
              onClick={handleHeroClick}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleHeroClick();
                }
              }}
              title="Click the hero a few times"
            >
              GestaltView
            </motion.h1>

            {/* Subscript text */}
            <p
              className="mx-auto max-w-3xl text-3xl leading-relaxed text-[#E0F7FA] drop-shadow-[0_0_15px_rgba(0,229,255,0.5)] lg:mx-0 sm:text-4xl"
              style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 500 }}
            >
              You don't have to know where you're going,{" "}
              <br className="hidden sm:block" />
              <span className="text-[#00E5FF]/80">just that you're not alone in getting there.</span>
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link href="/blackboard-room">
                <a className="group relative overflow-hidden rounded-full bg-[#00E5FF]/10 px-8 py-4 font-bold text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2),_inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all hover:scale-105 hover:bg-[#00E5FF]/20 hover:text-white hover:shadow-[0_0_40px_rgba(0,229,255,0.5)]">
                  Open Blackboard
                </a>
              </Link>
              <Link href="/sanctuary">
                <a className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all hover:scale-105 hover:border-[#B026FF]/50 hover:bg-[#B026FF]/10 hover:text-white hover:shadow-[0_0_30px_rgba(176,38,255,0.3)]">
                  Enter Sanctuary
                </a>
              </Link>
              <Link href="/welcome">
                <a
                  className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all hover:scale-105 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:text-white"
                  title={explainerPrompt}
                >
                  Watch Explainer
                </a>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Grid of neon-morphing cards */}
        <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ROOM_CARDS.map((card, index) => {
            const Icon = card.icon;
            const color = glowColorMap[card.glow] || glowColorMap.none;
            const softGlow = hexToRgba(color, 0.3);
            const strongGlow = hexToRgba(color, 0.92);

            return (
              <motion.div
                key={card.href}
                initial={false}
                animate={
                  shouldAnimate
                    ? {
                        borderColor: [softGlow, strongGlow, softGlow],
                        boxShadow: [
                          `0 0 16px ${hexToRgba(color, 0.26)}, 0 0 30px ${hexToRgba(color, 0.18)}, 0 0 56px ${hexToRgba(color, 0.08)}`,
                          `0 0 32px ${hexToRgba(color, 0.56)}, 0 0 64px ${hexToRgba(color, 0.34)}, 0 0 96px ${hexToRgba(color, 0.14)}`,
                          `0 0 16px ${hexToRgba(color, 0.26)}, 0 0 30px ${hexToRgba(color, 0.18)}, 0 0 56px ${hexToRgba(color, 0.08)}`,
                        ],
                        filter: [
                          "drop-shadow(0 0 8px rgba(255,255,255,0.02))",
                          "drop-shadow(0 0 14px rgba(255,255,255,0.04))",
                          "drop-shadow(0 0 8px rgba(255,255,255,0.02))",
                        ],
                      }
                    : undefined
                }
                transition={
                  shouldAnimate
                    ? {
                        duration: 6,
                        delay: 0.4 + index * 0.1,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      }
                    : { duration: 0 }
                }
                className="h-full rounded-2xl"
                style={{ borderWidth: "1px", borderStyle: "solid" }}
              >
                <Link href={card.href}>
                  <a className="block h-full">
                    <GlassCard
                      glow="none"
                      intensity="high"
                      hover={false}
                      dynamic={false}
                      className="flex h-full flex-col justify-between border-transparent shadow-none p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h2
                          className="text-xl font-bold tracking-wide text-slate-100"
                          style={{ fontFamily: "'Cabin Sketch', cursive" }}
                        >
                          {card.label}
                        </h2>
                        <div className="rounded-full bg-white/5 p-2 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-colors">
                          <Icon className="h-5 w-5 text-white/80" />
                        </div>
                      </div>
                      <p
                        className="mt-6 text-sm leading-relaxed text-slate-400"
                        style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
                      >
                        {card.copy}
                      </p>
                    </GlassCard>
                  </a>
                </Link>
              </motion.div>
            );
          })}
        </section>
      </div>

      {/* Spinner overlay */}
      {loading && <LoadingSpinner />}

    </main>
  );
}
