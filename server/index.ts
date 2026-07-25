import "../instrument.js";
import type { ErrorRequestHandler } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";
import { initNodeSentry } from "../api/_lib/sentry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  initNodeSentry({
    runtime: "express-static-server",
  });

  const { default: express } = await import("express");
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("/debug-sentry", (_req, res) => {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SENTRY_DEBUG_ENDPOINT_ENABLED !== "true"
    ) {
      res.status(404).end();
      return;
    }

    Sentry.logger.info("User triggered test error", {
      action: "test_error_endpoint",
      runtime: "express-static-server",
    });
    Sentry.metrics.count("test_counter", 1);
    throw new Error("My first Sentry error!");
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  Sentry.setupExpressErrorHandler(app);

  const fallbackErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("[server] Unhandled request error:", err);
    res.status(500).send("Internal Server Error");
  };

  app.use(fallbackErrorHandler);

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
