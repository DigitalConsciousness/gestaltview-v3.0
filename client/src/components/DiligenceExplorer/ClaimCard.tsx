import { useMemo, useState, type FC } from "react";
import BlockchainBadge from "./BlockchainBadge";
import LaneBadge from "./LaneBadge";
import SkepticismDrawer from "./SkepticismDrawer";
import type { Claim, SkepticismEntry } from "./types";

interface ClaimCardProps {
  claim: Claim;
  skepticism: SkepticismEntry[];
}

const ClaimCard: FC<ClaimCardProps> = ({ claim, skepticism }) => {
  const [showMethod, setShowMethod] = useState(false);
  const [showSkepticism, setShowSkepticism] = useState(false);

  const linkedSkepticism = useMemo(
    () => skepticism.filter((entry) => entry.neededartifact?.includes(claim.claimid)),
    [claim.claimid, skepticism]
  );

  return (
    <article id={`claim-${claim.claimid}`} className="rounded-xl border p-6" style={{ background: "#050A0E", borderColor: "rgba(0,212,255,0.25)" }}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-xs text-cyan-300">{claim.claimid}</p>
        <LaneBadge lane={claim.lane} />
      </div>
      <p className="mt-4 text-sm text-cyan-100/80">{claim.claimtext}</p>
      <p className="mt-3 text-base font-medium text-white">{claim.recommendedwording}</p>

      <div className="mt-4 space-y-1 text-xs text-cyan-100/75">
        <p>Status: {claim.status}</p>
        <p>Tier: {claim.evidenceTier}</p>
        <p>Source: {claim.source}</p>
      </div>

      {claim.blockchainanchored ? <div className="mt-4"><BlockchainBadge bitcoinBlock={claim.bitcoinblock} /></div> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="rounded-md border px-3 py-1.5 text-xs text-cyan-200" style={{ borderColor: "rgba(0,212,255,0.35)" }} onClick={() => setShowMethod((prev) => !prev)}>
          {showMethod ? "Hide Methodology" : "View Methodology"}
        </button>
        {linkedSkepticism.length > 0 ? (
          <button type="button" className="rounded-md border px-3 py-1.5 text-xs text-cyan-200" style={{ borderColor: "rgba(0,212,255,0.35)" }} onClick={() => setShowSkepticism((prev) => !prev)}>
            {showSkepticism ? "Hide Objection/Rebuttal" : "See Objection/Rebuttal"}
          </button>
        ) : null}
      </div>

      {showMethod ? <div className="mt-4 rounded-md border p-3 text-sm text-cyan-100/90" style={{ borderColor: "rgba(0,212,255,0.2)" }}>{claim.ownernotes}</div> : null}
      {showSkepticism ? <div className="mt-4 space-y-3">{linkedSkepticism.map((entry) => <SkepticismDrawer key={entry.objectionid} entry={entry} />)}</div> : null}
    </article>
  );
};

export default ClaimCard;
