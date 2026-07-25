export type Lane = "Documented" | "Needs Translation" | "Aspirational";

export interface Claim {
  claimid: string;
  claimtext: string;
  recommendedwording: string;
  status: string;
  lane: Lane;
  evidencefile1: string;
  evidencefile2?: string;
  ownernotes: string;
  evidenceTier: "Primary" | "Secondary" | "Tertiary";
  source: string;
  blockchainanchored?: boolean;
  bitcoinblock?: string;
}

export interface ChronologyEntry {
  dateorperiod: string;
  eventorphase: string;
  evidencefile: string;
  package: string;
  confidence: "High" | "Medium" | "Low";
  status: string;
  notes: string;
  blockchainanchored?: boolean;
  bitcoinblock?: string;
}

export interface SkepticismEntry {
  objectionid: string;
  objection: string;
  whyithits: string;
  rebuttal: string;
  status: "Resolved" | "Open" | "In Progress";
  neededartifact?: string;
}

export interface EvidenceEntry {
  evidencefile: string;
  package: string;
  tier: "Primary" | "Secondary" | "Tertiary";
  claimscovered: string;
  notes: string;
}

export interface ArchitectureEntry {
  component: string;
  function: string;
  evidencefile: string;
  evidencetype: string;
  skepticquestionanswered: string;
  status: string;
}

export interface BundleSummary {
  createdutc: string;
  packagecount: number;
  totalfileslisted: number;
  duplicaterows: number;
  uniquefilehashes: number;
  otsreceipts?: number;
  packages: string[];
}

export interface DiligenceData {
  claims: Claim[];
  chronology: ChronologyEntry[];
  skepticism: SkepticismEntry[];
  evidenceindex: EvidenceEntry[];
  architecturemap: ArchitectureEntry[];
  bundlesummary: BundleSummary;
  lastupdated: string;
  warnings?: string[];
}

export interface OTSEntry {
  otsId: string;
  otsFilename: string;
  proofSizeBytes: number;
  proofSha256: string;
  zipModifiedUtc: string;
  originalFilename: string;
  originalTitle: string;
  targetExtension: string;
  topicBucket: string;
  inferredDate: string;
  dateTextFound: string;
  isCopyVariant: boolean;
  canonicalKey: string;
  manifestMatchType: "exact" | "fuzzy" | "none";
  manifestMatchCount: number;
  manifestPackages: string;
  manifestPathsSample: string;
  bundleCompanionPresent: boolean;
  bundleCompanionFiles: string;
  indexNote: string;
  canonicalGroupCount: number;
}

export interface OTSIndexData {
  entries: OTSEntry[];
  total: number;
  last_updated: string;
  warnings?: string[];
}
