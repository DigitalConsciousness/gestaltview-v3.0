/**
 * MusicalDNA Somatic Orb Visualization — lightweight canvas edition.
 *
 * This preserves the public API used by the Musical DNA and Frequency
 * Therapy pages while removing the Babylon dependency tree from the build.
 */

export type SomaticMode = "bilateral" | "trilateral" | "quadlateral";

export interface MusicalDNAConfig {
  mode: SomaticMode;
  sensitivity: number;
  colorPalette: "aurora" | "neural" | "custom";
  showFog: boolean;
  autoRotate: boolean;
}

export interface AudioMetrics {
  frequencyData: Uint8Array<ArrayBuffer>;
  bassLevel: number;
  midLevel: number;
  highLevel: number;
  overallLevel: number;
}

const PALETTES = {
  aurora: ["#22ee8d", "#0dd9e6", "#b81afa", "#f59e0b"],
  neural: ["#10b981", "#14b8a6", "#a855f7", "#ffd60a"],
  custom: ["#22ee8d", "#0dd9e6", "#b81afa", "#f59e0b"],
} as const;

export class MusicalDNAVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: MusicalDNAConfig;
  private analyserNode: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;
  private animationFrame = 0;
  private startTime = performance.now();
  private modePhase = 0;
  private entrainmentStrength = 1;

  constructor(canvas: HTMLCanvasElement, config: Partial<MusicalDNAConfig> = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("MusicalDNAVisualizer requires a 2D canvas context");
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.config = {
      mode: "bilateral",
      sensitivity: 1,
      colorPalette: "aurora",
      showFog: true,
      autoRotate: false,
      ...config,
    };

    this.resize();
    window.addEventListener("resize", this.resize);
    this.renderLoop();
  }

  connectAnalyser(analyser: AnalyserNode) {
    this.analyserNode = analyser;
  }

  setAudioContext(ctx: AudioContext) {
    this.audioCtx = ctx;
  }

  setMode(mode: SomaticMode) {
    this.config = { ...this.config, mode };
  }

  setEntrainmentStrength(strength: number) {
    this.entrainmentStrength = Math.max(0.25, Math.min(3, strength));
  }

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.resize);
  }

  private resize = () => {
    const { canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 640));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 480));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private renderLoop = () => {
    this.draw();
    this.animationFrame = window.requestAnimationFrame(this.renderLoop);
  };

  private getPalette() {
    return PALETTES[this.config.colorPalette];
  }

  private sampleAudio() {
    const metrics: AudioMetrics = {
      frequencyData: new Uint8Array(256),
      bassLevel: 0,
      midLevel: 0,
      highLevel: 0,
      overallLevel: 0,
    };

    if (!this.analyserNode) {
      return metrics;
    }

    this.analyserNode.getByteFrequencyData(metrics.frequencyData);
    const bucket = (start: number, end: number) => {
      let total = 0;
      for (let i = start; i < end; i += 1) {
        total += metrics.frequencyData[i] ?? 0;
      }
      return total / Math.max(1, end - start) / 255;
    };

    metrics.bassLevel = bucket(0, 24);
    metrics.midLevel = bucket(24, 120);
    metrics.highLevel = bucket(120, 220);
    metrics.overallLevel = (metrics.bassLevel + metrics.midLevel + metrics.highLevel) / 3;
    return metrics;
  }

  private draw() {
    const { ctx, canvas } = this;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const time = (performance.now() - this.startTime) * 0.001;
    const audio = this.sampleAudio();
    const palette = this.getPalette();

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(4, 10, 16, 0.08)";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.18;
    const pulse = 1 + audio.overallLevel * 0.25 * this.entrainmentStrength;

    const gradient = ctx.createRadialGradient(centerX, centerY, 8, centerX, centerY, radius * 2.4);
    gradient.addColorStop(0, palette[1]);
    gradient.addColorStop(0.5, palette[0]);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * pulse * 1.8, 0, Math.PI * 2);
    ctx.fill();

    const orbitCount = this.config.mode === "quadlateral" ? 3 : this.config.mode === "trilateral" ? 2 : 1;
    for (let i = 0; i < orbitCount; i += 1) {
      const offset = (i + 1) * 0.2;
      const ringRadius = radius * (1.6 + i * 0.35 + audio.midLevel * 0.2);
      ctx.strokeStyle = `${palette[(i + 1) % palette.length]}cc`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      const dotAngle = time * (0.8 + i * 0.25) + offset;
      const dotX = centerX + Math.cos(dotAngle) * ringRadius;
      const dotY = centerY + Math.sin(dotAngle) * ringRadius * 0.72;
      ctx.fillStyle = palette[(i + 2) % palette.length];
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6 + audio.highLevel * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const bars = 24;
    for (let i = 0; i < bars; i += 1) {
      const level = (audio.frequencyData[i] ?? 0) / 255;
      const barHeight = height * 0.06 * (0.4 + level * 1.8);
      const x = width * 0.1 + (width * 0.8 * i) / bars;
      ctx.fillStyle = `${palette[i % palette.length]}aa`;
      ctx.fillRect(x, height * 0.82 - barHeight, width * 0.012, barHeight);
    }

    if (this.config.showFog) {
      ctx.fillStyle = `rgba(255,255,255,${0.02 + audio.overallLevel * 0.03})`;
      ctx.fillRect(0, 0, width, height);
    }
  }
}
