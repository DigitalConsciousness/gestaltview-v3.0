import { operatorPacks } from "../config/operatorPacks";
import {
  createImportManifestTemplate,
  type ImportManifestTemplate
} from "../config/importTemplates";
import { sourceBundles } from "../config/sourceBundles";
import type {
  ApiResult,
  PackRouteRequest,
  StarterPackApplication,
  StarterPackExecutionResult,
  StarterPackPreview
} from "./_lib/contracts";
import { createServiceRoleClient, type OperatorKitEnv } from "./_lib/supabaseClient";

export interface ApplyStarterPackInput {
  userId: string;
  packSlug: string;
  selectedBundleSlugs?: string[];
  projectName?: string;
  owner?: string;
}

export interface StarterPackPlan {
  packSlug: string;
  title: string;
  selectedSourceBundles: string[];
  generatedSkills: string[];
  generatedMemoryKeys: string[];
  recommendedSourceBundles: string[];
  nextActions: string[];
}

type PackRouteResponseData =
  | StarterPackPreview[]
  | typeof sourceBundles
  | StarterPackPreview
  | StarterPackPlan
  | ImportManifestTemplate
  | StarterPackExecutionResult;

const generatedSkillMap: Record<string, string[]> = {
  "general-operator-foundation": [
    "Ground answers in uploaded corpus.",
    "Prefer direct, useful outputs over generic assistant filler."
  ],
  "devops-terminal-pack": [
    "Support terminal-first operators with inspectable commands.",
    "Prefer concrete operational checks over vague setup prose."
  ],
  "agent-source-starter-bundle": [
    "Study source bundles before authoring new assistant behavior.",
    "Bias toward explicit reference material over generic prompt synthesis."
  ],
  "persistent-memory-foundation": [
    "Keep continuity legible and bounded.",
    "Separate user, shared, and pinned memory concerns."
  ]
};

const generatedMemoryMap: Record<string, string[]> = {
  "general-operator-foundation": ["operator_preference_style"],
  "devops-terminal-pack": ["operator_prefers_cli"],
  "agent-source-starter-bundle": ["study_before_write"],
  "persistent-memory-foundation": ["shared_memory_model", "pinned_continuity_rules"]
};

const recommendedBundleMap: Record<string, string[]> = {
  "general-operator-foundation": ["knowledge-core-bundle", "context-alignment-bundle"],
  "devops-terminal-pack": ["code-context-bundle"],
  "agent-source-starter-bundle": [
    "knowledge-core-bundle",
    "code-context-bundle",
    "product-ops-bundle",
    "context-alignment-bundle"
  ],
  "persistent-memory-foundation": ["context-alignment-bundle"]
};

function asApiError(error: { message?: string; code?: string } | null) {
  if (!error) {
    return null;
  }

  return {
    message: error.message ?? "Unknown Supabase error.",
    code: error.code
  };
}

export function previewStarterPacks(): StarterPackPreview[] {
  return operatorPacks.map((pack) => ({
    slug: pack.slug,
    title: pack.title,
    kind: pack.kind,
    summary: pack.summary,
    recommendedSourceBundles: recommendedBundleMap[pack.slug] ?? [],
    generatedSkills: generatedSkillMap[pack.slug] ?? [],
    generatedMemoryKeys: generatedMemoryMap[pack.slug] ?? []
  }));
}

export function listSourceBundles() {
  return sourceBundles;
}

export function findStarterPackPreview(packSlug: string): StarterPackPreview | null {
  return previewStarterPacks().find((pack) => pack.slug === packSlug) ?? null;
}

function normalizeSelectedBundleSlugs(
  packSlug: string,
  selectedBundleSlugs?: string[]
): string[] {
  const fallback = recommendedBundleMap[packSlug] ?? [];
  const requested = selectedBundleSlugs && selectedBundleSlugs.length > 0
    ? selectedBundleSlugs
    : fallback;

  return requested.filter((bundleSlug, index) => {
    const exists = sourceBundles.some((bundle) => bundle.slug === bundleSlug);
    return exists && requested.indexOf(bundleSlug) === index;
  });
}

