import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_TYPES_DIR = path.join(ROOT, ".next", "types");
const CACHE_LIFE_STUB = path.join(NEXT_TYPES_DIR, "cache-life.d.ts");

fs.mkdirSync(NEXT_TYPES_DIR, { recursive: true });

if (!fs.existsSync(CACHE_LIFE_STUB)) {
  fs.writeFileSync(CACHE_LIFE_STUB, "export {};\n", "utf8");
  console.log("[typecheck] Created .next/types/cache-life.d.ts stub");
}
