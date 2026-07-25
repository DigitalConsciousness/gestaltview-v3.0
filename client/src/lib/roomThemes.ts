/**
 * @file roomThemes.ts
 * @project GestaltView v2
 * @description Single source of truth for per-room visual identity tokens.
 * Pages declare their theme here rather than building it inline.
 * Add new rooms by extending RoomTheme and the ROOM_THEMES map.
 */

export type GlassVariant = "default" | "warm" | "cool" | "void";
export type AtmosphereStyle = "babylon" | "willow" | "none";

export interface RoomTheme {
  /** Tailwind bg class applied to the root <main> */
  bgClass: string;
  /** Inline gradient string for the atmospheric overlay div */
  gradientStyle: string;
  /** Primary accent hex — used for borders, glows, and focus rings */
  accentHex: string;
  /** Which 3D / canvas atmosphere this room uses */
  atmosphereStyle: AtmosphereStyle;
  /** Glass card visual weight */
  glassVariant: GlassVariant;
  /** Optional ambient audio path (relative to /public/audio/) */
  audioSrc?: string;
  /** Descriptive label for aria / debug */
  label: string;
}

export const ROOM_THEMES: Record<string, RoomTheme> = {
  home: {
    label: "Home",
    bgClass: "bg-gv-bg-void",
    gradientStyle:
      "radial-gradient(circle at 18% 14%, rgba(18,214,255,0.18), transparent 22%), " +
      "radial-gradient(circle at 78% 24%, rgba(191,0,255,0.10), transparent 20%), " +
      "radial-gradient(circle at 50% 78%, rgba(0,255,102,0.07), transparent 28%), " +
      "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 30%)",
    accentHex: "#12d6ff",
    atmosphereStyle: "none",
    glassVariant: "default",
    audioSrc: "ambient-home.mp3",
  },
  sanctuary: {
    label: "Sanctuary",
    bgClass: "bg-gv-bg-void",
    gradientStyle:
      "radial-gradient(ellipse at 30% 20%, rgba(120,80,40,0.10), transparent 40%), " +
      "radial-gradient(ellipse at 70% 80%, rgba(60,40,20,0.08), transparent 40%), " +
      "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.18))",
    accentHex: "#d4955a",
    atmosphereStyle: "willow",
    glassVariant: "warm",
    audioSrc: "ambient-sanctuary.mp3",
  },
  blackboard: {
    label: "Blackboard Room",
    bgClass: "bg-[#03040a]",
    gradientStyle:
      "radial-gradient(circle at top, rgba(18,214,255,0.06), transparent 28%), " +
      "radial-gradient(circle at 82% 16%, rgba(245,158,11,0.06), transparent 24%), " +
      "linear-gradient(180deg, rgba(3,4,10,0.12), rgba(3,4,10,0.72))",
    accentHex: "#32b8c6",
    atmosphereStyle: "babylon",
    glassVariant: "cool",
  },
  "creation-corner": {
    label: "Creation Corner",
    bgClass: "bg-gv-bg-void",
    gradientStyle:
      "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.10), transparent 30%), " +
      "radial-gradient(circle at 80% 70%, rgba(255,84,89,0.07), transparent 30%), " +
      "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.14))",
    accentHex: "#f59e0b",
    atmosphereStyle: "babylon",
    glassVariant: "warm",
  },
  "dynamic-inner-world": {
    label: "Dynamic Inner World",
    bgClass: "bg-gv-bg-void",
    gradientStyle:
      "radial-gradient(circle at 50% 20%, rgba(139,92,246,0.12), transparent 30%), " +
      "radial-gradient(circle at 20% 80%, rgba(16,185,129,0.08), transparent 28%), " +
      "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.16))",
    accentHex: "#8b5cf6",
    atmosphereStyle: "babylon",
    glassVariant: "cool",
  },
  "external-scaffold": {
    label: "External Scaffold",
    bgClass: "bg-gv-bg-void",
    gradientStyle:
      "radial-gradient(circle at 15% 25%, rgba(16,185,129,0.10), transparent 28%), " +
      "radial-gradient(circle at 75% 65%, rgba(18,214,255,0.07), transparent 28%), " +
      "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.12))",
    accentHex: "#10b981",
    atmosphereStyle: "none",
    glassVariant: "default",
  },
};

export function getRoomTheme(roomKey: string): RoomTheme {
  return ROOM_THEMES[roomKey] ?? ROOM_THEMES["home"];
}
