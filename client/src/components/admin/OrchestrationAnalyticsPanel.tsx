import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, Download, FilterX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type CountedItem = {
  label: string;
  count: number;
};

type OrchestrationAnalyticsSummary = {
  totalDecisions: number;
  artifactRate: number;
  persistenceRate: number;
  profileRate: number;
  scaffoldRate: number;
  elevatedSupportRate: number;
  averageConfidence: number;
  supportBreakdown: Record<string, number>;
  topTrigger: CountedItem | null;
  topDestination: CountedItem | null;
  topContentKind: CountedItem | null;
  latestDecisionAt: string | null;
};

type OrchestrationDecisionRow = {
  id: string;
  decision_id: string;
  triggered_at: string;
  user_id: string | null;
  trigger: string;
  source_room: string;
  detected_state: string;
  support_level: string;
  content_kind: string;
  destination: string;
  artifact_target_type: string | null;
  artifact_destination: string | null;
  synthesis_style: string;
  processors: string[];
  export_formats: string[];
  next_action: string;
  should_forge_artifact: boolean;
  should_persist_signal: boolean;
  should_update_profile: boolean;
  should_update_scaffold: boolean;
  confidence: number | string;
  user_facing_summary: string;
  markers: string[] | null;
  context_clues: string[] | null;
  has_image: boolean;
  has_audio: boolean;
  has_video: boolean;
  has_file: boolean;
  input_payload:
    | {
        title?: string | null;
        textExcerpt?: string | null;
        artifactIntent?: string | null;
        energyLevel?: number | null;
        contextClues?: string[];
        sourceCaptureIds?: string[];
        sourceArtifactIds?: string[];
        hasImage?: boolean;
        hasAudio?: boolean;
        hasVideo?: boolean;
        hasFile?: boolean;
      }
    | null;
  decision_payload: Record<string, unknown> | null;
  internal_diagnostics: string[] | null;
  created_at: string;
};

type OrchestrationAnalyticsResponse = {
  summary: OrchestrationAnalyticsSummary;
  decisions: OrchestrationDecisionRow[];
  limit: number;
  hasMore: boolean;
};

const DEFAULT_ANALYTICS: OrchestrationAnalyticsResponse = {
  summary: {
    totalDecisions: 0,
    artifactRate: 0,
    persistenceRate: 0,
    profileRate: 0,
    scaffoldRate: 0,
    elevatedSupportRate: 0,
    averageConfidence: 0,
    supportBreakdown: {},
    topTrigger: null,
    topDestination: null,
    topContentKind: null,
    latestDecisionAt: null,
  },
  decisions: [],
  limit: 24,
  hasMore: false,
};

function formatDate(value: string | null): string {
  if (!value) return "Not available";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").trim() || "Unknown";
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatConfidence(value: number | string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "n/a";
  }

  return `${Math.round(parsed * 100)}%`;
}

function supportTone(level: string): string {
  switch (level) {
    case "immediate":
      return "border-rose-500/40 bg-rose-500/10 text-rose-100";
    case "elevated":
      return "border-amber-500/40 bg-amber-500/10 text-amber-100";
    case "low":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";
    default:
      return "border-slate-700 bg-slate-900/60 text-slate-300";
  }
}

function escapeCsvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noreferrer";
  anchor.click();
  URL.revokeObjectURL(url);
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function summarizeDecisions(rows: OrchestrationDecisionRow[]): OrchestrationAnalyticsSummary {
  const totalDecisions = rows.length;
  const confidenceTotal = rows.reduce((sum, row) => sum + Number(row.confidence ?? 0), 0);

  const countBy = (selector: (row: OrchestrationDecisionRow) => string): CountedItem | null => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = selector(row);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const sorted = Array.from(counts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
    const [label, count] = sorted[0] ?? [];
    return label ? { label, count } : null;
  };

  const supportBreakdown = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.support_level] = (accumulator[row.support_level] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totalDecisions,
    artifactRate: totalDecisions > 0 ? rows.filter((row) => row.should_forge_artifact).length / totalDecisions : 0,
    persistenceRate: totalDecisions > 0 ? rows.filter((row) => row.should_persist_signal).length / totalDecisions : 0,
    profileRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_profile).length / totalDecisions : 0,
    scaffoldRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_scaffold).length / totalDecisions : 0,
    elevatedSupportRate:
      totalDecisions > 0
        ? rows.filter((row) => row.support_level === "elevated" || row.support_level === "immediate").length / totalDecisions
        : 0,
    averageConfidence: totalDecisions > 0 ? confidenceTotal / totalDecisions : 0,
    supportBreakdown,
    topTrigger: countBy((row) => row.trigger),
    topDestination: countBy((row) => row.destination),
    topContentKind: countBy((row) => row.content_kind),
    latestDecisionAt: rows[0]?.triggered_at ?? null,
  };
}

