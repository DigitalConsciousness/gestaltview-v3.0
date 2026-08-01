import { ChevronLeft, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

type QuickNavTarget = {
  href: string;
  label: string;
};

function resolveSecondaryTarget(location: string): QuickNavTarget | null {
  if (location === "/billy") {
    return { href: "/orientation", label: "Orientation" };
  }

  if (location === "/billy/voicestudio") {
    return { href: "/billy", label: "Billy" };
  }

  if (location === "/blackboard-room" || location === "/whiteboard-room") {
    return { href: "/sanctuary", label: "Sanctuary" };
  }

  if (location === "/dynamic-inner-world") {
    return { href: "/external-scaffold", label: "Scaffold" };
  }

  if (location === "/digital-intelligence-academy") {
    return { href: "/embodiment-studio", label: "Embodiment" };
  }

  if (location === "/embodiment-studio") {
    return { href: "/tribunal", label: "Tribunal" };
  }

  if (location === "/tribunal" || location === "/agent-council") {
    return { href: "/digital-intelligence-academy", label: "Academy" };
  }

  if (location === "/workspace-analysis") {
    return { href: "/workspaces", label: "Workspaces" };
  }

  if (location === "/module/workspace-analysis") {
    return { href: "/workspaces", label: "Workspaces" };
  }

  if (location === "/agent-trainer/runtime") {
    return { href: "/store", label: "Artifact Exchange" };
  }

  if (location === "/founder-runtime") {
    return { href: "/dashboard", label: "Manifest" };
  }

  if (
    location === "/external-scaffold" ||
    location === "/module/scaffold" ||
    location === "/brain-sparks" ||
    location === "/adhd-powerup"
  ) {
    return { href: "/blackboard-room", label: "Blackboard Room" };
  }

  if (location === "/demo") {
    return { href: "/store", label: "Artifact Exchange" };
  }

  if (location === "/signup") {
    return { href: "/store", label: "Artifact Exchange" };
  }

  if (location === "/agent_builder" || location === "/agent-builder") {
    return { href: "/creation-corner", label: "Creation Corner" };
  }

  if (location === "/builder") {
    return { href: "/creation-corner", label: "Creation Corner" };
  }

  if (location === "/creation-corner") {
    return { href: "/external-scaffold", label: "Scaffold" };
  }

  if (location === "/lair") {
    return { href: "/store", label: "Artifact Exchange" };
  }

  if (location === "/app") {
    return { href: "/dashboard", label: "Manifest" };
  }

  if (
    location === "/workspaces" ||
    location === "/documents" ||
    location === "/voice" ||
    location === "/analytics"
  ) {
    return { href: "/app", label: "App" };
  }

  if (
    location === "/agent-trainer/package-builder" ||
    location.startsWith("/agent-trainer/orders/")
  ) {
    return { href: "/store", label: "Artifact Exchange" };
  }

  if (location === "/agent-trainer/control-plane") {
    return { href: "/dashboard", label: "Manifest" };
  }

  if (location === "/gravity") {
    return { href: "/dashboard", label: "Manifest" };
  }

  const exhibitLikePaths = new Set([
    "/continuum-codex",
    "/addiction-recovery",
    "/musical-dna",
    "/symbiocoder",
    "/vibe-coder",
    "/resume-rockstar",
    "/bucket-drops",
    "/heirloom-companion",
  ]);

  if (exhibitLikePaths.has(location)) {
    return { href: "/exhibits", label: "Modules" };
  }

  return null;
}

export default function SubpageQuickNav() {
  const [location] = useLocation();
  const secondaryTarget = resolveSecondaryTarget(location);

  if (!secondaryTarget) {
    return null;
  }

  const linkClassName =
    "group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#05070A]/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-[#00E5FF]/60 hover:bg-[#080B12]/90 hover:text-white hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_0_25px_rgba(0,229,255,0.3)]";

  return (
    <div className="pointer-events-none fixed left-6 top-6 z-[10020] flex flex-wrap gap-3">
      <Link href="/" className={`pointer-events-auto ${linkClassName}`}>
        <Home className="size-3.5 text-slate-400 transition-colors group-hover:text-[#00E5FF]" />
        Home
      </Link>
      <Link
        href={secondaryTarget.href}
        className={`pointer-events-auto ${linkClassName}`}
      >
        <ChevronLeft className="size-3.5 text-slate-400 transition-colors group-hover:text-[#00E5FF]" />
        {secondaryTarget.label}
      </Link>
    </div>
  );
}
