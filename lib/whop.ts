import 'server-only'
import Whop from "@whop/sdk";

let whopInstance: Whop | null = null;

export const getWhop = () => {
  if (!whopInstance) {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey && process.env.NODE_ENV === 'production') {
      console.warn("WHOP_API_KEY is missing in production!");
    }
    whopInstance = new Whop({
      apiKey: apiKey || "dummy_key_for_build"
    });
  }
  return whopInstance;
};

// Default export for convenience
export const whop = getWhop();
