"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Code, Sparkles } from "lucide-react";

export const LoadingSpinner: React.FC = () => {
  const lowBandwidthMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("gv-low-bandwidth");

  if (lowBandwidthMode) {
    return (
      <div className="operation-render-shell fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/92 backdrop-blur-md">
        <div className="operation-render-surface-active rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-8 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00E5FF]">Loading</p>
          <p className="mt-2 text-lg font-semibold text-white">Opening a lighter surface</p>
          <p className="mt-1 text-sm text-white/55">Degraded mode is active, so heavy motion stays off.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="operation-render-shell fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex flex-col items-center justify-center p-12"
        >
          {/* Liquid Neon Halo Background */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 z-0 rounded-full bg-gradient-to-tr from-[#00E5FF]/20 via-[#B026FF]/20 to-[#FF007F]/20 blur-3xl"
          />

          {/* The Metal/Glass Core */}
          <div className="operation-render-surface-active relative z-10 flex flex-col items-center justify-center rounded-[2rem] p-8">
            <div className="mb-6 flex items-center justify-center gap-6">
              <motion.div
                animate={{ rotate: 360, y: [0, -5, 0] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                className="rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 p-3 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                <Brain className="h-7 w-7 text-[#00E5FF]" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360, y: [0, 5, 0] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
                className="rounded-full border border-[#B026FF]/30 bg-[#B026FF]/10 p-3 shadow-[0_0_20px_rgba(176,38,255,0.3)]"
              >
                <Code className="h-7 w-7 text-[#B026FF]" />
              </motion.div>

              <motion.div
                animate={{ rotate: 360, y: [0, -5, 0] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
                className="rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 p-3 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                <Sparkles className="h-7 w-7 text-[#FFD700]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h3 className="bg-gradient-to-r from-[#00E5FF] via-[#B026FF] to-[#FF007F] bg-clip-text text-xl font-bold tracking-wide text-transparent drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                Synthesizing
              </h3>
              <p className="mt-2 text-sm text-slate-400">Your AI symbiote is thinking</p>
            </motion.div>

            {/* Neon Pulse Tracker */}
            <div className="mt-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="h-1.5 w-8 rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.6)]"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
