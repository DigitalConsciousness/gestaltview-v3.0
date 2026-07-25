export type RoomStability = "UNSTABLE" | "DIRECTION" | "GOOD_FOR_NOW" | "LOCKED";

export interface RoomStateEntry {
  slug: string;
  label: string;
  stability: RoomStability;
  mobileChecked: boolean;
  captureChecked: boolean;
  notes: string;
  lastUpdated: string;
}

export const ROOM_STATES: Record<string, RoomStateEntry> = {
  "blackboard-room": {
    slug: "blackboard-room",
    label: "Blackboard Room",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes:
      "Capture and chat should remain fused, with the companion rail acting as a mirror instead of a second input surface.",
    lastUpdated: "2026-05-26",
  },
  "creation-corner": {
    slug: "creation-corner",
    label: "Creation Corner",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes:
      "The workbench should open from freeform material too, not only when a blueprint already exists.",
    lastUpdated: "2026-05-26",
  },
  "external-scaffold": {
    slug: "external-scaffold",
    label: "External Scaffold",
    stability: "DIRECTION",
    mobileChecked: false,
    captureChecked: false,
    notes:
      "The map needs mobile tap equivalents for link flows and a bottom-sheet orb inspector on smaller screens.",
    lastUpdated: "2026-05-26",
  },
  profile: {
    slug: "profile",
    label: "Profile Page",
    stability: "UNSTABLE",
    mobileChecked: false,
    captureChecked: false,
    notes:
      "Future sprint: turn the page into a visual portrait of curated continuity rather than a form-like surface.",
    lastUpdated: "2026-05-26",
  },
};

export function getRoomState(slug: string): RoomStateEntry | null {
  return ROOM_STATES[slug] ?? null;
}
