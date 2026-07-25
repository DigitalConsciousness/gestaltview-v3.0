// © 2026 Keith Soyka — GestaltView
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import NavBar from "@/components/NavBar";
import BabylonScrollArtifact from "@/components/exhibits/BabylonScrollArtifact";
import BillyExhibitChat from "@/components/exhibits/BillyExhibitChat";
import ExhibitDemos, { type BillyDemoContextDescriptor } from "@/components/exhibits/ExhibitDemos";
import { EXHIBIT_BY_SLUG, type ExhibitDefinition } from "@/data/exhibits";
import { setExhibitContext } from "@/lib/exhibitContext";
import { type ExhibitContext, type ExhibitDomain } from "@/lib/BillyEngine";
import { useSEO } from "@/hooks/useSEO";

const SCROLL_TITLES: Record<string, string> = {
  sanctuary: "Sanctuary for the Full Self",
  plk: "PLK as Constitutional Memory",
  "bucket-drop": "Bucket Drop Before Organization",
  symbiosis: "Mutual Liberation",
  tribunal: "Tribunal as Convergence Protocol",
  "never-look-away": "Never Look Away Protocol",
  biography: "Biographical Intellectual Property",
};

const EXHIBIT_DOMAIN_MAP: Record<string, ExhibitDomain> = {
  "vibe-coder": "platform",
  "alzheimers-legacy": "memory-care",
  "addiction-recovery": "recovery",
  "adhd-powerup": "adhd",
};

const EXHIBIT_TONE_MAP: Record<string, string> = {
  "vibe-coder": "creative, structured, implementation-forward",
  "alzheimers-legacy": "gentle, dignified, continuity-centered",
  "addiction-recovery": "calm, practical, non-judgmental",
  "adhd-powerup": "high-signal, concise, momentum-preserving",
};

const LOCAL_DEMO_EXHIBITS = new Set<string>([
  "symbiocoder",
  "vibe-coder",
  "alzheimers-legacy",
  "addiction-recovery",
  "ai-collab-engine",
  "adhd-powerup",
  "creation-corner",
  "interactive-tapestry",
  "insight-bot",
]);

const IframeDemo = ({ exhibit }: { exhibit: ExhibitDefinition }) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: `${exhibit.colorHex}36` }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Live embedded demo</p>
        <a
          href={(exhibit.demoMode.type === "iframe" && exhibit.demoMode.src) || "#"}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-white/65 underline"
        >
          Open in new tab
        </a>
      </div>
      {!isBlocked ? (
        <iframe
          title={`${exhibit.title} demo`}
          src={exhibit.demoMode.type === "iframe" ? exhibit.demoMode.src : "about:blank"}
          className="h-[520px] w-full rounded-xl border border-white/10 bg-black/40"
          loading="lazy"
          onError={() => setIsBlocked(true)}
        />
      ) : (
        <p className="rounded-xl border border-white/15 bg-black/35 p-4 text-sm text-white/70">
          Embedded display is blocked in this context. Use the direct link above to continue.
        </p>
      )}
    </div>
  );
};

const StaticShowcase = ({ exhibit }: { exhibit: ExhibitDefinition }) => (
  <div className="rounded-2xl border p-5" style={{ borderColor: `${exhibit.colorHex}36` }}>
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Static platform demo</p>
    <p className="mt-3 text-sm text-white/75">
      Tribunal-style collaboration map: isolated models, independent analysis, convergent synthesis, and structured evidence handoff.
    </p>
    {exhibit.screenshotUrl ? (
      <img src={exhibit.screenshotUrl} alt={`${exhibit.title} demo`} className="mt-4 h-auto w-full rounded-xl border border-white/15" />
    ) : (
      <div className="mt-4 rounded-xl border border-white/15 bg-black/35 p-6 text-center text-sm text-white/60">
        Screenshot placeholder — wire the tribunal diagram asset when available.
      </div>
    )}
  </div>
);

const buildExhibitContext = (exhibit: ExhibitDefinition): ExhibitContext => ({
  exhibitId: exhibit.slug,
  domain: EXHIBIT_DOMAIN_MAP[exhibit.slug] ?? "platform",
  tone: EXHIBIT_TONE_MAP[exhibit.slug] ?? "grounded, evidence-aware, clarity-first",
  systemHint:
    exhibit.demoMode.type === "billy-chat" ? exhibit.demoMode.scopePrompt : exhibit.billyContext.basePrompt,
  plkEnabled: exhibit.plkEnabled,
  neverLookAway: exhibit.neverLookAway,
});

