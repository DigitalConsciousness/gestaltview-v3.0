import { useMemo, useState, type FC } from "react";
import ClaimCard from "./ClaimCard";
import type { Claim, Lane, SkepticismEntry } from "./types";

interface ClaimWallProps {
  claims: Claim[];
  skepticism: SkepticismEntry[];
}

const statusFilterMap: Record<string, string[]> = {
  All: [],
  Confirmed: ["Confirmed"],
  "Timestamp Confirmed": ["Timestamp Confirmed"],
  Open: ["Open"],
  "Pending External Validation": ["Documented", "Documented Pending Codified External Validation", "Documented — Pending Codified External Validation"],
};

const ClaimWall: FC<ClaimWallProps> = ({ claims, skepticism }) => {
  const [laneFilter, setLaneFilter] = useState<Lane | "All">("All");
  const [statusFilter, setStatusFilter] = useState<keyof typeof statusFilterMap>("All");
  const [query, setQuery] = useState("");

  const filteredClaims = useMemo(() => {
    const q = query.toLowerCase();

    return claims.filter((claim) => {
      const laneMatch = laneFilter === "All" ? true : claim.lane === laneFilter;
      const statusGroup = statusFilterMap[statusFilter];
      const statusMatch = statusGroup.length === 0 ? true : statusGroup.includes(claim.status);
      const queryMatch = q.length === 0 ? true : `${claim.claimtext} ${claim.recommendedwording}`.toLowerCase().includes(q);
      return laneMatch && statusMatch && queryMatch;
    });
  }, [claims, laneFilter, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-3" style={{ borderColor: "rgba(0,212,255,0.22)" }}>
        <label className="flex flex-col gap-1 text-xs text-cyan-200">
          Lane
          <select className="rounded-md border bg-black/40 px-2 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }} value={laneFilter} onChange={(event) => setLaneFilter(event.target.value as Lane | "All")}>
            <option value="All">All</option>
            <option value="Documented">Documented</option>
            <option value="Needs Translation">Needs Translation</option>
            <option value="Aspirational">Aspirational</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-cyan-200">
          Status
          <select className="rounded-md border bg-black/40 px-2 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as keyof typeof statusFilterMap)}>
            {Object.keys(statusFilterMap).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-cyan-200">
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-md border bg-black/40 px-2 py-1.5 text-sm" style={{ borderColor: "rgba(0,212,255,0.3)" }} placeholder="Search claim text or wording" />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredClaims.map((claim) => (
          <ClaimCard key={claim.claimid} claim={claim} skepticism={skepticism} />
        ))}
      </div>
    </div>
  );
};

export default ClaimWall;
