#!/usr/bin/env node
import { spawnSync } from "node:child_process"

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000"
const timeoutMs = Number.parseInt(process.env.SMOKE_TIMEOUT_MS || "8000", 10)

const checks = [
  { path: "/api/health", name: "health", expectJsonField: "status" },
  { path: "/en", name: "localized_home" },
  { path: "/api", name: "api_root" },
]

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = Date.now()
  try {
    const response = await fetch(url, { signal: controller.signal })
    const latencyMs = Date.now() - startedAt
    const text = await response.text()
    return { ok: response.ok, status: response.status, latencyMs, text }
  } finally {
    clearTimeout(timer)
  }
}

function fetchViaCurl(url) {
  const startedAt = Date.now()
  const result = spawnSync(
    "curl",
    [
      "--silent",
      "--show-error",
      "--max-time",
      String(Math.ceil(timeoutMs / 1000)),
      "--output",
      "-",
      "--write-out",
      "\n%{http_code}",
      url,
    ],
    { encoding: "utf8" },
  )

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || "curl failed"
    throw new Error(stderr)
  }

  const output = result.stdout || ""
  const newlineIndex = output.lastIndexOf("\n")
  const body = newlineIndex >= 0 ? output.slice(0, newlineIndex) : output
  const statusText = newlineIndex >= 0 ? output.slice(newlineIndex + 1).trim() : "0"
  const status = Number.parseInt(statusText, 10) || 0

  return {
    ok: status >= 200 && status < 400,
    status,
    latencyMs: Date.now() - startedAt,
    text: body,
  }
}

async function run() {
  const results = []

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`
    try {
      let result
      try {
        result = await fetchWithTimeout(url)
      } catch (error) {
        const code =
          error instanceof Error && "cause" in error && error.cause && typeof error.cause === "object"
            ? error.cause.code
            : undefined
        if (code === "EPERM" || code === "EACCES") {
          result = fetchViaCurl(url)
        } else {
          throw error
        }
      }
      let passed = result.ok
      let reason = ""

      if (passed && check.expectJsonField) {
        try {
          const json = JSON.parse(result.text)
          passed = Object.prototype.hasOwnProperty.call(json, check.expectJsonField)
          if (!passed) {
            reason = `Missing JSON field "${check.expectJsonField}"`
          }
        } catch {
          passed = false
          reason = "Invalid JSON response"
        }
      }

      results.push({
        check: check.name,
        path: check.path,
        status: result.status,
        latencyMs: result.latencyMs,
        passed,
        reason,
      })
    } catch (error) {
      results.push({
        check: check.name,
        path: check.path,
        status: 0,
        latencyMs: timeoutMs,
        passed: false,
        reason: error instanceof Error ? error.message : "Request failed",
      })
    }
  }

  const failed = results.filter((item) => !item.passed)
  console.table(results)
  if (failed.length > 0) {
    console.error(`[smoke] ${failed.length} check(s) failed`)
    process.exit(1)
  }

  console.log("[smoke] all checks passed")
}

run().catch((error) => {
  console.error("[smoke] unexpected failure", error)
  process.exit(1)
})
