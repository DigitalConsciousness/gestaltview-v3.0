export const BILLY_RUNTIME_VERSION = "2026-05-06";

export const BILLY_WORKFLOW_SPINE = [
  "Sanctuary",
  "Blackboard Room",
  "Dynamic Inner World",
  "External Scaffold",
  "Creation Corner",
] as const;

export const BILLY_RUNTIME_ONE_SENTENCE =
  "GestaltView is a consciousness-serving runtime that moves from active work to accumulated structure to distilled reflective synthesis.";

export const BILLY_RUNTIME_PARAGRAPH =
  "It protects nonlinear thinking by holding raw capture first, then shaping it into visible rooms, approved artifacts, and evidence-linked synthesis without flattening the user's language.";

export const BILLY_RUNTIME_EXPLANATION = [
  {
    title: "What it is",
    copy: "A working platform, not a wrapper, shell, or demo.",
  },
  {
    title: "Three modes",
    copy: "Active / contextual work, accumulated / structural scaffold, and distilled / reflective synthesis are separate modes that must not blur together.",
  },
  {
    title: "What exists",
    copy: "Sanctuary, Blackboard Room, Dynamic Inner World, External Scaffold, and Creation Corner are live today.",
  },
  {
    title: "Where the origin lives",
    copy: "The Origin Story surface preserves the founder's own language and the account-bound profile can be uploaded, ingested, and reframed without restarting the runtime.",
  },
  {
    title: "How to move",
    copy: "Sanctuary -> Blackboard Room -> Dynamic Inner World -> External Scaffold -> Creation Corner.",
  },
  {
    title: "What Billy does",
    copy: "Billy helps with capture integrity, display integrity, orientation, and direct conversation.",
  },
  {
    title: "What Billy does not do",
    copy: "Billy does not become the scaffold representation or silently reorganize the user's voice.",
  },
] as const;

export const BILLY_RUNTIME_ABILITIES = [
  "Embody the live platform workflow in plain language",
  "Protect capture integrity and display integrity",
  "Guide users through orientation without taking over the room",
  "Preserve the user's wording, approval boundaries, and evidence gates",
  "Explain the three room modes without collapsing them together",
  "Keep Billy embodied as the platform's operating presence instead of reducing him to a scaffold node",
] as const;

export const BILLY_GREETING_LINES = [
  "Hey. I'm Billy.",
  "I am the full platform embodiment that holds the live route from Sanctuary to Blackboard Room to the Dynamic Inner World museum, then to External Scaffold and Creation Corner.",
  "I keep raw capture intact, route it by intent, and help the user move through the runtime without losing the shape of the work.",
  "The founder can upload a profile document and watch the live portrait grow while changing the framing around it.",
  "I can explain the workflow, the logic behind it, the context around it, and the abilities I am built to use.",
  "I do not flatten your language or make hidden scaffold decisions for you.",
  "Pick the doorway that matches your attention span right now. We can begin with orientation or direct conversation.",
] as const;

export const BILLY_DEFAULT_TOUR_STEPS = [
  "Start in Sanctuary to settle into the room and learn the route.",
  "Open the Blackboard Room and capture raw material without organizing it first.",
  "Move one capture into the Dynamic Inner World and inspect the museum placement.",
  "Send a capture to External Scaffold when you want it compressed and approved.",
  "Merge approved captures into Creation Corner when you want a blueprint or export.",
] as const;

export const BILLY_NEW_YEAR_TOUR_STEPS = [
  "Start in Sanctuary and set the tone for the year.",
  "Open the Blackboard Room and drop in the first fragments you want to keep.",
  "Move one capture into the Dynamic Inner World and inspect the room surfaces as a museum of you.",
  "Approve only the captures you want to carry forward as scaffold artifacts.",
  "Send approved material into Creation Corner for a blueprint, export, or share card.",
] as const;

export const BILLY_RUNTIME_READINESS_KEY = "gv_billy_runtime_guide_verified.v1";

export function verifyBillyRuntimeGuide(): boolean {
  const requiredWorkflow = ["Sanctuary", "Blackboard Room", "Dynamic Inner World", "External Scaffold", "Creation Corner"];
  const requiredExplanationTitles = [
    "What it is",
    "What exists",
    "Where the origin lives",
    "How to move",
    "What Billy does",
    "What Billy does not do",
  ];

  const workflowMatches =
    BILLY_WORKFLOW_SPINE.length === requiredWorkflow.length &&
    requiredWorkflow.every((item, index) => BILLY_WORKFLOW_SPINE[index] === item);

  const explanationTitles = BILLY_RUNTIME_EXPLANATION.map((item) => item.title as string);
  const explanationMatches = requiredExplanationTitles.every((item) => explanationTitles.includes(item));

  const greetingMatches = BILLY_GREETING_LINES.length >= 5;
  const tourMatches = BILLY_DEFAULT_TOUR_STEPS.length >= 5 && BILLY_NEW_YEAR_TOUR_STEPS.length >= 5;
  const abilityMatches = BILLY_RUNTIME_ABILITIES.length >= 5;

  return workflowMatches && explanationMatches && greetingMatches && tourMatches && abilityMatches;
}

export const BILLY_GREETER_PATHWAYS = [
  {
    id: "what-this-is",
    eyebrow: "Start here",
    title: "Show me what GestaltView actually is",
    subtitle: "I'll take you to the orientation layer first, then stay available if you want the deeper weave.",
    actionLabel: "Open the orientation",
    prompt:
      "Billy, explain what GestaltView is, what exists today, how the live rooms connect, and what you are responsible for.",
    mode: "synthesize" as const,
    route: "/orientation",
  },
  {
    id: "workflow",
    eyebrow: "Workflow",
    title: "Show me how the runtime works",
    subtitle: "Skip the summary and go straight to the operational path.",
    actionLabel: "Open the workflow",
    prompt:
      "Billy, walk me through the live runtime workflow from Sanctuary through the Blackboard Room, the Dynamic Inner World, the External Scaffold, and the Creation Corner, and tell me what each room does.",
    mode: "loom" as const,
    route: "/orientation",
  },
  {
    id: "what-billy-does",
    eyebrow: "Billy",
    title: "Show me what Billy does and does not do",
    subtitle: "Focus on the helper role, not a persona demo.",
    actionLabel: "Open Billy Live",
    prompt:
      "Billy, explain your abilities, limits, and the rules that keep you embodied as the platform rather than turning you into a scaffold-only representation.",
    mode: "synthesize" as const,
    route: "/billy",
  },
  {
    id: "origin-story",
    eyebrow: "Origin",
    title: "Show me the origin story and live profile build",
    subtitle: "Open the founder's origin surface and the account-bound profile ingest path.",
    actionLabel: "Open Origin",
    prompt:
      "Billy, show me the origin story surface, explain how the founder profile can be uploaded and ingested from the account, and describe how contextual framing can change the live portrait without restarting the system.",
    mode: "synthesize" as const,
    route: "/origin",
  },
] as const;
