import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const BLOCKED = /hugodemenez|hugo[ _-]*demenez/i;
const SELF_FILE = "check-branding.mjs";
const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "dist",
  "build",
  "test-results",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".md",
  ".mdx",
  ".json",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".txt",
]);

const violations = [];

function scanDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      scanDir(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    if (entry.name === SELF_FILE) continue;
    if (!ALLOWED_EXTENSIONS.has(extname(entry.name))) continue;

    const size = statSync(fullPath).size;
    if (size > 2_000_000) continue;

    const content = readFileSync(fullPath, "utf8");
    if (!BLOCKED.test(content)) continue;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (BLOCKED.test(lines[i])) {
        violations.push(`${fullPath}:${i + 1}`);
      }
    }
  }
}

scanDir(ROOT);

if (violations.length > 0) {
  console.error("Branding guard failed: blocked name found.");
  for (const hit of violations) {
    console.error(`- ${hit}`);
  }
  process.exit(1);
}

console.log("Branding guard passed.");