export function buildStarterPackPlan(
  packSlug: string,
  selectedBundleSlugs?: string[]
): ApiResult<StarterPackPlan> {
  const preview = findStarterPackPreview(packSlug);

  if (!preview) {
    return {
      data: null,
      error: {
        message: `Unknown starter pack: ${packSlug}`,
        code: "starter_pack_not_found"
      }
    };
  }

  const chosenBundles = normalizeSelectedBundleSlugs(packSlug, selectedBundleSlugs);

  return {
    data: {
      packSlug,
      title: preview.title,
      selectedSourceBundles: chosenBundles,
      generatedSkills: preview.generatedSkills,
      generatedMemoryKeys: preview.generatedMemoryKeys,
      recommendedSourceBundles: preview.recommendedSourceBundles,
      nextActions: [
        "Apply the starter pack to seed generic skills and memory posture.",
        "Load buyer-owned material into the selected source bundles only.",
        "Generate and refine the import manifest before ingesting real corpus files."
      ]
    },
    error: null
  };
}

export function buildImportManifestForPack(
  packSlug: string,
  projectName = "replace-with-project-name",
  owner = "replace-with-owner",
  selectedBundleSlugs?: string[]
): ApiResult<ImportManifestTemplate> {
  const planResult = buildStarterPackPlan(packSlug, selectedBundleSlugs);

  if (!planResult.data || planResult.error) {
    return {
      data: null,
      error: planResult.error
    };
  }

  const template = createImportManifestTemplate();

  return {
    data: {
      ...template,
      projectName,
      owner,
      entries: planResult.data.selectedSourceBundles.map((bundleSlug, index) => {
        const bundle = sourceBundles.find((entry) => entry.slug === bundleSlug);

        return {
          title: bundle?.title ?? `replace-with-document-title-${index + 1}`,
          lane: bundle?.lane ?? "knowledge",
          sourceType: "file" as const,
          sourceUri: `./path/to/your-${bundle?.lane ?? "knowledge"}-source-${index + 1}.md`,
          audience: "internal",
          notes: bundle
            ? `Buyer-owned source for ${bundle.title}. Replace with your own material only.`
            : "Buyer-owned source. Replace with your own material only."
        };
      })
    },
    error: null
  };
}

export function buildStarterPackRouteRequest(input: {
  packSlug: string;
  userId: string;
  selectedBundleSlugs?: string[];
  projectName?: string;
  owner?: string;
}): PackRouteRequest {
  return {
    method: "POST",
    action: "apply",
    packSlug: input.packSlug,
    userId: input.userId,
    selectedBundleSlugs: input.selectedBundleSlugs,
    projectName: input.projectName,
    owner: input.owner
  };
}

export async function handlePacksRoute(
  request: PackRouteRequest
): Promise<ApiResult<PackRouteResponseData>> {
  switch (request.action) {
    case "list":
      return {
        data: previewStarterPacks(),
        error: null
      };
    case "bundles":
      return {
        data: listSourceBundles(),
        error: null
      };
    case "preview":
      if (!request.packSlug) {
        return {
          data: null,
          error: {
            message: "packSlug is required for preview.",
            code: "missing_pack_slug"
          }
        };
      }

      return {
        data: findStarterPackPreview(request.packSlug),
        error: findStarterPackPreview(request.packSlug)
          ? null
          : {
              message: `Unknown starter pack: ${request.packSlug}`,
              code: "starter_pack_not_found"
            }
      };
    case "plan":
      if (!request.packSlug) {
        return {
          data: null,
          error: {
            message: "packSlug is required for plan.",
            code: "missing_pack_slug"
          }
        };
      }

      return buildStarterPackPlan(request.packSlug, request.selectedBundleSlugs);
    case "manifest":
      if (!request.packSlug) {
        return {
          data: null,
          error: {
            message: "packSlug is required for manifest.",
            code: "missing_pack_slug"
          }
        };
      }

      return buildImportManifestForPack(
        request.packSlug,
        request.projectName,
        request.owner,
        request.selectedBundleSlugs
      );
    case "apply":
      return {
        data: null,
        error: {
          message:
            "Pack application requires an environment-backed handler. Use handlePacksRouteWithEnv or the apply-pack script.",
          code: "env_required_for_apply"
        }
      };
    default:
      return {
        data: null,
        error: {
          message: `Unsupported action: ${request.action satisfies never}`,
          code: "unsupported_action"
        }
      };
  }
}

