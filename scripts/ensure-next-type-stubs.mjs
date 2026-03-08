import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_TYPES_DIR = path.join(ROOT, ".next", "types");
const NEXT_DEV_TYPES_DIR = path.join(ROOT, ".next", "dev", "types");
const CACHE_LIFE_STUB = path.join(NEXT_TYPES_DIR, "cache-life.d.ts");
const CACHE_LIFE_DEV_STUB = path.join(NEXT_DEV_TYPES_DIR, "cache-life.d.ts");

fs.mkdirSync(NEXT_TYPES_DIR, { recursive: true });
fs.mkdirSync(NEXT_DEV_TYPES_DIR, { recursive: true });

fs.writeFileSync(CACHE_LIFE_STUB, "export {};\n", "utf8");
fs.writeFileSync(CACHE_LIFE_DEV_STUB, "export {};\n", "utf8");
console.log("[typecheck] Ensured cache-life.d.ts stubs");
