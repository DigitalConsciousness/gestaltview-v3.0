import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  initialX: number;
  radius: number;
  initialRadius: number;
  speed: number;
  opacity: number;
  directionX: number;
}

interface EmbersProps {
  consciousnessState?: string;
  audioData?: Uint8Array | null;
}

export const useEmbers = ({ consciousnessState = 'Relaxed', audioData = null }: EmbersProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const p of particles) {
      // Ember palette: warm amber → teal → cyan — matches GestaltView Signal Noir
      const hues: Record<string, number> = {
        Focused:    195, // cyan
        Relaxed:    30,  // warm amber
        Overwhelmed: Math.random() * 60 + 10,
        Hyperfocus: 185,
      };
      const hue = hues[consciousnessState] ?? 35;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
      // Glow: larger soft circle behind the ember dot
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
      grd.addColorStop(0,   `hsla(${hue}, 90%, 75%, ${p.opacity})`);
      grd.addColorStop(0.4, `hsla(${hue}, 80%, 60%, ${p.opacity * 0.5})`);
      grd.addColorStop(1,   `hsla(${hue}, 70%, 50%, 0)`);
      ctx.fillStyle = grd;
      ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2, false);
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = `hsla(${hue}, 95%, 88%, ${p.opacity})`;
      ctx.fill();
    }
  }, [consciousnessState]);

  const update = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    let audioIntensity = 0;
    let bassIntensity = 0;

    if (audioData && audioData.length > 0) {
      const bassCutoff = Math.floor(audioData.length * 0.2);
      let bassSum = 0;
      for (let i = 0; i < bassCutoff; i++) bassSum += audioData[i];
      bassIntensity = (bassSum / bassCutoff) / 255;
      const totalSum = audioData.reduce((s, v) => s + v, 0);
      audioIntensity = (totalSum / audioData.length) / 255;
    }

    for (const p of particles) {
      let baseSpeed = 0.12;

      switch (consciousnessState) {
        case 'Focused':
          baseSpeed = 0.28;
          p.directionX = (p.initialX / ctx.canvas.width - 0.5) * -0.08;
          break;
        case 'Relaxed':
          baseSpeed = 0.09;
          p.directionX += (Math.random() - 0.5) * 0.008;
          p.directionX *= 0.97;
          break;
        case 'Overwhelmed':
          baseSpeed = 0.5;
          p.directionX += (Math.random() - 0.5) * 0.2;
          break;
        case 'Hyperfocus':
          baseSpeed = 1.4;
          p.directionX = 0;
          break;
        default:
          p.directionX *= 0.94;
      }

      p.speed = audioData ? baseSpeed + audioIntensity * 2 : baseSpeed;
      p.radius = audioData ? p.initialRadius * (1 + bassIntensity * 2) : p.initialRadius;

      p.y -= p.speed;
      p.x += p.directionX;

      // FIX: opacity fades IN as ember rises (y decreases), fades OUT near top
      // Bottom of screen → transparent; middle → visible; near top → fade out
      const progress = 1 - (p.y / ctx.canvas.height); // 0 at bottom, 1 at top
      p.opacity = progress < 0.15
        ? progress / 0.15                    // fade in from bottom
        : progress > 0.75
          ? (1 - progress) / 0.25           // fade out near top
          : 0.55 + Math.random() * 0.15;    // stable visible band

      if (p.y < -p.radius * 2) {
        p.y = ctx.canvas.height + p.radius;
        p.x = Math.random() * ctx.canvas.width;
        p.initialX = p.x;
        p.directionX = 0;
        p.opacity = 0;
      }

      if (p.x < -p.radius * 2 || p.x > ctx.canvas.width + p.radius * 2) {
        p.x = Math.random() * ctx.canvas.width;
        p.initialX = p.x;
      }
    }
  }, [audioData, consciousnessState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const particleCount = 60;

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const radius = Math.random() * 1.8 + 0.6;
        // Scatter particles throughout canvas height so they don't all spawn at once
        particles.push({
          x, y: Math.random() * canvas.height,
          initialX: x,
          radius, initialRadius: radius,
          speed: Math.random() * 0.3 + 0.08,
          opacity: 0,
          directionX: 0,
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const animate = () => {
      update(ctx, particles);
      draw(ctx, particles);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [draw, update]);

  return canvasRef;
};
