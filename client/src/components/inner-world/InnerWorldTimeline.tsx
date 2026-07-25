/**
 * InnerWorldTimeline
 * ==================
 * A temporal navigation rail for the Dynamic Inner World museum.
 * Allows the user to filter visible artifacts by time range — "see yourself
 * at a point in time, or across all time."
 *
 * Design: Neural Aurora dark field, amber/cyan accent, minimal chrome.
 * No productivity scores. No progress bars. Just time.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

export type TimelineRange = "all" | "today" | "week" | "month" | "quarter" | "year";

interface InnerWorldTimelineProps {
  artifacts: InnerWorldArtifactRecord[];
  activeRange: TimelineRange;
  onRangeChange: (range: TimelineRange) => void;
  className?: string;
}

const RANGE_LABELS: Record<TimelineRange, string> = {
  all: "All Time",
  today: "Today",
  week: "This Week",
  month: "This Month",
  quarter: "This Quarter",
  year: "This Year",
};

function getArtifactCountForRange(
  artifacts: InnerWorldArtifactRecord[],
  range: TimelineRange,
): number {
  if (range === "all") return artifacts.length;
  const now = Date.now();
  const cutoffs: Record<Exclude<TimelineRange, "all">, number> = {
    today: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    quarter: 90 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - cutoffs[range as Exclude<TimelineRange, "all">];
  return artifacts.filter((a) => {
    const ts = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return ts >= cutoff;
  }).length;
}

/**
 * Filter an artifact list to only those within the given time range.
 */
export function filterArtifactsByRange(
  artifacts: InnerWorldArtifactRecord[],
  range: TimelineRange,
): InnerWorldArtifactRecord[] {
  if (range === "all") return artifacts;
  const now = Date.now();
  const cutoffs: Record<Exclude<TimelineRange, "all">, number> = {
    today: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    quarter: 90 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };
  const cutoff = now - cutoffs[range as Exclude<TimelineRange, "all">];
  return artifacts.filter((a) => {
    const ts = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return ts >= cutoff;
  });
}

export default function InnerWorldTimeline({
  artifacts,
  activeRange,
  onRangeChange,
  className = "",
}: InnerWorldTimelineProps) {
  const ranges = useMemo<TimelineRange[]>(
    () => ["all", "year", "quarter", "month", "week", "today"],
    [],
  );

  return (
    <nav
      aria-label="Timeline filter"
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
    >
      {ranges.map((range) => {
        const count = getArtifactCountForRange(artifacts, range);
        const isActive = range === activeRange;
        return (
          <motion.button
            key={range}
            onClick={() => onRangeChange(range)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={[
              "relative rounded-full border px-3 py-1 text-xs font-medium transition-all",
              isActive
                ? "border-gv-accent-cyan/60 bg-gv-accent-cyan/10 text-gv-accent-cyan shadow-[0_0_8px_rgba(18,214,255,0.18)]"
                : "border-white/10 bg-white/[0.03] text-gv-text-muted hover:border-white/20 hover:text-gv-text-secondary",
            ].join(" ")}
            aria-pressed={isActive}
            title={`${count} artifact${count !== 1 ? "s" : ""} in this range`}
          >
            {RANGE_LABELS[range]}
            {count > 0 && (
              <span
                className={[
                  "ml-1.5 rounded-full px-1 py-0.5 text-[10px] tabular-nums",
                  isActive
                    ? "bg-gv-accent-cyan/20 text-gv-accent-cyan"
                    : "bg-white/[0.06] text-gv-text-muted",
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
