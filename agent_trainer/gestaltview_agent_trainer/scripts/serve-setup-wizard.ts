import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const packageRoot = resolve(scriptDir, "..");

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

function resolveRequestPath(urlPath: string): string {
  if (urlPath === "/" || urlPath === "/setup" || urlPath === "/setup/") {
    return resolve(packageRoot, "setup", "setup-wizard.html");
  }

  const normalized = urlPath.replace(/^\/+/, "");
  return resolve(packageRoot, normalized);
}

async function main(): Promise<void> {
  const port = Number(process.env.PORT ?? "4177");

  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
    const filePath = resolveRequestPath(requestUrl.pathname);

    try {
      const file = await readFile(filePath);
      const extension = extname(filePath);
      const contentType = mimeTypes[extension] ?? "application/octet-stream";
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store"
      });
      response.end(file);
    } catch {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end("Not found");
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Setup wizard available at http://127.0.0.1:${port}/setup/`);
    console.log("If you are using a remote host, open that URL through your forwarded port or tunnel.");
  });
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  console.error("Unknown setup wizard server failure.");
  process.exitCode = 1;
});