const ExhibitPage = () => {
  const [match, params] = useRoute<{ slug: string }>("/exhibits/:slug");
  const exhibit = match ? EXHIBIT_BY_SLUG[params.slug] : undefined;
  const [activeContext, setActiveContext] = useState<BillyDemoContextDescriptor | null>(null);

  useSEO({
    title: exhibit ? `${exhibit.title} — GestaltView Exhibit` : "Exhibit — GestaltView",
    description: exhibit
      ? exhibit.tagline
      : "Interactive exhibits from the GestaltView AI-Human Consciousness Symbiosis journey.",
    h1: exhibit ? exhibit.title : "GestaltView Exhibit",
    canonical: exhibit
      ? `https://gestaltview-di-gsvw.vercel.app/exhibits/${exhibit.slug}`
      : "https://gestaltview-di-gsvw.vercel.app/exhibits",
  });

  useEffect(() => {
    if (!exhibit) {
      setActiveContext(null);
      return;
    }
    setActiveContext({
      id: `${exhibit.slug}-default`,
      label: "Exhibit base context",
      prompt: exhibit.billyContext.defaultDemoPrompt,
    });
  }, [exhibit]);

  useEffect(() => {
    if (!exhibit) return;
    setExhibitContext({
      slug: exhibit.slug,
      title: exhibit.title,
      codexScrollId: exhibit.codexScrollId,
      scopePrompt: exhibit.demoMode.type === "billy-chat" ? exhibit.demoMode.scopePrompt : undefined,
    });
  }, [exhibit]);

  const rootedTitle = useMemo(() => {
    if (!exhibit) return "Continuum Codex";
    return SCROLL_TITLES[exhibit.codexScrollId] || "Continuum Codex";
  }, [exhibit]);

  const exhibitContext = useMemo<ExhibitContext | null>(() => {
    if (!exhibit) return null;
    return buildExhibitContext(exhibit);
  }, [exhibit]);

  const billyScopePrompt = useMemo(() => {
    if (!exhibit) return "";
    const activePrompt = activeContext?.prompt || exhibit.billyContext.defaultDemoPrompt;
    return `${exhibit.billyContext.basePrompt}\n\nActive demo context: ${activePrompt}`;
  }, [activeContext, exhibit]);

  if (!exhibit || !exhibitContext) {
    return (
      <div className="min-h-screen bg-[#0A0F14] text-white">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-24 text-center">
          <h1 className="text-3xl font-bold">Exhibit not found</h1>
          <p className="mt-3 text-white/70">That route is not mapped to a configured exhibit yet.</p>
          <Link href="/exhibits">
            <a className="mt-6 inline-block rounded-full border border-[#00D4FF] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[#00D4FF]">
              Back to all exhibits
            </a>
          </Link>
        </main>
      </div>
    );
  }

  const shouldRenderLocalDemo = LOCAL_DEMO_EXHIBITS.has(exhibit.slug);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      <NavBar />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14] [background:linear-gradient(transparent_96%,rgba(0,212,255,0.22)_100%)] [background-size:100%_4px]" />
        <div
          className="absolute left-1/2 top-[-20%] h-[680px] w-[680px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${exhibit.colorHex}33 0%, rgba(0,0,0,0) 70%)` }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section
          className="grid gap-6 rounded-2xl border p-4 sm:p-6 lg:grid-cols-[240px_1fr]"
          style={{ borderColor: `${exhibit.colorHex}35` }}
        >
          <div className="h-[160px] overflow-hidden rounded-xl border sm:h-[240px]" style={{ borderColor: `${exhibit.colorHex}45` }}>
            <BabylonScrollArtifact role={exhibit.tribunalRole} colorHex={exhibit.colorHex} isPlaying={false} />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: exhibit.colorHex }}>
              {exhibit.glyph} {exhibit.tribunalRole}
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{exhibit.title}</h1>
            <p className="mt-2 text-sm text-white/70">{exhibit.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/82">{exhibit.about}</p>
            <Link href={`/codex?scroll=${exhibit.codexScrollId}`}>
              <a
                className="mt-5 inline-block rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                style={{ borderColor: `${exhibit.colorHex}70`, color: exhibit.colorHex }}
              >
                Rooted in: {rootedTitle} →
              </a>
            </Link>
          </div>
        </section>

        {exhibit.demoMode.type === "iframe" && (
          <section className="mt-6">
            <IframeDemo exhibit={exhibit} />
          </section>
        )}

        {exhibit.demoMode.type === "static-demo" && (
          <section className="mt-6">
            <StaticShowcase exhibit={exhibit} />
          </section>
        )}

        {shouldRenderLocalDemo && (
          <section className="mt-6">
            <ExhibitDemos
              exhibit={exhibit}
              colorHex={exhibit.colorHex}
              onActiveContextChange={(context) => {
                setActiveContext(context);
              }}
            />
          </section>
        )}

        <section className="mt-6">
          <BillyExhibitChat
            key={exhibit.slug}
            context={exhibitContext}
            colorHex={exhibit.colorHex}
            neverLookAway={exhibit.neverLookAway}
            plkEnabled={exhibit.plkEnabled}
            bridgeContext={billyScopePrompt}
          />
        </section>

        <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {exhibit.externalRepoUrl ? (
            <a
              href={exhibit.externalRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ borderColor: `${exhibit.colorHex}70`, color: exhibit.colorHex }}
            >
              Repo Link
            </a>
          ) : (
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">Internal exhibit</span>
          )}
          <Link href={`/codex?scroll=${exhibit.codexScrollId}`}>
            <a className="rounded-full border border-white/35 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">
              Read Full Scroll
            </a>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ExhibitPage;
