import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createImportManifestTemplate } from "../config/importTemplates";

function main(): void {
  const outputPath = resolve(process.argv[2] ?? "import-manifest.template.json");
  const manifest = createImportManifestTemplate();
  writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`Created ${outputPath}`);
  console.log("Fill this manifest with buyer-owned sources only.");
}

main();
