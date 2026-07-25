import { motion, useReducedMotion } from "framer-motion";
import type { InnerWorldCapture } from "@/components/Scaffold";
import type { InnerWorldPlacement } from "@/components/inner-world/innerWorldPlacement";

type Props = {
  capture: InnerWorldCapture;
  placement: InnerWorldPlacement;
  active: boolean;
  onSelect: (captureId: string) => void;
};

export function InnerWorldArtifact({ capture, placement, active, onSelect }: Props) {
  const modeClass = artifactModeClasses[placement.displayMode];
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(capture.id);
      }}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: placement.scale }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }}
      className={`group absolute max-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[1.15rem] border p-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-transform ${
        active ? "border-cyan-200/40 bg-cyan-200/14" : "border-white/10 bg-black/38 hover:border-white/18"
      } ${modeClass}`}
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
        transformOrigin: "center center",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-white">{capture.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">{capture.text}</p>
        </div>
        <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: capture.color }} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span>{capture.type}</span>
        <span>{capture.source}</span>
      </div>

      {placement.displayMode === "waveform" && (
        <div className="mt-3 flex h-10 items-end gap-1 overflow-hidden rounded-lg border border-cyan-300/12 bg-cyan-300/8 px-2 py-1">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className="w-full rounded-full bg-cyan-200/80"
              style={{ height: `${30 + ((index * 13) % 64)}%` }}
            />
          ))}
        </div>
      )}

      {placement.displayMode === "fragment-shard" && (
        <div className="mt-3 h-11 rounded-[1rem] border border-rose-300/16 bg-[linear-gradient(135deg,rgba(230,0,0,0.28),rgba(255,255,255,0.02))] [clip-path:polygon(0_20%,20%_0,82%_8%,100%_34%,86%_100%,16%_92%)]" />
      )}

      {placement.displayMode === "photo" && (
        <div className="mt-3 overflow-hidden rounded-[1rem] border border-white/10 bg-white/[0.04]">
          <div
            className="h-12 w-full"
            style={{
              backgroundImage:
                placement.thumbnailUrl || placement.mediaUrl
                  ? `url(${placement.thumbnailUrl ?? placement.mediaUrl})`
                  : "linear-gradient(135deg, rgba(18,214,255,0.14), rgba(191,0,255,0.08), rgba(255,255,255,0.02))",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      )}
    </motion.button>
  );
}

const artifactModeClasses: Record<InnerWorldPlacement["displayMode"], string> = {
  scorch: "bg-[linear-gradient(180deg,rgba(40,30,18,0.84),rgba(10,8,8,0.96))]",
  "sticky-note": "bg-[linear-gradient(180deg,rgba(255,214,118,0.22),rgba(40,32,12,0.88))]",
  pinboard: "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(18,18,22,0.92))]",
  waveform: "bg-[linear-gradient(180deg,rgba(0,215,255,0.12),rgba(4,10,14,0.92))]",
  sketch: "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(14,16,20,0.95))]",
  "code-panel": "bg-[linear-gradient(180deg,rgba(10,14,20,0.98),rgba(0,0,0,0.92))] font-mono",
  photo: "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(12,12,14,0.92))]",
  "fragment-shard": "bg-[linear-gradient(180deg,rgba(78,0,0,0.9),rgba(12,4,4,0.98))]",
};
