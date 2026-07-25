export type KitDomain =
  | "general"
  | "resume"
  | "adhd"
  | "creative"
  | "consulting"
  | "custom";

export interface DomainPreset {
  slug: KitDomain;
  label: string;
  description: string;
  suggestedUploads: string[];
  starterPromptFocus: string;
}

export const domainPresets: Record<KitDomain, DomainPreset> = {
  general: {
    slug: "general",
    label: "General",
    description: "Neutral baseline for broad assistant use.",
    suggestedUploads: ["FAQs", "SOPs", "general notes"],
    starterPromptFocus: "Answer clearly and stay grounded in the uploaded corpus."
  },
  resume: {
    slug: "resume",
    label: "Resume",
    description: "Career, job-search, and resume support workflows.",
    suggestedUploads: ["resume guides", "job-search frameworks", "coaching notes"],
    starterPromptFocus: "Help users present their work clearly and credibly."
  },
  adhd: {
    slug: "adhd",
    label: "ADHD",
    description: "Supportive, structured, task-scaffolding workflows.",
    suggestedUploads: ["coaching prompts", "task systems", "checklists"],
    starterPromptFocus: "Break work into manageable steps and reduce overload."
  },
  creative: {
    slug: "creative",
    label: "Creative",
    description: "Idea development, identity, and creative iteration support.",
    suggestedUploads: ["brand voice", "creative briefs", "portfolio notes"],
    starterPromptFocus: "Preserve voice while helping expand and refine ideas."
  },
  consulting: {
    slug: "consulting",
    label: "Consulting",
    description: "Client delivery, packaging, and expert-system framing.",
    suggestedUploads: ["service offers", "playbooks", "case studies"],
    starterPromptFocus: "Translate expertise into practical client-facing outputs."
  },
  custom: {
    slug: "custom",
    label: "Custom",
    description: "Operator-defined domain preset with custom prompt control.",
    suggestedUploads: ["operator-owned reference material"],
    starterPromptFocus: "Follow the operator's custom domain framing."
  }
};
