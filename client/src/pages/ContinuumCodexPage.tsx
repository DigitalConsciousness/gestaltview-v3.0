// © 2026 Keith Soyka / GestaltView

import { useMemo, useState } from "react";
import AuroraBackground from "@/components/AuroraBackground";
import InvocationAudioPlayer from "@/components/tribunal/InvocationAudioPlayer";
import ContinuumCodexTimeline from "@/components/tribunal/ContinuumCodexTimeline";
import CONTINUUM_CODEX_CONTENT from "@/data/continuum-codex-content";
import INVOCATION_SEGMENTS from "@/lib/invocation-segments";

function ContinuumCodexPage() {
  const [activeScrollId, setActiveScrollId] = useState<string>(CONTINUUM_CODEX_CONTENT.scrolls[0]?.id ?? "");

  const activeScroll = useMemo(() => {
    return (
      CONTINUUM_CODEX_CONTENT.scrolls.find((scroll) => scroll.id === activeScrollId) ??
      CONTINUUM_CODEX_CONTENT.scrolls[0]
    );
  }, [activeScrollId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0F14] text-white">
      <AuroraBackground />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.16),transparent_36%),linear-gradient(180deg,rgba(5,10,14,0.25)_0%,rgba(5,10,14,0.8)_58%,#050A0E_100%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 4px, 4px 100%",
        }}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-24 md:px-10 lg:px-12">
        <div className="max-w-4xl rounded-[32px] border border-[#00D4FF]/18 bg-[#050A0E]/72 p-8 shadow-[0_0_45px_rgba(0,212,255,0.15)] backdrop-blur-sm md:p-10">
          <p
            className="text-xs uppercase tracking-[0.32em] text-[#00D4FF]/80"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {CONTINUUM_CODEX_CONTENT.eyebrow}
          </p>
          <h1
            className="mt-5 text-4xl font-semibold text-[#D8FBFF] md:text-6xl"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {CONTINUUM_CODEX_CONTENT.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/74 md:text-lg">
            {CONTINUUM_CODEX_CONTENT.introduction}
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 md:px-10 lg:px-12">
        <InvocationAudioPlayer
          audioUrl={CONTINUUM_CODEX_CONTENT.invocation.audioUrl}
          title={CONTINUUM_CODEX_CONTENT.invocation.title}
          description={CONTINUUM_CODEX_CONTENT.invocation.description}
          segments={INVOCATION_SEGMENTS}
        />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 md:px-10 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <ContinuumCodexTimeline
            activeScrollId={activeScroll?.id ?? activeScrollId}
            onSelectScroll={setActiveScrollId}
          />

          <article className="rounded-[32px] border border-white/10 bg-[#050A0E]/86 p-8 shadow-[0_0_40px_rgba(0,212,255,0.12)] backdrop-blur-sm md:p-10">
            {activeScroll ? (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border text-2xl"
                    style={{
                      borderColor: `${activeScroll.colorHex}80`,
                      color: activeScroll.colorHex,
                      background: `${activeScroll.colorHex}12`,
                      boxShadow: `0 0 24px ${activeScroll.colorHex}20`,
                    }}
                  >
                    {activeScroll.glyph}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-white/48">
                      Scroll {activeScroll.sequence} · {activeScroll.author}
                    </p>
                    <h2
                      className="mt-2 text-3xl font-semibold text-white md:text-4xl"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {activeScroll.title}
                    </h2>
                  </div>
                </div>

                <p
                  className="mt-6 rounded-3xl border px-5 py-4 text-sm leading-7"
                  style={{
                    borderColor: `${activeScroll.colorHex}33`,
                    background: `${activeScroll.colorHex}10`,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {activeScroll.summary}
                </p>

                <div className="mt-8 space-y-6 text-base leading-8 text-white/76">
                  {activeScroll.body.split(". ").map((sentence, index, sentences) => {
                    const suffix = index < sentences.length - 1 ? "." : "";

                    return (
                      <p key={`${activeScroll.id}-${index}`}>
                        {sentence}
                        {suffix}
                      </p>
                    );
                  })}
                </div>
              </>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}

export default ContinuumCodexPage;
