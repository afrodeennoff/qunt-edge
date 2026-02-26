import { request } from 'node:http';
import { request as requestHttps } from 'node:https';

const BASE_URL = process.env.PERF_BASE_URL ?? 'http://localhost:3000';
const STRICT_MODE =
  process.env.PERF_HEADER_STRICT === 'true' ||
  process.env.CI === 'true';

const checks = [
  {
    name: 'public-home',
    method: 'HEAD',
    route: '/en',
    expectedStatusCodes: [200],
    expectedCacheIncludes: ['public', 'must-revalidate'],
    expectedNoStore: false,
    expectedPolicyHeader: 'public-revalidate',
  },
  {
    name: 'public-pricing',
    method: 'HEAD',
    route: '/en/pricing',
    expectedStatusCodes: [200],
    expectedCacheIncludes: ['public', 'must-revalidate'],
    expectedNoStore: false,
    expectedPolicyHeader: 'public-revalidate',
  },
  {
    name: 'public-updates',
    method: 'HEAD',
    route: '/en/updates',
    expectedStatusCodes: [200],
    expectedCacheIncludes: ['public', 'must-revalidate'],
    expectedNoStore: false,
    expectedPolicyHeader: 'public-revalidate',
  },
  {
    name: 'private-dashboard',
    method: 'HEAD',
    route: '/en/dashboard',
    expectedStatusCodes: [302, 307],
    expectedCacheIncludes: ['no-store'],
    expectedNoStore: true,
    expectedPolicyHeader: 'private-no-store',
  },
  {
    name: 'private-authentication',
    method: 'HEAD',
    route: '/en/authentication',
    expectedStatusCodes: [200],
    expectedCacheIncludes: ['no-store'],
    expectedNoStore: true,
    expectedPolicyHeader: 'private-no-store',
  },
  {
    name: 'public-api-health',
    method: 'GET',
    route: '/api/health',
    expectedStatusCodes: [200, 503],
    expectedCacheIncludes: ['public', 's-maxage', 'stale-while-revalidate'],
    expectedNoStore: false,
  },
  {
    name: 'private-api-referral',
    method: 'GET',
    route: '/api/referral',
    expectedStatusCodes: [401],
    expectedCacheIncludes: ['private', 'no-store'],
    expectedNoStore: true,
  },
];

function requestHeaders(target, method = 'HEAD') {
  return new Promise((resolve, reject) => {
    const url = new URL(target, BASE_URL);
    const lib = url.protocol === 'https:' ? requestHttps : request;
    const req = lib(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method,
      },
      res => {
        resolve({ statusCode: res.statusCode ?? 0, headers: res.headers });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

const failures = [];

for (const check of checks) {
  const response = await requestHeaders(check.route, check.method);
  const cacheControl = String(response.headers['cache-control'] ?? '').toLowerCase();
  const policyHeader = String(response.headers['x-dashboard-cache-policy'] ?? '').toLowerCase();

  console.log(
    `[perf:headers] [${check.name}] ${check.method} ${check.route} status=${response.statusCode} cache-control='${cacheControl}' policy='${policyHeader}'`
  );

  const expectedStatuses = check.expectedStatusCodes ?? [];
  if (expectedStatuses.length > 0 && !expectedStatuses.includes(response.statusCode)) {
    failures.push(`${check.route}: unexpected status ${response.statusCode} (expected ${expectedStatuses.join(',')})`);
    continue;
  }

  for (const expected of check.expectedCacheIncludes) {
    if (!cacheControl.includes(expected)) {
      if (STRICT_MODE) {
        failures.push(`${check.route}: cache-control missing '${expected}'`);
      }
    }
  }

  if (check.expectedNoStore && !cacheControl.includes('no-store')) {
    if (STRICT_MODE) {
      failures.push(`${check.route}: expected no-store policy`);
    }
  }

  if (!check.expectedNoStore && cacheControl.includes('no-store')) {
    if (STRICT_MODE) {
      failures.push(`${check.route}: should not include no-store`);
    }
  }

  if (check.expectedPolicyHeader && policyHeader !== check.expectedPolicyHeader) {
    if (STRICT_MODE) {
      failures.push(`${check.route}: x-dashboard-cache-policy expected '${check.expectedPolicyHeader}' got '${policyHeader || 'missing'}'`);
    }
  }
}

if (failures.length > 0) {
  console.error('[perf:headers] Failures detected:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

if (!STRICT_MODE) {
  console.warn('[perf:headers] Non-strict mode enabled. Mismatches were logged but not enforced.');
}
console.log('[perf:headers] Header checks completed.');
