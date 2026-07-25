import type { FC } from "react";
import type { Lane } from "./types";

interface LaneBadgeProps {
  lane?: Lane | string | null;
}

const laneStyles: Record<Lane, { bg: string; border: string; color: string; icon: string }> = {
  Documented: { bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.55)", color: "#34D399", icon: "✓" },
  "Needs Translation": { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.55)", color: "#FBBF24", icon: "⚡" },
  Aspirational: { bg: "rgba(14,165,233,0.18)", border: "rgba(14,165,233,0.55)", color: "#38BDF8", icon: "◎" },
};

function normalizeLane(lane: LaneBadgeProps["lane"]): Lane {
  const normalized = String(lane ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (normalized.includes("needs") && normalized.includes("translation")) return "Needs Translation";
  if (normalized.includes("aspirational")) return "Aspirational";
  return "Documented";
}

const LaneBadge: FC<LaneBadgeProps> = ({ lane }) => {
  const safeLane = normalizeLane(lane);
  const style = laneStyles[safeLane];

  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium" style={{ background: style.bg, borderColor: style.border, color: style.color }}>
      <span>{style.icon}</span>
      {safeLane}
    </span>
  );
};

export default LaneBadge;
