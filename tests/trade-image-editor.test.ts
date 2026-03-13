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
});
