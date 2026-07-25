"use client";

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Search, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useBillySection } from "@/components/Billy";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  EmbodimentBadge,
  EmbodimentCard,
  PrivateInteriorSeal,
} from "@/components/embodiment";
import {
  getAllEmbodimentProfiles,
  getEmbodimentGovernanceSummary,
} from "@/lib/embodimentRuntime";
import type { EmbodimentProfile } from "@shared/embodiment";

const ACADEMY_PRINCIPLES = [
  {
    icon: BookOpen,
    title: "Orientation before authority",
    copy:
      "Every profile explains what it is, what it protects, and where the user stays in control.",
  },
  {
    icon: ShieldCheck,
    title: "Consent in the loop",
    copy:
      "Memory and persistence stay visible as governance choices instead of hidden implementation details.",
  },
  {
    icon: Sparkles,
    title: "Personality with purpose",
    copy:
      "Profile quirks are allowed when they help the ecosystem hold the user more carefully.",
  },
  {
    icon: UsersRound,
    title: "Harmony over hierarchy",
    copy:
      "The academy shows the ecosystem as a set of governed collaborators, not a single generic agent shell.",
  },
] as const;

const STATUS_FILTERS = [
  "all",
  "active",
  "draft",
  "founder-only",
  "experimental",
  "archived",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type ProfileStatusKey = Exclude<StatusFilter, "all">;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function profileMatchesSearch(profile: EmbodimentProfile, query: string): boolean {
  const normalized = normalizeText(query);

  if (!normalized) {
    return true;
  }

  return [
    profile.publicName,
    profile.slug,
    profile.immutableCore.archetype,
    profile.immutableCore.coreWisdom,
  ].some((field) => field.toLowerCase().includes(normalized));
}

function profileStatus(profile: EmbodimentProfile): StatusFilter {
  return (profile.profileStatus ?? "active") as StatusFilter;
}

export default function DigitalIntelligenceAcademyPage() {
  useSEO(PAGE_SEO.digitalIntelligenceAcademy);
  useBillySection("digital-intelligence-academy");

  const { isAuthenticated, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allProfiles = useMemo(() => getAllEmbodimentProfiles(), []);

  const visibleProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      const governance = getEmbodimentGovernanceSummary(profile);
      const founderRestricted = governance.founderOnly;

      if (isAuthenticated && !isAdmin && founderRestricted) {
        return false;
      }

      const status = profileStatus(profile);
      const statusMatches =
        statusFilter === "all" ? true : status === statusFilter;

      return statusMatches && profileMatchesSearch(profile, search);
    });
  }, [allProfiles, isAdmin, isAuthenticated, search, statusFilter]);

  const hiddenFounderOnlyCount = useMemo(() => {
    if (!isAuthenticated || isAdmin) {
      return 0;
    }

    return allProfiles.filter((profile) => getEmbodimentGovernanceSummary(profile).founderOnly)
      .length;
  }, [allProfiles, isAdmin, isAuthenticated]);

  const visibleStatusCounts = useMemo(() => {
    const counts: Record<ProfileStatusKey, number> = {
      active: 0,
      draft: 0,
      "founder-only": 0,
      experimental: 0,
      archived: 0,
    };

    for (const profile of visibleProfiles) {
      const status = profileStatus(profile) as ProfileStatusKey;
      counts[status] += 1;
    }

    return counts;
  }, [visibleProfiles]);

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-x-hidden bg-[#05060A] text-white pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(0,212,255,0.15), transparent 22%), radial-gradient(circle at 82% 20%, rgba(153,69,255,0.16), transparent 20%), radial-gradient(circle at 50% 78%, rgba(0,255,163,0.10), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 24%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-14 flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
              Home
            </a>
          </Link>
          <div className="flex flex-wrap gap-2">
            <EmbodimentBadge
              name={isAdmin ? "Founder access" : isAuthenticated ? "Signed in" : "Public"}
              status={isAdmin ? "active" : "founder-only"}
            />
            <PrivateInteriorSeal className="border-white/12 bg-white/[0.03]" />
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
              Digital Intelligence Academy
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Teach the ecosystem to hold people with dignity.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/68">
              The academy now shows live embodiment profiles, governance state, and access
              boundaries without exposing private interior content.
            </p>

            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-white/42">
              <span>{allProfiles.length} profiles in registry</span>
              <span>•</span>
              <span>{visibleProfiles.length} visible now</span>
              {hiddenFounderOnlyCount > 0 ? (
                <>
                  <span>•</span>
                  <span>{hiddenFounderOnlyCount} founder-only hidden</span>
                </>
              ) : null}
            </div>
          </div>

          <GlassCard glow="cyan" intensity="high" className="relative overflow-hidden p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent"
            />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-[#7FE9FF]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
                  Profile search
                </p>
              </div>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/40">
                  Search by name, slug, or archetype
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="billy, the-weaver, advisor..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#7FE9FF]/35 focus:bg-black/40"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => {
                  const isActive = filter === statusFilter;
                  const count =
                    filter === "all"
                      ? allProfiles.length
                      : visibleStatusCounts[filter as Exclude<StatusFilter, "all">];

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                        isActive
                          ? "border-[#7FE9FF]/35 bg-[#7FE9FF]/12 text-white"
                          : "border-white/10 bg-black/20 text-white/52 hover:bg-white/[0.05]"
                      }`}
                    >
                      {filter}
                      <span className="ml-2 text-[10px] text-white/32">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ACADEMY_PRINCIPLES.map((item) => (
            <GlassCard key={item.title} glow="none" intensity="medium" className="p-5" hover={false}>
              <item.icon className="h-5 w-5 text-[#7FE9FF]" />
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.copy}</p>
            </GlassCard>
          ))}
        </section>

        <section className="mt-16 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C7A5FF]">
                Registry view
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Real embodiment profiles</h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-white/56">
              Cards only surface public-safe profile data: name, status, archetype, wisdom, and
              governance boundary notes. Private interior content stays sealed.
            </p>
          </div>

          {visibleProfiles.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {visibleProfiles.map((profile, index) => {
                const readiness = profile.readinessScore;
                const governance = getEmbodimentGovernanceSummary(profile);

                return (
                  <motion.div
                    key={profile.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.02 }}
                    className="space-y-3"
                  >
                    <EmbodimentCard profile={profile} />
                    {typeof readiness === "number" ? (
                      <GlassCard
                        glow="none"
                        intensity="medium"
                        className="flex items-center justify-between gap-4 px-4 py-3"
                        hover={false}
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">
                            Readiness
                          </p>
                          <p className="mt-1 text-sm text-white/74">
                            {Math.round(readiness * 100)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/32">
                            Governance
                          </p>
                          <p className="mt-1 text-sm text-white/74">
                            {governance.reviewGated ? "Review gated" : "Open"}
                          </p>
                        </div>
                      </GlassCard>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <GlassCard glow="none" intensity="medium" className="p-8" hover={false}>
              <p className="text-lg font-semibold text-white">No profiles match this filter.</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Try clearing the search or switching the status filter. Private interior content is
                never shown here.
              </p>
            </GlassCard>
          )}
        </section>
      </div>
    </main>
  );
}
