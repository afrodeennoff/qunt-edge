import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const ARTIFACT_DIR = path.join(ROOT, 'docs', 'audits', 'artifacts');
const BASELINE_DIR = path.join(ROOT, 'docs', 'audits', 'baselines');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(BASELINE_DIR, { recursive: true });

const DATE = new Date().toISOString().split('T')[0];
const BASELINE_PATH = path.join(BASELINE_DIR, `baseline-${DATE}.json`);

const METRICS = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  commit: getGitCommit(),
  branch: getGitBranch(),

  // Build metrics
  build: {
    totalSize: 0,
    routeCount: 0,
    pageCount: 0,
    appRoutes: [],
  },

  // Bundle metrics
  bundles: {
    totalSize: 0,
    largestRoutes: [],
  },

  // Lighthouse metrics (if available)
  lighthouse: {
    lastRun: null,
    summary: null,
  },

  // Runtime metrics (requires running server)
  runtime: {
    baselineCaptured: false,
    ttfbMedian: null,
    totalMedian: null,
  },

  // Database metrics (from environment)
  database: {
    poolConfig: getDatabasePoolConfig(),
  },

  // Cache configuration
  cache: {
    policies: getCachePolicies(),
  },

  // Error tracking
  errors: {
    sentryConfigured: checkSentryConfigured(),
  },
};

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getDatabasePoolConfig() {
  return {
    maxConnections: process.env.PG_POOL_MAX || 'not set',
    minConnections: process.env.PG_POOL_MIN || 'not set',
    sslMode: process.env.PG_SSL_MODE || 'not set',
    rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED || 'not set',
  };
}

function getCachePolicies() {
  const policies = [];

  if (process.env.NEXT_PUBLIC_SW_ENABLED === 'true') {
    policies.push('service-worker');
  }

  if (process.env.NEXT_PUBLIC_CACHE_REVALIDATE) {
    policies.push(`ISR-revalidate:${process.env.NEXT_PUBLIC_CACHE_REVALIDATE}`);
  }

  return policies;
}

