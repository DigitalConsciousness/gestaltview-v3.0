import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

const SHOWCASE_BASE = "/artifacts/showcase";

export interface ShowcaseManifestEntry extends Omit<InnerWorldArtifactRecord, "html"> {
  filePath: string;
}

export interface ShowcaseManifest {
  version: string;
  generatedAt: string;
  artifacts: ShowcaseManifestEntry[];
}

let SHOWCASE_MANIFEST_CACHE: ShowcaseManifest | null = null;

export async function loadShowcaseArtifacts(): Promise<InnerWorldArtifactRecord[]> {
  try {
    if (!SHOWCASE_MANIFEST_CACHE) {
      const resp = await fetch(`${SHOWCASE_BASE}/index.json`);
      if (!resp.ok) return [];
      SHOWCASE_MANIFEST_CACHE = await resp.json();
    }
    
    if (!SHOWCASE_MANIFEST_CACHE) return [];

    return SHOWCASE_MANIFEST_CACHE.artifacts.map((entry: ShowcaseManifestEntry) => ({
      ...entry,
      html: "", // lazy-loaded per ExhibitPod on demand
    }));
  } catch (error) {
    console.error("[showcaseArtifacts] failed to load manifest", error);
    return [];
  }
}

export async function loadShowcaseArtifactHtml(id: string): Promise<string | null> {
  try {
    if (!SHOWCASE_MANIFEST_CACHE) {
      await loadShowcaseArtifacts();
    }
    
    const entry = SHOWCASE_MANIFEST_CACHE?.artifacts.find(a => a.id === id);
    if (!entry) return null;
    
    const resp = await fetch(`/${entry.filePath}`);
    if (!resp.ok) return null;
    return resp.text();
  } catch (error) {
    console.error(`[showcaseArtifacts] failed to load HTML for ${id}`, error);
    return null;
  }
}
