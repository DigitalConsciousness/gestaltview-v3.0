/**
 * api/model-homes.ts
 * ==================
 * Vercel serverless API route for the Model Homes system.
 *
 * GET  /api/model-homes          — list all default model homes (onboarding view)
 * GET  /api/model-homes?slug=x   — get a single model home by slug
 * POST /api/model-homes/evaluate — evaluate readiness of a model home config
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFAULT_MODEL_HOMES } from "../shared/model-homes/registry.js";
import { evaluateModelHomeReadiness } from "../server/modelHomes/modelHomeEvaluator.js";
import { listDefaultModelHomeOnboarding } from "../server/modelHomes/modelHomeOnboarding.js";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // POST /api/model-homes/evaluate
  if (req.method === "POST") {
    const body = req.body as { slug?: string } | undefined;
    const slug = body?.slug;
    if (!slug) {
      res.status(400).json({ error: "slug is required in the request body" });
      return;
    }
    const home = DEFAULT_MODEL_HOMES.find((h) => h.slug === slug);
    if (!home) {
      res.status(404).json({ error: `Model home not found: ${slug}` });
      return;
    }
    const result = evaluateModelHomeReadiness(home);
    res.status(200).json({
      ...result,
      provider: "model-homes-evaluator",
      timestamp: new Date().toISOString(),
      metadata: { slug },
    });
    return;
  }

  // GET /api/model-homes?slug=x
  if (req.method === "GET") {
    const slug = typeof req.query.slug === "string" ? req.query.slug : null;

    if (slug) {
      const home = DEFAULT_MODEL_HOMES.find((h) => h.slug === slug);
      if (!home) {
        res.status(404).json({ error: `Model home not found: ${slug}` });
        return;
      }
      res.status(200).json(home);
      return;
    }

    // List onboarding summary for all default homes
    const onboarding = listDefaultModelHomeOnboarding();
    res.status(200).json({ modelHomes: onboarding, total: onboarding.length });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
