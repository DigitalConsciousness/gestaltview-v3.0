import { colorPalette, type ColorName } from "@/theme/colors";

export type UserSurfaceSettings = {
  voiceCapture: boolean;
  motionHints: boolean;
  darkSurfaces: boolean;
  lowBandwidthMode: boolean;
  founderDebug: boolean;
  musicalDnaAmbientInference: boolean;
  palette: ColorName;
};

export const USER_SURFACE_SETTINGS_KEY = "gestaltview.settings.surface.v1";
export const USER_SURFACE_SETTINGS_EVENT = "gestaltview:settings:surface";

export const DEFAULT_USER_SURFACE_SETTINGS: UserSurfaceSettings = {
  voiceCapture: true,
  motionHints: true,
  darkSurfaces: true,
  lowBandwidthMode: false,
  founderDebug: false,
  musicalDnaAmbientInference: false,
  palette: "cyan",
};

export function readUserSurfaceSettings(): UserSurfaceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_USER_SURFACE_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(USER_SURFACE_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_USER_SURFACE_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<UserSurfaceSettings>;
    const palette =
      parsed.palette && parsed.palette in colorPalette
        ? parsed.palette
        : DEFAULT_USER_SURFACE_SETTINGS.palette;

    return {
      ...DEFAULT_USER_SURFACE_SETTINGS,
      ...parsed,
      palette,
    };
  } catch {
    return DEFAULT_USER_SURFACE_SETTINGS;
  }
}

export function applyUserSurfaceSettings(settings: UserSurfaceSettings): void {
  if (typeof document === "undefined") {
    return;
  }

  const palette = colorPalette[settings.palette];
  const root = document.documentElement;
  root.style.setProperty("--accent-color", palette.accent);
  root.style.setProperty("--glow-color", palette.glow);
  root.dataset.gvVoiceCapture = settings.voiceCapture ? "on" : "off";
  root.dataset.gvMotionHints = settings.motionHints ? "on" : "off";
  root.dataset.gvDarkSurfaces = settings.darkSurfaces ? "on" : "off";
  root.dataset.gvLowBandwidthMode = settings.lowBandwidthMode ? "on" : "off";
  root.classList.toggle("gv-reduced-motion", !settings.motionHints);
  root.classList.toggle("gv-soft-surfaces", !settings.darkSurfaces);
  root.classList.toggle("gv-low-bandwidth", settings.lowBandwidthMode);
}

export function writeUserSurfaceSettings(settings: UserSurfaceSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(USER_SURFACE_SETTINGS_KEY, JSON.stringify(settings));
  applyUserSurfaceSettings(settings);
  window.dispatchEvent(new CustomEvent(USER_SURFACE_SETTINGS_EVENT, { detail: settings }));
}
