import { describe, expect, it } from "vitest";
import { ensureOwnedImagePath } from "@/lib/trade-image-path";

describe("trade image ownership guard", () => {
  it("allows paths that belong to the active actor", () => {
    const prefix = "actor-abc/";
    const path = "actor-abc/trades/2026/inspection.png";
    expect(ensureOwnedImagePath(path, prefix)).toBe(path);
  });

  it("rejects when the actor prefix is missing", () => {
    expect(() => ensureOwnedImagePath("actor-abc/trades/img.png", null)).toThrow(
      /actor context/i
    );
  });

  it("rejects paths belonging to other actors", () => {
    const prefix = "user-123/";
    const externalPath = "user-456/trades/forgery.jpg";
    expect(() => ensureOwnedImagePath(externalPath, prefix)).toThrow(
      /current actor/i
    );
  });

  it("rejects paths that try to escape via relative segments", () => {
    const prefix = "actor-secure/";
    const sneakyPath = "actor-secure/../actor-hq/secrets.png";
    expect(() => ensureOwnedImagePath(sneakyPath, prefix)).toThrow(
      /relative segments/i
    );
  });

  it("normalizes separators, dot segments, and whitespace before returning the path", () => {
    const prefix = "actor-abc/";
    const messyPath = "  actor-abc\\\\//trades/./2026\\inspection.png  ";
    expect(ensureOwnedImagePath(messyPath, prefix)).toBe(
      "actor-abc/trades/2026/inspection.png"
    );
  });

  it("normalizes the actor prefix before evaluating ownership", () => {
    const prefix = "/actor-abc\\";
    const path = "\\actor-abc\\trades\\2026\\inspection.png";
    expect(ensureOwnedImagePath(path, prefix)).toBe(
      "actor-abc/trades/2026/inspection.png"
    );
  });

  it("rejects encoded traversal segments", () => {
    const prefix = "actor-abc/";
    const encodedPath = "actor-abc/trades/%2e%2e/secret.png";
    expect(() => ensureOwnedImagePath(encodedPath, prefix)).toThrow(
      /relative segments/i
    );
  });

  it("rejects paths that contain control characters", () => {
    const prefix = "actor-abc/";
    const controlCharPath = "actor-abc/trades/base\u0000image.png";
    expect(() => ensureOwnedImagePath(controlCharPath, prefix)).toThrow(
      /invalid characters/i
    );
  });

  it("rejects whitespace-only actor prefixes", () => {
    const path = "actor-abc/trades/inspection.png";
    expect(() => ensureOwnedImagePath(path, "   ")).toThrow(/actor context/i);
  });
});
