import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCcw, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { OpsWorkbookItem } from "@shared/workbook/schemas";

import {
  listWorkbookItems,
  listWorkbookSyncRuns,
  updateWorkbookItem,
  upsertWorkbookItems,
} from "./lib/workbookApi";
import { WorkbookTable } from "./WorkbookTable";

const SHEETS = [
  "Roadmap",
  "Products_vs_Proof",
  "Claim_Ledger",
  "Evidence_Index",
  "Status_Dashboard",
] as const;

function parseCsvRows(input: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(current);
      current = "";
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const [headers, ...body] = rows;
  return body.map((columns) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), (columns[index] ?? "").trim()]))
  );
}

function firstValue(row: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const match = row[key];
    if (typeof match === "string" && match.trim()) {
      return match.trim();
    }
  }

  return undefined;
}

function itemToCsvRow(item: OpsWorkbookItem): string {
  const values = [
    item.rowKey,
    item.label,
    item.category ?? "",
    item.status ?? "",
    item.priority ?? "",
    item.phase ?? "",
    item.targetStart ?? "",
    item.targetEnd ?? "",
    item.notes ?? "",
    item.linkRef ?? "",
  ];

  return values
    .map((value) => `"${String(value).replace(/"/g, "\"\"")}"`)
    .join(",");
}

export function WorkbookSyncPanel(props: {
  authHeaders: Record<string, string>;
}) {
  const [sheet, setSheet] = useState<(typeof SHEETS)[number]>("Roadmap");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [items, setItems] = useState<OpsWorkbookItem[]>([]);
  const [syncRuns, setSyncRuns] = useState<Array<{ createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [itemsResponse, syncRunsResponse] = await Promise.all([
        listWorkbookItems(
          {
            sheet,
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            phase: phaseFilter || undefined,
          },
          props.authHeaders
        ),
        listWorkbookSyncRuns(props.authHeaders),
      ]);

      setItems(itemsResponse.items);
      setSyncRuns(syncRunsResponse.syncRuns);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load workbook.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [sheet, statusFilter, priorityFilter, phaseFilter]);

  const lastSyncLabel = useMemo(() => {
    const latest = syncRuns[0];
    if (!latest) {
      return "No sync recorded";
    }

    return new Date(latest.createdAt).toLocaleString();
  }, [syncRuns]);

  async function handleImport() {
    if (!selectedFile) {
      return;
    }

    setImporting(true);
    setError(null);
    setNotice(null);

    try {
      const fileText = await selectedFile.text();
      const parsedRows =
        selectedFile.name.toLowerCase().endsWith(".json")
          ? ((JSON.parse(fileText) as unknown[]) ?? [])
          : parseCsvRows(fileText);

      const itemsToUpsert = parsedRows.map((rawRow) => {
        const row = rawRow as Record<string, string>;
        const label =
          firstValue(row, ["label", "Label", "item", "Item", "metric", "Metric"]) ?? "Untitled";
        const targetStart = firstValue(row, [
          "target_start",
          "Target Start",
          "targetStart",
        ]);
        const targetEnd = firstValue(row, [
          "target_end",
          "Target End",
          "targetEnd",
        ]);

        return {
          sheetName: sheet,
          rowKey: firstValue(row, ["row_key", "rowKey"]),
          label,
          category: firstValue(row, ["category", "Category"]) ?? null,
          status: firstValue(row, ["status", "Status"]) ?? null,
          priority: firstValue(row, ["priority", "Priority"]) ?? null,
          phase: firstValue(row, ["phase", "Phase"]) ?? null,
          targetStart: targetStart ?? null,
          targetEnd: targetEnd ?? null,
          notes: firstValue(row, ["notes", "Notes"]) ?? null,
          linkRef: firstValue(row, ["link_ref", "Link", "linkRef"]) ?? null,
        };
      });

      const response = await upsertWorkbookItems(itemsToUpsert, props.authHeaders, {
        sourceFile: selectedFile.name,
        triggeredBy: "manual",
      });
      setItems(response.items);
      setNotice(`Imported ${response.items.length} workbook rows from ${selectedFile.name}.`);
      await load();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Workbook import failed.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSaveItem(
    itemId: string,
    patch: {
      label: string;
      category?: string | null;
      status?: string | null;
      priority?: string | null;
      phase?: string | null;
      notes?: string | null;
      linkRef?: string | null;
    }
  ) {
    setSavingItemId(itemId);
    setError(null);
    setNotice(null);

    try {
      const response = await updateWorkbookItem(itemId, patch, props.authHeaders);
      setItems((current) => current.map((item) => (item.id === itemId ? response.item : item)));
      setNotice("Workbook item saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Workbook item save failed.");
    } finally {
      setSavingItemId(null);
    }
  }

  function handleExportCsv() {
    const csv = [
      [
        "row_key",
        "label",
        "category",
        "status",
        "priority",
        "phase",
        "target_start",
        "target_end",
        "notes",
        "link_ref",
      ].join(","),
      ...items.map(itemToCsvRow),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sheet}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader>
          <CardTitle>Workbook Registry</CardTitle>
          <CardDescription>
            Supabase-backed operating workbook state, with CSV sync and inline edits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
              Last sync {lastSyncLabel}
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300">
              {items.length} rows
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Sheet</label>
              <Select value={sheet} onValueChange={(value) => setSheet(value as (typeof SHEETS)[number])}>
                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHEETS.map((sheetName) => (
                    <SelectItem key={sheetName} value={sheetName}>
                      {sheetName.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Status filter</label>
              <Input
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border-slate-600 bg-slate-800/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Priority filter</label>
              <Input
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="border-slate-600 bg-slate-800/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Phase filter</label>
              <Input
                value={phaseFilter}
                onChange={(event) => setPhaseFilter(event.target.value)}
                className="border-slate-600 bg-slate-800/60"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1 space-y-2">
              <label className="text-xs font-medium text-slate-400">Sync from CSV or JSON</label>
              <Input
                type="file"
                accept=".csv,.json"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="border-slate-600 bg-slate-800/60"
              />
            </div>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => void load()}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              disabled={items.length === 0}
              onClick={handleExportCsv}
            >
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-500"
              disabled={importing || !selectedFile}
              onClick={() => void handleImport()}
            >
              <Upload className="mr-2 size-4" />
              {importing ? "Syncing..." : "Sync from file"}
            </Button>
          </div>

          <WorkbookTable items={items} savingItemId={savingItemId} onSave={handleSaveItem} />
        </CardContent>
      </Card>
    </div>
  );
}
