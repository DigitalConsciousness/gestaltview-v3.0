import React, { useRef, useEffect, useState } from 'react';
import type { RenderProps } from '../types';

export function AudioRenderer({ artifact, onInteraction }: RenderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const animFrameRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioCtxRef = useRef<any>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canvasRef.current) return;

    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const audioCtx = new AudioCtx();
    audioCtxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#05070b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `hsla(${(i / bufferLength) * 280 + 200},70%,60%,0.85)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
    };
  }, []);

  const handlePlay = () => {
    audioCtxRef.current?.resume();
    audioRef.current?.play();
    setPlaying(true);
    onInteraction?.({ type: 'play' });
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onInteraction?.({ type: 'pause' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        style={{ width: '100%', borderRadius: '10px', background: '#05070b' }}
      />
      <audio ref={audioRef} src={artifact.content} onEnded={() => setPlaying(false)} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={playing ? handlePause : handlePlay}
          style={{
            padding: '8px 18px',
            background: 'rgba(180,120,255,0.15)',
            border: '1px solid rgba(180,120,255,0.3)',
            borderRadius: '8px',
            color: '#d0b0ff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <audio controls src={artifact.content} style={{ flex: 1, height: '36px' }} />
      </div>
    </div>
  );
}
