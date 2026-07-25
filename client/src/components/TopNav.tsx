"use client";

import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  type LucideIcon,
  Castle,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  PanelsTopLeft,
  Shield,
  PenSquare,
  FolderOpen,
  Layers3,
  UserRound,
  Settings2,
  Menu,
  ArrowRight,
  ChevronDown,
  Users,
  FileAudio,
} from "lucide-react";
import { EMBODIMENT_REGISTRY } from "@shared/embodiment/generated";
import { useAuth } from "@/contexts/AuthContext";
import DIPresenceIndicator from "@/components/DIPresenceIndicator";
import { isFeatureEnabled, type FeatureFlag } from "@/config/featureFlags";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  flag?: FeatureFlag;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/blackboard-room", label: "Blackboard Room", icon: ClipboardList },
  { href: "/transcriptory", label: "Transcriptory", icon: FileAudio, flag: "transcriptory" },
  { href: "/sanctuary", label: "Sanctuary", icon: Castle },
  { href: "/dynamic-inner-world", label: "Dynamic Inner World", icon: PanelsTopLeft },
  { href: "/artifact-gallery", label: "Artifact Gallery", icon: Layers3 },
  { href: "/tribunal", label: "Tribunal", icon: Users, flag: "agentCouncil" },
  { href: "/external-scaffold", label: "External Scaffold", icon: Shield, flag: "externalScaffold" },
  { href: "/creation-corner", label: "Creation Corner", icon: PenSquare },
  { href: "/module/masterclass", label: "Masterclass", icon: GraduationCap },
  { href: "/documents", label: "File Explorer", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

function isActivePath(location: string, href: string, exact?: boolean) {
  if (exact) {
    return location === href;
  }

  return location === href || location.startsWith(`${href}/`);
}

export function TopNav() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [masterclassOpen, setMasterclassOpen] = useState(false);

  // Top 8 DI profiles for the dropdown quick-launch list
  const quickDIProfiles = useMemo(() => {
    const priority = ["billy", "art-teacher", "curator", "the-guardian", "gate-keeper", "vibe-check", "the-architect", "the-weaver"];
    const all = Object.values(EMBODIMENT_REGISTRY);
    return priority
      .map((slug) => all.find((p) => (p.slug as string) === slug))
      .filter(Boolean)
      .slice(0, 8) as (typeof all)[number][];
  }, []);
  const { isAuthenticated, isAdmin, tier, signOut, user } = useAuth();
  const founderEmail = import.meta.env.VITE_FOUNDER_EMAIL?.trim().toLowerCase() || "";
  const isFounder = Boolean(founderEmail && user?.email?.trim().toLowerCase() === founderEmail);

  const sessionLabel = useMemo(() => {
    if (isFounder) {
      return "Founder";
    }

    if (isAuthenticated) {
      return tier.toUpperCase();
    }

    return "Guest";
  }, [isAuthenticated, isFounder, tier]);

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.flag || isFeatureEnabled(item.flag)),
    []
  );

  const handleRoute = (href: string) => {
    setLocation(href);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    setLocation("/");
  };

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10"
      style={{
        background:
          "linear-gradient(180deg, rgba(5,7,11,0.96), rgba(5,7,11,0.82) 70%, rgba(5,7,11,0.58))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3">
          <Link href="/">
            <a className="inline-flex items-center gap-3 justify-self-start">
              <span className="font-logo text-2xl leading-none tracking-[0.02em] text-[#f5e9cf]">
                GestaltView
              </span>
              <span className="rounded-full border border-[#00E5FF]/18 bg-[#00E5FF]/8 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-[#BDF7FF]">
                v2
              </span>
            </a>
          </Link>

          <div className="hidden items-center justify-center xl:flex">
            <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] px-2 py-2 shadow-[0_18px_54px_rgba(0,0,0,0.26)]">
              {visibleNavItems.map((item) => {
                const active = isActivePath(location, item.href, item.exact);
                const Icon = item.icon;
                const isMasterclass = item.href === "/module/masterclass";

                if (isMasterclass) {
                  return (
                    <div key={item.href} className="relative">
                      <button
                        type="button"
                        onClick={() => setMasterclassOpen((v) => !v)}
                        onBlur={(e) => {
                          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                            setMasterclassOpen(false);
                          }
                        }}
                        className={`gv-nav-pill ${active ? "gv-nav-pill-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        aria-expanded={masterclassOpen}
                      >
                        <Icon className="size-3.5" />
                        {item.label}
                        <ChevronDown
                          className={`size-3 transition-transform ${masterclassOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {masterclassOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#05070b]/98 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.6)] z-50"
                          >
                            {/* Browse all */}
                            <button
                              type="button"
                              onClick={() => { handleRoute("/module/masterclass"); setMasterclassOpen(false); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors font-medium"
                            >
                              <GraduationCap className="size-3.5 text-[#00E5FF]" />
                              Browse all profiles
                            </button>
                            <div className="my-1.5 border-t border-white/[0.06]" />
                            <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-white/20 font-mono">Quick launch</p>
                            {quickDIProfiles.map((profile) => {
                              const pSlug = profile.slug as string;
                              const pName = (profile.publicName ?? profile.immutableCore?.archetype ?? pSlug) as string;
                              return (
                                <button
                                  key={pSlug}
                                  type="button"
                                  onClick={() => { handleRoute(`/di/${pSlug}`); setMasterclassOpen(false); }}
                                  className="w-full flex flex-col px-3 py-2 rounded-xl text-left hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-xs text-white/80 font-medium">{pName}</span>
                                  <span className="text-[10px] text-white/30 font-mono">{pSlug}</span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleRoute(item.href)}
                    className={`gv-nav-pill ${active ? "gv-nav-pill-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 lg:flex" title="Session tier">
              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                {sessionLabel}
              </span>
            </div>

            {isAuthenticated ? <DIPresenceIndicator /> : null}

            {isAuthenticated && isFounder ? (
              <button
                type="button"
                onClick={() => handleRoute("/founder-runtime")}
                className="hidden rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-300/16 lg:inline-flex"
              >
                <LayoutDashboard className="mr-2 size-4" />
                Manifest
              </button>
            ) : null}

            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => handleRoute("/login")}
                className="hidden rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00E5FF]/18 lg:inline-flex"
              >
                Sign in
              </button>
            ) : null}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/[0.08] lg:inline-flex"
              >
                Sign out
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/70 xl:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="xl:hidden pb-4"
            >
              <div className="rounded-[1.5rem] border border-white/10 bg-[#05070b]/96 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                <div className="grid gap-2">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(location, item.href, item.exact);
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleRoute(item.href)}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          active
                            ? "border-cyan-300/20 bg-cyan-300/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/78 hover:text-white"
                        }`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <Icon className="size-4 text-[#00E5FF]" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </span>
                        <ArrowRight className="size-4 text-white/32" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {isAuthenticated && isFounder ? (
                    <button
                      type="button"
                      onClick={() => handleRoute("/founder-runtime")}
                      className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-white/78"
                    >
                      Manifest
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleRoute("/profile")}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoute("/settings")}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoute("/documents")}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                  >
                    File Explorer
                  </button>
                  <button
                    type="button"
                    onClick={isAuthenticated ? handleSignOut : () => handleRoute("/login")}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                  >
                    {isAuthenticated ? "Sign out" : "Sign in"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default TopNav;
