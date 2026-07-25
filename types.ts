export interface LayoutPreferences {
  theme: "light" | "dark" | "auto";
  density: "compact" | "comfortable" | "spacious";
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number;
  consciousnessAdaptive: boolean;
  energyResponsive: boolean;
  focusMode: boolean;
}
