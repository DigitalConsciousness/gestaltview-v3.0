/**
 * OrientationSlideshowPage.tsx  (v4 — Restored + Break The Glass Protocol link)
 * GestaltView — Automated System Orientation
 * © 2026 Keith Soyka / GestaltView — All Rights Reserved
 *
 * FIX: The previous version had TWO <video> elements pointing to the same src:
 *   1. A hidden one (preload="metadata" for duration preview on start screen)
 *   2. A visible one (autoPlay) rendered when hasStarted=true
 * Both played simultaneously → doubled audio track.
 *
 * Solution: ONE <video ref={videoRef}> always in the DOM.
 * Visibility toggled via CSS opacity/pointerEvents based on hasStarted.
 * Play triggered via useEffect. Duration preview still works via preload="metadata".
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import {
  BILLY_RUNTIME_EXPLANATION,
  BILLY_RUNTIME_ONE_SENTENCE,
  BILLY_RUNTIME_PARAGRAPH,
  BILLY_WORKFLOW_SPINE,
} from "@/lib/billy-runtime-guide";

const VIDEO_SRC = "/video/GestaltView_Orientation.mp4";
const BREAK_THE_GLASS_URL = "https://youtu.be/a-FbYl7yTsY?si=0KNrV8grIykch5mk";

export default function OrientationSlideshowPage() {
  useSEO(PAGE_SEO.orientation);

  const [hasStarted, setHasStarted]     = useState(false);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // ── Wire ALL events to the single video element ───────────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime  = () => setCurrentTime(v.currentTime);
    const onMeta  = () => setDuration(v.duration);
    const onEnded = () => { setIsPlaying(false); setHasStarted(false); };
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFSChg = () => setIsFullscreen(!!document.fullscreenElement);

    v.addEventListener("timeupdate",      onTime);
    v.addEventListener("loadedmetadata",  onMeta);
    v.addEventListener("ended",           onEnded);
    v.addEventListener("play",            onPlay);
    v.addEventListener("pause",           onPause);
    document.addEventListener("fullscreenchange", onFSChg);

    return () => {
      v.removeEventListener("timeupdate",     onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended",          onEnded);
      v.removeEventListener("play",           onPlay);
      v.removeEventListener("pause",          onPause);
      document.removeEventListener("fullscreenchange", onFSChg);
    };
  }, []);

  // ── Stop + reset when navigating away ────────────────────────────────────
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) { v.pause(); v.currentTime = 0; }
    };
  }, []);

  // ── Play / pause driven by hasStarted state ───────────────────────────────
  useEffect(() => {
    if (hasStarted) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [hasStarted]);

  const handleStart = useCallback(() => setHasStarted(true), []);

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = Math.max(0, Math.min(ratio * duration, duration));
  }, [duration]);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050505",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top nav */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 30, display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => setLocation("/")}
          style={{
            background: "rgba(5,10,14,0.86)", border: "1px solid rgba(0,212,255,0.4)",
            color: "#00D4FF", padding: "0.4rem 0.75rem", borderRadius: "0.35rem",
            fontFamily: "monospace", letterSpacing: "0.12em", fontSize: "0.65rem",
            cursor: "pointer", textTransform: "uppercase",
          }}
        >Home</button>
        <button
          onClick={() => setLocation("/billy")}
          style={{
            background: "rgba(5,10,14,0.86)", border: "1px solid rgba(0,212,255,0.4)",
            color: "#00D4FF", padding: "0.4rem 0.75rem", borderRadius: "0.35rem",
            fontFamily: "monospace", letterSpacing: "0.12em", fontSize: "0.65rem",
            cursor: "pointer", textTransform: "uppercase",
          }}
        >Billy</button>
      </div>

      {/*
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        THE ONE AND ONLY <video> ELEMENT.
        Always in the DOM. Never unmounted. Never duplicated.
        Visibility: opacity 0 (hidden) until hasStarted, then opacity 1.
        preload="metadata" loads the duration for the start screen.
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        preload="metadata"
        playsInline
        onClick={hasStarted ? handleTogglePlay : undefined}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
          cursor: hasStarted ? "pointer" : "default",
          opacity: hasStarted ? 1 : 0,
          pointerEvents: hasStarted ? "auto" : "none",
          transition: "opacity 0.5s ease",
          zIndex: 5,
        }}
      />

      {/* Neural Aurora glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(circle at center, rgba(0,212,255,0.055) 0%, transparent 70%)",
      }} />

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.008) 2px, rgba(0,212,255,0.008) 4px)",
      }} />

      <AnimatePresence mode="wait">
        {/* ─── Start Screen ─── */}
        {!hasStarted && (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.5 }}
            style={{ zIndex: 10, textAlign: "center", padding: "0 2rem", maxWidth: 600 }}
          >
            <div style={{
              fontSize: "0.6rem", letterSpacing: "0.35em",
              color: "rgba(0,212,255,0.65)", marginBottom: "1.5rem", fontFamily: "monospace",
            }}>
              GESTALTVIEW · CONSCIOUSNESS-SERVING INFRASTRUCTURE · PLK v5.0
            </div>

            <h1 style={{
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)", fontWeight: 800,
              marginBottom: "1.25rem", letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #fff 0%, #00D4FF 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1,
            }}>
              GESTALTVIEW<br />ORIENTATION
            </h1>

            <p style={{
              fontSize: "1.05rem", opacity: 0.82, marginBottom: "1.8rem",
              lineHeight: 1.7, maxWidth: "42rem",
            }}>
              {BILLY_RUNTIME_ONE_SENTENCE} {BILLY_RUNTIME_PARAGRAPH}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginBottom: "2rem",
              textAlign: "left",
            }}>
              {BILLY_RUNTIME_EXPLANATION.map(({ title, copy }) => (
                <div key={title} style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "0.85rem",
                  padding: "0.85rem 0.9rem",
                }}>
                  <div style={{
                    color: "rgba(0,212,255,0.75)",
                    fontFamily: "monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    marginBottom: "0.45rem",
                  }}>
                    {title}
                  </div>
                  <div style={{ color: "rgba(226,232,240,0.86)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                    {copy}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem",
              padding: "0.55rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.78)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              <span style={{ color: "rgba(0,212,255,0.8)", fontFamily: "monospace" }}>
                Workflow
              </span>
              <span>{BILLY_WORKFLOW_SPINE.join(" -> ")}</span>
            </div>

            {duration > 0 && (
              <div style={{
                fontSize: "0.65rem", color: "rgba(0,212,255,0.45)",
                fontFamily: "monospace", letterSpacing: "0.2em", marginBottom: "2rem",
              }}>
                RUNTIME: {fmt(duration)}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleStart}
                style={{
                  background: "rgba(0,212,255,0.1)", color: "#00D4FF",
                  border: "1px solid rgba(0,212,255,0.45)", borderRadius: "0.4rem",
                  padding: "0.85rem 2.5rem", fontSize: "0.9rem", fontWeight: 700,
                  cursor: "pointer", letterSpacing: "0.15em", fontFamily: "monospace",
                  boxShadow: "0 0 20px rgba(0,212,255,0.12)", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.18)";
                  e.currentTarget.style.boxShadow  = "0 0 30px rgba(0,212,255,0.28)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.1)";
                  e.currentTarget.style.boxShadow  = "0 0 20px rgba(0,212,255,0.12)";
                }}
              >
                ▶ START ORIENTATION
              </button>
              <button
                onClick={() => setLocation("/")}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.45)", borderRadius: "0.4rem",
                  padding: "0.85rem 2rem", fontSize: "0.8rem",
                  cursor: "pointer", letterSpacing: "0.1em", fontFamily: "monospace",
                }}
              >
                SKIP / EXIT
              </button>
            </div>

            {/* ─── Break The Glass Protocol ─── */}
            <div style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.5rem" }}>
              <div style={{
                fontSize: "0.55rem", letterSpacing: "0.3em",
                color: "rgba(255,80,80,0.55)", fontFamily: "monospace",
                textTransform: "uppercase", marginBottom: "0.6rem",
              }}>
                ⚠ Break The Glass Protocol
              </div>
              <a
                href={BREAK_THE_GLASS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "rgba(255,60,60,0.07)",
                  border: "1px solid rgba(255,80,80,0.35)",
                  color: "rgba(255,120,120,0.85)",
                  borderRadius: "0.35rem",
                  padding: "0.5rem 1.2rem",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,60,60,0.14)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,80,80,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,60,60,0.07)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,80,80,0.35)";
                }}
              >
                <span>▶</span>
                <span>WATCH ON YOUTUBE</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* ─── Controls Overlay ─── */}
        {hasStarted && (
          <motion.div
            key="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "3rem 2rem 1.5rem",
              background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
              zIndex: 20,
            }}
          >
            {/* Progress bar */}
            <div
              onClick={handleSeek}
              title="Seek"
              style={{
                width: "100%", height: "3px", background: "rgba(255,255,255,0.1)",
                cursor: "pointer", marginBottom: "1rem", position: "relative", borderRadius: 2,
              }}
            >
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                background: "#00D4FF", width: `${progress}%`, borderRadius: 2,
                boxShadow: "0 0 8px rgba(0,212,255,0.6)", transition: "width 0.25s linear",
              }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <button
                  onClick={() => setHasStarted(false)}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.55)", padding: "0.4rem 0.9rem",
                    borderRadius: "0.3rem", fontSize: "0.7rem",
                    cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.1em",
                  }}
                >EXIT</button>

                <button
                  onClick={handleTogglePlay}
                  style={{
                    background: "transparent", border: "none", color: "#00D4FF",
                    fontSize: "1.5rem", cursor: "pointer", lineHeight: 1,
                    filter: "drop-shadow(0 0 6px rgba(0,212,255,0.5))",
                  }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                <span style={{
                  fontSize: "0.72rem", color: "rgba(255,255,255,0.4)",
                  fontFamily: "monospace", letterSpacing: "0.05em",
                }}>
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{
                  fontSize: "0.55rem", letterSpacing: "0.28em",
                  color: "rgba(0,212,255,0.45)", fontFamily: "monospace", textTransform: "uppercase",
                }}>
                  GESTALTVIEW ORIENTATION
                </span>
                <button
                  onClick={handleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.5)", padding: "0.35rem 0.55rem",
                    borderRadius: "0.3rem", fontSize: "0.8rem",
                    cursor: "pointer", fontFamily: "monospace",
                  }}
                >
                  {isFullscreen ? "⊡" : "⛶"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        video::-webkit-media-controls,
        video::-webkit-media-controls-enclosure { display: none !important; }
      `}</style>
    </div>
  );
}
