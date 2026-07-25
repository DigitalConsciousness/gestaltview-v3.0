"use client";

type BillyMood = "idle" | "listening" | "processing" | "speaking";

const MOOD_COLORS: Record<BillyMood, string> = {
  idle: "#00D4FF",
  listening: "#F8FAFC",
  processing: "#9F67FF",
  speaking: "#00FFC8",
};

export default function BillyBabylon({
  size = 320,
  mood = "idle",
}: {
  size?: number;
  mood?: BillyMood;
}) {
  const accent = MOOD_COLORS[mood];
  const glow = mood === "processing" ? 0.9 : mood === "speaking" ? 0.82 : mood === "listening" ? 1 : 0.72;

  return (
    <div
      aria-label={`Billy Babylon orb, ${mood} mood`}
      role="img"
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="billy-core" cx="0.5" cy="0.42" r="0.52">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="28%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="72%" stopColor={accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="billy-halo" cx="0.5" cy="0.42" r="0.58">
            <stop offset="0%" stopColor={accent} stopOpacity="0.48" />
            <stop offset="62%" stopColor={accent} stopOpacity="0.14" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="120" cy="120" r="76" fill="url(#billy-halo)">
          <animate attributeName="r" values="70;78;70" dur="5.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.76;1;0.76" dur="4.8s" repeatCount="indefinite" />
        </circle>

        <g opacity={glow}>
          <circle cx="120" cy="120" r="52" stroke={accent} strokeOpacity="0.92" strokeWidth="2.4" />
          <circle cx="120" cy="120" r="36" stroke="#FFFFFF" strokeOpacity="0.72" strokeWidth="1.2" />
          <circle cx="120" cy="120" r="18" fill="url(#billy-core)" />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 120 120"
            to="360 120 120"
            dur={mood === "processing" ? "10s" : "16s"}
            repeatCount="indefinite"
          />
        </g>

        <g>
          <circle cx="120" cy="120" r="88" stroke={accent} strokeOpacity="0.2" strokeWidth="1.2" strokeDasharray="8 12">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 120 120"
              to="-360 120 120"
              dur={mood === "processing" ? "18s" : "24s"}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="120" cy="32" r="5" fill={accent}>
            <animate attributeName="r" values="4;6;4" dur="3.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="194" cy="120" r="3.8" fill="#FFFFFF" fillOpacity="0.82">
            <animate attributeName="opacity" values="0.35;1;0.35" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="208" r="4.5" fill={accent} fillOpacity="0.88">
            <animate attributeName="r" values="3.8;5.2;3.8" dur="4.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
