import { useId } from "react";

const NODE_POSITIONS = [
  { x: 0.16, y: 0.2, r: 0.028 },
  { x: 0.29, y: 0.36, r: 0.018 },
  { x: 0.42, y: 0.22, r: 0.022 },
  { x: 0.54, y: 0.46, r: 0.03 },
  { x: 0.67, y: 0.28, r: 0.02 },
  { x: 0.79, y: 0.42, r: 0.026 },
  { x: 0.36, y: 0.66, r: 0.018 },
  { x: 0.58, y: 0.72, r: 0.024 },
];

export default function ConsciousnessEngine() {
  const id = useId();

  return (
    <div className="relative h-[720px] overflow-hidden rounded-2xl border border-emerald-400/15 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_40%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(3,7,18,0.98))]">
      <svg viewBox="0 0 1000 720" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-glow`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#22ee8d" stopOpacity="0.9" />
            <stop offset="42%" stopColor="#0dd9e6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-line`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22ee8d" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#b81afa" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <circle cx="500" cy="360" r="230" fill={`url(#${id}-glow)`}>
          <animate attributeName="r" values="210;240;210" dur="7s" repeatCount="indefinite" />
        </circle>

        <path
          d="M320 530 C390 360, 450 320, 500 360 S610 480, 680 260"
          fill="none"
          stroke={`url(#${id}-line)`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 18"
        >
          <animate attributeName="stroke-dashoffset" values="0;-56" dur="5s" repeatCount="indefinite" />
        </path>

        <path
          d="M280 260 C360 160, 460 130, 540 180 S680 300, 760 210"
          fill="none"
          stroke="#0dd9e6"
          strokeOpacity="0.18"
          strokeWidth="3"
        />

        {NODE_POSITIONS.map((node, index) => (
          <g key={index}>
            <circle cx={node.x * 1000} cy={node.y * 720} r={node.r * 1000} fill="#0f172a" fillOpacity="0.35" />
            <circle
              cx={node.x * 1000}
              cy={node.y * 720}
              r={node.r * 1000}
              fill="none"
              stroke={index % 2 === 0 ? "#22ee8d" : "#b81afa"}
              strokeOpacity="0.6"
              strokeWidth="2"
            >
              <animate attributeName="r" values={`${node.r * 900};${node.r * 1100};${node.r * 900}`} dur={`${4 + index * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-6 bottom-6 max-w-xl rounded-2xl border border-emerald-400/15 bg-slate-950/70 p-4 text-sm text-emerald-50 shadow-[0_0_48px_rgba(16,185,129,0.12)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Consciousness Engine</p>
        <p className="mt-2 leading-relaxed text-emerald-50/90">
          The original 3D engine has been reduced to a lightweight visual scaffold that keeps the page intact while removing the Babylon build dependency.
        </p>
      </div>
    </div>
  );
}
