import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
const ROUTES = (process.env.PERF_BASELINE_ROUTES ?? '/en,/en/pricing,/en/updates,/en/dashboard')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);
const RUNS = Number(process.env.PERF_BASELINE_RUNS ?? 5);
const ARTIFACT_DIR = path.join(process.cwd(), 'docs', 'audits', 'artifacts');
const OUTPUT_PATH = path.join(ARTIFACT_DIR, 'performance-baseline.json');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  const boundedIndex = Math.max(0, Math.min(sortedValues.length - 1, index));
  return sortedValues[boundedIndex];
}

function measureUrl(url) {
  const samples = [];
  for (let i = 1; i <= RUNS; i += 1) {
    const line = execSync(
      `curl -s -o /dev/null -w "ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} code=%{http_code}" "${url}"`,
      { encoding: 'utf8' }
    ).trim();

    const values = Object.fromEntries(
      line.split(' ').map(pair => pair.split('='))
    );

    samples.push({
      run: i,
      ttfb: Number(values.ttfb),
      total: Number(values.total),
      size: Number(values.size),
      code: Number(values.code),
    });
  }

  const sortedTtfb = [...samples].map(v => v.ttfb).sort((a, b) => a - b);
  const sortedTotal = [...samples].map(v => v.total).sort((a, b) => a - b);
  const median = arr => arr[Math.floor(arr.length / 2)];

  return {
    url,
    runs: samples,
    summary: {
      ttfbMedian: median(sortedTtfb),
      ttfbP50: percentile(sortedTtfb, 50),
      ttfbP95: percentile(sortedTtfb, 95),
      totalMedian: median(sortedTotal),
      totalP50: percentile(sortedTotal, 50),
      totalP95: percentile(sortedTotal, 95),
      statusCodes: Array.from(new Set(samples.map(v => v.code))),
      sizeBytes: samples[0]?.size ?? 0,
    },
  };
}

const results = ROUTES.map(route => measureUrl(new URL(route, BASE_URL).toString()));

const payload = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  runs: RUNS,
  routes: results,
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
console.log(`[perf:baseline] Baseline written: ${OUTPUT_PATH}`);
for (const route of results) {
  console.log(
    `[perf:baseline] ${route.url} ttfbP50=${route.summary.ttfbP50}s ttfbP95=${route.summary.ttfbP95}s totalP50=${route.summary.totalP50}s totalP95=${route.summary.totalP95}s size=${route.summary.sizeBytes}`
  );
}
