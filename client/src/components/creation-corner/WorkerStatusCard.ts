import { createElement } from "react";

type WorkerStatusCardProps = {
  id: string;
  label: string;
  status: string;
  summary: string;
  dependsOn: string[];
};

function statusTone(status: string): string {
  switch (status) {
    case "done":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-50";
    case "running":
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-50";
    case "failed":
      return "border-rose-300/20 bg-rose-300/10 text-rose-50";
    case "skipped":
      return "border-slate-300/20 bg-slate-300/10 text-slate-50";
    default:
      return "border-white/10 bg-white/[0.04] text-gv-text-primary";
  }
}

export function WorkerStatusCard({ id, label, status, summary, dependsOn }: WorkerStatusCardProps) {
  return createElement(
    "article",
    { className: "rounded-[1.1rem] border border-white/10 bg-black/20 p-3" },
    createElement(
      "div",
      { className: "flex items-center justify-between gap-3" },
      createElement(
        "div",
        null,
        createElement("p", { className: "text-sm font-semibold text-gv-text-primary" }, label),
        createElement("p", { className: "mt-1 text-[10px] uppercase tracking-[0.2em] text-gv-text-muted" }, id),
      ),
      createElement("span", {
        className: `rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${statusTone(status)}`,
      }, status),
    ),
    createElement("p", { className: "mt-3 text-sm leading-6 text-gv-text-secondary" }, summary),
    dependsOn.length > 0
      ? createElement(
          "p",
          { className: "mt-2 text-[11px] uppercase tracking-[0.18em] text-gv-text-muted" },
          `Depends on ${dependsOn.join(", ")}`,
        )
      : null,
  );
}
