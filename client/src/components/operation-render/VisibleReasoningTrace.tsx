import { CheckCircle2, Eye, ShieldCheck, Wrench } from "lucide-react";
import type { VisibleReasoningTrace as VisibleReasoningTraceData } from "@shared/operation-render/contracts";
import { GlassCard } from "@/components/ui/GlassCard";

interface VisibleReasoningTraceProps {
  trace: VisibleReasoningTraceData;
}

function TraceGlyph({ trace }: { trace: VisibleReasoningTraceData }) {
  const { sourceCount, toolCallCount, uncertaintyLevel, profileColor, roomColor } = trace.visualSeed;
  const radius = uncertaintyLevel === "high" ? 42 : uncertaintyLevel === "medium" ? 34 : 26;

  return (
    <svg viewBox="0 0 160 90" role="img" aria-label="Decorative map of visible evidence, tool calls, and uncertainty." className="h-24 w-full overflow-visible">
      <defs><linearGradient id={`trace-gradient-${trace.sessionId}`} x1="0" x2="1"><stop offset="0%" stopColor={profileColor} /><stop offset="100%" stopColor={roomColor} /></linearGradient></defs>
      <circle cx="80" cy="45" r={radius} fill="none" stroke={`url(#trace-gradient-${trace.sessionId})`} strokeOpacity="0.55" strokeWidth="2" />
      {Array.from({ length: Math.max(1, sourceCount) }).map((_, index) => <circle key={`source-${index}`} cx={24 + index * 18} cy={22 + (index % 2) * 18} r="3" fill={profileColor} opacity="0.85" />)}
      {Array.from({ length: Math.max(0, toolCallCount) }).map((_, index) => <path key={`tool-${index}`} d={`M${38 + index * 22} 70 C 62 35, 98 62, ${122 - index * 8} 22`} stroke={roomColor} strokeOpacity="0.5" fill="none" />)}
      <text x="80" y="50" textAnchor="middle" className="fill-white text-[10px] font-bold">trace</text>
    </svg>
  );
}

export function VisibleReasoningTrace({ trace }: VisibleReasoningTraceProps) {
  return (
    <GlassCard surfaceRole="artifact" glow="electricPurple" intensity="high" hover={false} className="p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="operation-render-equation-field rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:w-56">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#BDF7FF]"><Eye className="h-4 w-4" /> visible trace</div>
          <TraceGlyph trace={trace} />
          <p className="text-xs leading-relaxed text-white/55">Public evidence map only. Private scratchpad stays private.</p>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div><p className="text-sm font-semibold text-white">How this was built</p><p className="mt-1 text-sm leading-relaxed text-white/65">{trace.summary}</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            {trace.evidenceCards.map((card) => <div key={card.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-[#00E5FF]" />{card.title}</div><p className="mt-1 text-xs leading-relaxed text-white/55">{card.summary}</p><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/35">{card.sourceType} · {card.freshness}</p></div>)}
          </div>
          {trace.toolTrail.length > 0 && <div className="rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-[#D7FBFF]"><Wrench className="h-4 w-4" /> Tool trail</p><ul className="mt-2 space-y-1 text-xs text-white/60">{trace.toolTrail.map((tool, index) => <li key={`${tool.toolName}-${index}`}>{tool.status}: {tool.toolClass}/{tool.toolName} — {tool.outputSummary ?? "no output summary"}</li>)}</ul></div>}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55"><p className="flex items-center gap-2 font-semibold text-white/75"><ShieldCheck className="h-4 w-4 text-[#A7F3D0]" /> Redacted theater</p><p className="mt-1">{trace.redactions[0] ?? "[redacted: private scratchpad stayed private]"}</p></div>
        </div>
      </div>
    </GlassCard>
  );
}
