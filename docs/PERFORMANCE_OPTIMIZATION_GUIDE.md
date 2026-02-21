# Next.js Performance Optimization Guide

## Root Cause and Conflict Resolution

### Previous mismatch
- Two separate configs existed: `next.config.ts` (active) and `next.config.optimized.ts` (documentation target).
- The alternate config drifted and included settings that were not aligned with the active runtime path.
- Result: optimization behavior varied by which file engineers followed, and monitoring setup could fail builds (`web-vitals` typing/import mismatch).

### Fix
- Consolidated optimization logic into one source: `lib/performance/next-config.ts`.
- `next.config.ts` now consumes only that shared builder.
- Removed `next.config.optimized.ts` to prevent future drift.
- Added env validation with warnings for invalid optimization input values.

## Implemented Optimization Strategy

### Configuration
- `next.config.ts` is now a thin wrapper around `createOptimizedNextConfig(...)`.
- `lib/performance/next-config.ts` now enforces:
  - validated CPU tuning (`NEXT_BUILD_CPUS`) with safe fallback,
  - validated CDN prefix (`NEXT_PUBLIC_CDN_URL`) with warning-based fallback,
  - strict image security defaults (`dangerouslyAllowSVG: false`, CSP, attachment disposition),
  - optimized image formats, sizes, and quality tiers,
  - static asset cache headers and API rewrite compatibility.

### Code splitting
- `app/[locale]/(home)/components/DeferredHomeSections.tsx` now uses `next/dynamic` imports for section-level chunking.
- This reduces home-route initial JavaScript pressure by deferring non-hero sections into independent chunks.

### Font optimization
- `app/layout.tsx` now uses the centralized font loader contract in `lib/performance/font-optimization.ts`.
- Font loading strategy is consistent across app shell and avoids duplicate inline setup.

### Image optimization
- `lib/performance/image-optimization.ts` now handles invalid URLs and bad dimensions safely.
- CDN URL generation now validates and normalizes URL/path values before building query parameters.

### Static generation
- `app/[locale]/(home)/page.tsx` now explicitly sets:
  - `revalidate = 3600`,
  - `dynamic = "force-static"`,
  - `dynamicParams = false`,
  - locale static params generation.

### Hydration and cache pitfall handling
- Removed server `cookies()` dependency from `app/[locale]/layout.tsx` to avoid forcing dynamic rendering across locale routes.
- `components/ui/sidebar.tsx` now syncs sidebar cookie state on mount, avoiding server/client state divergence and reducing hydration mismatch risk.
- `lib/performance/isr-utils.ts` now fails safely (`boolean` results) for revalidation errors instead of escalating throws.

### Optimization failure handling
- `components/performance/performance-observer.tsx` now gracefully skips Web Vitals runtime setup if unavailable.
- Added local typing shim: `types/web-vitals.d.ts`.
- Added TypeScript include for declaration files in `tsconfig.json`.

## Verification and Tests

### New tests
- `tests/performance/next-config.test.ts`: env parsing, fallback behavior, URL validation warnings.
- `tests/performance/image-optimization.test.ts`: URL safety and fallback behavior.
- `tests/performance/isr-utils.test.ts`: revalidation failure safety.

### Performance verification scripts
- `npm run check:route-budgets`
- `npm run analyze:bundle`
- `npm run perf:verify`

## Measurable Results to Track

Run these after every optimization change:

```bash
npm run build
npm run check:route-budgets
npm run analyze:bundle
```

Use output from:
- `.next` build summary,
- `docs/audits/artifacts/bundle-summary.json`,
- route budget script output.

Key KPIs:
- build success/failure for optimization pipeline,
- high-priority route payload budget compliance,
- top route client manifest sizes,
- largest JS chunk sizes,
- home route static generation status.

## Files Changed
- `next.config.ts`
- `lib/performance/next-config.ts`
- `app/layout.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/(home)/page.tsx`
- `app/[locale]/(home)/components/DeferredHomeSections.tsx`
- `components/ui/sidebar.tsx`
- `components/performance/performance-observer.tsx`
- `lib/performance/image-optimization.ts`
- `lib/performance/isr-utils.ts`
- `lib/performance/bundle-analyzer.ts`
- `types/web-vitals.d.ts`
- `tests/performance/next-config.test.ts`
- `tests/performance/image-optimization.test.ts`
- `tests/performance/isr-utils.test.ts`
- `package.json`
- `tsconfig.json`
