import type { WorldNode, WorldRenderContext } from "../types";

export function WorldStatsRibbon({ context }: { node: WorldNode; context: WorldRenderContext }) {
  const stats = [
    ["Artifacts", context.stats.totalArtifacts],
    ["PLK fragments", context.stats.plkFragmentCount],
    ["Recent updates", context.stats.recentUpdates],
    ["Curator", context.stats.curatorLabel],
  ];

  return (
    <div className="pointer-events-auto grid gap-2 sm:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-black/28 px-3 py-2.5 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
        </div>
      ))}
      {context.dynamicInnerWorldError ? <p className="sm:col-span-4 text-xs text-amber-100/72">{context.dynamicInnerWorldError}</p> : null}
    </div>
  );
}
