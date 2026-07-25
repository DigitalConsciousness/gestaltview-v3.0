import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

interface ScrollReaderProps {
  title: string;
  author: string;
  colorHex: string;
  audioUrl: string;
  timestamps: WordTimestamp[];
  onPlayStateChange: (isPlaying: boolean) => void;
}

export default function ScrollReader({ 
  title, 
  author, 
  colorHex, 
  audioUrl, 
  timestamps,
  onPlayStateChange
}: ScrollReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Sync Audio Time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlayStateChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
      onPlayStateChange(!isPlaying);
    }
  };

  // Find active word
  const activeIndex = timestamps.findIndex(
    (t) => currentTime >= t.start && currentTime <= t.end
  );

  // Auto-scroll text to keep active word in view
  useEffect(() => {
    if (activeIndex !== -1 && textContainerRef.current) {
      const activeElement = textContainerRef.current.querySelector('.active-word');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 relative z-10" style={{ background: `linear-gradient(to bottom, ${colorHex}15, transparent)` }}>
        <h2 className="text-3xl tracking-widest mb-1" style={{ fontFamily: "'Cabin Sketch', cursive", color: colorHex, textShadow: `0 0 15px ${colorHex}80` }}>
          {title}
        </h2>
        <p className="font-mono text-xs text-slate-400 tracking-widest uppercase">{author}</p>
      </div>

      {/* Text Area */}
      <div ref={textContainerRef} className="flex-1 overflow-y-auto p-8 relative">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <p className="text-xl leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {timestamps.map((t, idx) => {
            const isActive = idx === activeIndex;
            const isPast = currentTime > t.end;
            
            return (
              <span
                key={idx}
                className={`transition-all duration-200 inline-block mr-2 ${isActive ? 'active-word font-bold scale-105' : ''}`}
                style={{
                  color: isActive ? colorHex : isPast ? '#94a3b8' : '#cbd5e1', // Glow active, dim past, normal future
                  textShadow: isActive ? `0 0 12px ${colorHex}` : 'none'
                }}
              >
                {t.word}
              </span>
            );
          })}
        </p>
      </div>

      {/* Controls Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50 flex items-center justify-between">
        <button
          onClick={togglePlay}
          className="px-6 py-2 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
          style={{ 
            backgroundColor: `${colorHex}20`, 
            color: colorHex,
            border: `1px solid ${colorHex}50`,
            boxShadow: isPlaying ? `0 0 15px ${colorHex}40` : 'none'
          }}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ LISTEN'}
        </button>
        
        {/* Simple Progress Bar */}
        <div className="flex-1 mx-6 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full"
            style={{ backgroundColor: colorHex }}
            animate={{ width: audioRef.current && audioRef.current.duration ? `${(currentTime / audioRef.current.duration) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}
