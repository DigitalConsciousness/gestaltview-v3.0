import { RefreshCw } from "lucide-react";

import type { PersonalityProfile } from "@shared/profileIngestion";
import type { ProfilePortrait } from "@shared/profilePortrait";

interface ProfileDisplayProps {
  userId: string;
  runId?: string;
  readOnly?: boolean;
  profile?: PersonalityProfile | null;
  portrait?: ProfilePortrait | null;
  contextFraming?: string;
  isLoading?: boolean;
  onRefreshRequest?: () => Promise<void>;
}

export default function ProfileDisplay({
  readOnly = true,
  profile,
  portrait,
  contextFraming,
  isLoading = false,
  onRefreshRequest,
}: ProfileDisplayProps) {
  const portraitDimensions = portrait?.dimensions ?? [];
  const profileDimensions = profile?.dimensions ?? [];
  const title = portrait?.portraitTitle ?? profile?.keyThemes[0] ?? "Identity card stack";
  const subtitle = portrait?.tagline ?? profile?.coreNarrative;

  return (
    <aside className="space-y-4 rounded-[1.4rem] border border-white/10 bg-black/24 p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">
            {portrait ? "Living portrait" : "Live profile"}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
        </div>
        {onRefreshRequest ? (
          <button
            type="button"
            onClick={() => void onRefreshRequest()}
            disabled={isLoading}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-50"
            aria-label="Refresh profile"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-white/58">
        {subtitle ??
          "Run profile ingestion to populate factual dimensions from journals, resumes, transcripts, lived experience, and Music DNA."}
      </p>

      {contextFraming?.trim() ? (
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/6 p-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">Context framing</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{contextFraming.trim()}</p>
        </div>
      ) : null}

      {portrait ? (
        <div className="grid gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/6 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">Version</p>
            <p className="mt-1 text-sm text-white">{portrait.version}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">Confidence</p>
            <p className="mt-1 text-sm text-white">{Math.round(portrait.overallConfidence * 100)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">Evidence</p>
            <p className="mt-1 text-sm text-white">{portrait.totalSourceRecords} records</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {portrait ? (
          portraitDimensions.length > 0 ? (
            portraitDimensions.map((dimension) => (
              <article key={dimension.kind} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{dimension.label}</h3>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-100">
                    {Math.round(dimension.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/58">{dimension.summary}</p>
                {dimension.rawQuotes?.[0] ? (
                  <p className="mt-3 border-l border-white/12 pl-3 text-xs leading-5 text-white/46">
                    {dimension.rawQuotes[0]}
                  </p>
                ) : null}
                {dimension.delta ? (
                  <p className="mt-2 text-[11px] leading-5 text-cyan-100/70">{dimension.delta}</p>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/46">
              No portrait dimensions are loaded yet.
            </div>
          )
        ) : profileDimensions.length > 0 ? (
          profileDimensions.slice(0, readOnly ? 4 : profileDimensions.length).map((dimension) => (
            <article key={dimension.dimensionId} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{dimension.dimensionLabel}</h3>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-100">
                  {Math.round(dimension.confidence * 100)}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/58">{dimension.dimensionValue.summary}</p>
              {dimension.evidenceFragments[0] ? (
                <p className="mt-3 border-l border-white/12 pl-3 text-xs leading-5 text-white/46">
                  {dimension.evidenceFragments[0]}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-white/46">
            No profile dimensions are loaded yet.
          </div>
        )}
      </div>
    </aside>
  );
}