export async function applyStarterPack(
  env: OperatorKitEnv,
  input: ApplyStarterPackInput
): Promise<ApiResult<StarterPackApplication>> {
  const pack = operatorPacks.find((entry) => entry.slug === input.packSlug);

  if (!pack) {
    return {
      data: null,
      error: {
        message: `Unknown starter pack: ${input.packSlug}`,
        code: "starter_pack_not_found"
      }
    };
  }

  const supabase = createServiceRoleClient(env);
  const generatedSkills = generatedSkillMap[pack.slug] ?? [];
  const generatedMemoryKeys = generatedMemoryMap[pack.slug] ?? [];
  const recommendedBundles = recommendedBundleMap[pack.slug] ?? [];

  if (generatedSkills.length > 0) {
    const { error: skillsError } = await (supabase.from("skill_fragments") as any).insert(
      generatedSkills.map((description, index) => ({
        user_id: input.userId,
        name: `${pack.title} Skill ${index + 1}`,
        description,
        domain: "general",
        active: true,
        metadata: {
          starter_pack: pack.slug,
          generated: true
        }
      }))
    );

    if (skillsError) {
      return {
        data: null,
        error: asApiError(skillsError)
      };
    }
  }

  if (generatedMemoryKeys.length > 0) {
    const { error: memoryError } = await (supabase.from("memory_entries") as any).insert(
      generatedMemoryKeys.map((memoryKey) => ({
        user_id: input.userId,
        session_id: `starter-pack:${pack.slug}`,
        key: memoryKey,
        value: {
          source: "starter_pack",
          pack: pack.slug
        },
        importance: 3,
        metadata: {
          starter_pack: pack.slug,
          scope: memoryKey.includes("shared") ? "shared" : "user",
          pinned: memoryKey.includes("pinned")
        }
      }))
    );

    if (memoryError) {
      return {
        data: null,
        error: asApiError(memoryError)
      };
    }
  }

  return {
    data: {
      packSlug: pack.slug,
      activatedSkills: generatedSkills,
      seededMemoryKeys: generatedMemoryKeys,
      recommendedSourceBundles: normalizeSelectedBundleSlugs(
        pack.slug,
        input.selectedBundleSlugs ?? recommendedBundles
      )
    },
    error: null
  };
}

export async function executeStarterPackActivation(
  env: OperatorKitEnv,
  input: ApplyStarterPackInput
): Promise<ApiResult<StarterPackExecutionResult>> {
  const applicationResult = await applyStarterPack(env, input);

  if (!applicationResult.data || applicationResult.error) {
    return {
      data: null,
      error: applicationResult.error
    };
  }

  const manifestResult = buildImportManifestForPack(
    input.packSlug,
    input.projectName,
    input.owner,
    input.selectedBundleSlugs
  );

  if (!manifestResult.data || manifestResult.error) {
    return {
      data: null,
      error: manifestResult.error
    };
  }

  return {
    data: {
      application: applicationResult.data,
      manifest: manifestResult.data,
      routeRequest: buildStarterPackRouteRequest({
        packSlug: input.packSlug,
        userId: input.userId,
        selectedBundleSlugs: input.selectedBundleSlugs,
        projectName: input.projectName,
        owner: input.owner
      })
    },
    error: null
  };
}

export async function handlePacksRouteWithEnv(
  env: OperatorKitEnv,
  request: PackRouteRequest
): Promise<ApiResult<PackRouteResponseData>> {
  if (request.action !== "apply") {
    return handlePacksRoute(request);
  }

  if (!request.packSlug) {
    return {
      data: null,
      error: {
        message: "packSlug is required for apply.",
        code: "missing_pack_slug"
      }
    };
  }

  if (!request.userId) {
    return {
      data: null,
      error: {
        message: "userId is required for apply.",
        code: "missing_user_id"
      }
    };
  }

  return executeStarterPackActivation(env, {
    userId: request.userId,
    packSlug: request.packSlug,
    selectedBundleSlugs: request.selectedBundleSlugs,
    projectName: request.projectName,
    owner: request.owner
  });
}
