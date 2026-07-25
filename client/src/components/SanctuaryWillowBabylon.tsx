import WillowTreeOverlay from "@/components/WillowTreeOverlay";

export interface SanctuaryWillowBabylonProps {
  windAmplitude?: number;
  fireflyCount?: number;
  fogDensity?: number;
  windSpeed?: number;
  reducedMotion?: boolean;
}

export default function SanctuaryWillowBabylon(props: SanctuaryWillowBabylonProps) {
  const { windAmplitude = 0.82, fireflyCount = 44, fogDensity = 0.016, windSpeed = 1, reducedMotion = false } = props;

  return (
    <div className="pointer-events-none fixed inset-0 z-[3]">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(180deg,_rgba(2,6,23,0.14),_rgba(2,6,23,0.46))]"
        style={{
          opacity: reducedMotion ? 0.45 : 0.95,
          filter: `blur(${Math.max(0, fogDensity * 320)}px)`,
        }}
      />
      <div
        className="absolute inset-x-[12%] top-[12%] h-[56%] rounded-full border border-emerald-300/10"
        style={{
          opacity: 0.65,
          transform: `scale(${1 + windAmplitude * 0.02}) rotate(${windSpeed * 2}deg)`,
          boxShadow: `0 0 ${18 + fireflyCount * 0.2}px rgba(16,185,129,0.08)`,
        }}
      />
      <WillowTreeOverlay />
    </div>
  );
}
