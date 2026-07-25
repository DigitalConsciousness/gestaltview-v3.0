"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?:
    | "cyan" | "teal" | "emerald" | "electricPurple" | "neonPink"
    | "neonRed" | "midnightBlue" | "blue" | "gold" | "purple" | "none";
  intensity?: "low" | "medium" | "high";
  hover?: boolean;
  dynamic?: boolean; // Toggles the liquid breathing background
  surfaceRole?: "ambient" | "active" | "artifact" | "critical";
}

// Upgraded to pure, saturated neons with multi-layered (inner + outer) glows
const glowColors = {
  cyan: "border-[#00E5FF]/50 shadow-[0_0_25px_rgba(0,229,255,0.25),_inset_0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5),_inset_0_0_30px_rgba(0,229,255,0.3)] hover:border-[#00E5FF]/90",
  teal: "border-[#00FFD4]/50 shadow-[0_0_25px_rgba(0,255,212,0.25),_inset_0_0_20px_rgba(0,255,212,0.15)] hover:shadow-[0_0_50px_rgba(0,255,212,0.5),_inset_0_0_30px_rgba(0,255,212,0.3)] hover:border-[#00FFD4]/90",
  emerald: "border-[#00FF66]/50 shadow-[0_0_25px_rgba(0,255,102,0.25),_inset_0_0_20px_rgba(0,255,102,0.15)] hover:shadow-[0_0_50px_rgba(0,255,102,0.5),_inset_0_0_30px_rgba(0,255,102,0.3)] hover:border-[#00FF66]/90",
  electricPurple: "border-[#B026FF]/50 shadow-[0_0_25px_rgba(176,38,255,0.25),_inset_0_0_20px_rgba(176,38,255,0.15)] hover:shadow-[0_0_50px_rgba(176,38,255,0.5),_inset_0_0_30px_rgba(176,38,255,0.3)] hover:border-[#B026FF]/90",
  neonPink: "border-[#FF007F]/50 shadow-[0_0_25px_rgba(255,0,127,0.25),_inset_0_0_20px_rgba(255,0,127,0.15)] hover:shadow-[0_0_50px_rgba(255,0,127,0.5),_inset_0_0_30px_rgba(255,0,127,0.3)] hover:border-[#FF007F]/90",
  neonRed: "border-[#FF2D55]/50 shadow-[0_0_25px_rgba(255,45,85,0.25),_inset_0_0_20px_rgba(255,45,85,0.15)] hover:shadow-[0_0_50px_rgba(255,45,85,0.5),_inset_0_0_30px_rgba(255,45,85,0.3)] hover:border-[#FF2D55]/90",
  midnightBlue: "border-[#4169E1]/50 shadow-[0_0_25px_rgba(65,105,225,0.25),_inset_0_0_20px_rgba(65,105,225,0.15)] hover:shadow-[0_0_50px_rgba(65,105,225,0.5),_inset_0_0_30px_rgba(65,105,225,0.3)] hover:border-[#4169E1]/90",
  blue: "border-[#0088FF]/50 shadow-[0_0_25px_rgba(0,136,255,0.25),_inset_0_0_20px_rgba(0,136,255,0.15)] hover:shadow-[0_0_50px_rgba(0,136,255,0.5),_inset_0_0_30px_rgba(0,136,255,0.3)] hover:border-[#0088FF]/90",
  gold: "border-[#FFD700]/50 shadow-[0_0_25px_rgba(255,215,0,0.25),_inset_0_0_20px_rgba(255,215,0,0.15)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5),_inset_0_0_30px_rgba(255,215,0,0.3)] hover:border-[#FFD700]/90",
  purple: "border-[#9945FF]/50 shadow-[0_0_25px_rgba(153,69,255,0.25),_inset_0_0_20px_rgba(153,69,255,0.15)] hover:shadow-[0_0_50px_rgba(153,69,255,0.5),_inset_0_0_30px_rgba(153,69,255,0.3)] hover:border-[#9945FF]/90",
  none: "border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/20",
};

// Deep contrast bases instead of pale white/5 washes
const intensityMap = {
  low: "bg-[#05070A]/70 backdrop-blur-md",
  medium: "bg-[#070A0F]/80 backdrop-blur-xl",
  high: "bg-[#0A0D14]/90 backdrop-blur-2xl",
};

const surfaceRoleMap = {
  ambient: "operation-render-surface",
  active: "operation-render-surface-active",
  artifact: "operation-render-surface-artifact",
  critical: "operation-render-surface-critical",
};

export function GlassCard({
  children,
  glow = "cyan",
  intensity = "medium",
  hover = true,
  dynamic = true,
  surfaceRole = "ambient",
  className,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-500 ease-out operation-render-focus",
        intensityMap[intensity],
        surfaceRoleMap[surfaceRole],
        glowColors[glow],
        hover && "hover:-translate-y-1 hover:scale-[1.015] cursor-pointer",
        className
      )}
      style={{
        // The sharp top edge that gives it the "metal" physical feel
        boxShadow: hover ? undefined : "inset 0 1px 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)"
      }}
      {...props}
    >
      {/* Dynamic Liquid Breathing Background */}
      {dynamic && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-30 mix-blend-color-dodge"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(0,229,255,0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(176,38,255,0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, rgba(0,229,255,0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Interactive Liquid Spotlight on Hover */}
      {hover && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-screen"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
      )}

      {/* Content wrapper to stay above liquid effects */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}

export default GlassCard;
