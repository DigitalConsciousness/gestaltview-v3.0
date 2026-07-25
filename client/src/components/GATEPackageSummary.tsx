import { memo } from "react";

import type { GateDraftAnalysis } from "@shared/gate/schemas";

interface GATEPackageSummaryProps {
  analysis: GateDraftAnalysis;
  savedDraftId: string | null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function GATEPackageSummary({
  analysis,
  savedDraftId,
}: GATEPackageSummaryProps) {
  return (
    <aside className="space-y-5 rounded-[32px] border border-[rgba(120,214,255,0.18)] bg-[rgba(7,12,18,0.82)] p-6 backdrop-blur-xl">
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.22em] text-[var(--gv-electric-cyan)]">
          Package Summary
        </p>
        <h2 className="min-h-[3.5rem] font-display text-2xl font-bold uppercase tracking-[0.05em] text-white">
          {analysis.draft.companyName || "Bespoke package"}
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          {analysis.draft.useCaseSlug.replace(/-/g, " ")} · {analysis.draft.backend} ·{" "}
          {analysis.draft.deliverySurfaces.join(", ")}
        </p>
        {savedDraftId ? (
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Draft ID: {savedDraftId}
          </p>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-black/20 px-4 py-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
          Estimated Total
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-white">
          {formatCurrency(analysis.quote.totalCents)}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Deterministic quote from tier, backend, surfaces, packs, bundles, and installer scope.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
          Price Breakdown
        </p>
        {analysis.quote.breakdown.map((item) => (
          <div
            key={item.code}
            className="flex items-start justify-between gap-4 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
                {item.kind}
              </p>
            </div>
            <p className="text-sm font-mono text-slate-200">
              {formatCurrency(item.amountCents)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
          Deliverables Preview
        </p>
        <div className="grid gap-2">
          {analysis.deliverables.map((item) => (
            <div
              key={item}
              className="rounded-[18px] border border-white/8 bg-white/[0.025] px-3 py-3 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
          Recommended Next
        </p>
        <div className="flex flex-wrap gap-2">
          {analysis.recommendations.operatorPackSlugs.map((slug) => (
            <span
              key={slug}
              className="rounded-full border border-[rgba(255,60,172,0.28)] bg-[rgba(255,60,172,0.08)] px-3 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-white"
            >
              {slug.replace(/-/g, " ")}
            </span>
          ))}
          {analysis.recommendations.sourceBundleSlugs.map((slug) => (
            <span
              key={slug}
              className="rounded-full border border-[rgba(18,214,255,0.24)] bg-[rgba(18,214,255,0.08)] px-3 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-white"
            >
              {slug.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default memo(GATEPackageSummary);
