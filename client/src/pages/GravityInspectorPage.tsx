// © 2026 Keith Soyka — GestaltView
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, RefreshCcw, Sparkles } from "lucide-react";

import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";

type GravityReportFragment = {
  id: string;
  user_id: string;
  gravity_report_id: string;
  knowledge_fragment_id: string;
  chunk_index: number;
  priority_rank: number;
  signal_weight: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type GravityReport = {
  id: string;
  user_id: string;
  source_title: string;
  source_uri: string | null;
  source_type: string | null;
  source_kind: string | null;
  source_fingerprint: string;
  surface_map: {
    loud_claims?: string[];
    intensifiers?: string[];
    repetition_patterns?: string[];
    implied_frame?: string;
    notable_absences?: string[];
  };
  gravity_report: {
    load_bearing_claims?: string[];
    claims_that_collapse_under_scrutiny?: string[];
    actual_delta?: string;
    incentive_distortion?: string;
    signal?: string;
    confidence?: "high" | "medium" | "low" | "noise";
  };
  signal_weight: number;
  confidence: "high" | "medium" | "low" | "noise";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  fragments: GravityReportFragment[];
};

type GravityPayload = {
  ok: boolean;
  timestamp: string;
  reportCount: number;
  fragmentCount: number;
  strongestReport: {
    id: string;
    sourceTitle: string;
    signalWeight: number;
    confidence: GravityReport["confidence"];
  } | null;
  reports: GravityReport[];
};

function confidenceTone(confidence: GravityReport["confidence"]) {
  switch (confidence) {
    case "high":
      return "bg-emerald-500/10 text-emerald-100 border-emerald-500/30";
    case "medium":
      return "bg-cyan-500/10 text-cyan-100 border-cyan-500/30";
    case "low":
      return "bg-amber-500/10 text-amber-100 border-amber-500/30";
    default:
      return "bg-slate-500/10 text-slate-200 border-slate-500/30";
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function JsonPillList({ values }: { values: string[] }) {
  if (!values.length) {
    return <p className="text-sm text-slate-500">None detected.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value} variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-100">
          {value}
        </Badge>
      ))}
    </div>
  );
}

