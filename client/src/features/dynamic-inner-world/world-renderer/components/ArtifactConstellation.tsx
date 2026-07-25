import type { WorldNode, WorldRenderContext } from "../types";

export function ArtifactConstellation({ context }: { node: WorldNode; context: WorldRenderContext }) {
  return (
    <div className="pointer-events-none absolute inset-10 hidden rounded-full border border-cyan-100/10 lg:block" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_24px_rgba(18,214,255,0.72)]" />
      <p className="sr-only">{context.plan.mode}</p>
    </div>
  );
}
