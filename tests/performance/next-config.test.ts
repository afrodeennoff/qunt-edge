import { describe, expect, it } from "vitest";
import { resolveOptimizationSettings } from "@/lib/performance/next-config";

describe("Next optimization config", () => {
  it("falls back to safe defaults for invalid cpu values", () => {
    const settings = resolveOptimizationSettings({
      NEXT_BUILD_CPUS: "-4",
      VERCEL: undefined,
      NEXT_PUBLIC_CDN_URL: undefined,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_STANDALONE: undefined,
      NEXT_OUTPUT_STANDALONE: undefined,
    });

    expect(settings.buildCpus).toBe(1);
  });

  it("uses standalone output when standalone flags are enabled", () => {
    const settings = resolveOptimizationSettings({
      NEXT_STANDALONE: "1",
      NEXT_OUTPUT_STANDALONE: undefined,
      NEXT_BUILD_CPUS: undefined,
      VERCEL: undefined,
      NEXT_PUBLIC_CDN_URL: undefined,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
    });

    expect(settings.output).toBe("standalone");
  });

  it("normalizes valid asset prefix and supabase host", () => {
    const settings = resolveOptimizationSettings({
      NEXT_PUBLIC_CDN_URL: "https://cdn.example.com/",
      NEXT_PUBLIC_SUPABASE_URL: "https://abcxyz.supabase.co",
      NEXT_STANDALONE: undefined,
      NEXT_OUTPUT_STANDALONE: undefined,
      NEXT_BUILD_CPUS: undefined,
      VERCEL: undefined,
    });

    expect(settings.assetPrefix).toBe("https://cdn.example.com");
    expect(settings.supabaseHostname).toBe("abcxyz.supabase.co");
    expect(settings.warnings).toEqual([]);
  });

  it("emits warnings for invalid URLs", () => {
    const settings = resolveOptimizationSettings({
      NEXT_PUBLIC_CDN_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_URL: "still-not-a-url",
      NEXT_STANDALONE: undefined,
      NEXT_OUTPUT_STANDALONE: undefined,
      NEXT_BUILD_CPUS: undefined,
      VERCEL: undefined,
    });

    expect(settings.assetPrefix).toBeUndefined();
    expect(settings.supabaseHostname).toBeUndefined();
    expect(settings.warnings.length).toBe(2);
  });
});
