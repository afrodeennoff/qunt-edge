import { execSync } from 'node:child_process'

const BASE_URL = process.env.PERF_BASE_URL ?? 'http://127.0.0.1:3000'
const DASHBOARD_PATH = process.env.PERF_DASHBOARD_PATH ?? '/en/dashboard'
const AUTH_COOKIE = process.env.PERF_DASHBOARD_AUTH_COOKIE ?? ''
const REDIRECT_MAX_MS = Number(process.env.PERF_DASHBOARD_REDIRECT_MAX_MS ?? 900)
const AUTH_MAX_MS = Number(process.env.PERF_DASHBOARD_AUTH_MAX_MS ?? 1800)

function curlMetrics(url, cookie = '') {
  const headerPart = cookie ? `-H "Cookie: ${cookie}"` : ''
  const command = `curl -s -o /dev/null ${headerPart} -w "code=%{http_code} ttfb=%{time_starttransfer} total=%{time_total}" "${url}"`
  const output = execSync(command, { encoding: 'utf8' }).trim()
  const entries = Object.fromEntries(output.split(' ').map((pair) => pair.split('=')))
  return {
    code: Number(entries.code),
    ttfbMs: Number(entries.ttfb) * 1000,
    totalMs: Number(entries.total) * 1000,
  }
}

const url = new URL(DASHBOARD_PATH, BASE_URL).toString()

if (!AUTH_COOKIE) {
  const unauth = curlMetrics(url)
  console.log(`[perf:dashboard-runtime] unauth code=${unauth.code} ttfb=${unauth.ttfbMs.toFixed(1)}ms total=${unauth.totalMs.toFixed(1)}ms`)

  if (unauth.code !== 307 && unauth.code !== 302) {
    console.error(`[perf:dashboard-runtime] expected redirect for unauth dashboard, got ${unauth.code}`)
    process.exit(1)
  }

  if (unauth.totalMs > REDIRECT_MAX_MS) {
    console.error(`[perf:dashboard-runtime] unauth redirect too slow: ${unauth.totalMs.toFixed(1)}ms > ${REDIRECT_MAX_MS}ms`)
    process.exit(1)
  }

  console.log('[perf:dashboard-runtime] auth cookie not provided; authenticated runtime check skipped')
  process.exit(0)
}

const auth = curlMetrics(url, AUTH_COOKIE)
console.log(`[perf:dashboard-runtime] auth code=${auth.code} ttfb=${auth.ttfbMs.toFixed(1)}ms total=${auth.totalMs.toFixed(1)}ms`)

if (auth.code < 200 || auth.code >= 400) {
  console.error(`[perf:dashboard-runtime] expected 2xx/3xx for authenticated dashboard, got ${auth.code}`)
  process.exit(1)
}

if (auth.totalMs > AUTH_MAX_MS) {
  console.error(`[perf:dashboard-runtime] authenticated dashboard too slow: ${auth.totalMs.toFixed(1)}ms > ${AUTH_MAX_MS}ms`)
  process.exit(1)
}

console.log('[perf:dashboard-runtime] dashboard runtime gate passed')
