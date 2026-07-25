import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv, type PluginOption } from "vite";

const METICULOUS_RECORDING_TOKEN_FALLBACK =
  "oA1u6RTNxVPySyjd0KKDvIASb1lLZkhFHOwThjsB";

type MeticulousPluginOptions = {
  enabled: boolean;
  recordingToken: string;
  isProductionEnvironment: boolean;
};

/**
 * Meticulous Recorder
 * -------------------
 * Replaces the first-tag placeholder in client/index.html.
 *
 * Local development:
 *   Recorder enabled, marked non-production.
 *
 * Actual production deployment:
 *   Recorder enabled only when VITE_METICULOUS_RECORDING_ENABLED=true,
 *   and marked as production.
 *
 * Meticulous CI replay build:
 *   Recorder disabled when METICULOUS_BUILD=true so a replay never records
 *   itself as a new user session.
 */
function createMeticulousRecordingPlugin(
  options: MeticulousPluginOptions,
): PluginOption {
  return {
    name: "inject-meticulous",
    transformIndexHtml(html) {
      const snippet =
        options.enabled && options.recordingToken
          ? `<script
          id="meticulous"
          data-recording-token="${options.recordingToken}"
          data-is-production-environment="${
            options.isProductionEnvironment ? "true" : "false"
          }"
          src="https://snippet.meticulous.ai/v1/meticulous.js"
        ></script>`
          : "";

      return html.replace(
        /<script\s+id="meticulous"[\s\S]*?<\/script>/,
        snippet,
      );
    },
  };
}

const DEV_SERVER_PORT = 3000;
const DEFAULT_DEV_API_PROXY_TARGET = "https://gestaltview-one.vercel.app/";

function normalizeProxyTarget(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.startsWith("//")) {
    return `https:${withoutTrailingSlash}`;
  }

  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function isSelfReferentialDevProxyTarget(value: string): boolean {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const port =
      parsed.port ||
      (parsed.protocol === "https:"
        ? "443"
        : parsed.protocol === "http:"
          ? "80"
          : "");

    const isLoopback =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    return isLoopback && port === String(DEV_SERVER_PORT);
  } catch {
    return false;
  }
}

function resolveApiProxyTarget(env: Record<string, string>): string {
  const candidates = [
    env.VITE_API_PROXY_TARGET,
    env.VITE_API_BASE_URL,
    env.VITE_BILLY_API_URL,
    DEFAULT_DEV_API_PROXY_TARGET,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeProxyTarget(candidate || "");
    if (!normalized) {
      continue;
    }

    if (isSelfReferentialDevProxyTarget(normalized)) {
      console.warn(
        `[vite] ignoring self-referential /api proxy target ${normalized}; falling through to the next candidate`,
      );
      continue;
    }

    return normalized;
  }

  return DEFAULT_DEV_API_PROXY_TARGET;
}

export default defineConfig(async ({ mode }) => {
  const repoRoot = path.resolve(import.meta.dirname);
  const clientRoot = path.resolve(import.meta.dirname, "client");
  const env = {
    ...loadEnv("vercel", repoRoot, ""),
    ...loadEnv("vercel", clientRoot, ""),
    ...loadEnv(mode, repoRoot, ""),
    ...loadEnv(mode, clientRoot, ""),
  };

  const isProductionMode = mode === "production";
  const isMeticulousReplayBuild = process.env.METICULOUS_BUILD === "true";
  const productionRecordingEnabled =
    env.VITE_METICULOUS_RECORDING_ENABLED === "true";

  const meticulousRecordingEnabled =
    !isMeticulousReplayBuild &&
    (!isProductionMode || productionRecordingEnabled);

  const meticulousRecordingToken =
    env.VITE_METICULOUS_RECORDING_TOKEN ||
    METICULOUS_RECORDING_TOKEN_FALLBACK;

  const apiProxyTarget = resolveApiProxyTarget(env);
  const spotifyClientId =
    env.VITE_SPOTIFY_CLIENT_ID || env.SPOTIFY_CLIENT_ID || "";
  const spotifyRedirectUri =
    env.VITE_SPOTIFY_REDIRECT_URI || env.SPOTIFY_REDIRECT_URI || "";
  const sentryOrg = env.SENTRY_ORG || "gestaltview-digital-intelligen";
  const sentryProject = env.SENTRY_PROJECT || "sentry-indigo-cognition";
  const shouldUploadSentrySourceMaps = Boolean(env.SENTRY_AUTH_TOKEN);
  const sentryPlugins: PluginOption[] = [];

  if (shouldUploadSentrySourceMaps) {
    const { sentryVitePlugin } = await import("@sentry/vite-plugin");
    sentryPlugins.push(
      sentryVitePlugin({
        org: sentryOrg,
        project: sentryProject,
        authToken: env.SENTRY_AUTH_TOKEN,
        silent: !env.CI,
        telemetry: false,
        release: {
          name: env.SENTRY_RELEASE || env.VERCEL_GIT_COMMIT_SHA,
          inject: true,
        },
        sourcemaps: {
          assets: [
            "./dist/public/assets/**/*.js",
            "./dist/public/assets/**/*.js.map",
          ],
          filesToDeleteAfterUpload: ["./dist/public/assets/**/*.js.map"],
        },
      }),
    );
  }

  return {
    define: {
      "import.meta.env.VITE_SPOTIFY_CLIENT_ID": JSON.stringify(
        spotifyClientId,
      ),
      "import.meta.env.VITE_SPOTIFY_REDIRECT_URI": JSON.stringify(
        spotifyRedirectUri,
      ),
    },
    plugins: [
      createMeticulousRecordingPlugin({
        enabled: meticulousRecordingEnabled,
        recordingToken: meticulousRecordingToken,
        isProductionEnvironment: isProductionMode,
      }),
      react(),
      tailwindcss(),
      ...sentryPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@config": path.resolve(import.meta.dirname, "config"),
      },
    },
    root: clientRoot,
    build: {
      sourcemap: shouldUploadSentrySourceMaps ? "hidden" : true,
      reportCompressedSize: false,
      minify: false,
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: DEV_SERVER_PORT,
      host: true,
      fs: {
        strict: true,
        allow: [repoRoot],
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: apiProxyTarget.startsWith("https://"),
        },
      },
    },
  };
});
