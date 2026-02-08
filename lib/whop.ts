import 'server-only'
import Whop from "@whop/sdk";

let whopInstance: Whop | null = null;

export const getWhop = () => {
  if (!whopInstance) {
    whopInstance = new Whop({
      apiKey: process.env.WHOP_API_KEY as string
    });
  }
  return whopInstance;
};

// Deprecated export for backward compatibility - use getWhop() instead
export const whop = new Whop({
  apiKey: process.env.WHOP_API_KEY || "dummy_key_for_build"
});
