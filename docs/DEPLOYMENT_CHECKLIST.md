# QuntEdge — Production Deployment Checklist

**Last Updated:** 2026-02-22  
**Platform:** Vercel (primary) / Docker + VPS (alternative)

---

## Pre-Deployment Checks

### 1. Secret Management ✅

- [ ] All secrets rotated after audit (database password, Supabase keys, encryption keys)
- [ ] `.env` file NOT committed to repository
- [ ] `.env.development.local`, `.env.preview.local`, `.env.production.local` removed from git tracking
- [ ] All secrets configured in Vercel Dashboard > Settings > Environment Variables
- [ ] `ENCRYPTION_KEY` is at least 32 characters, randomly generated
- [ ] `CRON_SECRET` is unique and at least 20 characters
- [ ] `HEALTHCHECK_SECRET` is unique and at least 20 characters
- [ ] `WELCOME_WEBHOOK_SECRET` is unique and at least 20 characters
- [ ] `WHOP_WEBHOOK_SECRET` is configured for production
- [ ] `UNSUBSCRIBE_TOKEN_SECRET` is at least 32 characters

### 2. Database ✅

- [ ] `DATABASE_URL` uses Supabase transaction pooler (port 6543)
- [ ] `DIRECT_URL` uses direct connection (port 5432) — for migrations only
- [ ] `PG_POOL_MAX=2` for serverless (Vercel) or `5` for VPS
- [ ] SSL enabled (`sslmode=require` in connection string)
- [ ] All Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Database backup verified (Supabase Backups or manual `pg_dump`)

### 3. Authentication ✅

- [ ] Supabase Auth configured with production URLs
- [ ] Supabase leaked password protection enabled
- [ ] OAuth redirect URLs point to production domain
- [ ] Email templates configured in Supabase Dashboard
- [ ] Magic link email sender configured (Resend API key set)
- [ ] Rate limiting active (`AUTH_RATE_LIMIT_ENABLED=true` or not set — defaults to true)

### 4. Build & Test ✅

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes  
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] Coverage ≥ 80% line coverage (`npm run test:coverage`)
- [ ] `npm audit --audit-level=high` — no high-severity vulnerabilities

### 5. Security Headers ✅

- [ ] `middleware.ts` deployed (CSP, CORS, HSTS, X-Frame-Options)
- [ ] `CSP_REPORT_ONLY=false` in production unless temporary rollout window is active
- [ ] `next.config.ts` security headers confirmed (no-cache for API routes)
- [ ] `poweredByHeader: false` in Next.js config
- [ ] CORS allowlist updated with production domain

### 6. Performance ✅

- [ ] `npm run perf:verify` passes (route budgets + bundle analysis)
- [ ] Image optimization configured (AVIF + WebP)
- [ ] Font loading uses `next/font/google` with `display: swap`
- [ ] `Sharp` available for image processing

---

## Deployment Steps

### Vercel (Primary)

```bash
# 1. Ensure all env vars are set in Vercel Dashboard
# 2. Push to main branch
git push origin main

# 3. Vercel auto-deploys on push to main
# 4. Verify deployment at https://qunt-edge.vercel.app

# 5. Run smoke test
npm run test:smoke
```

### Docker / VPS (Alternative)

```bash
# 1. Build Docker image
docker compose -f docker-compose.prod.yml build

# 2. Run database migrations (one-time)
docker compose -f docker-compose.prod.yml --profile migrate run --rm migrate

# 3. Start application
docker compose -f docker-compose.prod.yml up -d

# 4. Verify health
curl -f http://localhost:3000/api/health

# 5. Check logs
docker compose -f docker-compose.prod.yml logs -f app
```

---

## Post-Deployment Verification

- [ ] `/api/health` returns `200` with `status: "ok"`
- [ ] Authentication flow works (login, OTP, OAuth)
- [ ] Dashboard loads with data
- [ ] Webhook endpoint accepts test events
- [ ] Cron jobs configured and running (Vercel crons in `vercel.json`)
- [ ] SSL certificate active (HSTS header present in response)
- [ ] CSP header present in browser DevTools → Network tab

---

## Rollback Procedures

### Vercel Rollback

```bash
# Option 1: Revert via Vercel Dashboard
# Go to Vercel Dashboard → Deployments → Select previous deployment → Promote to Production

# Option 2: Git revert
git revert HEAD
git push origin main

# Option 3: Instant rollback (Vercel CLI)
vercel rollback
```

### Docker Rollback

```bash
# 1. Stop current container
docker compose -f docker-compose.prod.yml down

# 2. Roll back to previous image tag
docker tag quntedge:prod quntedge:rollback
docker compose -f docker-compose.prod.yml up -d

# 3. If database migration needs reverting:
# ⚠️ Prisma does not support down migrations — use manual SQL
# Check prisma/migrations/ for the latest migration and reverse it manually
```

### Database Rollback

```bash
# 1. Restore from Supabase backup (Dashboard → Database → Backups)
# 2. Or restore from pg_dump:
pg_restore -h $DB_HOST -U postgres -d postgres backup.sql
```

---

## Incident Response Protocol

### Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P0 — Critical | Complete outage, data breach | 15 minutes | Immediate team notification |
| P1 — High | Major feature broken, security issue | 1 hour | Engineering lead |
| P2 — Medium | Minor feature issue, performance | 4 hours | Daily standup |
| P3 — Low | Cosmetic, improvement | Next sprint | Backlog |

### Response Steps

1. **Detect** — Monitor `/api/health` endpoint + Vercel Logs + Error tracking
2. **Assess** — Determine severity level and impact scope
3. **Contain** — If security incident, disable affected endpoint/feature
4. **Communicate** — Notify users via Discord + status page
5. **Fix** — Apply hotfix or rollback
6. **Verify** — Confirm fix via smoke tests
7. **Postmortem** — Document root cause and prevention measures

### Contacts

| Role | Contact |
|------|---------|
| Platform Owner | TIMON |
| Support Email | support@qunt-edge.vercel.app |
| Discord | See `NEXT_PUBLIC_DISCORD_INVITATION` env var |

---

## Monitoring Checklist

- [ ] Vercel Analytics enabled (`@vercel/analytics`)
- [ ] Vercel Speed Insights enabled (`@vercel/speed-insights`)
- [ ] Health endpoint monitored externally (UptimeRobot / Better Uptime)
- [ ] Error threshold alerting configured (via `lib/logger.ts` alert system)
- [ ] Database latency alerts configured (`DB_LATENCY_ALERT_MS=250`)
- [ ] Webhook processing stats available via `WebhookService.stats`
