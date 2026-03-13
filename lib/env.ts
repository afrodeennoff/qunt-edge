import { z } from "zod";

const optionalString = () =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().optional()
  );

const optionalUrl = () =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url().optional()
  );

const optionalMinString = (minLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(minLength).optional()
  );

const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:+/-]*$/;
const optionalModelId = () =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(MODEL_ID_PATTERN, "Invalid model identifier format").optional()
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: optionalString(),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalMinString(1),
  NEXT_PUBLIC_UI_V2_ENABLED: optionalString(),
  CRON_SECRET: optionalMinString(1),
  UNSUBSCRIBE_TOKEN_SECRET: optionalMinString(32),
  OPENAI_API_KEY: optionalMinString(1),
  AI_BASE_URL: optionalUrl(),
  AI_MODEL: optionalModelId(), // legacy alias
  AI_MODEL_DEFAULT: optionalModelId(),
  AI_MODEL_CHAT: optionalModelId(),
  AI_MODEL_SUPPORT: optionalModelId(),
  AI_MODEL_EDITOR: optionalModelId(),
  AI_MODEL_MAPPINGS: optionalModelId(),
  AI_MODEL_FORMAT_TRADES: optionalModelId(),
  AI_MODEL_ANALYSIS: optionalModelId(),
  AI_MODEL_SEARCH: optionalModelId(),
  AI_TIMEOUT_MS: optionalString(),
  AI_MAX_STEPS: optionalString(),
  AI_LOG_SAMPLE_RATE: optionalString(),
  HEALTH_DETAILS_PUBLIC: optionalString(),
  CSP_ENABLED: optionalString(),
  CSP_REPORT_ONLY: optionalString(),
  CSP_STRICT_MODE: optionalString(),
  REDIS_URL: optionalString(),
  UPSTASH_REDIS_REST_URL: optionalUrl(),
  UPSTASH_REDIS_REST_TOKEN: optionalMinString(1),
  OPENROUTER_API_KEY: optionalMinString(1),
  AI_ROUTER_ENABLED: optionalString(),
  AI_ROUTER_MODEL_FREE: optionalModelId(),
  AI_ROUTER_MODEL_AUTO: optionalModelId(),
  AI_ROUTER_MODEL_LIQUID: optionalModelId(),
  AI_ROUTER_LIQUID_MODEL: optionalString(),
  AI_ROUTER_PROVIDER_ORDER: optionalString(),
  AI_ROUTER_MAX_PRICE_INPUT: optionalString(),
  AI_ROUTER_MAX_PRICE_OUTPUT: optionalString(),
}).superRefine((env, ctx) => {
  const routerEnabled = env.AI_ROUTER_ENABLED === "true";
  if (env.NODE_ENV === "production" && routerEnabled && !env.OPENROUTER_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENROUTER_API_KEY"],
      message: "OPENROUTER_API_KEY is required in production when AI_ROUTER_ENABLED=true",
    });
  }
});

type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}

export function assertRequiredEnv(keys: Array<keyof AppEnv>): void {
  const env = getEnv();
  const missing = keys.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function assertProductionEnv(): void {
  const env = getEnv();

  if (env.NODE_ENV !== "production") {
    return;
  }

  assertRequiredEnv([
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "CRON_SECRET",
  ]);
}

export function assertSecurityEnvConsistency(): void {
  const env = getEnv();
  if (env.NODE_ENV !== "production") return;

  if (env.HEALTH_DETAILS_PUBLIC === "true") {
    throw new Error("Invalid production config: HEALTH_DETAILS_PUBLIC=true is not allowed.");
  }

  const cspEnabled = env.CSP_ENABLED !== "false";
  const reportOnly = env.CSP_REPORT_ONLY === "true";
  if (cspEnabled && reportOnly) {
    throw new Error(
      "Invalid production config: CSP_REPORT_ONLY=true while CSP is enabled. Set CSP_REPORT_ONLY=false in production."
    );
  }
}
