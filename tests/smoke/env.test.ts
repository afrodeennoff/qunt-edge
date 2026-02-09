import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("environment validation", () => {
  it("parses runtime environment with sane defaults", () => {
    const env = getEnv();
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });
});
