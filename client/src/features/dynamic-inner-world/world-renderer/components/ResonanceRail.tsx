import type { WorldNode, WorldRenderContext } from "../types";
import { worldTransform } from "../styles";

export function ResonanceRail({ node, context }: { node: WorldNode; context: WorldRenderContext }) {
  const score = typeof node.props?.score === "number" ? node.props.score : 0;

  return (
    <button
      type="button"
      onClick={() => node.artifactId && context.onSelectArtifact(node.artifactId)}
      className="absolute left-1/2 top-1/2 hidden w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/14 bg-cyan-100/[0.05] px-3 py-2 text-left text-xs text-cyan-50/74 shadow-[0_0_24px_rgba(18,214,255,0.12)] backdrop-blur-md transition-colors hover:border-cyan-100/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 lg:block"
      style={{ transform: `translate(-50%, -50%) ${worldTransform(node.position)}` }}
      title={node.summary}
    >
      <span className="block truncate">{node.title ?? "Resonance link"}</span>
      <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-cyan-100/52">{Math.round(score * 100)}% resonance</span>
    </button>
  );
}
