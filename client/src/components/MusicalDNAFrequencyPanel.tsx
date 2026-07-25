/**
 * MusicalDNAFrequencyPanel.tsx
 * GestaltView — Musical DNA Engine — Frequencies & Custom Settings Panel
 * © 2026 Keith Soyka / GestaltView — All Rights Reserved
 *
 * Exposes:
 *   - All binaural beat presets (Delta → Gamma) with live frequency display
 *   - Custom beat frequency slider (0.5–50 Hz)
 *   - Custom carrier frequency slider (80–440 Hz)
 *   - Binaural volume control
 *   - Isochronic tone toggle (rhythmic pulse alternative to binaural)
 *   - Spatial panning width control
 *   - Master music volume
 *   - EQ band sliders (Bass, Mid, Treble)
 *   - Session timer
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BINAURAL_PRESETS, type BinauralPreset, type BinauralBeatsControls } from "../hooks/useBinauralBeats";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EQBand {
  label: string;
  freq: number;
  gain: number;
  type: BiquadFilterType;
}

interface CustomSettings {
  beatFreq: number;       // 0.5–50 Hz
  carrierFreq: number;    // 80–440 Hz
  binauralVolume: number; // 0–1
  musicVolume: number;    // 0–1
  spatialWidth: number;   // 0–1 (panning LFO depth)
  isochronic: boolean;    // use isochronic tones instead of binaural
  eq: EQBand[];
}

interface MusicalDNAFrequencyPanelProps {
  binaural: BinauralBeatsControls;
  audioCtxRef: React.RefObject<AudioContext | null>;
  gainRef?: React.RefObject<GainNode | null>;
  isPlaying: boolean;
  activeSongBpm: number;
  activeSongKey: string;
  /**
   * Called whenever the EQ filter chain is (re)built so MusicalDNAPage
   * can pass it to FrequencyTherapySection for signal-chain insertion.
   */
  onEQFiltersReady?: (filters: BiquadFilterNode[]) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_EQ: EQBand[] = [
  { label: "Sub Bass",  freq: 60,   gain: 0, type: "lowshelf"  },
  { label: "Bass",      freq: 200,  gain: 0, type: "peaking"   },
  { label: "Low Mid",   freq: 800,  gain: 0, type: "peaking"   },
  { label: "High Mid",  freq: 3000, gain: 0, type: "peaking"   },
  { label: "Presence",  freq: 6000, gain: 0, type: "peaking"   },
  { label: "Air",       freq: 12000,gain: 0, type: "highshelf" },
];

