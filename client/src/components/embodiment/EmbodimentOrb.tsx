import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type OrbPulseStyle = "calm" | "active" | "dim" | "glowing" | "steady";

interface EmbodimentOrbProps {
  size?: number;
  color?: string;
  pulseStyle?: OrbPulseStyle;
  label?: string;
  className?: string;
}

const pulseVariants: Record<OrbPulseStyle, string> = {
  calm: "shadow-[0_0_24px_rgba(143,0,255,0.32)]",
  active: "shadow-[0_0_32px_rgba(0,212,255,0.45)]",
  dim: "shadow-[0_0_18px_rgba(255,255,255,0.12)]",
  glowing: "shadow-[0_0_42px_rgba(0,255,165,0.42)]",
  steady: "shadow-[0_0_30px_rgba(34,211,238,0.36)]",
};

export function EmbodimentOrb({
  size = 72,
  color = "#8f00ff",
  pulseStyle = "calm",
  label = "Embodiment presence",
  className,
}: EmbodimentOrbProps) {
  const outerSize = `${size}px`;
  const innerSize = `${Math.max(18, Math.round(size * 0.6))}px`;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: outerSize, height: outerSize }}
    >
      <motion.span
        aria-hidden="true"
        animate={{ scale: [1, 1.03, 1], opacity: [0.82, 1, 0.82] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute inset-0 rounded-full border border-white/12",
          pulseVariants[pulseStyle]
        )}
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.6), ${color} 28%, rgba(255,255,255,0.04) 72%)`,
          backdropFilter: "blur(16px)",
        }}
      />
      <motion.span
        aria-hidden="true"
        animate={{ scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full border border-white/20"
        style={{
          width: innerSize,
          height: innerSize,
          background:
            "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.85), rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.02) 78%)",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full bg-white/20 blur-[10px]"
      />
    </div>
  );
}

export default EmbodimentOrb;
