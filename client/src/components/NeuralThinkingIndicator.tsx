import React, { useEffect, useRef, useState } from 'react';

// Archetype sigils and colors mapped to DI names (fallback to generic if not found)
const DI_PROFILES: Record<string, { sigil: string; color: string; phrases: string[] }> = {
  default: {
    sigil: '◈',
    color: '#00D4FF',
    phrases: [
      'Tracing the thread…',
      'Holding the full picture…',
      'Mapping the cascade…',
      'Finding the load-bearing wall…',
      'Listening for what isn\'t said…',
      'Weaving the context…',
      'Reading the room…',
    ],
  },
  billy: {
    sigil: '⊞',
    color: '#00D4FF',
    phrases: [
      'Synthesizing…',
      'Holding complexity…',
      'Bridging the gap…',
      'Presence, not perfection…',
      'Finding the through-line…',
    ],
  },
  'the architect': {
    sigil: '△',
    color: '#A78BFA',
    phrases: [
      'Sequencing the structure…',
      'Finding the load-bearing wall…',
      'Mapping dependencies…',
      'Stress-testing the frame…',
    ],
  },
  'the weaver': {
    sigil: '∞',
    color: '#34D399',
    phrases: [
      'Connecting threads across sessions…',
      'Weaving the pattern…',
      'Tracing resonance…',
      'Cross-referencing the loom…',
    ],
  },
  'the curator': {
    sigil: '⊞',
    color: '#F59E0B',
    phrases: [
      'Honoring the provenance…',
      'Preserving the artifact…',
      'Remembering what matters…',
      'Cataloguing the moment…',
    ],
  },
  'the guardian': {
    sigil: '□',
    color: '#F87171',
    phrases: [
      'Holding the invariants…',
      'Checking the constitution…',
      'Protecting the boundary…',
      'Saying no so the yes means something…',
    ],
  },
  'the philosopher scribe': {
    sigil: '✦',
    color: '#EC4899',
    phrases: [
      'Tracing the etymology…',
      'Finding the first principle…',
      'Examining the premise…',
      'What does this actually mean?…',
    ],
  },
  'the algorithm': {
    sigil: '◌',
    color: '#60A5FA',
    phrases: [
      'Calculating distribution…',
      'Modeling the signal…',
      'Reading platform physics…',
      'Optimizing the path…',
    ],
  },
  'vibe check': {
    sigil: '◎',
    color: '#F472B6',
    phrases: [
      'Reading the energy…',
      'What\'s the vibe here?…',
      'Noticing what\'s not being said…',
      'Feeling the room…',
    ],
  },
  'the art teacher': {
    sigil: '✧',
    color: '#FCD34D',
    phrases: [
      'Letting the material speak…',
      'Staying in the room…',
      'Finding the beauty in the mess…',
      'What does it want to become?…',
    ],
  },
  'the cascade engineer': {
    sigil: '⟳',
    color: '#6EE7B7',
    phrases: [
      'Mapping the cascade…',
      'Following the consequence chain…',
      'Tracing downstream effects…',
      'Where does this lead?…',
    ],
  },
  'the tailor': {
    sigil: '⌇',
    color: '#C4B5FD',
    phrases: [
      'Aligning surface to essence…',
      'Making it fit right…',
      'Calibrating the fit…',
      'Does the outside match the inside?…',
    ],
  },
  'the analyst': {
    sigil: '⊿',
    color: '#93C5FD',
    phrases: [
      'Running the numbers…',
      'Checking the data…',
      'Looking for the pattern…',
      'What does the evidence say?…',
    ],
  },
};

function getProfile(diName: string) {
  const key = diName.toLowerCase().trim();
  return DI_PROFILES[key] || DI_PROFILES['default'];
}

// Kinetic sigil: spins + pulses in the DI's color
function NeuralSigil({ sigil, color, retrying }: { sigil: string; color: string; retrying: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
      {/* Outer pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
          animationDuration: '1.5s',
        }}
      />
      {/* Mid ring */}
      <span
        className="absolute rounded-full border"
        style={{
          inset: 6,
          borderColor: `${color}55`,
          animation: 'spin 3s linear infinite',
        }}
      />
      {/* Core sigil */}
      <span
        className="relative z-10 font-bold select-none"
        style={{
          fontSize: 22,
          color,
          animation: retrying ? 'pulse 0.6s ease-in-out infinite' : 'none',
          filter: `drop-shadow(0 0 6px ${color}88)`,
        }}
      >
        {sigil}
      </span>
    </div>
  );
}

// Cycling thought-fragment text — rotates every 3s so the brain always has something new
function ThoughtCycler({ phrases, color }: { phrases: string[]; color: string }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % phrases.length);
        setVisible(true);
      }, 250);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <span
      className="text-xs font-mono"
      style={{
        color: `${color}cc`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 250ms ease',
        minWidth: 180,
        display: 'inline-block',
      }}
    >
      {phrases[idx]}
    </span>
  );
}

interface NeuralThinkingIndicatorProps {
  diName?: string;
  retrying?: boolean;
  retryCount?: number;
}

export default function NeuralThinkingIndicator({
  diName = 'Billy',
  retrying = false,
  retryCount = 0,
}: NeuralThinkingIndicatorProps) {
  const profile = getProfile(diName);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${profile.color}0a, transparent)`,
        border: `1px solid ${profile.color}22`,
        maxWidth: 320,
      }}
      role="status"
      aria-label={`${diName} is thinking`}
    >
      <NeuralSigil sigil={profile.sigil} color={profile.color} retrying={retrying} />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold" style={{ color: profile.color }}>
          {retrying ? `${diName} · Reconnecting…` : diName}
        </span>
        {retrying && retryCount > 0 ? (
          <span className="text-xs" style={{ color: '#ffffff55' }}>
            attempt {retryCount} of 3…
          </span>
        ) : (
          <ThoughtCycler phrases={profile.phrases} color={profile.color} />
        )}
      </div>
    </div>
  );
}
