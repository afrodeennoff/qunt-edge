# k6 Load Test

## 1. Install k6

```bash
brew install k6
```

## 2. Run against Vercel

```bash
BASE_URL="https://your-app.vercel.app" npm run loadtest:k6
```

## 3. Include authenticated dashboard traffic (optional)

1. Log in from browser.
2. Copy full `Cookie` header from a dashboard request in DevTools.
3. Run:

```bash
BASE_URL="https://your-app.vercel.app" \
DASHBOARD_COOKIE="sb-...=...; other_cookie=..." \
npm run loadtest:k6
```

## Notes

- Start with a preview deployment, then run on production.
- Watch Supabase metrics during test: active connections, CPU, slow queries.
- If p95/p99 fails, scale down traffic and identify the slow endpoint first.
