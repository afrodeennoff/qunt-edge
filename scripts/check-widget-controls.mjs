import { readFileSync } from "node:fs";
import { join } from "node:path";

const widgetCanvasPath = join(
  process.cwd(),
  "app/[locale]/dashboard/components/widget-canvas.tsx"
);

const source = readFileSync(widgetCanvasPath, "utf8");

const hasLegacyAlwaysVisiblePattern =
  source.includes("top-2 right-2 flex gap-2 opacity-100 z-10") ||
  source.includes("className=\"absolute top-2 right-2 flex gap-2 opacity-100 z-10\"");

const hasExpectedHoverBehavior =
  source.includes("isMobile") &&
  source.includes("opacity-0 group-hover:opacity-100 group-focus-within:opacity-100");

if (hasLegacyAlwaysVisiblePattern || !hasExpectedHoverBehavior) {
  console.error("Widget controls guard failed.");
  if (hasLegacyAlwaysVisiblePattern) {
    console.error("- Found always-visible controls pattern.");
  }
  if (!hasExpectedHoverBehavior) {
    console.error("- Missing required hover-only desktop behavior.");
  }
  process.exit(1);
}

console.log("Widget controls guard passed.");
