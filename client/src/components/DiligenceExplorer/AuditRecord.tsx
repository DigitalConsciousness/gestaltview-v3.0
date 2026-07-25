import { useMemo, useState, type FC } from "react";
import type { ArchitectureEntry, BundleSummary, EvidenceEntry } from "./types";

type AuditTab = "evidence" | "architecture" | "stats";

interface AuditRecordProps {
  evidenceIndex: EvidenceEntry[];
  architectureMap: ArchitectureEntry[];
  bundleSummary: BundleSummary;
  onJumpToClaim: (claimId: string) => void;
}

const statusColors: Record<string, string> = {
  Implemented: "#34D399",
  Prototype: "#FBBF24",
  "Documented Only": "#60A5FA",
  Aspirational: "#C084FC",
};

const AuditRecord: FC<AuditRecordProps> = ({ evidenceIndex, architectureMap, bundleSummary, onJumpToClaim }) => {
  const [tab, setTab] = useState<AuditTab>("evidence");
  const packageList = useMemo(() => bundleSummary.packages || [], [bundleSummary.packages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("evidence")} className="rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }}>Evidence Index</button>
        <button type="button" onClick={() => setTab("architecture")} className="rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }}>Architecture Map</button>
        <button type="button" onClick={() => setTab("stats")} className="rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }}>Corpus Stats</button>
      </div>

      {tab === "evidence" ? (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(0,212,255,0.25)" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/30 text-cyan-200">
              <tr><th className="px-3 py-2">File</th><th className="px-3 py-2">Package</th><th className="px-3 py-2">Tier</th><th className="px-3 py-2">Claims Covered</th><th className="px-3 py-2">Notes</th></tr>
            </thead>
            <tbody>
              {evidenceIndex.map((entry, index) => (
                <tr key={`${entry.evidencefile}-${index}`} className="border-t" style={{ borderColor: "rgba(0,212,255,0.12)" }}>
                  <td className="px-3 py-2">{entry.evidencefile}</td>
                  <td className="px-3 py-2">{entry.package}</td>
                  <td className="px-3 py-2">{entry.tier}</td>
                  <td className="px-3 py-2">{entry.claimscovered.split(",").map((id) => id.trim()).filter(Boolean).map((id) => <button key={id} type="button" className="mr-1 font-mono text-cyan-300 underline" onClick={() => onJumpToClaim(id)}>{id}</button>)}</td>
                  <td className="px-3 py-2">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "architecture" ? (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(0,212,255,0.25)" }}>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/30 text-cyan-200">
              <tr><th className="px-3 py-2">Component</th><th className="px-3 py-2">Function</th><th className="px-3 py-2">Evidence File</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Skeptic Q Answered</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody>
              {architectureMap.map((entry, index) => (
                <tr key={`${entry.component}-${index}`} className="border-t" style={{ borderColor: "rgba(0,212,255,0.12)" }}>
                  <td className="px-3 py-2">{entry.component}</td>
                  <td className="px-3 py-2">{entry.function}</td>
                  <td className="px-3 py-2">{entry.evidencefile}</td>
                  <td className="px-3 py-2">{entry.evidencetype}</td>
                  <td className="px-3 py-2">{entry.skepticquestionanswered}</td>
                  <td className="px-3 py-2" style={{ color: statusColors[entry.status] ?? "#E5E7EB" }}>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="rounded-xl border p-4 text-sm" style={{ borderColor: "rgba(0,212,255,0.25)", background: "#050A0E" }}>
          <p>Total files indexed: {bundleSummary.totalfileslisted}</p>
          <p>Package count: {bundleSummary.packagecount}</p>
          <p>Unique SHA-256 hashes: {bundleSummary.uniquefilehashes}</p>
          <p>Duplicate rows: {bundleSummary.duplicaterows}</p>
          <p>Last refreshed: {new Date(bundleSummary.createdutc).toLocaleString()}</p>
          <p className="mt-3 font-semibold">Packages:</p>
          <ul className="mt-1 list-inside list-disc">{packageList.map((pkg) => <li key={pkg}>{pkg}</li>)}</ul>
          <p className="mt-3 text-xs text-cyan-100/70">SHA-256 hashes computed at index time. Verify at opentimestamps.org</p>
        </div>
      ) : null}
    </div>
  );
};

export default AuditRecord;
