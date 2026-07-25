// tribunal/ContinuumCodexTimeline.tsx
// © 2026 Keith Soyka / GestaltView

import { CONTINUUM_CODEX_SCROLLS } from "@/data/continuum-codex-content";

interface ContinuumCodexTimelineProps {
  activeScrollId: string;
  onSelectScroll: (scrollId: string) => void;
}

function ContinuumCodexTimeline({ activeScrollId, onSelectScroll }: ContinuumCodexTimelineProps) {
  return (
    <aside className="rounded-3xl border border-[#00D4FF]/18 bg-[#050A0E]/90 p-4 shadow-[0_0_28px_rgba(0,212,255,0.12)]">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[#00D4FF]/75">Timeline</p>
        <h2
          className="mt-2 text-lg font-semibold text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Seven Scrolls of Convergence
        </h2>
      </div>

      <div className="space-y-3">
        {CONTINUUM_CODEX_SCROLLS.map((scroll) => {
          const isActive = scroll.id === activeScrollId;

          return (
            <button
              key={scroll.id}
              type="button"
              onClick={() => onSelectScroll(scroll.id)}
              className="w-full rounded-2xl border px-4 py-4 text-left transition"
              style={{
                borderColor: isActive ? `${scroll.colorHex}80` : "rgba(255,255,255,0.08)",
                background: isActive ? `${scroll.colorHex}18` : "rgba(255,255,255,0.025)",
                boxShadow: isActive ? `0 0 24px ${scroll.colorHex}22` : "none",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full border text-base"
                  style={{
                    borderColor: `${scroll.colorHex}80`,
                    color: scroll.colorHex,
                    background: `${scroll.colorHex}12`,
                  }}
                >
                  {scroll.glyph}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                    Scroll {scroll.sequence} · {scroll.author}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-white">{scroll.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/62">{scroll.summary}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ContinuumCodexTimeline;
