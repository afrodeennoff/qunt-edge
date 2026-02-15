import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, ".next");
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, "build-manifest.json");
const APP_SERVER_DIR = path.join(NEXT_DIR, "server", "app");
const DEFAULT_ROUTE_BUDGET_KB = Number(process.env.ROUTE_BUDGET_KB ?? 300);
const HIGH_PRIORITY_ROUTE_BUDGET_KB = Number(process.env.HIGH_PRIORITY_ROUTE_BUDGET_KB ?? 80);
const HIGH_PRIORITY_ROUTES = ["/[locale]/(home)", "/[locale]/dashboard"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sizeInBytes(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function toKb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

if (!fs.existsSync(BUILD_MANIFEST_PATH)) {
  console.error("[route-budgets] Missing .next/build-manifest.json. Run `npm run build` first.");
  process.exit(1);
}

const manifest = readJson(BUILD_MANIFEST_PATH);
const pages = manifest?.pages ?? {};
const allFiles = manifest?.allFiles ?? [];

const fileSizes = new Map(
  allFiles.map((file) => [file, sizeInBytes(path.join(NEXT_DIR, file))])
);

const violations = [];
const results = [];

for (const [route, files] of Object.entries(pages)) {
  const bytes = files.reduce((sum, file) => sum + (fileSizes.get(file) ?? 0), 0);
  const kb = toKb(bytes);
  const budgetKb = HIGH_PRIORITY_ROUTES.includes(route)
    ? HIGH_PRIORITY_ROUTE_BUDGET_KB
    : DEFAULT_ROUTE_BUDGET_KB;

  const withinBudget = kb <= budgetKb;
  results.push({ route, kb, budgetKb, withinBudget });

  if (!withinBudget) {
    violations.push({ route, kb, budgetKb });
  }
}

results
  .sort((a, b) => b.kb - a.kb)
  .slice(0, 15)
  .forEach((result) => {
    console.log(
      `[route-budgets] ${result.route}: ${result.kb} KB (budget ${result.budgetKb} KB)`
    );
  });

if (violations.length > 0) {
  console.error("[route-budgets] Budget violations detected:");
  violations.forEach((v) => {
    console.error(`- ${v.route}: ${v.kb} KB > ${v.budgetKb} KB`);
  });
  process.exit(1);
}

function collectClientReferenceManifests(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routeFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routeFiles.push(...collectClientReferenceManifests(fullPath));
      continue;
    }
    if (entry.name.endsWith("page_client-reference-manifest.js")) {
      const route = `/${path
        .relative(APP_SERVER_DIR, fullPath)
        .replace(/\\/g, "/")
        .replace(/\/page_client-reference-manifest\.js$/, "")}`;
      routeFiles.push({
        route,
        kb: toKb(sizeInBytes(fullPath)),
      });
    }
  }

  return routeFiles;
}

if (fs.existsSync(APP_SERVER_DIR)) {
  const appRoutes = collectClientReferenceManifests(APP_SERVER_DIR);
  appRoutes.forEach((entry) => {
    const budgetKb = HIGH_PRIORITY_ROUTES.includes(entry.route)
      ? HIGH_PRIORITY_ROUTE_BUDGET_KB
      : DEFAULT_ROUTE_BUDGET_KB;
    if (entry.kb > budgetKb) {
      violations.push({ route: entry.route, kb: entry.kb, budgetKb });
    }
  });
}

if (violations.length > 0) {
  console.error("[route-budgets] Budget violations detected:");
  violations.forEach((v) => {
    console.error(`- ${v.route}: ${v.kb} KB > ${v.budgetKb} KB`);
  });
  process.exit(1);
}

console.log("[route-budgets] All page and app route budgets are within threshold.");
