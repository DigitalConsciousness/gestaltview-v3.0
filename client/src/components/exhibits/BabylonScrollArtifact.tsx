export interface ScrollArtifactProps {
  role: string;
  colorHex: string;
  isPlaying: boolean;
}

const ROLE_SHAPES: Record<string, string> = {
  "The Architect": "M120 24 L204 72 L176 172 L64 172 L36 72 Z",
  "The Mirror": "M120 24 C166 24 202 58 202 104 C202 150 166 184 120 184 C74 184 38 150 38 104 C38 58 74 24 120 24 Z",
  "The Guardian": "M64 40 H176 V160 H64 Z",
  "The Weaver": "M120 30 L188 66 L164 156 L76 156 L52 66 Z",
  "The Witness": "M120 28 L176 164 H64 Z",
};

export default function BabylonScrollArtifact({ role, colorHex, isPlaying }: ScrollArtifactProps) {
  const path = ROLE_SHAPES[role] ?? "M120 24 L188 54 L204 120 L164 176 L76 176 L36 120 L52 54 Z";

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 240 240" className="h-full w-full max-h-[320px] max-w-[320px]" aria-hidden="true">
        <defs>
          <radialGradient id="artifact-glow" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor={colorHex} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="120" cy="120" r="88" fill="url(#artifact-glow)" opacity={isPlaying ? 0.95 : 0.55} />
        <path
          d={path}
          fill={colorHex}
          fillOpacity="0.28"
          stroke={colorHex}
          strokeOpacity="0.9"
          strokeWidth="3"
        >
          <animate attributeName="opacity" values={isPlaying ? "0.32;0.7;0.32" : "0.22;0.38;0.22"} dur={isPlaying ? "2.8s" : "5s"} repeatCount="indefinite" />
        </path>
        <circle cx="120" cy="120" r="28" fill="#0b1220" fillOpacity="0.7" stroke={colorHex} strokeOpacity="0.45" strokeWidth="2" />
        <circle cx="120" cy="120" r="6" fill={colorHex}>
          <animate attributeName="r" values={isPlaying ? "5;8;5" : "4;6;4"} dur={isPlaying ? "1.6s" : "3.2s"} repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
