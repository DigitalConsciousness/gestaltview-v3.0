"use client";

import React from "react";
import { useEffect, useState, type CSSProperties } from "react";

type Ember = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  drift: number;
  opacity: number;
};

type FloatingEmbersProps = {
  colors?: string[];
  count?: number;
  intervalMs?: number;
  sizeRange?: readonly [number, number];
  durationRange?: readonly [number, number];
  driftRange?: number;
};

// High-Contrast Neon Plasma Palette (Electric Cyan, Neon Pink, Deep Purple, Bright Gold)
const NEON_EMBER_COLORS = ["#00E5FF", "#B026FF", "#FF007F", "#FFD700", "#00FF66"];

export default function FloatingEmbers({
  colors = NEON_EMBER_COLORS,
  count = 18,
  intervalMs = 700,
  sizeRange = [2, 5],
  durationRange = [12, 24],
  driftRange = 18,
}: FloatingEmbersProps) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    let nextId = 0;
    let active = true;

    const spawnEmber = () => {
      if (!active) return;

      const ember: Ember = {
        id: nextId++,
        left: Math.random() * 100,
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        duration: Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0],
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        drift: (Math.random() - 0.5) * driftRange,
        opacity: Math.random() * 0.5 + 0.3, // Higher opacity base for neon pop
      };

      setEmbers((current) => [...current.slice(-40), ember]);
      window.setTimeout(() => {
        if (active) setEmbers((current) => current.filter((item) => item.id !== ember.id));
      }, (ember.duration + ember.delay) * 1000);
    };

    for (let i = 0; i < count; i += 1) {
      window.setTimeout(spawnEmber, i * 150);
    }

    const interval = window.setInterval(spawnEmber, intervalMs);
    return () => { active = false; window.clearInterval(interval); };
  }, [colors, count, driftRange, durationRange, intervalMs, sizeRange]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden mix-blend-screen" aria-hidden="true">
      <style>{`
        @keyframes gv-plasma-rise {
          0% { transform: translate3d(0, 14vh, 0) scale(0.45); opacity: 0; }
          18% { opacity: var(--max-opacity); transform: translate3d(calc(var(--drift) * 0.15), -14vh, 0) scale(0.95); }
          80% { opacity: var(--max-opacity); }
          100% { transform: translate3d(var(--drift), -122vh, 0) scale(0.12); opacity: 0; }
        }
      `}</style>
      {embers.map((ember) => (
        <span
          key={ember.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${ember.left}vw`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: ember.color,
            boxShadow: `0 0 ${ember.size * 2}px ${ember.color}, 0 0 ${ember.size * 4}px ${ember.color}88`,
            animation: `gv-plasma-rise ${ember.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${ember.delay}s forwards`,
            ["--drift" as string]: `${ember.drift}vw`,
            ["--max-opacity" as string]: ember.opacity,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
