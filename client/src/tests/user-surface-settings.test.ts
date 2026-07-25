import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyUserSurfaceSettings,
  DEFAULT_USER_SURFACE_SETTINGS,
  readUserSurfaceSettings,
  USER_SURFACE_SETTINGS_KEY,
  writeUserSurfaceSettings,
} from "@/lib/userSurfaceSettings";

describe("user surface settings", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    const classNames = new Set<string>();
    const styleValues = new Map<string, string>();
    const documentElement = {
      dataset: {} as Record<string, string>,
      classList: {
        add: (name: string) => classNames.add(name),
        remove: (name: string) => classNames.delete(name),
        contains: (name: string) => classNames.has(name),
        toggle: (name: string, force?: boolean) => {
          if (force === false) {
            classNames.delete(name);
            return false;
          }
          classNames.add(name);
          return true;
        },
      },
      style: {
        setProperty: (name: string, value: string) => styleValues.set(name, value),
      },
    };

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("document", { documentElement });
  });

  it("persists settings and applies root affordances", () => {
    const next = {
      ...DEFAULT_USER_SURFACE_SETTINGS,
      voiceCapture: false,
      motionHints: false,
      darkSurfaces: false,
      lowBandwidthMode: true,
      palette: "emerald" as const,
    };

    writeUserSurfaceSettings(next);

    expect(JSON.parse(window.localStorage.getItem(USER_SURFACE_SETTINGS_KEY) ?? "{}")).toMatchObject(next);
    expect(readUserSurfaceSettings()).toMatchObject(next);
    expect(document.documentElement.dataset.gvVoiceCapture).toBe("off");
    expect(document.documentElement.dataset.gvLowBandwidthMode).toBe("on");
    expect(document.documentElement.classList.contains("gv-reduced-motion")).toBe(true);
    expect(document.documentElement.classList.contains("gv-soft-surfaces")).toBe(true);
    expect(document.documentElement.classList.contains("gv-low-bandwidth")).toBe(true);

    applyUserSurfaceSettings(DEFAULT_USER_SURFACE_SETTINGS);
  });
});
