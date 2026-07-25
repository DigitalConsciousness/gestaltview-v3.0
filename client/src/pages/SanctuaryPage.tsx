/**
 * @file SanctuaryPage.tsx
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: Sanctuary room shell with its own layered atmosphere — willow tree silhouette,
 * floating embers, and fog overlay. BabylonAtmosphere is intentionally NOT used here;
 * the generic orb/ring scene belongs to other rooms. Each room owns its visual identity.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useBillySection } from "@/components/Billy";
import { useAuth } from "@/contexts/AuthContext";
import WillowTreeOverlay from "@/components/WillowTreeOverlay";
import FloatingEmbers from "@/components/FloatingEmbers";
import FogOverlay from "@/components/FogOverlay";
import JournalEditor from "@/components/JournalEditor";
import ProfileDisplay from "@/components/ProfileDisplay";
import ScrapbookPanel from "@/components/ScrapbookPanel";
import MusicalDNAHub from "@/components/MusicalDNAHub";
import { usePortrait } from "@/hooks/usePortrait";
import { readUserSurfaceSettings } from "@/lib/userSurfaceSettings";

const SANCTUARY_NAV = [
  { href: "/origin", label: "Origin Story" },
  { href: "/profile", label: "Profile Room" },
  { href: "/creation-corner", label: "Creation Corner" },
  { href: "/blackboard-room", label: "Blackboard Room" },
  { href: "/dynamic-inner-world", label: "Dynamic Inner World" },
  { href: "/external-scaffold", label: "External Scaffold" },
  { href: "/musical-dna", label: "Musical DNA" },
  { href: "/documents", label: "Import Files" },
];

export default function SanctuaryPage() {
  useSEO(PAGE_SEO.sanctuary);
  useBillySection("sanctuary");
  const { isAuthenticated, isLoading, user } = useAuth();
  const [guestDemoStarted, setGuestDemoStarted] = useState(false);
  const portrait = usePortrait(isAuthenticated ? user?.id ?? null : null);
  const showGuestEntry = !isLoading && !isAuthenticated;
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    const settings = readUserSurfaceSettings();
    return settings.lowBandwidthMode || !settings.motionHints;
  });

  useEffect(() => {
    const syncSurfaceSettings = () => {
      const settings = readUserSurfaceSettings();
      setLowBandwidthMode(settings.lowBandwidthMode || !settings.motionHints);
    };

    syncSurfaceSettings();
    window.addEventListener("storage", syncSurfaceSettings);
    window.addEventListener("gestaltview:settings:surface", syncSurfaceSettings);
    return () => {
      window.removeEventListener("storage", syncSurfaceSettings);
      window.removeEventListener("gestaltview:settings:surface", syncSurfaceSettings);
    };
  }, []);

  return (
    <main className="operation-render-shell relative min-h-screen overflow-x-hidden bg-gv-bg-void text-gv-text-primary">
      {/* Sanctuary-specific layered atmosphere — willow silhouette, embers, fog */}
      {!lowBandwidthMode ? <WillowTreeOverlay /> : null}
      {!lowBandwidthMode ? <FloatingEmbers /> : null}
      {!lowBandwidthMode ? <FogOverlay /> : null}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:text-gv-text-primary">
              Home
            </a>
          </Link>
          <div className="hidden text-sm text-gv-text-muted md:block">Private place to write, keep, and return.</div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {SANCTUARY_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:border-white/20 hover:text-gv-text-primary">
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-gv-text-muted">Sanctuary</p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Write, gather, and keep only what you choose.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-gv-text-secondary sm:text-lg">
                A private room for journals, scraps, imported pieces, and the fragments you are not ready to explain yet.
              </p>
            </div>

            {showGuestEntry ? (
              <div className="rounded-[1.6rem] border border-cyan-200/20 bg-cyan-300/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gv-text-primary">Try Sanctuary as a guest</p>
                    <p className="mt-2 text-sm leading-6 text-gv-text-secondary">
                      Open a read-only room and hear one Billy response before creating an account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuestDemoStarted(true)}
                    className="rounded-full border border-cyan-200/25 bg-cyan-200/14 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/20"
                  >
                    Try as Guest
                  </button>
                </div>

                {guestDemoStarted ? (
                  <div className="mt-4 grid gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 p-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gv-text-muted">You</p>
                      <p className="mt-1 text-gv-text-secondary">I need a place to land before I decide what to save.</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Billy</p>
                      <p className="mt-1 leading-6 text-gv-text-primary">
                        Then we keep this simple. You can write one thing, import nothing, and leave without being tracked.
                        If something matters enough to keep, I will help you carry it into your world after signup.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="operation-render-surface rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                <p
                  className="text-sm font-semibold text-gv-text-primary"
                  style={{ fontFamily: "'Cabin Sketch', cursive", letterSpacing: "0.03em" }}
                >
                  What belongs here
                </p>
                <p
                  className="mt-2 text-sm leading-6 text-gv-text-secondary"
                  style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
                >
                  Journals, scrapbook pieces, imported files, and the musical self you want to keep near.
                </p>
              </div>
              <div className="operation-render-surface rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                <p
                  className="text-sm font-semibold text-gv-text-primary"
                  style={{ fontFamily: "'Cabin Sketch', cursive", letterSpacing: "0.03em" }}
                >
                  The Keeper says
                </p>
                <p
                  className="mt-2 text-sm leading-6 text-gv-text-secondary"
                  style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
                >
                  Keep what matters. Name it later if the name arrives.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <MusicalDNAHub />
            <ProfileDisplay
              userId={user?.id ?? "guest"}
              profile={portrait.profile}
              portrait={portrait.portrait}
              isLoading={portrait.isLoading}
              onRefreshRequest={portrait.refetch}
            />
            <div className="operation-render-surface-active rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-semibold text-gv-text-primary">Quiet note</p>
              <p className="mt-2 text-sm leading-6 text-gv-text-secondary">
                The room keeps your writing, your scraps, and your listening close. Nothing leaves here without your say.
              </p>
            </div>
          </div>
        </section>

        <section
          className="operation-render-surface-artifact mt-8 space-y-4 rounded-[2rem] border border-amber-100/10 bg-[linear-gradient(135deg,rgba(255,248,220,0.07),rgba(255,255,255,0.025)),radial-gradient(circle_at_24%_12%,rgba(255,210,140,0.08),transparent_34%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_22px_80px_rgba(0,0,0,0.18)] sm:p-4"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,248,220,0.07), rgba(255,255,255,0.025)), radial-gradient(circle at 24% 12%, rgba(255,210,140,0.08), transparent 34%), repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 9px)",
          }}
        >
          <JournalEditor />
          <ScrapbookPanel />
        </section>

        <p className="mt-8 text-center text-xs text-gv-text-muted">
          Nothing leaves here without your say.
        </p>
      </div>
    </main>
  );
}
