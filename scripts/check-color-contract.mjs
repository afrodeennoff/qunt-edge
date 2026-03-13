#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["app", "components"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);
const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);

const FORBIDDEN_HUE_CLASS =
  /\b(?:bg|text|border|from|to|via|ring|stroke|fill)-(?:red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink)-\d{2,3}\b/g;
const FORBIDDEN_COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\((?!\s*var\()/g;

const ALLOWLIST = [
  {
    file: "app/[locale]/(home)/components/Hero.tsx",
    includes: "brand-color-exception",
  },
  {
    file: "app/[locale]/(home)/components/Hero.tsx",
    includes: "#ff4d1a",
  },
  {
    file: "app/[locale]/dashboard/components/filters/tag-widget.tsx",
    includes: "DEFAULT_TAG_COLOR",
  },
  {
    file: "app/[locale]/dashboard/components/filters/filter-command-menu-tag-section.tsx",
    includes: "DEFAULT_TAG_COLOR",
  },
  {
    file: "app/[locale]/dashboard/components/mindset/day-tag-selector.tsx",
    includes: "DEFAULT_TAG_COLOR",
  },
  {
    file: "app/[locale]/admin/components/newsletter/newsletter-audio-player.tsx",
  },
  {
    file: "app/[locale]/admin/components/dashboard/user-growth-chart.tsx",
  },
  {
    file: "app/[locale]/admin/components/dashboard/daily-summary-modal.tsx",
  },
  {
    file: "components/ui/chart.tsx",
  },
  {
    file: "components/ui/dialog.tsx",
  },
  {
    file: "components/ui/accordion.tsx",
  },
  {
    file: "components/ui/dropzone.tsx",
  },
  {
    file: "components/ui/calendar/calendar.tsx",
  },
  {
    file: "app/[locale]/(landing)/deals/_components/deals-market-illustration.tsx",
    includes: "rgba(255,255,255",
  },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, out);
      continue;
    }
    if (EXTENSIONS.has(path.extname(entry.name))) out.push(abs);
  }
  return out;
}

function isAllowlisted(relPath, lineText) {
  if (relPath.startsWith("app/api/")) return true;
  if (relPath.includes("opengraph-image.tsx")) return true;
  if (relPath.startsWith("app/[locale]/shared/")) return true;
  if (relPath.startsWith("app/[locale]/admin/actions/")) return true;
  if (relPath.startsWith("components/emails/")) return true;
  if (relPath === "app/globals.css" || relPath === "styles/tokens.css") return true;
  return ALLOWLIST.some(
    (rule) => rule.file === relPath && (!rule.includes || lineText.includes(rule.includes)),
  );
}

const files = SEARCH_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
const violations = [];

for (const abs of files) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  if (rel.startsWith("components/emails/")) continue;

  const text = fs.readFileSync(abs, "utf8");
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isAllowlisted(rel, line)) continue;
    if (FORBIDDEN_HUE_CLASS.test(line)) {
      violations.push({ type: "hue-class", file: rel, line: i + 1, text: line.trim() });
    }
    FORBIDDEN_HUE_CLASS.lastIndex = 0;
    if (FORBIDDEN_COLOR_LITERAL.test(line)) {
      violations.push({ type: "literal", file: rel, line: i + 1, text: line.trim() });
    }
    FORBIDDEN_COLOR_LITERAL.lastIndex = 0;
  }
}

if (violations.length > 0) {
  console.error(`Color contract violations: ${violations.length}`);
  for (const violation of violations.slice(0, 200)) {
    console.error(
      `[${violation.type}] ${violation.file}:${violation.line} ${violation.text}`,
    );
  }
  if (violations.length > 200) {
    console.error(`... truncated ${violations.length - 200} additional violations`);
  }
  process.exit(1);
}

console.log("Color contract check passed.");
