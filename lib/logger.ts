import { AsyncLocalStorage } from "node:async_hooks"

const LOG_LEVEL = process.env.LOG_LEVEL || "info"
const ERROR_ALERT_THRESHOLD = Number.parseInt(process.env.ERROR_ALERT_THRESHOLD || "20", 10)
const ERROR_ALERT_WINDOW_MS = Number.parseInt(process.env.ERROR_ALERT_WINDOW_MS || "300000", 10)

type LogLevel = "debug" | "info" | "warn" | "error"

export interface LoggerContext {
  requestId?: string
  correlationId?: string
  route?: string
  method?: string
  userId?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

interface ErrorWindowState {
  count: number
  startedAt: number
  alerted: boolean
}

const logContextStore = new AsyncLocalStorage<LoggerContext>()
const errorWindowByKey = new Map<string, ErrorWindowState>()

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
])

function redactValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.length <= 8) return "[REDACTED]"
    return `${value.slice(0, 2)}***${value.slice(-2)}`
  }
  return "[REDACTED]"
}

function redactMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    const isSensitive = SENSITIVE_KEYS.has(key) || /token|secret|password|authorization/i.test(key)
    if (isSensitive) {
      output[key] = redactValue(value)
      continue
    }

    if (value instanceof Error) {
      output[key] = {
        name: value.name,
        message: value.message,
        stack: value.stack,
      }
      continue
    }

    if (Array.isArray(value)) {
      output[key] = value.map((item) =>
        item && typeof item === "object" ? redactMeta(item as Record<string, unknown>) : item
      )
      continue
    }

    if (value && typeof value === "object") {
      output[key] = redactMeta(value as Record<string, unknown>)
      continue
    }

    output[key] = value
  }
  return output
}

function withDefaultCorrelation(meta: Record<string, unknown>): Record<string, unknown> {
  const context = logContextStore.getStore() || {}
  const merged: Record<string, unknown> = { ...context, ...meta }
  const requestId = typeof merged.requestId === "string" ? merged.requestId : undefined
  const correlationId = typeof merged.correlationId === "string" ? merged.correlationId : undefined

  if (!requestId && correlationId) merged.requestId = correlationId
  if (!correlationId && requestId) merged.correlationId = requestId
  if (!merged.requestId && !merged.correlationId) {
    const generated = crypto.randomUUID()
    merged.requestId = generated
    merged.correlationId = generated
  }

  return merged
}

function emitErrorAlert(entry: LogEntry) {
  if (entry.level !== "error") return

  const route = typeof entry.route === "string" ? entry.route : "unknown-route"
  const key = `${route}:${entry.message}`
  const now = Date.now()
  const existing = errorWindowByKey.get(key)

  if (!existing || now - existing.startedAt > ERROR_ALERT_WINDOW_MS) {
    errorWindowByKey.set(key, { count: 1, startedAt: now, alerted: false })
    return
  }

  existing.count += 1
  if (existing.count >= ERROR_ALERT_THRESHOLD && !existing.alerted) {
    existing.alerted = true
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
    }
    console.log(JSON.stringify(alertEntry))
  }
}

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function normalizeMeta(meta: unknown): Record<string, unknown> {
  if (meta == null) {
    return {}
  }

  if (typeof meta === "object" && !Array.isArray(meta)) {
    return meta as Record<string, unknown>
  }

  return { meta }
}

function log(level: LogLevel, message: string, meta: unknown = {}) {
  const currentLevel = levels[LOG_LEVEL as LogLevel] ?? levels.info
  if (levels[level] < currentLevel) return

  const mergedMeta = withDefaultCorrelation(normalizeMeta(meta))
  const redactedMeta = redactMeta(mergedMeta)
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redactedMeta,
  }

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry))
  } else {
    const metaString = Object.keys(redactedMeta).length > 0 ? JSON.stringify(redactedMeta) : ""
    console.log(`[${entry.timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`)
  }

  emitErrorAlert(entry)
}

export function withLogContext<T>(context: LoggerContext, fn: () => T): T {
  return logContextStore.run(context, fn)
}

export function getLogContext(): LoggerContext | undefined {
  return logContextStore.getStore()
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
}
