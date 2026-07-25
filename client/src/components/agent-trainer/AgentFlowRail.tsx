import { AGENT_FLOW_STAGES } from "@/lib/agentFlow";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AgentFlowRail() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {AGENT_FLOW_STAGES.map((stage, index) => (
        <GlassCard key={stage.key} glow={index % 2 === 0 ? "cyan" : "purple"} intensity="medium" className="p-5" hover={false}>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35">
            {String(index + 1).padStart(2, "0")} · {stage.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">{stage.summary}</p>
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] text-white/55">
            {stage.defaultCommand}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
