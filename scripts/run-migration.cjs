const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const env = Object.fromEntries(
  readFileSync(join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const { CONTENTFUL_SPACE_ID, CONTENTFUL_ENVIRONMENT, CONTENTFUL_MANAGEMENT_TOKEN } = env;

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: node scripts/run-migration.cjs <migration-file>");
  process.exit(1);
}

const result = spawnSync(
  "contentful",
  [
    "space",
    "migration",
    "--space-id",
    CONTENTFUL_SPACE_ID,
    "--environment-id",
    CONTENTFUL_ENVIRONMENT,
    "--management-token",
    CONTENTFUL_MANAGEMENT_TOKEN,
    "-y",
    migrationFile,
  ],
  { stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