export default function GravityInspectorPage() {
  useSEO(PAGE_SEO.gravityInspector);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [payload, setPayload] = useState<GravityPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = useMemo(() => {
    const reports = payload?.reports ?? [];
    if (reports.length === 0) {
      return null;
    }

    return reports.find((report) => report.id === selectedReportId) ?? reports[0];
  }, [payload, selectedReportId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError("Sign in to inspect your gravity reports.");
      setPayload(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gravity?limit=12");
        const body = (await response.json().catch(() => null)) as GravityPayload | { error?: string } | null;

        if (!response.ok || !body || !("reports" in body)) {
          throw new Error((body as { error?: string } | null)?.error ?? `Gravity inspector failed: ${response.status}`);
        }

        if (!cancelled) {
          setPayload(body);
          setSelectedReportId((current) => current ?? body.reports[0]?.id ?? null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
          setPayload(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  const strongestReport = payload?.strongestReport ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <a className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
              <ArrowLeft size={16} /> Back to Manifest
            </a>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {strongestReport ? (
              <Badge variant="outline" className={cn("border", confidenceTone(strongestReport.confidence))}>
                Strongest signal {strongestReport.signalWeight.toFixed(2)}
              </Badge>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                if (!isAuthenticated) return;
                setSelectedReportId(null);
                setError(null);
                setLoading(true);
                void fetch("/api/gravity?limit=12")
                  .then(async (response) => {
                    const body = (await response.json().catch(() => null)) as GravityPayload | { error?: string } | null;
                    if (!response.ok || !body || !("reports" in body)) {
                      throw new Error((body as { error?: string } | null)?.error ?? `Gravity inspector failed: ${response.status}`);
                    }
                    setPayload(body);
                    setSelectedReportId(body.reports[0]?.id ?? null);
                  })
                  .catch((refreshError: unknown) => {
                    setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
                  })
                  .finally(() => setLoading(false));
              }}
              disabled={loading || !isAuthenticated}
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="border-slate-800 bg-slate-950/80">
            <CardHeader>
              <CardTitle>Gravity reports</CardTitle>
              <CardDescription>Latest stored Two-Pass Gravity analyses for the signed-in operator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Reports</div>
                  <div className="mt-1 text-2xl font-semibold">{payload?.reportCount ?? 0}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Fragments</div>
                  <div className="mt-1 text-2xl font-semibold">{payload?.fragmentCount ?? 0}</div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <ScrollArea className="h-[640px] pr-3">
                <div className="space-y-3">
                  {(payload?.reports ?? []).map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedReportId(report.id)}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition-all",
                        selectedReport?.id === report.id
                          ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-white">{report.source_title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {formatTime(report.created_at)}
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("border", confidenceTone(report.confidence))}>
                          {report.confidence}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                          {report.signal_weight.toFixed(2)}
                        </Badge>
                        {report.source_type ? (
                          <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                            {report.source_type}
                          </Badge>
                        ) : null}
                        {report.source_kind ? (
                          <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                            {report.source_kind}
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-950/80">
              <CardHeader>
                <CardTitle>Selected report</CardTitle>
                <CardDescription>
                  Inspect the surface map, load-bearing claims, and fragment ranking for the active report.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {selectedReport ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Signal weight</div>
                        <div className="mt-2 text-3xl font-semibold">{selectedReport.signal_weight.toFixed(2)}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Confidence</div>
                        <Badge variant="outline" className={cn("mt-2 border", confidenceTone(selectedReport.confidence))}>
                          {selectedReport.confidence}
                        </Badge>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Source type</div>
                        <div className="mt-2 text-lg font-medium">{selectedReport.source_type ?? "Unknown"}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Source kind</div>
                        <div className="mt-2 text-lg font-medium">{selectedReport.source_kind ?? "Unknown"}</div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Actual delta</div>
                        <p className="mt-2 text-sm leading-6 text-slate-100">
                          {selectedReport.gravity_report.actual_delta ?? "No actual delta was detected."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Incentive distortion</div>
                        <p className="mt-2 text-sm leading-6 text-slate-100">
                          {selectedReport.gravity_report.incentive_distortion ?? "No incentive distortion recorded."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Loud claims</div>
                        <div className="mt-3">
                          <JsonPillList values={selectedReport.surface_map.loud_claims ?? []} />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Load-bearing claims</div>
                        <div className="mt-3">
                          <JsonPillList values={selectedReport.gravity_report.load_bearing_claims ?? []} />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Intensifiers</div>
                        <div className="mt-3">
                          <JsonPillList values={selectedReport.surface_map.intensifiers ?? []} />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Repetition</div>
                        <div className="mt-3">
                          <JsonPillList values={selectedReport.surface_map.repetition_patterns ?? []} />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Notable absences</div>
                        <div className="mt-3">
                          <JsonPillList values={selectedReport.surface_map.notable_absences ?? []} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Collapse candidates</div>
                      <p className="mt-2 text-sm leading-6 text-slate-100">
                        {(selectedReport.gravity_report.claims_that_collapse_under_scrutiny ?? []).join(" • ") ||
                          "No collapse candidates surfaced."}
                      </p>
                      <Separator className="my-4 bg-slate-800" />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Implied frame</div>
                          <p className="mt-2 text-sm text-slate-100">{selectedReport.surface_map.implied_frame ?? "Unknown"}</p>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Signal</div>
                          <p className="mt-2 text-sm text-slate-100">{selectedReport.gravity_report.signal ?? "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">
                    {loading ? "Loading gravity reports..." : "No gravity reports available yet."}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/80">
              <CardHeader>
                <CardTitle>Fragment rankings</CardTitle>
                <CardDescription>
                  Chunks linked to the selected report, ordered by priority rank and signal weight.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedReport?.fragments.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-400">Rank</TableHead>
                        <TableHead className="text-slate-400">Fragment</TableHead>
                        <TableHead className="text-slate-400">Chunk</TableHead>
                        <TableHead className="text-slate-400">Signal</TableHead>
                        <TableHead className="text-slate-400">Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReport.fragments.map((fragment) => (
                        <TableRow key={fragment.id} className="border-slate-800">
                          <TableCell className="font-medium text-slate-200">{fragment.priority_rank}</TableCell>
                          <TableCell className="max-w-[360px] break-all text-slate-300">
                            {fragment.knowledge_fragment_id}
                          </TableCell>
                          <TableCell className="text-slate-300">{fragment.chunk_index}</TableCell>
                          <TableCell className="text-slate-200">{fragment.signal_weight.toFixed(2)}</TableCell>
                          <TableCell className="text-slate-400">{formatTime(fragment.updated_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No fragments were linked to this report yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="size-3.5 text-cyan-300" />
            Two-Pass Gravity Protocol
          </div>
          <div>{payload?.timestamp ? `Refreshed ${formatTime(payload.timestamp)}` : "Waiting for data"}</div>
        </div>
      </div>
    </div>
  );
}
