import { useEffect, useMemo, useState, type FC } from "react";
import { Link } from "wouter";
import ContinuumTimeline3D from "../ContinuumTimeline3D";
import AuditRecord from "./AuditRecord";
import ClaimWall from "./ClaimWall";
import EvidenceTimeline from "./EvidenceTimeline";
import { useDiligenceData } from "./useDiligenceData";

type MainTab = "claims" | "timeline" | "loom" | "record";

const tabLabels: Record<MainTab, string> = {
  claims: "Claim Wall",
  timeline: "2D Evidence Timeline",
  loom: "3D Loom",
  record: "Audit Record",
};

const DiligenceExplorer: FC = () => {
  const { data, loading, error } = useDiligenceData();
  const [tab, setTab] = useState<MainTab>("claims");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as MainTab;
    if (["claims", "timeline", "loom", "record"].includes(hash)) {
      setTab(hash);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  const stats = useMemo(() => {
    if (!data) {
      return { files: 0, receipts: 0, claims: 0, objections: 0, updated: "--" };
    }

    return {
      files: data.bundlesummary.totalfileslisted,
      receipts: data.bundlesummary.otsreceipts ?? data.claims.filter((claim) => claim.blockchainanchored).length,
      claims: data.claims.length,
      objections: data.skepticism.length,
      updated: new Date(data.lastupdated).toLocaleString(),
    };
  }, [data]);

  const jumpToClaim = (claimId: string): void => {
    setTab("claims");
    setTimeout(() => {
      document.getElementById(`claim-${claimId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <section className="relative min-h-screen px-4 pb-14 pt-24 md:px-8" style={{ background: "radial-gradient(circle at top, rgba(0,212,255,0.16), #0A0F14 40%), #0A0F14" }}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)", opacity: 0.14 }} />
      <div className="relative mx-auto w-full max-w-7xl text-cyan-50">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" style={{ borderColor: "rgba(0,212,255,0.25)", background: "#050A0E" }}>
          <div>
            <h2 className="text-xs uppercase tracking-[0.18em] text-cyan-300/85">Evidence and Audit Record</h2>
            <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">GestaltView Diligence Explorer</h1>
          </div>
          <Link href="/" className="inline-flex items-center rounded-md border px-3 py-2 text-sm transition-colors hover:bg-cyan-400/10" style={{ borderColor: "rgba(0,212,255,0.35)" }}>
            ← Back to Home
          </Link>
        </header>

        <div className="mb-5 grid gap-3 rounded-xl border p-4 text-sm md:grid-cols-5" style={{ borderColor: "rgba(0,212,255,0.25)", background: "#050A0E" }}>
          <p>[ {stats.files} files indexed ]</p>
          <p>[ {stats.receipts} OTS receipts ]</p>
          <p>[ {stats.claims} claims ]</p>
          <p>[ {stats.objections} objections answered ]</p>
          <p>[ Last: {stats.updated} ]</p>
        </div>

        <div className="mb-6 flex flex-wrap overflow-hidden rounded-xl border" style={{ borderColor: "rgba(0,212,255,0.25)" }}>
          {(Object.keys(tabLabels) as MainTab[]).map((tabKey) => (
            <button key={tabKey} type="button" className="flex-1 px-4 py-3 text-left text-sm" style={{ background: tabKey === tab ? "rgba(0,212,255,0.12)" : "#050A0E" }} onClick={() => setTab(tabKey)} id={`tab-${tabKey}`} aria-controls={`panel-${tabKey}`}>
              {tabLabels[tabKey]}
            </button>
          ))}
        </div>

        {loading ? <p className="text-sm text-cyan-200">Loading diligence corpus...</p> : null}
        {error ? <p className="text-sm text-amber-300">Error loading diligence data: {error}</p> : null}

        {data ? (
          <div>
            {tab === "claims" ? (
              <div role="tabpanel" aria-labelledby="tab-claims" id="panel-claims">
                <ClaimWall claims={data.claims} skepticism={data.skepticism} />
              </div>
            ) : null}
            {tab === "timeline" ? (
              <div role="tabpanel" aria-labelledby="tab-timeline" id="panel-timeline">
                <EvidenceTimeline entries={data.chronology} />
              </div>
            ) : null}
            {tab === "loom" ? (
              <div role="tabpanel" aria-labelledby="tab-loom" id="panel-loom">
                <ContinuumTimeline3D />
              </div>
            ) : null}
            {tab === "record" ? (
              <div role="tabpanel" aria-labelledby="tab-record" id="panel-record">
                <AuditRecord evidenceIndex={data.evidenceindex} architectureMap={data.architecturemap} bundleSummary={data.bundlesummary} onJumpToClaim={jumpToClaim} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default DiligenceExplorer;
