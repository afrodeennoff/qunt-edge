import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SECURITY_MANIFEST = [
  {
    route: "app/api/team/invite/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
  {
    route: "app/api/etp/v1/store/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
  {
    route: "app/api/thor/store/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
  {
    route: "app/api/tradovate/sync/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
  {
    route: "app/api/rithmic/synchronizations/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
  {
    route: "app/api/admin/subscriptions/route.ts",
    requireAuth: true,
    requireRateLimit: true,
    requireValidation: true,
    disallowRawErrorDetails: true,
  },
];

const AUTH_PATTERNS = [
  /requireServiceAuth/,
  /assertAdminAccess/,
  /createRouteClient\([^)]*\)[\s\S]{0,200}auth\.getUser\(/,
  /authenticateRequest\(/,
];

const RATE_PATTERNS = [/rateLimit\(/, /createRateLimitResponse\(/];
const VALIDATION_PATTERNS = [/parseJson\(/, /parseQuery\(/];
const RAW_DETAIL_PATTERNS = [
  /details\s*:\s*error\s+instanceof\s+Error\s*\?\s*error\.message/i,
  /details\s*:\s*error\.message/i,
];

function hasAnyPattern(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function run() {
  const failures = [];

  for (const entry of SECURITY_MANIFEST) {
    const filePath = path.join(ROOT, entry.route);
    if (!fs.existsSync(filePath)) {
      failures.push(`${entry.route}: missing file`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    if (entry.requireAuth && !hasAnyPattern(content, AUTH_PATTERNS)) {
      failures.push(`${entry.route}: missing auth guard pattern`);
    }

    if (entry.requireRateLimit && !hasAnyPattern(content, RATE_PATTERNS)) {
      failures.push(`${entry.route}: missing rate limit pattern`);
    }

    if (entry.requireValidation && !hasAnyPattern(content, VALIDATION_PATTERNS)) {
      failures.push(`${entry.route}: missing parseJson/parseQuery validation pattern`);
    }

    if (entry.disallowRawErrorDetails && hasAnyPattern(content, RAW_DETAIL_PATTERNS)) {
      failures.push(`${entry.route}: raw internal error details exposed in response payload`);
    }
  }

  if (failures.length > 0) {
    console.error("[check:route-security] Security contract violations:");
    for (const failure of failures) {
      console.error(` - ${failure}`);
    }
    process.exit(1);
  }

  console.log("[check:route-security] All route security contracts pass.");
}

run();
