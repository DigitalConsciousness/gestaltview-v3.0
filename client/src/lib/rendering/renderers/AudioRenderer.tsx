/**
 * Audio Renderer
 * Native <audio> element + Web Audio API frequency visualizer.
 * AudioContext is gated behind the play button (required for Samsung A35 + iOS).
 * Accepts: URL, blob URL, data URI, or raw base64.
 */

import React, { useRef, useEffect, useState } from 'react';
import type { RenderingEngineProps } from '../types';

function toAudioSrc(content: string, mimeType?: string): string {
  if (content.startsWith('http') || content.startsWith('blob:') || content.startsWith('data:')) return content;
  return `data:${mimeType ?? 'audio/mpeg'};base64,${content}`;
}

export default function AudioRenderer({ artifact }: RenderingEngineProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);

  const src = toAudioSrc(artifact.content, artifact.mimeType);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      ctxRef.current?.close();
    };
  }, []);

  const initVisualizer = () => {
    if (!audioRef.current || !canvasRef.current || ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const src = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(ctx.destination);

    const canvas = canvasRef.current;
    const cctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      cctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const hue = (i / bufferLength) * 260 + 180;
        cctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
        cctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  return (
    <div className="gv-renderer gv-renderer--audio">
      {artifact.title && <div className="gv-audio-title">{artifact.title}</div>}
      <canvas ref={canvasRef} className="gv-audio-visualizer" width={320} height={80} />
      <audio
        ref={audioRef}
        controls
        src={src}
        onPlay={() => { initVisualizer(); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: '100%', marginTop: '8px' }}
      />
    </div>
  );
}
