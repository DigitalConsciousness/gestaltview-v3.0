import { createElement } from "react";
import { Play, Sparkles } from "lucide-react";

import { WorkerStatusCard } from "./WorkerStatusCard";

type OrchestrationRailProps = {
  gateState: "auto" | "approval";
  workers: Array<{
    id: string;
    label: string;
    status: string;
    summary: string;
    dependsOn: string[];
  }>;
  isRunning?: boolean;
  runId?: string | null;
  onRun?: () => void;
};

export function OrchestrationRail({
  gateState,
  workers,
  isRunning = false,
  runId,
  onRun,
}: OrchestrationRailProps) {
  return createElement(
    "section",
    { className: "rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/[0.04] p-4" },
    createElement(
      "div",
      { className: "flex flex-wrap items-center justify-between gap-3" },
      createElement(
        "div",
        null,
        createElement(
          "p",
          { className: "font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/80" },
          "Central DI orchestral layer",
        ),
        createElement("h3", { className: "mt-2 text-xl font-semibold text-gv-text-primary" }, "Worker fan-out"),
        createElement(
          "p",
          { className: "mt-1 text-sm leading-6 text-gv-text-secondary" },
          "Gate state: ",
          createElement("span", { className: "font-semibold text-gv-text-primary" }, gateState),
          runId ? createElement("span", { className: "ml-2 text-gv-text-muted" }, `Run ${runId}`) : null,
        ),
      ),
      onRun
        ? createElement(
            "button",
            {
              type: "button",
              onClick: onRun,
              disabled: isRunning,
              className:
                "inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-cyan-300/14 disabled:opacity-50",
            },
            createElement(Play, { className: "h-4 w-4" }),
            isRunning ? "Running" : "Run orchestrator",
          )
        : null,
    ),
    createElement(
      "div",
      { className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3" },
      workers.length > 0
        ? workers.map((worker) => createElement(WorkerStatusCard, { key: worker.id, ...worker }))
        : createElement(
            "div",
            { className: "rounded-[1.1rem] border border-white/10 bg-black/20 p-3 text-sm leading-6 text-gv-text-secondary md:col-span-2 xl:col-span-3" },
            createElement(
              "div",
              { className: "flex items-center gap-2 text-gv-text-primary" },
              createElement(Sparkles, { className: "h-4 w-4 text-cyan-200" }),
              "No workers spawned yet.",
            ),
            createElement(
              "p",
              { className: "mt-2" },
              "The orchestrator will spin up specialists once Creation Corner receives a synthesis request.",
            ),
          ),
    ),
  );
}