const BRAINWAVE_BANDS = [
  { name: "Delta",  range: "0.5–4 Hz",  color: "#b81afa", desc: "Deep sleep · Trauma integration" },
  { name: "Theta",  range: "4–8 Hz",    color: "#0dd9e6", desc: "Meditation · Emotional processing" },
  { name: "Alpha",  range: "8–14 Hz",   color: "#22ee8d", desc: "Relaxed focus · Flow onset" },
  { name: "Beta",   range: "14–30 Hz",  color: "#f59e0b", desc: "Active thinking · Concentration" },
  { name: "Gamma",  range: "30–50 Hz",  color: "#ff6b6b", desc: "Peak cognition · Insight" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function MusicalDNAFrequencyPanel({
  binaural,
  audioCtxRef,
  gainRef,
  isPlaying,
  activeSongBpm,
  activeSongKey,
  onEQFiltersReady,
}: MusicalDNAFrequencyPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "eq" | "session">("presets");
  const [settings, setSettings] = useState<CustomSettings>({
    beatFreq: 10,
    carrierFreq: 200,
    binauralVolume: 0.08,
    musicVolume: 0.85,
    spatialWidth: 1.0,
    isochronic: false,
    eq: DEFAULT_EQ.map((b) => ({ ...b })),
  });
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const isochronicRef = useRef<OscillatorNode | null>(null);
  const isoGainRef = useRef<GainNode | null>(null);

  // Session timer
  useEffect(() => {
    if (isPlaying) {
      sessionTimerRef.current = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Custom binaural oscillator refs — managed independently of the preset hook
  const customLeftOscRef  = useRef<OscillatorNode | null>(null);
  const customRightOscRef = useRef<OscillatorNode | null>(null);
  const customMergerRef   = useRef<ChannelMergerNode | null>(null);
  const customGainRef     = useRef<GainNode | null>(null);
  const [customActive, setCustomActive] = useState(false);

  const _tearDownCustom = useCallback(() => {
    try { customLeftOscRef.current?.stop(); }  catch {}
    try { customRightOscRef.current?.stop(); } catch {}
    customLeftOscRef.current?.disconnect();
    customRightOscRef.current?.disconnect();
    customMergerRef.current?.disconnect();
    customGainRef.current?.disconnect();
    customLeftOscRef.current  = null;
    customRightOscRef.current = null;
    customMergerRef.current   = null;
    customGainRef.current     = null;
  }, []);

  // Apply custom binaural settings — builds real oscillators at the exact Hz values
  const applyCustomBinaural = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Stop any preset-based binaural and tear down previous custom graph
    binaural.stop();
    _tearDownCustom();

    const halfBeat = settings.beatFreq / 2;
    const leftFreq  = settings.carrierFreq - halfBeat;
    const rightFreq = settings.carrierFreq + halfBeat;

    const leftOsc  = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    leftOsc.type  = "sine";
    rightOsc.type = "sine";
    leftOsc.frequency.value  = leftFreq;
    rightOsc.frequency.value = rightFreq;

    const merger = ctx.createChannelMerger(2);
    const gain   = ctx.createGain();
    gain.gain.value = 0;

    leftOsc.connect(merger, 0, 0);
    rightOsc.connect(merger, 0, 1);
    merger.connect(gain);
    gain.connect(ctx.destination);

    leftOsc.start(ctx.currentTime);
    rightOsc.start(ctx.currentTime);

    // Fade in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, settings.binauralVolume)),
      ctx.currentTime + 2.5
    );

    customLeftOscRef.current  = leftOsc;
    customRightOscRef.current = rightOsc;
    customMergerRef.current   = merger;
    customGainRef.current     = gain;
    setCustomActive(true);
  }, [binaural, audioCtxRef, settings, _tearDownCustom]);

  // Cleanup custom oscillators on unmount
  useEffect(() => {
    return () => { _tearDownCustom(); };
  }, [_tearDownCustom]);

  // Apply EQ to audio context
  const applyEQ = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // Tear down old filters
    eqFiltersRef.current.forEach((f) => { try { f.disconnect(); } catch {} });
    eqFiltersRef.current = [];
    // Create new filters
    const filters = settings.eq.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.freq;
      filter.gain.value = band.gain;
      return filter;
    });
    // Chain filters internally
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }
    eqFiltersRef.current = filters;
    // Notify parent so FrequencyTherapySection can insert the EQ chain
    onEQFiltersReady?.(filters);
  }, [audioCtxRef, settings.eq, onEQFiltersReady]);

  // Update music volume
  const handleMusicVolume = useCallback((vol: number) => {
    setSettings((s) => ({ ...s, musicVolume: vol }));
    if (gainRef?.current) {
      gainRef.current.gain.value = vol;
    }
  }, [gainRef]);

  // Update binaural volume
  const handleBinauralVolume = useCallback((vol: number) => {
    setSettings((s) => ({ ...s, binauralVolume: vol }));
    binaural.setVolume(vol);
  }, [binaural]);

  // Update EQ band
  const handleEQChange = useCallback((index: number, gain: number) => {
    setSettings((s) => {
      const eq = s.eq.map((b, i) => i === index ? { ...b, gain } : b);
      // Apply to live filter if exists
      if (eqFiltersRef.current[index]) {
        eqFiltersRef.current[index].gain.value = gain;
      }
      return { ...s, eq };
    });
  }, []);

  const resetEQ = useCallback(() => {
    setSettings((s) => ({ ...s, eq: DEFAULT_EQ.map((b) => ({ ...b })) }));
    eqFiltersRef.current.forEach((f) => { f.gain.value = 0; });
  }, []);

  const resetSession = useCallback(() => setSessionSeconds(0), []);

  const color = "#22ee8d";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 50,
        fontFamily: "monospace",
      }}
    >
      {/* Toggle pill */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          background: "rgba(4,20,12,0.88)",
          border: `1px solid ${color}44`,
          borderRadius: "2rem",
          padding: "0.5rem 1rem",
          color,
          fontSize: "0.72rem",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ fontSize: "0.8rem" }}>〰</span>
        <span>Frequencies & Settings</span>
        <span style={{ opacity: 0.6 }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22 }}
            style={{
              marginBottom: "0.5rem",
              background: "rgba(4,20,12,0.95)",
              border: `1px solid ${color}33`,
              borderRadius: "1rem",
              padding: "1rem",
              backdropFilter: "blur(20px)",
              width: "320px",
              color: "#c8ffd4",
              fontSize: "0.75rem",
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginTop: "0.5rem",
            }}
          >
            {/* Song context */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "0.75rem", paddingBottom: "0.5rem",
              borderBottom: `1px solid ${color}22`,
            }}>
              <div>
                <span style={{ color, fontWeight: 700 }}>Musical DNA Engine</span>
                <div style={{ opacity: 0.6, fontSize: "0.65rem", marginTop: "2px" }}>
                  {activeSongKey} · {activeSongBpm} BPM
                </div>
              </div>
              <div style={{ textAlign: "right", opacity: 0.7 }}>
                <div style={{ color: isPlaying ? color : "#666" }}>
                  {isPlaying ? "▶ Playing" : "⏸ Paused"}
                </div>
                <div style={{ fontSize: "0.65rem" }}>{formatTime(sessionSeconds)}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem" }}>
              {(["presets", "custom", "eq", "session"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "0.3rem 0.25rem",
                    borderRadius: "0.4rem",
                    border: `1px solid ${activeTab === tab ? color : color + "33"}`,
                    background: activeTab === tab ? color + "18" : "transparent",
                    color: activeTab === tab ? color : "#c8ffd488",
                    fontSize: "0.62rem", cursor: "pointer",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}
                >
                  {tab === "presets" ? "Presets" : tab === "custom" ? "Custom" : tab === "eq" ? "EQ" : "Session"}
                </button>
              ))}
            </div>

            {/* ── Tab: Presets ── */}
            {activeTab === "presets" && (
              <div>
                <div style={{ opacity: 0.6, fontSize: "0.65rem", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>
                  BRAINWAVE ENTRAINMENT PRESETS
                </div>
                {BRAINWAVE_BANDS.map((band) => {
                  const presetKey = band.name.toLowerCase() as BinauralPreset;
                  const preset = BINAURAL_PRESETS[presetKey];
                  const isActive = binaural.isActive && binaural.currentPreset === presetKey;
                  return (
                    <div
                      key={band.name}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 0.6rem", borderRadius: "0.5rem",
                        marginBottom: "0.3rem",
                        border: `1px solid ${isActive ? band.color : band.color + "33"}`,
                        background: isActive ? band.color + "12" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() =>
                        isActive ? binaural.stop() : binaural.start(presetKey)
                      }
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: band.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ color: isActive ? band.color : "#c8ffd4", fontWeight: isActive ? 700 : 400 }}>
                            {band.name}
                          </span>
                          <span style={{ fontSize: "0.62rem", opacity: 0.6 }}>{band.range}</span>
                        </div>
                        <div style={{ fontSize: "0.62rem", opacity: 0.55, marginTop: "1px" }}>{band.desc}</div>
                        <div style={{ fontSize: "0.6rem", opacity: 0.45, marginTop: "1px" }}>
                          Beat: {preset.beatFreq} Hz · Carrier: {preset.baseFreq} Hz
                        </div>
                      </div>
                      {isActive && (
                        <span style={{ color: band.color, fontSize: "0.65rem", flexShrink: 0 }}>◉ ON</span>
                      )}
                    </div>
                  );
                })}

                {/* Volume */}
                <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: `1px solid ${color}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ opacity: 0.7 }}>Binaural Volume</span>
                    <span style={{ color }}>{Math.round(settings.binauralVolume * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={0.3} step={0.01}
                    value={settings.binauralVolume}
                    onChange={(e) => handleBinauralVolume(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: color }}
                  />
                  <div style={{ fontSize: "0.6rem", opacity: 0.4, marginTop: "2px" }}>
                    Keep subtle (5–15%) for therapeutic use
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Custom ── */}
            {activeTab === "custom" && (
              <div>
                <div style={{ opacity: 0.6, fontSize: "0.65rem", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>
                  CUSTOM FREQUENCY SETTINGS
                </div>

                {/* Beat Frequency */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span>Beat Frequency</span>
                    <span style={{ color }}>{settings.beatFreq.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range" min={0.5} max={50} step={0.5}
                    value={settings.beatFreq}
                    onChange={(e) => setSettings((s) => ({ ...s, beatFreq: parseFloat(e.target.value) }))}
                    style={{ width: "100%", accentColor: color }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", opacity: 0.4 }}>
                    <span>0.5 Hz (Delta)</span><span>50 Hz (Gamma)</span>
                  </div>
                </div>

                {/* Carrier Frequency */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span>Carrier Frequency</span>
                    <span style={{ color }}>{settings.carrierFreq} Hz</span>
                  </div>
                  <input
                    type="range" min={80} max={440} step={5}
                    value={settings.carrierFreq}
                    onChange={(e) => setSettings((s) => ({ ...s, carrierFreq: parseInt(e.target.value) }))}
                    style={{ width: "100%", accentColor: color }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", opacity: 0.4 }}>
                    <span>80 Hz (sub)</span><span>440 Hz (A4)</span>
                  </div>
                </div>

                {/* Spatial Width */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span>Spatial Width</span>
                    <span style={{ color }}>{Math.round(settings.spatialWidth * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={settings.spatialWidth}
                    onChange={(e) => setSettings((s) => ({ ...s, spatialWidth: parseFloat(e.target.value) }))}
                    style={{ width: "100%", accentColor: color }}
                  />
                  <div style={{ fontSize: "0.6rem", opacity: 0.4 }}>
                    Controls L↔R panning depth for somatic modes
                  </div>
                </div>

                {/* Music Volume */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span>Music Volume</span>
                    <span style={{ color }}>{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={settings.musicVolume}
                    onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: color }}
                  />
                </div>

                {/* Isochronic toggle */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.5rem 0.6rem", borderRadius: "0.5rem",
                  border: `1px solid ${settings.isochronic ? color : color + "33"}`,
                  background: settings.isochronic ? color + "12" : "transparent",
                  cursor: "pointer", marginBottom: "0.5rem",
                }}
                  onClick={() => setSettings((s) => ({ ...s, isochronic: !s.isochronic }))}
                >
                  <div>
                    <div style={{ color: settings.isochronic ? color : "#c8ffd4" }}>Isochronic Tones</div>
                    <div style={{ fontSize: "0.6rem", opacity: 0.5 }}>
                      Rhythmic pulses — works without headphones
                    </div>
                  </div>
                  <div style={{
                    width: 32, height: 18, borderRadius: 9,
                    background: settings.isochronic ? color : color + "33",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 2, left: settings.isochronic ? 14 : 2,
                      width: 14, height: 14, borderRadius: "50%",
                      background: settings.isochronic ? "#041a0e" : "#c8ffd4",
                      transition: "left 0.2s",
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={applyCustomBinaural}
                    style={{
                      flex: 1, padding: "0.5rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${customActive ? color : color + "66"}`,
                      background: customActive ? color + "28" : color + "18",
                      color, cursor: "pointer", fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {customActive ? `◉ ${settings.beatFreq.toFixed(1)} Hz / ${settings.carrierFreq} Hz` : "Apply Custom Settings"}
                  </button>
                  {customActive && (
                    <button
                      onClick={() => { _tearDownCustom(); setCustomActive(false); }}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.5rem",
                        border: `1px solid #f59e0b66`,
                        background: "transparent",
                        color: "#f59e0b", cursor: "pointer", fontSize: "0.72rem",
                      }}
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: EQ ── */}
            {activeTab === "eq" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ opacity: 0.6, fontSize: "0.65rem", letterSpacing: "0.1em" }}>6-BAND EQUALIZER</span>
                  <button
                    onClick={resetEQ}
                    style={{
                      padding: "0.2rem 0.5rem", borderRadius: "0.4rem",
                      border: `1px solid ${color}44`, background: "transparent",
                      color: color + "88", fontSize: "0.62rem", cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
                {settings.eq.map((band, i) => (
                  <div key={band.label} style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <span style={{ opacity: 0.8 }}>{band.label}</span>
                      <span style={{ color: band.gain > 0 ? color : band.gain < 0 ? "#f59e0b" : "#c8ffd488" }}>
                        {band.gain > 0 ? "+" : ""}{band.gain.toFixed(1)} dB
                      </span>
                    </div>
                    <input
                      type="range" min={-12} max={12} step={0.5}
                      value={band.gain}
                      onChange={(e) => handleEQChange(i, parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: band.gain !== 0 ? color : "#666" }}
                    />
                    <div style={{ fontSize: "0.58rem", opacity: 0.35 }}>{band.freq < 1000 ? band.freq + " Hz" : (band.freq / 1000).toFixed(1) + " kHz"}</div>
                  </div>
                ))}
                <button
                  onClick={applyEQ}
                  style={{
                    width: "100%", padding: "0.5rem", marginTop: "0.25rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${color}66`,
                    background: color + "18",
                    color, cursor: "pointer", fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  Apply EQ
                </button>
              </div>
            )}

            {/* ── Tab: Session ── */}
            {activeTab === "session" && (
              <div>
                <div style={{ opacity: 0.6, fontSize: "0.65rem", marginBottom: "0.75rem", letterSpacing: "0.1em" }}>
                  SESSION TRACKER
                </div>

                {/* Session timer */}
                <div style={{
                  textAlign: "center", padding: "1rem",
                  border: `1px solid ${color}33`, borderRadius: "0.75rem",
                  marginBottom: "0.75rem",
                }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color, letterSpacing: "0.1em" }}>
                    {formatTime(sessionSeconds)}
                  </div>
                  <div style={{ opacity: 0.5, fontSize: "0.65rem", marginTop: "0.25rem" }}>
                    Session Duration
                  </div>
                </div>

                {/* Song info */}
                <div style={{ marginBottom: "0.75rem", padding: "0.5rem 0.6rem", borderRadius: "0.5rem", background: color + "08", border: `1px solid ${color}22` }}>
                  <div style={{ opacity: 0.6, fontSize: "0.62rem", marginBottom: "0.3rem" }}>CURRENT TRACK</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Key: <strong style={{ color }}>{activeSongKey}</strong></span>
                    <span>BPM: <strong style={{ color }}>{activeSongBpm}</strong></span>
                  </div>
                </div>

                {/* Binaural status */}
                <div style={{ padding: "0.5rem 0.6rem", borderRadius: "0.5rem", background: color + "08", border: `1px solid ${color}22`, marginBottom: "0.75rem" }}>
                  <div style={{ opacity: 0.6, fontSize: "0.62rem", marginBottom: "0.3rem" }}>BINAURAL STATUS</div>
                  {binaural.isActive && binaural.currentPreset ? (
                    <div>
                      <div style={{ color }}>
                        ◉ Active — {BINAURAL_PRESETS[binaural.currentPreset]?.label}
                      </div>
                      <div style={{ opacity: 0.5, fontSize: "0.65rem" }}>
                        {BINAURAL_PRESETS[binaural.currentPreset]?.beatFreq} Hz beat ·{" "}
                        {BINAURAL_PRESETS[binaural.currentPreset]?.baseFreq} Hz carrier
                      </div>
                      <div style={{ opacity: 0.5, fontSize: "0.62rem", marginTop: "2px" }}>
                        {BINAURAL_PRESETS[binaural.currentPreset]?.therapeuticUse}
                      </div>
                    </div>
                  ) : (
                    <div style={{ opacity: 0.5 }}>No binaural beats active</div>
                  )}
                </div>

                <button
                  onClick={resetSession}
                  style={{
                    width: "100%", padding: "0.4rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${color}44`,
                    background: "transparent",
                    color: color + "88", cursor: "pointer", fontSize: "0.68rem",
                  }}
                >
                  Reset Session Timer
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