function buildDecisionCsv(rows: OrchestrationDecisionRow[], filters: {
  search: string;
  supportLevel: string;
  contentKind: string;
  destination: string;
}): string {
  const header = [
    "decision_id",
    "triggered_at",
    "trigger",
    "source_room",
    "support_level",
    "detected_state",
    "content_kind",
    "destination",
    "next_action",
    "confidence",
    "processors",
    "export_formats",
    "user_facing_summary",
    "markers",
    "context_clues",
    "filters_search",
    "filters_support_level",
    "filters_content_kind",
    "filters_destination",
  ];

  const lines = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      [
        row.decision_id,
        row.triggered_at,
        row.trigger,
        row.source_room,
        row.support_level,
        row.detected_state,
        row.content_kind,
        row.destination,
        row.next_action,
        formatConfidence(row.confidence),
        row.processors.join(" | "),
        row.export_formats.join(" | "),
        row.user_facing_summary,
        (row.markers ?? []).join(" | "),
        (row.context_clues ?? []).join(" | "),
        filters.search,
        filters.supportLevel,
        filters.contentKind,
        filters.destination,
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-950/70">
      <CardContent className="space-y-2 py-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="text-sm leading-5 text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function OrchestrationAnalyticsPanel() {
  const { getAuthHeader } = useAuth();
  const [payload, setPayload] = useState<OrchestrationAnalyticsResponse>(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [supportFilter, setSupportFilter] = useState("all");
  const [contentKindFilter, setContentKindFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");

  const loadAnalytics = useCallback(async () => {
    setError(null);
    setRefreshing(true);

    try {
      const response = await fetch("/api/orchestrator/analytics?limit=24", {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const nextPayload = (await response.json().catch(() => null)) as
        | OrchestrationAnalyticsResponse
        | { error?: string }
        | null;

      if (!response.ok || !nextPayload || !("decisions" in nextPayload) || !("summary" in nextPayload)) {
        throw new Error((nextPayload as { error?: string } | null)?.error || `Analytics request failed: ${response.status}`);
      }

      setPayload(nextPayload);
      setRefreshedAt(new Date().toISOString());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const supportOrder = ["immediate", "elevated", "low", "none"];
  const contentKinds = useMemo(
    () => Array.from(new Set(payload.decisions.map((decision) => decision.content_kind))).sort(),
    [payload.decisions]
  );
  const destinations = useMemo(
    () => Array.from(new Set(payload.decisions.map((decision) => decision.destination))).sort(),
    [payload.decisions]
  );

  const filteredDecisions = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return payload.decisions.filter((decision) => {
      if (supportFilter !== "all" && decision.support_level !== supportFilter) {
        return false;
      }

      if (contentKindFilter !== "all" && decision.content_kind !== contentKindFilter) {
        return false;
      }

      if (destinationFilter !== "all" && decision.destination !== destinationFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        decision.decision_id,
        decision.trigger,
        decision.source_room,
        decision.detected_state,
        decision.support_level,
        decision.content_kind,
        decision.destination,
        decision.next_action,
        decision.user_facing_summary,
        decision.processors.join(" "),
        decision.export_formats.join(" "),
        (decision.markers ?? []).join(" "),
        (decision.context_clues ?? []).join(" "),
        decision.input_payload?.textExcerpt ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [contentKindFilter, destinationFilter, payload.decisions, searchQuery, supportFilter]);

  const filteredSummary = useMemo(() => summarizeDecisions(filteredDecisions), [filteredDecisions]);
  const filtersActive = Boolean(
    searchQuery.trim() || supportFilter !== "all" || contentKindFilter !== "all" || destinationFilter !== "all"
  );
  const summary = filteredSummary;
  const loadedDecisionCount = payload.decisions.length;

  const macroCards = useMemo(
    () => [
      {
        label: "Decisions captured",
        value: summary.totalDecisions === 0 ? "None yet" : String(summary.totalDecisions),
        detail:
          summary.totalDecisions > 0
            ? filtersActive
              ? `Showing ${filteredDecisions.length} filtered decisions from ${loadedDecisionCount} loaded rows.`
              : `${payload.hasMore ? `Latest ${payload.limit} shown` : "All visible"} orchestration decisions from the routing spine.`
            : "The analytics table will populate after the next triggered decision is persisted.",
      },
      {
        label: "Artifact-ready rate",
        value: formatPercent(summary.artifactRate),
        detail: "How often the router decides the moment is ready to forge an artifact instead of preserving a capture.",
      },
      {
        label: "Support escalations",
        value: formatPercent(summary.elevatedSupportRate),
        detail: "Share of decisions that landed in elevated or immediate support territory.",
      },
      {
        label: "Average confidence",
        value: formatPercent(summary.averageConfidence),
        detail: "Higher means the classifier is seeing cleaner signals in the trigger, text, and context clues.",
      },
    ],
    [
      filtersActive,
      filteredDecisions.length,
      loadedDecisionCount,
      payload.hasMore,
      payload.limit,
      summary.artifactRate,
      summary.averageConfidence,
      summary.elevatedSupportRate,
      summary.totalDecisions,
    ]
  );

  const patternCards = useMemo(
    () => [
      {
        label: "Top trigger",
        value: summary.topTrigger ? humanize(summary.topTrigger.label) : "None yet",
        detail: summary.topTrigger ? `${summary.topTrigger.count} decisions` : "No trigger pattern has emerged yet.",
      },
      {
        label: "Top destination",
        value: summary.topDestination ? humanize(summary.topDestination.label) : "None yet",
        detail: summary.topDestination ? `${summary.topDestination.count} decisions` : "No destination pattern has emerged yet.",
      },
      {
        label: "Top content kind",
        value: summary.topContentKind ? humanize(summary.topContentKind.label) : "None yet",
        detail: summary.topContentKind ? `${summary.topContentKind.count} decisions` : "No content kind pattern has emerged yet.",
      },
      {
        label: "Latest decision",
        value: formatDate(summary.latestDecisionAt),
        detail: refreshedAt ? `Refreshed ${formatDate(refreshedAt)}` : "Waiting for the first analytics refresh.",
      },
    ],
    [refreshedAt, summary.latestDecisionAt, summary.topContentKind, summary.topDestination, summary.topTrigger]
  );

  const handleDownloadFilteredCsv = useCallback(() => {
    const csv = buildDecisionCsv(filteredDecisions, {
      search: searchQuery.trim(),
      supportLevel: supportFilter,
      contentKind: contentKindFilter,
      destination: destinationFilter,
    });

    downloadTextFile(
      `orchestration-decisions-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv"
    );
  }, [contentKindFilter, destinationFilter, filteredDecisions, searchQuery, supportFilter]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">
              Orchestration analytics
            </p>
            <CardTitle className="text-3xl font-semibold tracking-tight text-white">
              Macro and micro decision behavior, in one place.
            </CardTitle>
            <CardDescription>
              This tab tracks the structured routing decisions the orchestrator makes, then turns them into trend cards and a live decision table for pattern spotting.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleDownloadFilteredCsv}
            disabled={loading || filteredDecisions.length === 0}
            className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-900"
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => void loadAnalytics()}
            disabled={refreshing}
            className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-900"
          >
            {refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCcw className="mr-2 size-4" />}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="orchestration-search" className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Search
              </Label>
              <Input
                id="orchestration-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Trigger, room, route, summary, processor..."
                className="border-slate-800 bg-slate-900/60 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orchestration-support" className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Support
              </Label>
              <Select value={supportFilter} onValueChange={setSupportFilter}>
                <SelectTrigger id="orchestration-support" className="border-slate-800 bg-slate-900/60 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {supportOrder.map((level) => (
                    <SelectItem key={level} value={level}>
                      {humanize(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orchestration-kind" className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Content kind
              </Label>
              <Select value={contentKindFilter} onValueChange={setContentKindFilter}>
                <SelectTrigger id="orchestration-kind" className="border-slate-800 bg-slate-900/60 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All kinds</SelectItem>
                  {contentKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {humanize(kind)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orchestration-destination" className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Destination
              </Label>
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger id="orchestration-destination" className="border-slate-800 bg-slate-900/60 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {destinations.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {humanize(destination)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSupportFilter("all");
                  setContentKindFilter("all");
                  setDestinationFilter("all");
                }}
                disabled={!filtersActive}
                className="border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-900"
              >
                <FilterX className="mr-2 size-4" />
                Clear
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-slate-800 bg-slate-950/70">
                  <CardContent className="animate-pulse space-y-3 py-5">
                    <div className="h-3 w-24 rounded-full bg-slate-800/80" />
                    <div className="h-9 w-20 rounded-2xl bg-slate-800/80" />
                    <div className="h-3 w-40 rounded-full bg-slate-800/70" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {macroCards.map((card) => (
                  <MetricCard key={card.label} {...card} />
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {patternCards.map((card) => (
                  <Card key={card.label} className="border-slate-800 bg-slate-950/70">
                    <CardContent className="space-y-2 py-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                      <p className="text-xl font-semibold text-white">{card.value}</p>
                      <p className="text-sm leading-5 text-slate-400">{card.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-slate-800 bg-slate-950/70">
                <CardHeader>
                  <CardTitle className="text-white">Support mix</CardTitle>
                  <CardDescription>
                    The current routing footprint by support level.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {supportOrder.map((level) => {
                    const count = summary.supportBreakdown[level] ?? 0;
                    return (
                      <Badge key={level} variant="outline" className={cn("px-3 py-1 text-xs font-medium", supportTone(level))}>
                        {humanize(level)} {count}
                      </Badge>
                    );
                  })}
                </CardContent>
              </Card>

              {filtersActive ? (
                <Card className="border-cyan-500/20 bg-cyan-500/10">
                  <CardContent className="py-4 text-sm text-cyan-100">
                    Filters are active. Showing {filteredDecisions.length} of {payload.decisions.length} loaded decisions.
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader>
          <CardTitle className="text-white">Decision table</CardTitle>
          <CardDescription>
            Latest triggered decisions with the source room, support state, destination, and execution shape.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-300">Decision</TableHead>
                  <TableHead className="text-slate-300">Macro state</TableHead>
                  <TableHead className="text-slate-300">Micro route</TableHead>
                  <TableHead className="text-slate-300">Confidence</TableHead>
                  <TableHead className="text-slate-300">Processors</TableHead>
                  <TableHead className="text-slate-300">Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payload.decisions.length > 0 ? (
                  filteredDecisions.map((decision) => (
                    <TableRow key={decision.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="align-top whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">{humanize(decision.trigger)}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {humanize(decision.source_room)} • {formatDate(decision.triggered_at)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={cn("border-slate-700 bg-slate-900/60 text-slate-200", supportTone(decision.support_level))}>
                              {humanize(decision.support_level)}
                            </Badge>
                            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200">
                              {humanize(decision.detected_state)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300">{humanize(decision.content_kind)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-100">{humanize(decision.destination)}</p>
                          <p className="text-xs text-slate-400">{humanize(decision.next_action)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal text-slate-200">
                        {formatConfidence(decision.confidence)}
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {decision.processors.map((processor) => (
                              <Badge key={processor} variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-300">
                                {humanize(processor)}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {decision.should_forge_artifact ? "forges artifact" : "preserves capture"}
                            {decision.should_persist_signal ? " • persists signal" : ""}
                            {decision.should_update_profile ? " • profile update" : ""}
                            {decision.should_update_scaffold ? " • scaffold update" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[420px] align-top whitespace-normal text-slate-300">
                        <div className="space-y-2">
                          <p className="leading-6">{decision.user_facing_summary}</p>
                          {decision.input_payload && typeof decision.input_payload.textExcerpt === "string" ? (
                            <p className="text-xs leading-5 text-slate-500">
                              Input excerpt: {decision.input_payload.textExcerpt}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                      No orchestration decisions have been persisted yet. The table will fill after the next triggered route.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {payload.decisions.length > 0 && filteredDecisions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
              No loaded decisions match the current filters.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
