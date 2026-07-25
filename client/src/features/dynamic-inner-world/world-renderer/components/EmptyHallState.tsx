import { PlusCircle, SlidersHorizontal } from "lucide-react";
import type { WorldNode, WorldRenderContext } from "../types";

export function EmptyHallState({ node, context }: { node: WorldNode; context: WorldRenderContext }) {
  return (
    <div className="mx-auto flex min-h-[21rem] max-w-2xl flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/14 bg-white/[0.04] p-8 text-center backdrop-blur-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-100/60">Empty hall</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{node.title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-white/58">{node.summary}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {context.hasActiveFilters ? (
          <button
            type="button"
            onClick={context.onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-100/24 bg-cyan-100/10 px-4 py-2 text-sm text-white transition-colors hover:bg-cyan-100/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Reset filters
          </button>
        ) : null}
        <button
          type="button"
          onClick={context.onGoToCreationCorner}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
        >
          <PlusCircle className="h-4 w-4" />
          Creation Corner
        </button>
      </div>
    </div>
  );
}
