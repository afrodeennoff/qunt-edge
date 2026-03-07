const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const ERROR_ALERT_THRESHOLD = Number.parseInt(process.env.ERROR_ALERT_THRESHOLD || "20", 10);
const ERROR_ALERT_WINDOW_MS = Number.parseInt(process.env.ERROR_ALERT_WINDOW_MS || "300000", 10);

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerContext {
  requestId?: string;
  correlationId?: string;
  route?: string;
  method?: string;
  userId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

interface ErrorWindowState {
  count: number;
  startedAt: number;
  alerted: boolean;
}

type ContextRunner = <T>(context: LoggerContext, fn: () => T) => T;

const errorWindowByKey = new Map<string, ErrorWindowState>();
const contextStack: LoggerContext[] = [];

const SENSITIVE_KEYS = new Set([
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "secret",
  "password",
  "apikey",
  "apiKey",
  "clientSecret",
  "tokenCiphertext",
  "tokenTag",
  "tokenIv",
]);

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getCurrentContext(): LoggerContext | undefined {
  if (contextStack.length === 0) return undefined;
  return contextStack[contextStack.length - 1];
}

function runWithContext<T>(context: LoggerContext, fn: () => T): T {
  contextStack.push(context);
  try {
    return fn();
  } finally {
    contextStack.pop();
  }
}

function redactValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.length <= 8) return "[REDACTED]";
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  }
  return "[REDACTED]";
}

function redactMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE_KEYS.has(key) || /token|secret|password|authorization/i.test(key);
    if (isSensitive) {
      output[key] = redactValue(value);
      continue;
    }

    if (value instanceof Error) {
      output[key] = {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
      continue;
    }

    if (Array.isArray(value)) {
      output[key] = value.map((item) =>
        item && typeof item === "object" ? redactMeta(item as Record<string, unknown>) : item
      );
      continue;
    }

    if (value && typeof value === "object") {
      output[key] = redactMeta(value as Record<string, unknown>);
      continue;
    }

    output[key] = value;
  }
  return output;
}

function normalizeMeta(meta: unknown): Record<string, unknown> {
  if (meta == null) return {};
  if (typeof meta === "object" && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return { meta };
}

function normalizeArgs(a: unknown, b: unknown): { message: string; meta: Record<string, unknown> } {
  if (typeof a === "string") {
    return { message: a, meta: normalizeMeta(b) };
  }
  if (typeof b === "string") {
    return { message: b, meta: normalizeMeta(a) };
  }
  return { message: "log", meta: normalizeMeta(a ?? b) };
}

function withDefaultCorrelation(meta: Record<string, unknown>): Record<string, unknown> {
  const context = getCurrentContext() || {};
  const merged: Record<string, unknown> = { ...context, ...meta };
  const requestId = typeof merged.requestId === "string" ? merged.requestId : undefined;
  const correlationId = typeof merged.correlationId === "string" ? merged.correlationId : undefined;

  if (!requestId && correlationId) merged.requestId = correlationId;
  if (!correlationId && requestId) merged.correlationId = requestId;
  if (!merged.requestId && !merged.correlationId) {
    const generated = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    merged.requestId = generated;
    merged.correlationId = generated;
  }

  return merged;
}

function emitErrorAlert(entry: LogEntry) {
  if (entry.level !== "error") return;

  const route = typeof entry.route === "string" ? entry.route : "unknown-route";
  const key = `${route}:${entry.message}`;
  const now = Date.now();
  const existing = errorWindowByKey.get(key);

  if (!existing || now - existing.startedAt > ERROR_ALERT_WINDOW_MS) {
    errorWindowByKey.set(key, { count: 1, startedAt: now, alerted: false });
    return;
  }

  existing.count += 1;
  if (existing.count >= ERROR_ALERT_THRESHOLD && !existing.alerted) {
    existing.alerted = true;
    const alertEntry: LogEntry = {
      level: "warn",
      message: "[Monitoring] Error threshold reached",
      timestamp: new Date().toISOString(),
      route,
      originalMessage: entry.message,
      threshold: ERROR_ALERT_THRESHOLD,
      windowMs: ERROR_ALERT_WINDOW_MS,
      requestId: entry.requestId,
      correlationId: entry.correlationId,
    };
    console.log(JSON.stringify(alertEntry));
  }
}

function write(level: LogLevel, a: unknown, b?: unknown) {
  const currentLevel = levels[LOG_LEVEL as LogLevel] ?? levels.info;
  if (levels[level] < currentLevel) return;

  const { message, meta } = normalizeArgs(a, b);
  const mergedMeta = withDefaultCorrelation(meta);
  const redactedMeta = redactMeta(mergedMeta);
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redactedMeta,
  };

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    const metaString = Object.keys(redactedMeta).length > 0 ? JSON.stringify(redactedMeta) : "";
    console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`);
  }

  emitErrorAlert(entry);
}

function child(boundMeta: Record<string, unknown>) {
  const scopedWrite = (level: LogLevel, a: unknown, b?: unknown) => {
    const { message, meta } = normalizeArgs(a, b);
    write(level, message, { ...boundMeta, ...meta });
  };

  return {
    debug: (a: unknown, b?: unknown) => scopedWrite("debug", a, b),
    info: (a: unknown, b?: unknown) => scopedWrite("info", a, b),
    warn: (a: unknown, b?: unknown) => scopedWrite("warn", a, b),
    error: (a: unknown, b?: unknown) => scopedWrite("error", a, b),
  };
}

export function withLogContext<T>(context: LoggerContext, fn: () => T): T {
  return runWithContext(context, fn);
}

export function getLogContext(): LoggerContext | undefined {
  return getCurrentContext();
}

export const logger = {
  debug: (a: unknown, b?: unknown) => write("debug", a, b),
  info: (a: unknown, b?: unknown) => write("info", a, b),
  warn: (a: unknown, b?: unknown) => write("warn", a, b),
  error: (a: unknown, b?: unknown) => write("error", a, b),
  child,
};

export const createLogger = (name: string) => logger.child({ name });

export const withLogger = <T extends Record<string, unknown>>(context: T) => logger.child(context);

export default logger;
