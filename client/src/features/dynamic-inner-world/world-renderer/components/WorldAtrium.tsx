import type { WorldNode, WorldRenderContext } from "../types";

export function WorldAtrium({ context }: { node: WorldNode; context: WorldRenderContext }) {
  const modeLabel =
    context.plan.mode === "archive" ? "Archive wing" : context.plan.mode === "constellation" ? "T-junction constellation" : "Museum hall";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(18,214,255,0.20),transparent_30%),radial-gradient(circle_at_82%_24%,rgba(191,0,255,0.13),transparent_24%),radial-gradient(circle_at_18%_72%,rgba(53,255,159,0.10),transparent_26%),linear-gradient(180deg,rgba(2,6,14,0.34),rgba(2,6,14,0.96))]" />
      <div className="absolute inset-x-8 top-12 h-px bg-cyan-200/30 shadow-[0_0_34px_rgba(18,214,255,0.44)]" />

      {/* Long hall shell */}
      <div className="absolute left-1/2 top-16 h-[76%] w-[78%] -translate-x-1/2 rounded-t-[46%] border border-cyan-100/10 bg-cyan-100/[0.018] shadow-[inset_0_0_90px_rgba(18,214,255,0.06)]" />
      <div className="absolute bottom-0 left-1/2 h-[46%] w-[92%] -translate-x-1/2 rounded-t-full border-t border-cyan-200/15 bg-cyan-200/[0.025]" />

      {/* Perspective floor lane / retrieval track */}
      <div className="absolute bottom-16 left-1/2 h-[54%] w-[28%] -translate-x-1/2 skew-x-[-8deg] bg-[linear-gradient(180deg,rgba(18,214,255,0.00),rgba(18,214,255,0.10)_45%,rgba(18,214,255,0.02))]" />
      <div className="absolute bottom-20 left-1/2 h-[48%] w-px -translate-x-1/2 bg-cyan-100/30 shadow-[0_0_28px_rgba(18,214,255,0.44)]" />
      <div className="absolute bottom-20 left-[37%] h-[42%] w-px rotate-[8deg] bg-cyan-100/16" />
      <div className="absolute bottom-20 right-[37%] h-[42%] w-px -rotate-[8deg] bg-cyan-100/16" />

      {/* T-junction hint at far end */}
      <div className="absolute left-1/2 top-[22%] h-px w-[56%] -translate-x-1/2 bg-gradient-to-r from-transparent via-fuchsia-300/30 to-transparent shadow-[0_0_30px_rgba(191,0,255,0.28)]" />
      <div className="absolute left-[20%] top-[23%] h-16 w-24 rounded-2xl border border-fuchsia-200/10 bg-fuchsia-200/[0.03] blur-[0.2px]" />
      <div className="absolute right-[20%] top-[23%] h-16 w-24 rounded-2xl border border-fuchsia-200/10 bg-fuchsia-200/[0.03] blur-[0.2px]" />

      {/* Showcase light rails */}
      <div className="absolute inset-x-12 bottom-24 grid grid-cols-6 gap-4 opacity-40">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
        ))}
      </div>
      <div className="absolute inset-y-28 left-10 w-px bg-gradient-to-b from-transparent via-cyan-200/18 to-transparent" />
      <div className="absolute inset-y-28 right-10 w-px bg-gradient-to-b from-transparent via-cyan-200/18 to-transparent" />

      <div className="absolute left-8 top-8 max-w-[20rem] rounded-2xl border border-cyan-200/12 bg-black/24 px-4 py-3 text-left backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/70">{modeLabel}</p>
        <p className="mt-2 truncate text-sm font-medium text-white/88">{context.plan.atmosphere.signage}</p>
        <p className="mt-2 text-xs leading-5 text-white/44">Rendered HTML surfaces line the corridor. The selected piece rides the center lane forward.</p>
      </div>
    </div>
  );
}
