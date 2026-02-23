#!/usr/bin/env node

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

async function run() {
  const results = []

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`
    try {
      const result = await fetchWithTimeout(url)
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
