import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Layers3, Sparkles } from "lucide-react";
import { INNER_WORLD_SURFACES, type InnerWorldCapture, type InnerWorldSurface } from "@/components/Scaffold";
import { InnerWorldArtifact } from "@/components/inner-world/InnerWorldArtifact";
import { groupInnerWorldCaptures, resolveInnerWorldPlacement } from "@/components/inner-world/innerWorldPlacement";

type Props = {
  captures: InnerWorldCapture[];
  selectedSurface: InnerWorldSurface;
  selectedCaptureId: string | null;
  viewMode: "2d" | "3d";
  onSurfaceChange: (surface: InnerWorldSurface) => void;
  onCaptureSelect: (captureId: string) => void;
};

export function InnerWorldRoom({ captures, selectedSurface, selectedCaptureId, viewMode, onSurfaceChange, onCaptureSelect }: Props) {
  const groupedCaptures = groupInnerWorldCaptures(captures);
  const reducedMotion = useReducedMotion();
  const is3D = viewMode === "3d";

  return (
    <section
      className="relative rounded-[2.35rem] border border-white/10 bg-[#05060A]/95 p-4 shadow-[0_0_100px_rgba(18,214,255,0.08)] backdrop-blur-xl"
      style={is3D ? { perspective: "1600px" } : undefined}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[2.35rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 70%), radial-gradient(circle at 30% 0%, rgba(18,214,255,0.16), transparent 30%), radial-gradient(circle at 72% 12%, rgba(191,0,255,0.12), transparent 28%)",
        }}
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-4 sm:px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#12D6FF]">Artifact view</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Rooms stay open and context stays visible.</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/55">
              Switch surfaces, scan the overview, or browse the 3D view. The layout is meant to feel curated, not packed.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/52">
            <Sparkles className="h-3.5 w-3.5 text-[#BF00FF]" />
            Room
            <ChevronRight className="h-3.5 w-3.5 text-white/38" />
            {selectedSurface.replace("-", " ")}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/52">
            Walkthrough
            <ChevronRight className="h-3.5 w-3.5 text-white/38" />
            {is3D ? "3D" : "2D"}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="relative min-h-[660px] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(18,214,255,0.12),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(191,0,255,0.1),transparent_30%),linear-gradient(180deg,rgba(6,7,10,0.92),rgba(8,10,14,0.98))] p-4 sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "52px 52px",
              }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[7%] bottom-4 h-40 rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(18,214,255,0.18),transparent_64%)] blur-2xl" />

            <div
              className="relative h-full min-h-[620px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.36))] p-3"
              style={is3D ? { transform: "rotateX(2deg)", transformStyle: "preserve-3d" } : undefined}
            >
              <div className={`grid h-full gap-3 ${is3D ? "grid-cols-6 grid-rows-[1fr_0.65fr_1fr]" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
                {INNER_WORLD_SURFACES.map((surface) => {
                  const surfaceCaptures = groupedCaptures[surface.id];
                  const active = surface.id === selectedSurface;
                  const transformClass = is3D ? surfaceTransformClasses[surface.id] : flatSurfaceTransformClasses[surface.id];

                  return (
                    <motion.div
                      key={surface.id}
                      className={`relative overflow-hidden rounded-[1.5rem] border transition-all ${surfacePanelClasses[surface.id]} ${
                        active ? "border-cyan-200/45 shadow-[0_0_42px_rgba(18,214,255,0.16)]" : "border-white/10"
                      } ${transformClass}`}
                      whileHover={reducedMotion ? undefined : { y: -2 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22 }}
                      style={is3D ? { gridArea: surfaceGridAreas[surface.id] } : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => onSurfaceChange(surface.id)}
                        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-white/8 bg-black/25 px-3 py-2 text-left backdrop-blur-sm"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{surface.label}</p>
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">{surface.description}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/55">
                          {surfaceCaptures.length}
                        </span>
                      </button>

                      <div className="absolute inset-0">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_28%,transparent_72%,rgba(255,255,255,0.03))]" />
                        {surfaceCaptures.map((capture, index) => {
                          const placement = resolveInnerWorldPlacement(capture, index);
                          return (
                            <InnerWorldArtifact
                              key={capture.id}
                              capture={capture}
                              placement={placement}
                              active={capture.id === selectedCaptureId}
                              onSelect={onCaptureSelect}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {INNER_WORLD_SURFACES.map((surface) => {
                const count = groupedCaptures[surface.id].length;
                const active = surface.id === selectedSurface;
                return (
                  <button
                    key={surface.id}
                    type="button"
                    onClick={() => onSurfaceChange(surface.id)}
                    className={`rounded-[1.1rem] border px-3 py-3 text-left transition-colors ${
                      active ? "border-cyan-200/40 bg-cyan-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/62 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{surface.label}</p>
                      <Layers3 className={`h-4 w-4 ${active ? "text-cyan-100" : "text-white/32"}`} />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/46">{surface.description}</p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/34">{count} captures</p>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="border-t border-white/8 bg-black/22 p-4 lg:border-l lg:border-t-0 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#BF00FF]">Evidence notes</p>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              The surface keeps context visible. This panel is for inspection, not placement, so the room can stay calm and legible.
            </p>

            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/42">surface density</p>
              <div className="mt-3 grid gap-2">
                {INNER_WORLD_SURFACES.map((surface) => {
                  const count = groupedCaptures[surface.id].length;
                  return (
                    <div key={surface.id} className="flex items-center justify-between rounded-full border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/58">
                      <span>{surface.label}</span>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const surfaceGridAreas: Record<InnerWorldSurface, string> = {
  ceiling: "1 / 2 / 2 / 6",
  left: "2 / 1 / 4 / 3",
  forward: "2 / 3 / 4 / 5",
  right: "2 / 5 / 4 / 7",
  back: "1 / 3 / 2 / 5",
  floor: "3 / 2 / 4 / 6",
};

const surfaceTransformClasses: Record<InnerWorldSurface, string> = {
  ceiling: "translate-y-[-10px] -skew-x-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]",
  floor: "translate-y-[8px] skew-x-3 bg-[linear-gradient(180deg,rgba(12,14,18,0.92),rgba(4,6,8,0.98))]",
  left: "-skew-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]",
  right: "skew-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))]",
  forward: "translate-y-[2px] bg-[linear-gradient(180deg,rgba(18,214,255,0.06),rgba(255,255,255,0.016))]",
  back: "-translate-y-[2px] scale-[0.95] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))]",
};

const flatSurfaceTransformClasses: Record<InnerWorldSurface, string> = {
  ceiling: "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]",
  floor: "bg-[linear-gradient(180deg,rgba(12,14,18,0.92),rgba(4,6,8,0.98))]",
  left: "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]",
  right: "bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))]",
  forward: "bg-[linear-gradient(180deg,rgba(18,214,255,0.06),rgba(255,255,255,0.016))]",
  back: "bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))]",
};

const surfacePanelClasses: Record<InnerWorldSurface, string> = {
  ceiling: "bg-[radial-gradient(circle_at_50%_0%,rgba(191,0,255,0.08),transparent_40%),linear-gradient(180deg,rgba(10,11,16,0.92),rgba(4,5,8,0.96))]",
  floor: "bg-[radial-gradient(circle_at_50%_100%,rgba(18,214,255,0.08),transparent_34%),linear-gradient(180deg,rgba(6,8,10,0.96),rgba(18,20,24,0.94))]",
  left: "bg-[linear-gradient(180deg,rgba(22,24,30,0.98),rgba(10,12,18,0.95))]",
  right: "bg-[linear-gradient(180deg,rgba(18,20,26,0.98),rgba(10,12,18,0.95))]",
  forward: "bg-[radial-gradient(circle_at_50%_0%,rgba(18,214,255,0.09),transparent_28%),linear-gradient(180deg,rgba(14,16,22,0.98),rgba(10,12,16,0.96))]",
  back: "bg-[radial-gradient(circle_at_50%_100%,rgba(191,0,255,0.09),transparent_28%),linear-gradient(180deg,rgba(10,12,16,0.96),rgba(7,8,11,0.98))]",
};
