import { useMemo, useState, type FC } from "react";
import BlockchainBadge from "./DiligenceExplorer/BlockchainBadge";
import { useDiligenceData } from "./DiligenceExplorer/useDiligenceData";
import type { ChronologyEntry } from "./DiligenceExplorer/types";

type EventCategory = "Genesis" | "Development" | "Validation" | "Core IP" | "Milestone";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  Genesis: "#22ee8d",
  Development: "#00D4FF",
  Validation: "#f59e0b",
  "Core IP": "#b81afa",
  Milestone: "#ff4d8d",
};

function inferCategory(entry: ChronologyEntry): EventCategory {
  const t = `${entry.eventorphase} ${entry.notes ?? ""}`;
  if (/tribunal|pepperdine|symbiosis|founders.network|proof/i.test(t)) return "Validation";
  if (/genesis|catalyst|pain.to.pattern|inception/i.test(t)) return "Genesis";
  if (/\bplk\b|schema|\bip\b|copyright|seed.prompt|blockchain|172|loom.approach/i.test(t)) return "Core IP";
  if (/sprint.*culmin|harmony|universe.allows|emergence|full.integration/i.test(t)) return "Milestone";
  return "Development";
}

const ContinuumTimeline3D: FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<ChronologyEntry | null>(null);
  const { data } = useDiligenceData();

  const timeline = useMemo(() => {
    return data?.chronology ?? [];
  }, [data]);

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-[#050A0E] p-4 text-cyan-50 shadow-[0_0_32px_rgba(0,212,255,0.08)]">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-cyan-400/15 bg-slate-950/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">3D Loom Guide</p>
          <p className="mt-2 text-sm leading-relaxed text-cyan-100/85">
            The original 3D loom has been simplified into an interactive chronology panel so the data stays visible without the Babylon render cost.
          </p>

          <div className="mt-4 space-y-3">
            {timeline.map((entry, index) => {
              const category = inferCategory(entry);
              const isSelected = selectedEntry?.dateorperiod === entry.dateorperiod && selectedEntry?.eventorphase === entry.eventorphase;

              return (
                <button
                  key={`${entry.dateorperiod}-${index}`}
                  type="button"
                  onClick={() => setSelectedEntry(entry)}
                  className={[
                    "w-full rounded-xl border px-3 py-3 text-left transition",
                    isSelected ? "border-cyan-400/40 bg-cyan-400/10" : "border-cyan-400/10 bg-white/5 hover:border-cyan-400/25 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300/70">{entry.dateorperiod}</p>
                      <h3 className="mt-1 text-sm font-semibold text-white">{entry.eventorphase}</h3>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px]" style={{ color: CATEGORY_COLORS[category] }}>
                      {category}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-cyan-100/75">{entry.notes}</p>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-xl border border-cyan-500/20 bg-[#0A0F14]/95 p-4">
          {selectedEntry ? (
            <>
              <p className="font-mono text-xs text-cyan-300">{selectedEntry.dateorperiod}</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{selectedEntry.eventorphase}</h3>
              <p className="mt-2 text-sm text-cyan-100/85">{selectedEntry.notes}</p>
              <p className="mt-2 font-mono text-xs text-cyan-400/75">{selectedEntry.evidencefile}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selectedEntry.blockchainanchored ? <BlockchainBadge bitcoinBlock={selectedEntry.bitcoinblock} /> : null}
                <span className="rounded border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-xs" style={{ color: CATEGORY_COLORS[inferCategory(selectedEntry)] }}>
                  {inferCategory(selectedEntry)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-cyan-100/70">Select a chronology entry to inspect its details.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ContinuumTimeline3D;
