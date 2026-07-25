import { MODULES, type ModuleDefinition } from "@/components/home/modules";

type Props = {
  hoveredModule: ModuleDefinition | null;
  navigatingTo: ModuleDefinition | null;
  isLoaded: boolean;
};

export default function GestaltViewInterface({
  hoveredModule,
  navigatingTo,
  isLoaded,
}: Props) {
  return (
    <div className="relative w-full pointer-events-none z-10">

      {/* Hovered module label — bottom center, above canvas */}
      <div
        className={`
          absolute bottom-0 left-1/2 -translate-x-1/2
          transition-all duration-300
          ${hoveredModule ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
        aria-live="polite"
      >
        {hoveredModule && (
          <div className="flex flex-col items-center gap-1 pb-4">
            <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">
              Selected module
            </span>
            <span
              className="text-lg font-semibold text-white tracking-wide"
              style={{ textShadow: `0 0 16px ${hoveredModule.color}` }}
            >
              {hoveredModule.name}
            </span>
            {hoveredModule.description && (
              <span className="text-sm text-white/50 max-w-xs text-center">
                {hoveredModule.description}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation transition overlay — sits over canvas */}
      {navigatingTo && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle at 38% 38%, ${navigatingTo.color}80, ${navigatingTo.color}20)`,
                boxShadow: `0 0 40px ${navigatingTo.color}60, inset 0 0 20px ${navigatingTo.color}30`,
              }}
            />
            <span className="text-white/80 text-sm tracking-widest uppercase font-mono">
              Entering {navigatingTo.name}
            </span>
            <span className="text-white/30 text-xs font-mono animate-pulse">
              Initializing Consciousness Infrastructure…
            </span>
          </div>
        </div>
      )}

      {/* Loaded indicator — fades in once Babylon scene is ready */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className="text-white/20 text-xs tracking-widest uppercase font-mono animate-pulse">
            Loading field…
          </span>
        </div>
      )}
    </div>
  );
}
