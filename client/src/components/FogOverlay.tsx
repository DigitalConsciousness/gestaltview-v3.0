"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FogOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden mix-blend-color-dodge opacity-60"
      aria-hidden="true"
    >
      {/* Layer 1: Slow sweeping deep cyan and purple */}
      <motion.div
        animate={{ 
          x: ["-10%", "-40%", "-10%"], 
          y: ["0%", "5%", "0%"],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-[50%] h-[200%] w-[200%]"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, rgba(0,229,255,0.15), transparent 40%),
            radial-gradient(circle at 70% 60%, rgba(176,38,255,0.15), transparent 40%)
          `,
          filter: "blur(60px)",
        }}
      />

      {/* Layer 2: Counter-rotating pink and emerald highlights */}
      <motion.div
        animate={{ 
          x: ["-30%", "0%", "-30%"], 
          y: ["-5%", "5%", "-5%"],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-[50%] h-[200%] w-[200%]"
        style={{
          background: `
            radial-gradient(circle at 60% 30%, rgba(255,0,127,0.12), transparent 35%),
            radial-gradient(circle at 40% 70%, rgba(0,255,102,0.08), transparent 35%)
          `,
          filter: "blur(80px)",
        }}
      />
      
      {/* Vignette to keep the edges dark and focus the center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030509_100%)] opacity-80" />
    </div>
  );
}
