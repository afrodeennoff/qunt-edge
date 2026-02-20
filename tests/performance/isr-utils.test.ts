import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.fn();
const revalidateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}));

describe("ISR utility safety", () => {
  beforeEach(() => {
    revalidatePathMock.mockReset();
    revalidateTagMock.mockReset();
  });

  it("returns true when revalidation succeeds", async () => {
    const { ISRManager } = await import("@/lib/performance/isr-utils");
    const isr = ISRManager.getInstance();

    expect(isr.revalidatePath("/dashboard")).toBe(true);
    expect(isr.revalidateByTag("dashboard")).toBe(true);
  });

  it("returns false instead of throwing on revalidation failure", async () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("failed");
    });
    revalidateTagMock.mockImplementation(() => {
      throw new Error("failed");
    });
    const { ISRManager } = await import("@/lib/performance/isr-utils");
    const isr = ISRManager.getInstance();

    expect(isr.revalidatePath("/dashboard")).toBe(false);
    expect(isr.revalidateByTag("dashboard")).toBe(false);
  });
});
