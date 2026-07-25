import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { WorldNode, WorldRenderContext } from "../types";
import { worldTransform } from "../styles";

export function CuratorConsole({ node, context }: { node: WorldNode; context: WorldRenderContext }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="absolute left-1/2 top-1/2 hidden w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border border-white/12 bg-gv-bg-deep/78 p-4 text-white shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:block"
      style={{ transform: `translate(-50%, -50%) ${worldTransform(node.position)}` }}
      aria-label="Curator console"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-100/10 text-cyan-100">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/58">Curator</p>
          {!collapsed ? (
            <>
              <p className="mt-2 text-sm leading-6 text-white/82">{context.plan.curator.message}</p>
              {context.plan.curator.note ? <p className="mt-2 text-xs leading-5 text-white/48">{context.plan.curator.note}</p> : null}
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/64 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          aria-label={collapsed ? "Expand curator console" : "Collapse curator console"}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
