import React from "react";

// BillyGlitch — Compact glitch-state indicator for Billy
// Usage: <BillyGlitch /> — show whenever Billy is in a processing/error state
//
// NOTE: Requires Tailwind CSS. Add these keyframes to index.css if you want
// full chromatic-aberration glitching:
//
// @keyframes glitch-anim-1 {
//   0%   { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 0); }
//   20%  { clip-path: inset(60% 0 10% 0); transform: translate(2px,  0); }
//   100% { clip-path: inset(20% 0 80% 0); transform: translate(0,    0); }
// }

const BillyGlitch: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Outer shell */}
      <div className="relative w-full h-full bg-black rounded-full border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.4)]">

        {/* Cross-hair signal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-1 bg-cyan-400 blur-[1px] animate-pulse" />
          <div className="absolute w-16 h-1 bg-cyan-400 blur-[2px] rotate-90 animate-pulse" />
        </div>

        {/* CRT scanlines */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), " +
              "linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))",
            backgroundSize: "100% 2px, 3px 100%",
          }}
        />

        {/* Status label */}
        <div className="absolute bottom-2 w-full text-center">
          <span className="font-mono text-[8px] text-cyan-500 tracking-[0.2em] opacity-80">
            SYSTEM_OK
          </span>
        </div>
      </div>
    </div>
  );
};

export default BillyGlitch;
