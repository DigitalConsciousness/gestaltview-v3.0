// BillyAvatar.tsx — GestaltView · SymbioCoder
// Static Billy — Layer 1 of 3 (Static → Looped → Real-time)
// Vault-Tec warmth · Jiminy Cricket function · Don't Panic tone
// Pure SVG + TSX — zero external assets, zero blocking dependencies
// Keith Soyka © GestaltView All Rights Reserved

"use client";

import React from "react";
import { motion } from "framer-motion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  teal:     "#00D4FF",
  tealDim:  "#006B7F",
  tealGlow: "rgba(0,212,255,0.35)",
  cyan:     "#00FFFF",
  black:    "#000000",
  dark:     "#0A0F14",
};

// ─── Size variants ────────────────────────────────────────────────────────────
type BillySize = "sm" | "md" | "lg" | "xl";
const SIZE: Record<BillySize, number> = { sm: 48, md: 80, lg: 120, xl: 180 };

interface BillyAvatarProps {
  size?: BillySize;
  /** Override px width/height directly */
  px?: number;
  /** Show the gentle float animation (CSS only, no Framer dep needed) */
  animate?: boolean;
  /** Show teal glow halo behind Billy */
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BillyAvatar: React.FC<BillyAvatarProps> = ({
  size = "md",
  px,
  animate = true,
  glow = true,
  className = "",
  style = {},
}) => {
  const dim = px ?? SIZE[size];

  // The SVG is drawn on a 100×100 viewBox so it scales cleanly
  return (
    <motion.div
      className={className}
      style={{ display: "inline-block", position: "relative", ...style }}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* Glow halo */}
      {glow && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -dim * 0.25,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${T.tealGlow} 0%, transparent 70%)`,
            filter: `blur(${dim * 0.18}px)`,
            pointerEvents: "none",
          }}
        />
      )}

      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Billy — GestaltView manifest presence"
        role="img"
      >
        {/* ── Defs ── */}
        <defs>
          {/* Body gradient — slight teal center */}
          <radialGradient id="bodyGrad" cx="50%" cy="45%" r="50%">
            <stop offset="0%"  stopColor="#0D1F2D" />
            <stop offset="100%" stopColor={T.dark}  />
          </radialGradient>
          {/* Visor gradient */}
          <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.cyan}  stopOpacity="0.9" />
            <stop offset="100%" stopColor={T.teal} stopOpacity="0.5" />
          </linearGradient>
          {/* Eye glow filter */}
          <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Outer ring glow */}
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Outer ring — Tron grid circle ── */}
        <circle
          cx="50" cy="50" r="46"
          stroke={T.tealDim} strokeWidth="0.6"
          fill="none"
          filter="url(#ringGlow)"
          opacity="0.5"
        />
        {/* Tick marks on outer ring */}
        {[0,45,90,135,180,225,270,315].map((deg) => {
          const r = Math.PI * deg / 180;
          const x1 = 50 + 44 * Math.cos(r);
          const y1 = 50 + 44 * Math.sin(r);
          const x2 = 50 + 47 * Math.cos(r);
          const y2 = 50 + 47 * Math.sin(r);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={T.teal} strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* ── Body / helmet ── */}
        <circle cx="50" cy="50" r="38" fill="url(#bodyGrad)" />
        {/* Helmet outline */}
        <circle
          cx="50" cy="50" r="38"
          stroke={T.teal} strokeWidth="1.2"
          fill="none"
          filter="url(#ringGlow)"
        />

        {/* ── Visor band ── */}
        <rect
          x="18" y="34" width="64" height="20"
          rx="10"
          fill="url(#visorGrad)"
          opacity="0.18"
        />
        {/* Visor border */}
        <rect
          x="18" y="34" width="64" height="20"
          rx="10"
          stroke={T.teal} strokeWidth="0.8"
          fill="none"
          opacity="0.6"
        />

        {/* ── Eyes ── */}
        {/* Left eye */}
        <circle cx="35" cy="44" r="5.5" fill={T.dark} />
        <circle cx="35" cy="44" r="5.5" stroke={T.teal} strokeWidth="0.8" fill="none" />
        <circle cx="35" cy="44" r="3" fill={T.teal} filter="url(#eyeGlow)" />
        <circle cx="35" cy="44" r="1.2" fill={T.cyan} />
        {/* Eye highlight */}
        <circle cx="36.5" cy="42.5" r="0.8" fill="white" opacity="0.7" />

        {/* Right eye */}
        <circle cx="65" cy="44" r="5.5" fill={T.dark} />
        <circle cx="65" cy="44" r="5.5" stroke={T.teal} strokeWidth="0.8" fill="none" />
        <circle cx="65" cy="44" r="3" fill={T.teal} filter="url(#eyeGlow)" />
        <circle cx="65" cy="44" r="1.2" fill={T.cyan} />
        <circle cx="66.5" cy="42.5" r="0.8" fill="white" opacity="0.7" />

        {/* ── Mouth — subtle upward curve, friendly ── */}
        <path
          d="M 39 58 Q 50 65 61 58"
          stroke={T.teal} strokeWidth="1.5"
          fill="none" strokeLinecap="round"
          opacity="0.8"
        />

        {/* ── Chin detail — circuit line ── */}
        <line x1="44" y1="72" x2="56" y2="72"
          stroke={T.tealDim} strokeWidth="0.7" opacity="0.6" />
        <circle cx="44" cy="72" r="1" fill={T.tealDim} opacity="0.6" />
        <circle cx="56" cy="72" r="1" fill={T.tealDim} opacity="0.6" />

        {/* ── Crown detail — antenna nub ── */}
        <line x1="50" y1="12" x2="50" y2="18"
          stroke={T.teal} strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#eyeGlow)"
          opacity="0.7"
        />
        <circle cx="50" cy="11" r="2" fill={T.teal} filter="url(#eyeGlow)" opacity="0.9" />

        {/* ── Side circuit nodes ── */}
        <circle cx="14" cy="50" r="1.5" fill={T.tealDim} opacity="0.5" />
        <line x1="14" y1="50" x2="19" y2="50"
          stroke={T.tealDim} strokeWidth="0.7" opacity="0.4" />
        <circle cx="86" cy="50" r="1.5" fill={T.tealDim} opacity="0.5" />
        <line x1="81" y1="50" x2="86" y2="50"
          stroke={T.tealDim} strokeWidth="0.7" opacity="0.4" />
      </svg>
    </motion.div>
  );
};

export default BillyAvatar;

// ─── Billy Chip — Billy + name + tagline ──────────────────────────────────────
// Drop this anywhere: sidebar, hero, chat header, onboarding
interface BillyChipProps {
  size?: BillySize;
  showTagline?: boolean;
  orientation?: "horizontal" | "vertical";
}

export const BillyChip: React.FC<BillyChipProps> = ({
  size = "sm",
  showTagline = true,
  orientation = "horizontal",
}) => (
  <div
    style={{
      display: "inline-flex",
      flexDirection: orientation === "vertical" ? "column" : "row",
      alignItems: "center",
      gap: 10,
    }}
  >
    <BillyAvatar size={size} glow={false} />
    <div>
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontWeight: 700,
          fontSize: SIZE[size] * 0.22,
          color: T.teal,
          letterSpacing: "0.1em",
          lineHeight: 1.1,
        }}
      >
        BILLY
      </div>
      {showTagline && (
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: SIZE[size] * 0.14,
            color: T.tealDim,
            letterSpacing: "0.05em",
            marginTop: 2,
          }}
        >
          GestaltView · Billy
        </div>
      )}
    </div>
  </div>
);
