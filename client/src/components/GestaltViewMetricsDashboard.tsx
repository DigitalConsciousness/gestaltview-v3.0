import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainingRun } from "@/features/agent-trainer/hooks/useTrainingRun";
import {
  createEmptyOrchestrationAnalyticsSummary,
  buildGestaltViewMetricsSnapshot,
  buildTribunalTranscriptSummary,
  readSavedTribunalExcerpts,
  readStoredTribunalMessages,
  type OrchestrationAnalyticsSummary,
  type MetricsCard,
  type MetricsSnapshotInput,
} from "@/lib/gestaltviewMetrics";

const DEFAULT_FOUNDER_ADMIN_EMAILS = ["keithsoyka@gmail.com"];
const QUEUE_STALL_MS = 45_000;

type OrchestrationAnalyticsResponse = {
  summary: OrchestrationAnalyticsSummary;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getFounderAdminEmails(): string[] {
  const configured = (import.meta.env.VITE_FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_FOUNDER_ADMIN_EMAILS;
}

function hasFounderTrainerAccess(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getFounderAdminEmails().includes(normalizeEmail(email));
}

function describeElapsed(isoDate: string): string {
  const createdAt = new Date(isoDate).getTime();
  if (!Number.isFinite(createdAt)) {
    return "unknown";
  }

  const deltaMs = Math.max(0, Date.now() - createdAt);
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function toneClass(tone: MetricsCard["tone"]): string {
  if (tone === "warning") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  }

  if (tone === "success") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  return "border-slate-700/60 bg-slate-900/70 text-slate-200";
}

function MetricCard({
  label,
  title,
  value,
  detail,
  tone = "neutral",
}: MetricsCard) {
  return (
    <Card className={toneClass(tone)}>
      <CardHeader className="pb-3">
        <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl text-white">{title ?? label}</CardTitle>
        <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-slate-300">{detail}</CardContent>
    </Card>
  );
}

function buildTrainerSnapshot(
  runs: Array<{ status: string; createdAt: string }>,
  queuedCount: number | null | undefined,
) {
  const stalledRuns = runs.filter(
    (run) => run.status === "queued" && Date.now() - new Date(run.createdAt).getTime() >= QUEUE_STALL_MS,
  ).length;

  return {
    trackedRuns: runs.length,
    queuedRuns: queuedCount ?? runs.filter((run) => run.status === "queued").length,
    awaitingReviewRuns: runs.filter((run) => run.status === "awaiting_review").length,
    failedRuns: runs.filter((run) => run.status === "failed").length,
    stalledRuns,
  };
}

export function GestaltViewMetricsDashboard() {
  const { isAuthenticated, isAdmin, user, getAuthHeader } = useAuth();
  const hasTrainerAccess = isAdmin || hasFounderTrainerAccess(user?.email);
  const canSeeOrchestrationAnalytics = isAdmin;
  const trainer = useTrainingRun({
    authHeaders: getAuthHeader(),
    enabled: isAuthenticated && hasTrainerAccess,
    manualStudySources: [],
  });

  const stalledRuns = useMemo(
    () =>
      trainer.runs.filter(
        (run) => run.status === "queued" && Date.now() - new Date(run.createdAt).getTime() >= QUEUE_STALL_MS,
      ),
    [trainer.runs],
  );

  const awaitingReviewRuns = useMemo(
    () => trainer.runs.filter((run) => run.status === "awaiting_review"),
    [trainer.runs],
  );

  const failedRuns = useMemo(
    () => trainer.runs.filter((run) => run.status === "failed"),
    [trainer.runs],
  );

  const latestRun = trainer.currentRun ?? trainer.runs[0] ?? null;

  const [orchestrationSummary, setOrchestrationSummary] = useState<OrchestrationAnalyticsSummary | null>(null);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);
  const [tribunalRefreshTick, setTribunalRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadOrchestrationAnalytics() {
      if (!isAuthenticated || !canSeeOrchestrationAnalytics) {
        setOrchestrationSummary(null);
        setOrchestrationError(null);
        return;
      }

      try {
        const response = await fetch("/api/orchestrator/analytics?limit=24", {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!response.ok) {
          throw new Error(`Analytics request failed with ${response.status}`);
        }

        const payload = (await response.json()) as OrchestrationAnalyticsResponse;
        if (!cancelled) {
          setOrchestrationSummary(payload.summary);
          setOrchestrationError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setOrchestrationSummary(null);
          setOrchestrationError(
            error instanceof Error ? error.message : "Failed to load orchestration analytics.",
          );
        }
      }
    }

    void loadOrchestrationAnalytics();

    return () => {
      cancelled = true;
    };
  }, [canSeeOrchestrationAnalytics, getAuthHeader, isAuthenticated]);

  useEffect(() => {
    const refresh = () => setTribunalRefreshTick((current) => current + 1);
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const storedTribunalMessages = useMemo(() => readStoredTribunalMessages(), [tribunalRefreshTick]);
  const savedTribunalExcerpts = useMemo(() => readSavedTribunalExcerpts(), [tribunalRefreshTick]);
  const tribunalTranscriptSummary = useMemo(
    () => buildTribunalTranscriptSummary(storedTribunalMessages, savedTribunalExcerpts),
    [savedTribunalExcerpts, storedTribunalMessages],
  );

  const metricsInput: MetricsSnapshotInput = useMemo(
    () => ({
      generatedAt: new Date().toISOString(),
      trainer: buildTrainerSnapshot(trainer.runs, trainer.queueHealth?.queuedCount),
      orchestration: orchestrationSummary ?? createEmptyOrchestrationAnalyticsSummary(),
      tribunal: tribunalTranscriptSummary,
    }),
    [orchestrationSummary, tribunalTranscriptSummary, trainer.queueHealth?.queuedCount, trainer.runs],
  );

  const snapshot = useMemo(() => buildGestaltViewMetricsSnapshot(metricsInput), [metricsInput]);

  const latestTurnLabel =
    tribunalTranscriptSummary.totalTurns > 0
      ? `${tribunalTranscriptSummary.totalTurns} stored turns`
      : "No Tribunal transcript yet";

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-cyan-500/20 bg-slate-900/70 p-6 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Operational Metrics</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Surface the stuck work. Cut the decorative noise.
            </h2>
            <p className="text-sm leading-7 text-slate-300 md:text-base">
              This dashboard blends live trainer queue data, orchestration analytics,
              and the Tribunal transcript stored in this browser into a single snapshot.
              The point is to see what is actually happening, not what merely looks active.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 transition hover:text-white"
            >
              Dashboard
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              href="/agent-trainer/control-plane"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/10"
            >
              Control Plane
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              href="/tribunal"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 transition hover:text-white"
            >
              Tribunal
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {snapshot.overviewCards.map(({ key, ...card }) => (
          <MetricCard key={key} {...card} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.familyCards.map(({ key, ...card }) => (
          <MetricCard key={key} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-700/60 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Gauge className="size-5 text-cyan-400" />
              Action Board
            </CardTitle>
            <CardDescription>
              Live proxies for the five GestaltView metric families.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.liveSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-200"
              >
                {signal}
              </div>
            ))}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-300" />
                <span className="text-sm font-semibold text-white">Translation note</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                These are operational proxies derived from real runtime signals. They
                are intentionally honest about what is measured today and where the
                platform still needs deeper instrumentation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/60 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock3 className="size-5 text-cyan-400" />
              Live Ops Snapshot
            </CardTitle>
            <CardDescription>
              Refreshed from the current browser state and the live trainer/orchestration APIs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            {!hasTrainerAccess ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 leading-6">
                This account does not expose the internal trainer queue. The metric families
                still update from the browser transcript, but the queue controls stay behind
                the founder/admin gate.
              </div>
            ) : trainer.error ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 leading-6 text-amber-100">
                {trainer.error}
              </div>
            ) : trainer.isBootstrapping ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 leading-6">
                Loading trainer queue state…
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-200">
                    {trainer.runs.length} tracked runs
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-200">
                    {awaitingReviewRuns.length} awaiting review
                  </Badge>
                  <Badge variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-200">
                    {failedRuns.length} failed or rejected
                  </Badge>
                </div>

                {stalledRuns.length > 0 ? (
                  <div className="space-y-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2 font-semibold text-amber-100">
                      <AlertTriangle className="size-4" />
                      Stalled operations
                    </div>
                    {stalledRuns.slice(0, 4).map((run) => (
                      <div
                        key={run.runId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs text-white">{run.runId}</p>
                          <p className="text-xs text-amber-100/70">
                            Queued for {describeElapsed(run.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-amber-500/30 bg-transparent text-amber-100">
                          queued
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 font-semibold text-emerald-100">
                      <CheckCircle2 className="size-4" />
                      No stalled queue items are visible right now.
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-cyan-300" />
                    <span className="text-sm font-semibold text-white">Orchestration status</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {canSeeOrchestrationAnalytics
                      ? orchestrationSummary
                        ? `${orchestrationSummary.totalDecisions} persisted decisions at ${Math.round(orchestrationSummary.averageConfidence * 100)}% average confidence.`
                        : orchestrationError ?? "Orchestration analytics will populate after the next admin-authenticated refresh."
                      : "Orchestration analytics stay behind the admin gate, but the dashboard still computes Tribunal-derived proxies locally."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-4 text-emerald-300" />
                    <span className="text-sm font-semibold text-white">Tribunal transcript</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {latestTurnLabel}. {tribunalTranscriptSummary.cleanAgentTurns} clean agent turns,
                    {` ${tribunalTranscriptSummary.cannedAgentTurns} blocked turns, `}
                    {tribunalTranscriptSummary.savedExcerpts} saved excerpts.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/agent-trainer/control-plane"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 transition hover:bg-cyan-500/10"
                  >
                    Open queue controls
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/agent-trainer/runtime"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 transition hover:text-white"
                  >
                    Open runtime
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
