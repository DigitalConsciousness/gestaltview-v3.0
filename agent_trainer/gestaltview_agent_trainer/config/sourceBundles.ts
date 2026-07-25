import type { CorpusLane } from "./trainerBlueprint.js";

export interface SourceBundle {
  slug: string;
  title: string;
  summary: string;
  lane: CorpusLane;
  includes: string[];
  bestFor: string;
}

export const sourceBundles: SourceBundle[] = [
  {
    slug: "knowledge-core-bundle",
    title: "Knowledge Core Bundle",
    lane: "knowledge",
    summary: "Generic business-document starter bundle for FAQs, SOPs, and reference material.",
    includes: [
      "FAQ template",
      "SOP outline",
      "reference glossary structure"
    ],
    bestFor: "buyers starting from documentation instead of code"
  },
  {
    slug: "code-context-bundle",
    title: "Code Context Bundle",
    lane: "code",
    summary: "Starter source bundle for repo-aware assistants without exposing private repositories.",
    includes: [
      "architecture-summary template",
      "API reference outline",
      "repo conventions checklist"
    ],
    bestFor: "solo devs and technical teams"
  },
  {
    slug: "product-ops-bundle",
    title: "Product Ops Bundle",
    lane: "product",
    summary: "Starter bundle for roadmaps, specs, release notes, and decision logs.",
    includes: [
      "feature spec outline",
      "release note template",
      "research summary structure"
    ],
    bestFor: "product-led teams and founders"
  },
  {
    slug: "context-alignment-bundle",
    title: "Context Alignment Bundle",
    lane: "context",
    summary: "Starter bundle for voice, values, terminology, and operator preferences.",
    includes: [
      "voice guide template",
      "terminology map",
      "preference capture template"
    ],
    bestFor: "personal brands, consultants, and founder-led products"
  }
];
