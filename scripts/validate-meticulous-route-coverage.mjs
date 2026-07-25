import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routeSourcePath = path.join(repoRoot, "client/src/App.tsx");
const routeRegexPath = path.join(
  repoRoot,
  "docs/meticulously-route-index-regex-strict.txt",
);

export function extractClientRoutes(source) {
  return [...source.matchAll(/<Route\b[^>]*\bpath="([^"]+)"/g)].map(
    (match) => match[1],
  );
}

export function materializeRoutePattern(route) {
  return route.replace(/:([^/]+)/g, "__meticulous__");
}

export function findUncoveredRoutes(routes, routeRegexSource) {
  const routeMatcher = new RegExp(routeRegexSource);
  return routes.filter(
    (route) => !routeMatcher.test(materializeRoutePattern(route)),
  );
}

export function validateMeticulousRouteCoverage({ routeSource, routeRegex }) {
  const routes = extractClientRoutes(routeSource);
  const uncoveredRoutes = findUncoveredRoutes(routes, routeRegex);

  if (routes.length === 0) {
    throw new Error("No client routes were found in client/src/App.tsx");
  }

  if (uncoveredRoutes.length > 0) {
    throw new Error(
      [
        "Meticulous strict route coverage is missing client routes:",
        ...uncoveredRoutes.map((route) => `- ${route}`),
        `Update docs/meticulously-route-index-regex-strict.txt to cover ${uncoveredRoutes.length === 1 ? "this route" : "these routes"}.`,
      ].join("\n"),
    );
  }

  return {
    routeCount: routes.length,
    uncoveredRoutes,
  };
}

export function main() {
  const result = validateMeticulousRouteCoverage({
    routeSource: readFileSync(routeSourcePath, "utf8"),
    routeRegex: readFileSync(routeRegexPath, "utf8").trim(),
  });

  console.log(
    `Validated ${result.routeCount} client routes against ${path.relative(repoRoot, routeRegexPath)}`,
  );
}

const invokedScript = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === invokedScript) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
