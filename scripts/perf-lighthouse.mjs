import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const ARTIFACT_DIR = path.join(ROOT, 'docs', 'audits', 'artifacts');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
const ROUTES = (process.env.PERF_ROUTES ?? '/en,/en/pricing').split(',').map(v => v.trim()).filter(Boolean);
const CHROME_FLAGS = process.env.LIGHTHOUSE_CHROME_FLAGS ?? '--headless=new --no-sandbox';

const THRESHOLDS = {
  desktopScoreMin: Number(process.env.LIGHTHOUSE_DESKTOP_MIN ?? 0.9),
  mobileScoreMin: Number(process.env.LIGHTHOUSE_MOBILE_MIN ?? 0.75),
  desktopTbtMaxMs: Number(process.env.LIGHTHOUSE_DESKTOP_TBT_MAX_MS ?? 200),
  mobileTbtMaxMs: Number(process.env.LIGHTHOUSE_TBT_MAX_MS ?? 1200),
  desktopLcpMaxMs: Number(process.env.LIGHTHOUSE_DESKTOP_LCP_MAX_MS ?? 1800),
  mobileLcpMaxMs: Number(process.env.LIGHTHOUSE_MOBILE_LCP_MAX_MS ?? 3500),
  mobileClsMax: Number(process.env.LIGHTHOUSE_MOBILE_CLS_MAX ?? 0.1),
};

function runLighthouse(url, mode) {
  const outPath = path.join(
    ARTIFACT_DIR,
    `lighthouse-${mode}-${url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '-')}.json`
  );
  const preset = mode === 'desktop' ? '--preset=desktop' : '';
  const command = [
    'npx lighthouse',
    url,
    '--quiet',
    preset,
    `--chrome-flags='${CHROME_FLAGS}'`,
    '--output=json',
    `--output-path='${outPath}'`,
  ].filter(Boolean).join(' ');

  execSync(command, { stdio: 'inherit' });
  return JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

function readMetricMs(audit) {
  if (!audit?.numericValue && audit?.numericValue !== 0) return null;
  return Number(audit.numericValue);
}

function evaluate(report, mode, url) {
  const score = Number(report.categories?.performance?.score ?? 0);
  const tbt = readMetricMs(report.audits?.['total-blocking-time']);
  const lcp = readMetricMs(report.audits?.['largest-contentful-paint']);
  const cls = Number(report.audits?.['cumulative-layout-shift']?.numericValue ?? 0);

  const failures = [];

  if (mode === 'desktop') {
    if (score < THRESHOLDS.desktopScoreMin) failures.push(`desktop score ${score} < ${THRESHOLDS.desktopScoreMin}`);
    if (tbt !== null && tbt > THRESHOLDS.desktopTbtMaxMs) failures.push(`desktop TBT ${tbt}ms > ${THRESHOLDS.desktopTbtMaxMs}ms`);
    if (lcp !== null && lcp > THRESHOLDS.desktopLcpMaxMs) failures.push(`desktop LCP ${lcp}ms > ${THRESHOLDS.desktopLcpMaxMs}ms`);
  } else {
    if (score < THRESHOLDS.mobileScoreMin) failures.push(`mobile score ${score} < ${THRESHOLDS.mobileScoreMin}`);
    if (tbt !== null && tbt > THRESHOLDS.mobileTbtMaxMs) failures.push(`mobile TBT ${tbt}ms > ${THRESHOLDS.mobileTbtMaxMs}ms`);
    if (lcp !== null && lcp > THRESHOLDS.mobileLcpMaxMs) failures.push(`mobile LCP ${lcp}ms > ${THRESHOLDS.mobileLcpMaxMs}ms`);
    if (cls > THRESHOLDS.mobileClsMax) failures.push(`mobile CLS ${cls} > ${THRESHOLDS.mobileClsMax}`);
  }

  return {
    url,
    mode,
    score,
    tbt,
    lcp,
    cls,
    failures,
  };
}

const results = [];

for (const route of ROUTES) {
  const url = new URL(route, BASE_URL).toString();
  const mobileReport = runLighthouse(url, 'mobile');
  const desktopReport = runLighthouse(url, 'desktop');

  results.push(evaluate(mobileReport, 'mobile', url));
  results.push(evaluate(desktopReport, 'desktop', url));
}

const summaryPath = path.join(ARTIFACT_DIR, 'lighthouse-summary.json');
fs.writeFileSync(
  summaryPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      thresholds: THRESHOLDS,
      results,
    },
    null,
    2
  )
);

console.log(`[perf:lighthouse] Summary written: ${summaryPath}`);
results.forEach(result => {
  console.log(
    `[perf:lighthouse] ${result.mode.toUpperCase()} ${result.url} score=${result.score} tbt=${result.tbt} lcp=${result.lcp} cls=${result.cls}`
  );
});

const allFailures = results.flatMap(r => r.failures.map(message => `${r.mode} ${r.url}: ${message}`));
if (allFailures.length > 0) {
  console.error('[perf:lighthouse] Threshold failures detected:');
  allFailures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

console.log('[perf:lighthouse] All thresholds passed.');
