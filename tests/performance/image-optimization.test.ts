import { describe, expect, it } from "vitest";
import { getCdnImageUrl, optimizeImageUrl } from "@/lib/performance/image-optimization";

describe("image optimization helpers", () => {
  it("returns original URL when optimizeImageUrl receives invalid input", () => {
    expect(optimizeImageUrl("invalid-url", 1200)).toBe("invalid-url");
    expect(optimizeImageUrl("/static/hero.png", 1200)).toBe("/static/hero.png");
    expect(optimizeImageUrl("https://cdn.example.com/image.png", 0)).toBe(
      "https://cdn.example.com/image.png",
    );
  });

  it("adds width and quality for valid remote image URLs", () => {
    const optimized = optimizeImageUrl("https://cdn.example.com/image.png", 1200, 80);
    expect(optimized).toContain("w=1200");
    expect(optimized).toContain("q=80");
  });

  it("returns original path when CDN URL is unavailable", () => {
    expect(getCdnImageUrl("/hero.png", 1280, 80)).toBe("/hero.png");
  });
});
