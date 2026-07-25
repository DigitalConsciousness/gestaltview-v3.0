import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LibraryBig, Sparkles } from "lucide-react";

import type { CaptureOrb } from "@/components/Scaffold";

type BlackboardCompanionChatProps = {
  selectedSurfaceLabel: string;
  selectedSurfaceDescription: string;
  selectedTypeLabel: string;
  selectedCapture: CaptureOrb | null;
  sessionCaptureCount: number;
  savedCount: number;
  innerWorldCount: number;
  latestActionLabel: string | null;
  latestOrbTitle: string | null;
  blueprintReady: boolean;
  blueprintLabel: string;
  onPromoteBlueprint: () => void;
  onSendToCreationCorner: () => void;
};

function useIsCompact(): boolean {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsCompact(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isCompact;
}

function statLabel(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function BlackboardCompanionChat({
  selectedSurfaceLabel,
  selectedSurfaceDescription,
  selectedTypeLabel,
  selectedCapture,
  sessionCaptureCount,
  savedCount,
  innerWorldCount,
  latestActionLabel,
  latestOrbTitle,
  blueprintReady,
  blueprintLabel,
  onPromoteBlueprint,
  onSendToCreationCorner,
}: BlackboardCompanionChatProps) {
  const isCompact = useIsCompact();
  const [isExpanded, setIsExpanded] = useState(() => !isCompact);

  useEffect(() => {
    setIsExpanded(!isCompact);
  }, [isCompact]);

  const captureSummary = useMemo(() => {
    if (!selectedCapture) {
      return "Nothing has been pinned yet. Start talking and the room will surface the newest capture here.";
    }

    const preview = selectedCapture.text.trim();
    return preview.length > 160 ? `${preview.slice(0, 157)}...` : preview;
  }, [selectedCapture]);

  const statusLabel = blueprintReady ? "Blueprint ready to review" : "Keep capturing to shape the blueprint";

  if (isCompact && !isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex w-full items-center justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.14)] backdrop-blur-md"
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">Session mirror</p>
          <p className="mt-2 text-sm font-semibold text-white">{selectedSurfaceLabel}</p>
          <p className="mt-1 truncate text-xs text-white/56">{statLabel(sessionCaptureCount, "capture")} captured</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70">
          Open inspector
          <ArrowRight className="size-3.5" />
        </div>
      </button>
    );
  }

  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">Session mirror</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{selectedSurfaceLabel}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">{selectedSurfaceDescription}</p>
        </div>

        {isCompact ? (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70"
            aria-label="Collapse session mirror"
          >
            <Sparkles className="size-4" />
          </button>
        ) : (
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/54">
            {selectedTypeLabel}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Session captures" value={statLabel(sessionCaptureCount, "capture")} />
        <StatCard label="Saved orbs" value={statLabel(savedCount, "orb")} />
        <StatCard label="Inner world" value={statLabel(innerWorldCount, "orb")} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.2rem] border border-white/10 bg-black/22 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Latest orb</p>
              <h3 className="mt-2 text-base font-semibold text-white">{latestOrbTitle ?? "Nothing yet"}</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/54">
              {statusLabel}
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-white/64">{captureSummary}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {latestActionLabel ? (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/48">
                {latestActionLabel}
              </span>
            ) : null}
            {selectedCapture?.metadata.context ? (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/48">
                {selectedCapture.metadata.context}
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-black/22 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Blueprint handoff</p>
          <h3 className="mt-2 text-base font-semibold text-white">{blueprintLabel}</h3>
          <p className="mt-2 text-sm leading-6 text-white/62">
            {blueprintReady
              ? "Review the current draft, then route it to Creation Corner when you want it to become structure."
              : "The room is still gathering shape. Keep talking and the blueprint option will appear once there is something to promote."}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={onPromoteBlueprint}
              disabled={!blueprintReady}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <LibraryBig className="size-4" />
                Promote to blueprint
              </span>
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={onSendToCreationCorner}
              disabled={!blueprintReady}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                Send to Creation Corner
              </span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-black/20 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
