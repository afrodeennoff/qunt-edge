import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const ROUTE_CONTRACTS = [
  "app/api/team/invite/route.ts",
  "app/api/etp/v1/store/route.ts",
  "app/api/thor/store/route.ts",
  "app/api/tradovate/sync/route.ts",
  "app/api/rithmic/synchronizations/route.ts",
  "app/api/admin/subscriptions/route.ts",
];

describe("security route contracts", () => {
  it("enforces auth + rate limit + validation on critical mutation routes", () => {
    for (const routePath of ROUTE_CONTRACTS) {
      const absolutePath = path.join(ROOT, routePath);
      const content = fs.readFileSync(absolutePath, "utf8");

      expect(content, `${routePath} should include auth guard`).toMatch(
        /(assertAdminAccess|authenticateRequest|auth\.getUser\()/
      );
      expect(content, `${routePath} should include rate limiting`).toMatch(/rateLimit\(/);
      expect(content, `${routePath} should include schema validation`).toMatch(
        /(parseJson\(|parseQuery\()/
      );
      expect(content, `${routePath} should not expose raw error details`).not.toMatch(
        /details\s*:\s*error\s+instanceof\s+Error\s*\?\s*error\.message/i
      );
    }
  });
});
