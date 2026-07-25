import { useState, type FC } from "react";
import BlockchainBadge from "./BlockchainBadge";
import type { ChronologyEntry } from "./types";

interface EvidenceTimelineProps {
  entries: ChronologyEntry[];
}

function formatDate(dateOrPeriod: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrPeriod)) {
    const date = new Date(`${dateOrPeriod}T00:00:00`);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  if (/^\d{4}-\d{2}-Mid$/.test(dateOrPeriod)) {
    const [year, month] = dateOrPeriod.split("-");
    const monthName = new Date(`${year}-${month}-01T00:00:00`).toLocaleDateString("en-US", { month: "long" });
    return `Mid-${monthName} ${year}`;
  }

  if (/^\d{4}-\d{2} to \d{4}-\d{2}$/.test(dateOrPeriod)) {
    const [start, end] = dateOrPeriod.split(" to ");
    const [startYear, startMonth] = start.split("-");
    const [endYear, endMonth] = end.split("-");
    const startName = new Date(`${startYear}-${startMonth}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" });
    const endName = new Date(`${endYear}-${endMonth}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" });
    return `${startName}–${endName} ${endYear}`;
  }

  return dateOrPeriod;
}

const EvidenceTimeline: FC<EvidenceTimelineProps> = ({ entries }) => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const anchored = entry.blockchainanchored === true;

        return (
          <article key={`${entry.dateorperiod}-${index}`} className="rounded-xl border-l-4 border px-4 py-4" style={{ borderLeftColor: anchored ? "#10B981" : "rgba(148,163,184,0.45)", borderStyle: anchored ? "solid" : "dashed", background: "#050A0E", borderColor: "rgba(0,212,255,0.22)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${anchored ? "font-semibold text-white" : "text-cyan-100/85"}`}>{formatDate(entry.dateorperiod)}</p>
              {anchored ? <BlockchainBadge bitcoinBlock={entry.bitcoinblock} /> : null}
            </div>
            <p className="mt-3 text-cyan-50">{entry.eventorphase}</p>
            <p className="mt-2 text-xs text-cyan-100/70">{entry.evidencefile} • {entry.confidence}</p>
            <button type="button" className="mt-3 text-xs text-cyan-300" aria-expanded={Boolean(openItems[index])} onClick={() => setOpenItems((previous) => ({ ...previous, [index]: !previous[index] }))}>
              {openItems[index] ? "[−] Protocol note" : "[+] Protocol note"}
            </button>
            {openItems[index] ? <p className="mt-2 text-sm text-cyan-100/85">{entry.notes}</p> : null}
          </article>
        );
      })}
    </div>
  );
};

export default EvidenceTimeline;
