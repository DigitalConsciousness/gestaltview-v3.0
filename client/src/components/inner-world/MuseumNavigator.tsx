import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers3, Sparkles } from "lucide-react";
import { INNER_WORLD_SURFACES, type InnerWorldSurface } from "@/components/Scaffold";

type Props = {
  selectedSurface: InnerWorldSurface;
  viewMode: "2d" | "3d";
  surfaceCounts: Record<InnerWorldSurface, number>;
  onSurfaceChange: (surface: InnerWorldSurface) => void;
  onViewModeChange: (mode: "2d" | "3d") => void;
};

export function MuseumNavigator({
  selectedSurface,
  viewMode,
  surfaceCounts,
  onSurfaceChange,
  onViewModeChange,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_0_60px_rgba(18,214,255,0.06)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#12D6FF]">surface navigation</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Move through the surfaces without losing the thread.</h2>
          <p className="mt-1 text-sm leading-relaxed text-white/55">
            Select a surface, then switch between 2D overview and 3D walkthrough when you want context or scan speed.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
          <Sparkles className="h-3.5 w-3.5 text-[#BF00FF]" />
          Current room
          <ChevronRight className="h-3.5 w-3.5 text-white/38" />
          {INNER_WORLD_SURFACES.find((surface) => surface.id === selectedSurface)?.label ?? selectedSurface}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
          <div className="relative aspect-[1.05] min-h-[480px] overflow-hidden rounded-[1.35rem] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(18,214,255,0.12),transparent_18%),radial-gradient(circle_at_center,rgba(191,0,255,0.08),transparent_34%),linear-gradient(180deg,rgba(8,10,14,0.96),rgba(5,6,10,0.98))]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />

            <motion.button
              type="button"
              onClick={() => onViewModeChange(viewMode === "3d" ? "2d" : "3d")}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className="absolute left-1/2 top-1/2 z-20 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-200/30 bg-[radial-gradient(circle_at_center,rgba(18,214,255,0.18),rgba(5,6,10,0.9))] text-center shadow-[0_0_70px_rgba(18,214,255,0.18)]"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-100/80">center view</p>
                <p className="mt-2 text-2xl font-semibold text-white">{INNER_WORLD_SURFACES.find((surface) => surface.id === selectedSurface)?.label ?? selectedSurface}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/52">{viewMode === "3d" ? "3D walkthrough" : "2D overview"}</p>
              </div>
            </motion.button>

            {INNER_WORLD_SURFACES.map((surface, index) => {
              const active = surface.id === selectedSurface;
              const position = orbitPositions[index];
              return (
                <motion.button
                  key={surface.id}
                  type="button"
                  onClick={() => onSurfaceChange(surface.id)}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.24, delay: index * 0.04 }}
                  className={`absolute z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-start justify-between rounded-[1.45rem] border p-3 text-left transition-all ${
                    active
                      ? "border-cyan-200/40 bg-cyan-200/12 text-white shadow-[0_0_34px_rgba(18,214,255,0.12)]"
                      : "border-white/10 bg-black/24 text-white/72 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                  style={{ left: position.left, top: position.top }}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{surface.label}</p>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/55">
                      {surfaceCounts[surface.id] ?? 0}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">{surface.description}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onViewModeChange(viewMode === "3d" ? "2d" : "3d")}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/16"
              >
                {viewMode === "3d" ? <Layers3 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {viewMode === "3d" ? "Switch to 2D overview" : "Switch to 3D walkthrough"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSurfaceChange(previousSurface(selectedSurface))}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/72 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous room
              </button>
              <button
                type="button"
                onClick={() => onSurfaceChange(nextSurface(selectedSurface))}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/72 transition-colors hover:text-white"
              >
                Next room
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-3 rounded-[1.6rem] border border-white/10 bg-black/18 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#BF00FF]">Orbit legend</p>
          <div className="space-y-2">
            {INNER_WORLD_SURFACES.map((surface) => {
              const active = surface.id === selectedSurface;
              return (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => onSurfaceChange(surface.id)}
                  className={`flex w-full items-center justify-between rounded-[1.1rem] border px-3 py-3 text-left transition-colors ${
                    active ? "border-cyan-200/40 bg-cyan-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/62 hover:text-white"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{surface.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/44">{surface.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] text-white/55">
                    {surfaceCounts[surface.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

const orbitPositions: Array<{ left: string; top: string }> = [
  { left: "50%", top: "14%" },
  { left: "75%", top: "26%" },
  { left: "82%", top: "64%" },
  { left: "50%", top: "86%" },
  { left: "18%", top: "64%" },
  { left: "25%", top: "26%" },
];

function previousSurface(current: InnerWorldSurface): InnerWorldSurface {
  const index = INNER_WORLD_SURFACES.findIndex((surface) => surface.id === current);
  return INNER_WORLD_SURFACES[(index - 1 + INNER_WORLD_SURFACES.length) % INNER_WORLD_SURFACES.length].id;
}

function nextSurface(current: InnerWorldSurface): InnerWorldSurface {
  const index = INNER_WORLD_SURFACES.findIndex((surface) => surface.id === current);
  return INNER_WORLD_SURFACES[(index + 1) % INNER_WORLD_SURFACES.length].id;
}
