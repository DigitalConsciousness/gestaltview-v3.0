import type { FC } from "react";

interface BlockchainBadgeProps {
  bitcoinBlock?: string;
  anchored?: boolean;
  label?: string;
}

export const BlockchainBadge: FC<BlockchainBadgeProps> = ({ bitcoinBlock, anchored = true, label }) => {
  if (!anchored) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-500/40 bg-slate-500/20 px-2 py-1 text-xs text-slate-300"
        aria-label="Not blockchain anchored"
        title="Not blockchain anchored"
      >
        <span>⛓ Not Anchored</span>
      </div>
    );
  }

  const title = bitcoinBlock ? `Block ${bitcoinBlock}` : "Bitcoin anchored";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400"
      aria-label="Bitcoin anchored"
      title={title}
    >
      <span>⛓ Bitcoin Anchored</span>
      {label ? <span className="font-mono">[{label}]</span> : null}
      {bitcoinBlock ? <span className="font-mono">[Block {bitcoinBlock}]</span> : null}
    </div>
  );
};

export default BlockchainBadge;
