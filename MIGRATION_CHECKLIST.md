# Performance Optimization Migration Checklist

## Pre-Migration Checklist

- [ ] Run baseline performance tests (Lighthouse, WebPageTest)
- [ ] Document current bundle sizes
- [ ] Record current Core Web Vitals
- [ ] Backup current `next.config.ts`
- [ ] Create feature branch for migration
- [ ] Notify team of upcoming changes

## Phase 1: Configuration (Day 1)

- [ ] Replace `next.config.ts` with optimized version
- [ ] Review and adjust webpack split chunks configuration
- [ ] Verify image optimization settings
- [ ] Test build process
- [ ] Run `npm run build` and check for errors
- [ ] Verify standalone output works (if used)

## Phase 2: Code Splitting (Day 2-3)

- [ ] Identify heavy components (> 50KB)
- [ ] Convert to dynamic imports:
  - [ ] Charts component
  - [ ] Data tables
  - [ ] Modals/dialogs
  - [ ] Admin components
- [ ] Add loading states
- [ ] Test component functionality
- [ ] Verify no hydration errors

## Phase 3: Image Optimization (Day 3-4)

- [ ] Install `web-vitals` package
- [ ] Create optimized image component
- [ ] Replace `img` tags with `OptimizedImage`
- [ ] Implement responsive image sizes
- [ ] Add blur placeholders
- [ ] Test image loading performance
- [ ] Verify no layout shifts

## Phase 4: Font Optimization (Day 4)

- [ ] Verify next/font configuration
- [ ] Check font loading strategy
- [ ] Remove any external font requests
- [ ] Test font rendering
- [ ] Verify no FOUT/FOIT issues

## Phase 5: ISR & Caching (Day 5-6)

- [ ] Identify pages for ISR
- [ ] Implement ISR revalidation times
- [ ] Add cache tags where appropriate
- [ ] Implement on-demand revalidation
- [ ] Set up cache manager
- [ ] Configure API caching strategies
- [ ] Test cache invalidation

## Phase 6: Monitoring (Day 6-7)

- [ ] Install performance monitoring components
- [ ] Set up Web Vitals tracking
- [ ] Configure bundle analyzer
- [ ] Set up performance alerts
- [ ] Create performance dashboard
- [ ] Document baseline metrics

## Phase 7: Testing (Day 7-8)

- [ ] Run full test suite
- [ ] Perform integration testing
- [ ] Test on slow 3G networks
- [ ] Test on mobile devices
- [ ] Verify SEO performance
- [ ] Check accessibility
- [ ] Load test critical paths

## Phase 8: Deployment (Day 9)

- [ ] Deploy to staging environment
- [ ] Run performance tests on staging
- [ ] Monitor error rates
- [ ] Verify all functionality
- [ ] Get team approval
- [ ] Deploy to production
- [ ] Monitor performance for 24 hours

## Post-Migration Checklist

- [ ] Compare new vs old metrics
- [ ] Document improvements
- [ ] Update team documentation
- [ ] Schedule performance review (1 week)
- [ ] Set up ongoing monitoring
- [ ] Create performance budget
- [ ] Plan next optimization cycle

## Rollback Plan

If critical issues arise:

1. **Immediate Rollback (< 5 min)**
   - Revert to previous `next.config.ts`
   - Restore previous commit
   - Verify functionality

2. **Partial Rollback (< 30 min)**
   - Disable specific optimizations
   - Keep working optimizations
   - Incremental fixes

3. **Fix Forward (< 2 hours)**
   - Address specific issues
   - Test fixes
   - Deploy hotfix

## Success Criteria

Migration is successful when:

- ✅ All tests passing
- ✅ Core Web Vitals improved (FCP, LCP, FID, CLS)
- ✅ Bundle size reduced by > 30%
- ✅ No increase in error rates
- ✅ User experience improved
- ✅ Page load times improved by > 25%

## Monitoring Metrics

Track these metrics pre/post migration:

| Metric | Target | Actual |
|--------|--------|--------|
| FCP | < 1.8s | ___ |
| LCP | < 2.5s | ___ |
| FID | < 100ms | ___ |
| CLS | < 0.1 | ___ |
| TTI | < 3.5s | ___ |
| Bundle Size | < 500KB | ___ |
| API Response | < 100ms | ___ |

## Contact Information

**Performance Lead**: [Name]
**Deployment Window**: [Date/Time]
**Emergency Contact**: [Name/Email]

## Notes

- Document any issues encountered
- Record workarounds
- Share lessons learned with team
- Update this checklist for future migrations

---

*Checksheet Version: 1.0*
*Last Updated: February 20, 2026*
