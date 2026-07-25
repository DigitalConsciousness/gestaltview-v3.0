import { Search, SlidersHorizontal, Tag } from "lucide-react";
import type { WorldNode, WorldRenderContext } from "../types";
import { typeFilterOptions } from "../styles";

export function SearchControlDeck({ context }: { node: WorldNode; context: WorldRenderContext }) {
  return (
    <div className="pointer-events-auto relative z-20 rounded-[1.35rem] border border-white/10 bg-black/36 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/46">Search hall</span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-cyan-100/52" />
            <input
              value={context.searchQuery}
              onChange={(event) => context.onSearchQueryChange(event.target.value)}
              placeholder="Title, tag, origin, node"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/34"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/46">Sort</span>
          <select
            value={context.sortMode}
            onChange={(event) => context.onSortModeChange(event.target.value as WorldRenderContext["sortMode"])}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {typeFilterOptions.map((filter) => {
          const active = context.typeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => context.onTypeFilterChange(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 ${
                active ? "border-cyan-100/28 bg-cyan-100/12 text-white" : "border-white/10 bg-white/[0.03] text-white/58 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {context.availableTags.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/44">
            <Tag className="h-3 w-3" />
            Tags
          </span>
          {context.availableTags.map((tag) => {
            const active = context.selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => context.onToggleTag(tag)}
                className={`rounded-full border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 ${
                  active ? "border-white/20 bg-white/[0.08] text-white" : "border-white/10 bg-white/[0.03] text-white/54 hover:text-white"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-white/46">{context.artifactsById.size > 0 ? `${context.artifactsById.size} artifacts match` : "No matches yet"}</p>
        {context.hasActiveFilters ? (
          <button
            type="button"
            onClick={context.onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
