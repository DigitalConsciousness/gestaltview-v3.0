import { memo } from "react";

import { cn } from "@/lib/utils";
import type { CompatibilityResult } from "@shared/gate/schemas";

interface GATECompatibilityWarningsProps {
  compatibility: CompatibilityResult;
}

function severityClasses(severity: "error" | "warning" | "info") {
  if (severity === "error") {
    return "border-[rgba(255,92,138,0.35)] bg-[rgba(255,92,138,0.08)] text-[rgba(255,220,228,0.96)]";
  }

  if (severity === "warning") {
    return "border-[rgba(247,178,103,0.35)] bg-[rgba(247,178,103,0.08)] text-[rgba(255,237,199,0.96)]";
  }

  return "border-[rgba(120,214,255,0.28)] bg-[rgba(18,214,255,0.06)] text-[rgba(214,250,255,0.95)]";
}

function GATECompatibilityWarnings({
  compatibility,
}: GATECompatibilityWarningsProps) {
  if (compatibility.findings.length === 0) {
    return (
      <div className="rounded-[28px] border border-[rgba(120,214,255,0.18)] bg-[rgba(10,16,24,0.7)] px-5 py-4">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
          Compatibility
        </p>
        <p className="mt-2 text-sm text-slate-200">
          No blocking conflicts detected for the current package shape.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
          Compatibility Findings
        </p>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]",
            compatibility.checkoutMode === "request_review"
              ? "border-[rgba(247,178,103,0.35)] bg-[rgba(247,178,103,0.08)] text-[var(--gv-ember-gold)]"
              : "border-[rgba(110,231,183,0.35)] bg-[rgba(110,231,183,0.08)] text-[rgba(214,255,233,0.96)]"
          )}
        >
          {compatibility.checkoutMode === "request_review"
            ? "Review Required"
            : "Pay Now Supported"}
        </span>
      </div>

      {compatibility.findings.map((finding) => (
        <div
          key={finding.id}
          className={cn(
            "rounded-[24px] border px-4 py-4",
            severityClasses(finding.severity)
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em]">
              {finding.severity}
            </p>
          </div>
          <p className="mt-2 text-sm leading-6">{finding.message}</p>
          {finding.resolution ? (
            <p className="mt-2 text-xs leading-5 text-inherit/85">
              Resolution: {finding.resolution}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default memo(GATECompatibilityWarnings);