function checkSentryConfigured() {
  return !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

function captureBuildMetrics() {
  try {
    // Try to read Next.js build manifest
    const buildManifestPath = path.join(ROOT, '.next', 'server', 'app-build-manifest.json');
    if (fs.existsSync(buildManifestPath)) {
      const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
      METRICS.build.appRoutes = Object.keys(buildManifest.pages || {});
      METRICS.build.routeCount = METRICS.build.appRoutes.length;
    }

    // Try to read analyze build manifest if available
    const analyzePath = path.join(ARTIFACT_DIR, 'analyze-build-manifest.json');
    if (fs.existsSync(analyzePath)) {
      const analyze = JSON.parse(fs.readFileSync(analyzePath, 'utf8'));
      METRICS.build.totalSize = analyze.totalSize || 0;
      METRICS.build.pageCount = Object.keys(analyze.pages || {}).length;
    }
  } catch (error) {
    console.warn('[baseline] Could not capture build metrics:', error.message);
  }
}

function captureBundleMetrics() {
  try {
    const bundlePath = path.join(ARTIFACT_DIR, 'bundle-summary.json');
    if (fs.existsSync(bundlePath)) {
      const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

      if (bundle.routes) {
        const routes = Object.entries(bundle.routes).map(([path, data]) => ({
          path,
          size: data.totalSize || 0,
        }));

        const sorted = routes.sort((a, b) => b.size - a.size);
        METRICS.bundles.totalSize = bundle.totalSize || 0;
        METRICS.bundles.largestRoutes = sorted.slice(0, 10);
      }
    }
  } catch (error) {
    console.warn('[baseline] Could not capture bundle metrics:', error.message);
  }
}

function captureLighthouseMetrics() {
  try {
    const lighthousePath = path.join(ARTIFACT_DIR, 'lighthouse-summary.json');
    if (fs.existsSync(lighthousePath)) {
      const lighthouse = JSON.parse(fs.readFileSync(lighthousePath, 'utf8'));
      METRICS.lighthouse.lastRun = lighthouse.generatedAt;

      // Summarize by route
      const summary = {};
      for (const result of lighthouse.results || []) {
        const key = `${result.mode}-${result.url}`;
        if (!summary[key]) {
          summary[key] = {
            mode: result.mode,
            url: result.url,
            score: result.score,
            lcp: result.lcp,
            tbt: result.tbt,
            cls: result.cls,
          };
        }
      }

      METRICS.lighthouse.summary = summary;
    }
  } catch (error) {
    console.warn('[baseline] Could not capture Lighthouse metrics:', error.message);
  }
}

function captureRuntimeBaseline() {
  try {
    const baselinePath = path.join(ARTIFACT_DIR, 'performance-baseline.json');
    if (fs.existsSync(baselinePath)) {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      METRICS.runtime.baselineCaptured = true;

      // Calculate median across all routes
      const ttfts = baseline.routes
        .flatMap(r => r.runs)
        .map(r => r.ttfb);

      const totals = baseline.routes
        .flatMap(r => r.runs)
        .map(r => r.total);

      if (ttfts.length > 0) {
        ttfts.sort((a, b) => a - b);
        totals.sort((a, b) => a - b);

        METRICS.runtime.ttfbMedian = ttfts[Math.floor(ttfts.length / 2)];
        METRICS.runtime.totalMedian = totals[Math.floor(totals.length / 2)];
      }
    }
  } catch (error) {
    console.warn('[baseline] Could not capture runtime baseline:', error.message);
  }
}

// Main execution
console.log('[baseline] Capturing comprehensive performance baseline...');

captureBuildMetrics();
captureBundleMetrics();
captureLighthouseMetrics();
captureRuntimeBaseline();

fs.writeFileSync(BASELINE_PATH, JSON.stringify(METRICS, null, 2));
console.log(`[baseline] Baseline saved: ${BASELINE_PATH}`);

// Print summary
console.log('\n=== BASELINE SUMMARY ===');
console.log(`Environment: ${METRICS.environment}`);
console.log(`Commit: ${METRICS.commit}`);
console.log(`Branch: ${METRICS.branch}`);
console.log(`\nBuild Metrics:`);
console.log(`  Total Size: ${METRICS.build.totalSize} bytes`);
console.log(`  Route Count: ${METRICS.build.routeCount}`);
console.log(`  Page Count: ${METRICS.build.pageCount}`);
console.log(`\nBundle Metrics:`);
console.log(`  Total Size: ${METRICS.bundles.totalSize} bytes`);
if (METRICS.bundles.largestRoutes.length > 0) {
  console.log(`  Largest Routes:`);
  METRICS.bundles.largestRoutes.slice(0, 5).forEach(route => {
    console.log(`    ${route.path}: ${route.size} bytes`);
  });
}
console.log(`\nRuntime Metrics:`);
if (METRICS.runtime.baselineCaptured) {
  console.log(`  TTFB Median: ${METRICS.runtime.ttfbMedian}s`);
  console.log(`  Total Median: ${METRICS.runtime.totalMedian}s`);
} else {
  console.log(`  Not available (run npm run perf:baseline first)`);
}
console.log(`\nLighthouse Metrics:`);
if (METRICS.lighthouse.summary) {
  Object.values(METRICS.lighthouse.summary).forEach(result => {
    console.log(`  ${result.mode} ${result.url}: score=${result.score} lcp=${result.lcp} tbt=${result.tbt}`);
  });
} else {
  console.log(`  Not available (run npm run perf:lighthouse first)`);
}
console.log(`\nDatabase Config:`);
console.log(`  Pool Max: ${METRICS.database.poolConfig.maxConnections}`);
console.log(`  SSL Mode: ${METRICS.database.poolConfig.sslMode}`);
console.log(`\nCache Policies:`);
if (METRICS.cache.policies.length > 0) {
  METRICS.cache.policies.forEach(policy => console.log(`  - ${policy}`));
} else {
  console.log(`  None configured`);
}
console.log(`\nError Tracking:`);
console.log(`  Sentry: ${METRICS.errors.sentryConfigured ? 'Configured' : 'Not configured'}`);
