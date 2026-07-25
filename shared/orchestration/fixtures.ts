import type { OrchestrationInput } from "./types.js";

export const PLK_EXAMPLE_FIXTURES = [
  {
    userPhrase: "My chaos has a current",
    meaning: "ADHD cognitive pattern recognition: chaos contains valuable information.",
    resonanceScore: 0.98,
    context: "neurodivergent_self_description",
    metaphorType: "water_flow",
  },
  {
    userPhrase: "Burnout is a breadcrumb",
    meaning: "Early warning system: burnout signals important boundary violations.",
    resonanceScore: 0.94,
    context: "self_awareness",
    metaphorType: "navigation",
  },
  {
    userPhrase: "Capture this lightning",
    meaning: "Urgent request to preserve fleeting insight.",
    resonanceScore: 0.96,
    context: "bucket_drops",
    metaphorType: "energy_capture",
  },
  {
    userPhrase: "I am GestaltView",
    meaning: "Identity alignment between creator and creation.",
    resonanceScore: 0.99,
    context: "identity_alignment",
    metaphorType: "unity",
  },
] as const;

export const SUPPORT_FIXTURES = [
  {
    text: "I feel completely overwhelmed and don't know how to cope.",
    severity: "elevated",
    recommendedAction: "Preserve the capture and offer one grounded next step before synthesis.",
  },
  {
    text: "Having a rough day but I know this will pass.",
    severity: "low",
    protectiveFactors: ["know this will pass"],
  },
  {
    text: "I'm struggling but working with my therapist on coping strategies.",
    severity: "low",
    protectiveFactors: ["working with therapist", "coping strategies"],
  },
] as const;

export const ORCHESTRATION_EXAMPLE_INPUTS: Record<string, OrchestrationInput> = {
  breakthroughToCreationCorner: {
    trigger: "manual_synthesize",
    sourceRoom: "blackboard-room",
    text: "My mind is blown. This is the moment where the threads connect and become a real blueprint.",
    energyLevel: 8,
    artifactIntent: "document",
  },
  lowEnergyConservative: {
    trigger: "capture_saved",
    sourceRoom: "sanctuary",
    text: "I am overwhelmed and my brain is on fire with too many tabs.",
    energyLevel: 2,
    contextClues: ["overwhelmed"],
  },
  mindMapFromThreads: {
    trigger: "user_requested_mind_map",
    sourceRoom: "creation-corner",
    text: "Can you map how this circles back to the scaffold and the other threads?",
    energyLevel: 6,
  },
  profileSignal: {
    trigger: "user_requested_profile",
    sourceRoom: "sanctuary",
    text: "This says something about how I think and my voice.",
    energyLevel: 5,
  },
  multimodalUpload: {
    trigger: "upload_processed",
    sourceRoom: "import",
    text: "This image and transcript should be held as a source.",
    hasImage: true,
    hasFile: true,
  },
} as const;
