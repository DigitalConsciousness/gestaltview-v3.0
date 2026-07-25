import { isFeatureEnabled, type FeatureFlag } from "@/config/featureFlags";

export type ModuleDefinition = {
  id: string;
  name: string;
  route: string;
  pos: [number, number, number];
  color: string;
  description?: string;
  flag?: FeatureFlag;
};

const INTENSE_ORB_PALETTE = {
  cyan:    "#00D4FF",
  blue:    "#1A6FFF",
  violet:  "#9945FF",
  magenta: "#FF00C8",
  emerald: "#00FF66",
  teal:    "#00C896",
  amber:   "#FFB800",
};

const ALL_MODULES: ModuleDefinition[] = [
  { id: "scaffold",   name: "External Scaffold of You",   route: "/external-scaffold", pos: [-7.2, 0.72,  6.8], color: INTENSE_ORB_PALETTE.cyan,    description: "Your connections, context, and collected fragments — mapped.", flag: "externalScaffold" },
  { id: "rpe",        name: "Rapid Prototype Engine",     route: "/rapid-prototype",   pos: [-3.0, 0.58,  8.9], color: INTENSE_ORB_PALETTE.magenta,  description: "Build specs, blueprints, and prototypes — fast.", flag: "rapidPrototype" },
  { id: "creation",   name: "Creation Corner",            route: "/creation-corner",   pos: [ 1.1, 0.62,  5.2], color: INTENSE_ORB_PALETTE.emerald,  description: "The maker space. Artifacts get built and deployed here." },
  { id: "artifact-gallery", name: "Artifact Gallery",     route: "/artifact-gallery",  pos: [ 0.2, 0.74,  7.4], color: INTENSE_ORB_PALETTE.cyan,     description: "Queue unfinished work, repair failures, and publish only ready pieces." },
  { id: "pullstring", name: "Pull String",                route: "/pull-string",       pos: [ 4.3, 0.98,  8.2], color: INTENSE_ORB_PALETTE.violet,   description: "A sanctuary. No judgment. No extraction. Just you." },
  { id: "legacy",     name: "Memory Continuity",         route: "/heirloom-companion", pos: [ 8.3, 1.42, 10.8], color: INTENSE_ORB_PALETTE.blue,     description: "Every accepted moment, woven into a continuity record." },
  { id: "daydreamer", name: "Daydreamer",                route: "/daydreamer",        pos: [ 3.8, 0.58, 12.0], color: INTENSE_ORB_PALETTE.teal,     description: "Dream journal. Aspirations. What you're reaching toward." },
  { id: "musical",    name: "Musical DNA",               route: "/musical-dna",       pos: [ 8.9, 0.72,  6.8], color: INTENSE_ORB_PALETTE.cyan,     description: "Your relationship to sound — built from your music." },
  { id: "workspace",  name: "Workspace & Analysis",      route: "/workspaces",        pos: [-8.6, 0.68,  9.5], color: INTENSE_ORB_PALETTE.violet,   description: "Bring in documents. Surface what you didn't know to ask." },
  { id: "sanctuary",  name: "The Sanctuary",             route: "/sanctuary",         pos: [-4.5, 1.30, 11.4], color: INTENSE_ORB_PALETTE.emerald,  description: "Your room for rest, reflection, and navigation." },
  { id: "academy",    name: "Digital Intelligence Academy", route: "/digital-intelligence-academy", pos: [-2.0, 1.08, 10.2], color: INTENSE_ORB_PALETTE.amber, description: "The relationship hub where the agents learn how to hold the user well.", flag: "digitalIntelligenceAcademy" },
  { id: "embodiment", name: "Embodiment Studio",        route: "/embodiment-studio", pos: [ 2.4, 0.96, 10.1], color: INTENSE_ORB_PALETTE.cyan, description: "Tune temperament, memory style, and collaborative voice.", flag: "embodimentStudio" },
  { id: "tribunal",   name: "Tribunal",                route: "/tribunal",         pos: [ 0.0, 1.48, 12.2], color: INTENSE_ORB_PALETTE.violet, description: "The bounded multi-voice room for scaffold, care, and legacy.", flag: "agentCouncil" },
  { id: "cogos",      name: "Cognitive OS",              route: "/cogos",             pos: [ 0.0, 0.52,  9.1], color: INTENSE_ORB_PALETTE.magenta,  description: "Snap in new capabilities as you grow." },
];

export const MODULES: ModuleDefinition[] = ALL_MODULES.filter((module) => (
  !module.flag || isFeatureEnabled(module.flag)
));
