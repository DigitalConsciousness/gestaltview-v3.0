import { useState, type FC } from "react";
import type { SkepticismEntry } from "./types";

interface SkepticismDrawerProps {
  entry: SkepticismEntry;
}

const statusColor: Record<SkepticismEntry["status"], string> = {
  Resolved: "#34D399",
  Open: "#FBBF24",
  "In Progress": "#38BDF8",
};

const SkepticismDrawer: FC<SkepticismDrawerProps> = ({ entry }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border" style={{ borderColor: "rgba(0,212,255,0.25)", background: "#050A0E" }}>
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
        <div>
          <p className="font-mono text-xs text-cyan-300">{entry.objectionid}</p>
          <p className="mt-1 text-sm text-cyan-100">{entry.objection}</p>
        </div>
        <span style={{ color: statusColor[entry.status] }}>{entry.status}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t px-4 py-4 text-sm" style={{ borderColor: "rgba(0,212,255,0.2)" }}>
          <p className="text-cyan-100/70">Why it hits: {entry.whyithits}</p>
          <p className="rounded border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-100">{entry.rebuttal}</p>
        </div>
      ) : null}
    </div>
  );
};

export default SkepticismDrawer;
