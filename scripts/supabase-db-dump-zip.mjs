import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const artifactsDir = path.join(repoRoot, "artifacts");

function usage() {
  process.stdout.write(
    [
      "Usage:",
      "  node scripts/supabase-db-dump-zip.mjs [options]",
      "",
      "Options:",
      "  --output, -o <path>       Zip output path. Defaults to artifacts/supabase-db-dump-YYYY-MM-DD.zip",
      "  --db-url <url>            Dump from a raw Postgres connection string (will be percent-encoded)",
      "  --linked                  Dump from the linked Supabase project",
      "  --local                   Dump from the local Supabase database",
      "  --data-only               Include only table data",
      "  --use-copy                Use COPY statements instead of inserts",
      "  --exclude, -x <table>     Exclude schema.table entries from a data-only dump",
      "  --role-only               Dump only cluster roles",
      "  --keep-comments           Preserve commented lines from pg_dump output",
      "  --schema, -s <schema>     Comma-separated schema list to include",
      "  --password, -p <value>    Password for the remote Postgres database",
      "  --dry-run                 Print the pg_dump script without executing it",
      "  --help, -h                Show this help text",
      "",
      "Notes:",
      "  - If no source is provided, the script prefers DATABASE_URL or SUPABASE_DB_URL,",
      "    then falls back to --linked.",
      "  - The script writes the raw dump to a temp file and zips that file into the target archive.",
    ].join("\n")
  );
}

function parseArgs(argv) {
  const options = {
    output: null,
    dbUrl: null,
    linked: false,
    local: false,
    dataOnly: false,
    useCopy: false,
    roleOnly: false,
    keepComments: false,
    dryRun: false,
    schema: null,
    exclude: [],
    password: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      options.output = argv[++index] ?? null;
      continue;
    }

    if (arg === "--db-url") {
      options.dbUrl = argv[++index] ?? null;
      continue;
    }

    if (arg === "--schema" || arg === "-s") {
      options.schema = argv[++index] ?? null;
      continue;
    }

    if (arg === "--exclude" || arg === "-x") {
      const value = argv[++index];
      if (value) options.exclude.push(value);
      continue;
    }

    if (arg === "--password" || arg === "-p") {
      options.password = argv[++index] ?? null;
      continue;
    }

    if (arg === "--linked") {
      options.linked = true;
      continue;
    }

    if (arg === "--local") {
      options.local = true;
      continue;
    }

    if (arg === "--data-only") {
      options.dataOnly = true;
      continue;
    }

    if (arg === "--use-copy") {
      options.useCopy = true;
      continue;
    }

    if (arg === "--role-only") {
      options.roleOnly = true;
      continue;
    }

    if (arg === "--keep-comments") {
      options.keepComments = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function createTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function resolveSource(options) {
  if (options.dbUrl) {
    return ["--db-url", options.dbUrl];
  }

  if (options.local) {
    return ["--local"];
  }

  if (options.linked) {
    return ["--linked"];
  }

  const envDbUrl = (process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? "").trim();
  if (envDbUrl.startsWith("postgres://") || envDbUrl.startsWith("postgresql://")) {
    return ["--db-url", envDbUrl];
  }

  return ["--linked"];
}

function buildDumpArgs(options, dumpFile) {
  const args = ["exec", "supabase", "db", "dump", "--file", dumpFile];
  args.push(...resolveSource(options));

  if (options.dataOnly) args.push("--data-only");
  if (options.useCopy) args.push("--use-copy");
  if (options.roleOnly) args.push("--role-only");
  if (options.keepComments) args.push("--keep-comments");
  if (options.schema) {
    args.push("--schema", options.schema);
  }

  for (const exclude of options.exclude) {
    args.push("--exclude", exclude);
  }

  if (options.password) {
    args.push("--password", options.password);
  }

  if (options.dryRun) {
    args.push("--dry-run");
  }

  return args;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let tempDir = "";
  let outputZip = "";

  if (options.help) {
    usage();
    return;
  }

  const timestamp = createTimestamp();
  const dumpStem = `supabase-db-dump-${timestamp}`;
  outputZip = path.resolve(
    repoRoot,
    options.output ?? path.join("artifacts", `${dumpStem}.zip`)
  );
  tempDir = await mkdtemp(path.join(os.tmpdir(), "gestaltview-supabase-dump-"));
  const dumpFile = path.join(tempDir, `${dumpStem}.sql`);

  await mkdir(path.dirname(outputZip), { recursive: true });

  const env = {
    ...process.env,
    HOME: process.env.HOME ?? os.tmpdir(),
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME ?? os.tmpdir(),
    SUPABASE_TELEMETRY_DISABLED: "1",
  };

  const supabaseResult = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    buildDumpArgs(options, dumpFile),
    {
      cwd: repoRoot,
      stdio: "inherit",
      env,
    }
  );

  if (supabaseResult.status !== 0) {
    throw new Error("Supabase database dump failed.");
  }

  const zipResult = spawnSync("zip", ["-j", outputZip, dumpFile], {
    cwd: tempDir,
    stdio: "inherit",
  });

  if (zipResult.status !== 0) {
    throw new Error("Zip archive creation failed.");
  }

  process.stdout.write(`Wrote ${path.relative(repoRoot, outputZip)}\n`);

  await rm(tempDir, { recursive: true, force: true });
}

main().catch(async (error) => {
  console.error(error);
  try {
    const cleanupTargets = [];
    if (outputZip) {
      cleanupTargets.push(outputZip);
    }
    if (tempDir) {
      cleanupTargets.push(tempDir);
    }
    await Promise.all(
      cleanupTargets.map(async (target) => {
        await rm(target, { recursive: true, force: true }).catch(() => {});
      })
    );
  } catch {
    // ignore cleanup errors
  }
  process.exitCode = 1;
});
