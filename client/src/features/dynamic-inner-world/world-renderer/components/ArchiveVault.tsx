import { Archive, RotateCcw, Trash2 } from "lucide-react";
import type { WorldNode, WorldRenderContext } from "../types";
import { worldTransform } from "../styles";

export function ArchiveVault({ node, context }: { node: WorldNode; context: WorldRenderContext }) {
  const latest = context.archivedArtifacts.slice(0, 2);

  return (
    <aside
      className="absolute left-1/2 top-1/2 hidden w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-amber-100/14 bg-amber-100/[0.045] p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.30)] backdrop-blur-xl xl:block"
      style={{ transform: `translate(-50%, -50%) ${worldTransform(node.position)}` }}
      aria-label="Archive vault"
    >
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-amber-100/70" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-100/58">Archive vault</p>
      </div>
      <p className="mt-3 text-sm text-white/72">{context.archivedArtifacts.length} archived pieces</p>
      {latest.length > 0 ? (
        <ul className="mt-3 space-y-2 text-xs text-white/58">
          {latest.map((artifact) => (
            <li key={artifact.id} className="rounded-xl border border-white/8 bg-black/18 px-3 py-2">
              <p className="truncate text-white/72">{artifact.title}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => context.onRestoreArtifact(artifact.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-100/18 bg-amber-100/8 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-100/72 transition-colors hover:bg-amber-100/14"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Clear archived record "${artifact.title}"? This removes it from this device.`)) {
                      context.onClearArtifact(artifact.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-400/18 bg-red-400/8 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-red-200/72 transition-colors hover:bg-red-400/14"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs leading-5 text-white/42">Archived work will appear here without leaving the room.</p>
      )}
    </aside>
  );
}
