import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_DIR = path.join(ROOT, ".next");
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, "build-manifest.json");
const APP_BUILD_MANIFEST_PATH = path.join(NEXT_DIR, "app-build-manifest.json");
const APP_SERVER_DIR = path.join(NEXT_DIR, "server", "app");
const OUTPUT_DIR = path.join(ROOT, "docs", "audits", "artifacts");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "bundle-summary.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function bytesToKb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

if (!fs.existsSync(BUILD_MANIFEST_PATH) && !fs.existsSync(APP_BUILD_MANIFEST_PATH)) {
  console.error("[analyze-bundle] Missing build manifests. Run `npm run build` first.");
  process.exit(1);
}

const buildManifest = fs.existsSync(BUILD_MANIFEST_PATH)
  ? readJson(BUILD_MANIFEST_PATH)
  : {};
const appBuildManifest = fs.existsSync(APP_BUILD_MANIFEST_PATH)
  ? readJson(APP_BUILD_MANIFEST_PATH)
  : {};

const fileSet = new Set(buildManifest?.allFiles ?? []);
for (const files of Object.values(buildManifest?.pages ?? {})) {
  if (!Array.isArray(files)) continue;
  for (const file of files) fileSet.add(file);
}
for (const files of Object.values(appBuildManifest?.pages ?? {})) {
  if (!Array.isArray(files)) continue;
  for (const file of files) fileSet.add(file);
}

const fileSizes = Array.from(fileSet).map((file) => {
  const full = path.join(NEXT_DIR, file);
  return { file, bytes: fileSize(full), kb: bytesToKb(fileSize(full)) };
});

const largestFiles = [...fileSizes].sort((a, b) => b.bytes - a.bytes).slice(0, 30);

const routeEntries = [
  ...Object.entries(buildManifest?.pages ?? {}).map(([route, files]) => ({
    route,
    files,
    kind: "pages",
  })),
  ...Object.entries(appBuildManifest?.pages ?? {}).map(([route, files]) => ({
    route,
    files,
    kind: "app",
  })),
];

const routeBudgets = routeEntries.map(({ route, files, kind }) => {
  const normalizedFiles = Array.isArray(files) ? files : [];
  const routeBytes = normalizedFiles.reduce((sum, file) => {
    const entry = fileSizes.find((s) => s.file === file);
    return sum + (entry?.bytes ?? 0);
  }, 0);

  return {
    route,
    kind,
    bytes: routeBytes,
    kb: bytesToKb(routeBytes),
    files: normalizedFiles,
  };
});

const sortedRoutes = routeBudgets.sort((a, b) => b.bytes - a.bytes);

function collectClientReferenceManifests(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectClientReferenceManifests(fullPath));
      continue;
    }
    if (entry.name.endsWith("page_client-reference-manifest.js")) {
      const relative = path.relative(APP_SERVER_DIR, fullPath);
      files.push({
        route: `/${relative.replace(/\/page_client-reference-manifest\.js$/, "").replace(/\\/g, "/")}`,
        file: fullPath,
        bytes: fileSize(fullPath),
        kb: bytesToKb(fileSize(fullPath)),
      });
    }
  }

  return files;
}

const appRoutePayloads = fs.existsSync(APP_SERVER_DIR)
  ? collectClientReferenceManifests(APP_SERVER_DIR).sort((a, b) => b.bytes - a.bytes)
  : [];

const report = {
  generatedAt: new Date().toISOString(),
  largestFiles,
  routes: sortedRoutes,
  appRoutesByClientManifestSize: appRoutePayloads.slice(0, 50),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

console.log("[analyze-bundle] Report written:", OUTPUT_PATH);
console.log("[analyze-bundle] Top 10 routes by JS payload:");
sortedRoutes.slice(0, 10).forEach((route, index) => {
  console.log(`${index + 1}. ${route.route} -> ${route.kb} KB`);
});

if (appRoutePayloads.length > 0) {
  console.log("[analyze-bundle] Top 10 app routes by client manifest size:");
  appRoutePayloads.slice(0, 10).forEach((route, index) => {
    console.log(`${index + 1}. ${route.route} -> ${route.kb} KB`);
  });
}
