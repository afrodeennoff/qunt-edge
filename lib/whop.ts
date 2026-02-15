import 'server-only'
import Whop from "@whop/sdk";

let whopInstance: Whop | null = null;
const isProductionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const getWhop = () => {
  if (!whopInstance) {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey && process.env.NODE_ENV === 'production' && !isProductionBuildPhase) {
      console.warn("WHOP_API_KEY is missing in production!");
    }
    whopInstance = new Whop({
      apiKey: apiKey || "dummy_key_for_build"
    });
  }
  return whopInstance;
};

// Lazy proxy avoids eager SDK initialization during app boot/build import.
export const whop = new Proxy({} as Whop, {
  get(_target, property, receiver) {
    return Reflect.get(getWhop() as unknown as object, property, receiver);
  },
});

export const parseWhopDate = (value: string | number | null | undefined): Date | undefined => {
  if (value === null || value === undefined) return undefined;

  // If it's a number, assume seconds
  if (typeof value === 'number') {
    return new Date(value * 1000);
  }

  // If it's a string
  if (typeof value === 'string') {
    // Check if it's a string of digits (seconds)
    if (/^\d+$/.test(value)) {
      return new Date(parseInt(value, 10) * 1000);
    }
    // Otherwise assume ISO string or other date format
    return new Date(value);
  }

  return undefined;
};
