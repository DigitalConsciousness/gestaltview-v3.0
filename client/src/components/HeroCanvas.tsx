import { useId } from "react";

const NODES = [
  { x: 0.18, y: 0.22 },
  { x: 0.3, y: 0.5 },
  { x: 0.42, y: 0.28 },
  { x: 0.56, y: 0.62 },
  { x: 0.7, y: 0.33 },
  { x: 0.82, y: 0.54 },
];

export default function HeroCanvas() {
  const id = useId();

  return (
    <div className="relative h-[720px] w-full overflow-hidden rounded-3xl border border-cyan-400/15 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,212,255,0.16),_transparent_34%),radial-gradient(circle_at_70%_50%,_rgba(224,64,251,0.12),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(2,8,18,0.98))]">
      <svg viewBox="0 0 1200 720" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-orb`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#00D4FF" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E040FB" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <circle cx="600" cy="360" r="210" fill={`url(#${id}-orb)`}>
          <animate attributeName="r" values="190;225;190" dur="6.5s" repeatCount="indefinite" />
        </circle>

        <path
          d="M220 420 C360 220, 460 560, 600 360 S820 200, 980 460"
          fill="none"
          stroke={`url(#${id}-edge)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 12"
        >
          <animate attributeName="stroke-dashoffset" values="0;-80" dur="4.5s" repeatCount="indefinite" />
        </path>

        {NODES.map((node, index) => (
          <g key={index}>
            <circle cx={node.x * 1200} cy={node.y * 720} r={8 + index * 2} fill="#0f172a" fillOpacity="0.42" />
            <circle cx={node.x * 1200} cy={node.y * 720} r={8 + index * 2} fill="none" stroke={index % 2 === 0 ? "#00D4FF" : "#E040FB"} strokeOpacity="0.7" strokeWidth="2">
              <animate attributeName="r" values={`${7 + index};${10 + index};${7 + index}`} dur={`${3 + index * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-6 bottom-6 max-w-lg rounded-2xl border border-cyan-400/15 bg-slate-950/70 p-4 text-sm text-cyan-50 shadow-[0_0_48px_rgba(0,212,255,0.12)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">Hero Canvas</p>
        <p className="mt-2 leading-relaxed text-cyan-50/90">
          The hero visual now renders as a lightweight SVG constellation so the page stays expressive without the Babylon dependency tree.
        </p>
      </div>
    </div>
  );
}
