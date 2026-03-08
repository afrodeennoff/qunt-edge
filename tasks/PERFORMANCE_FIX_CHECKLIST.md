# Performance Fix Checklist

**Created:** 2026-03-08  
**Estimated Time:** 2 weeks  
**Priority:** CRITICAL

---

## ⚡ Phase 1: Critical Fixes (Week 1)

### Day 1: Quick Win - Add React.memo
- [ ] Find all chart components: `find app/[locale]/dashboard/components/charts -name "*.tsx"`
- [ ] Add `React.memo` to each chart component (30+ files)
- [ ] Find all statistics components: `find app/[locale]/dashboard/components/statistics -name "*.tsx"`
- [ ] Add `React.memo` to each statistics component (15+ files)
- [ ] Test dashboard loads correctly
- [ ] Verify filter changes are faster
- [ ] **Expected Result:** 30-50% fewer re-renders

### Day 2-3: Split Monolithic Context
- [ ] Create `context/providers/trades-provider.tsx`
- [ ] Create `context/providers/filters-provider.tsx`
- [ ] Create `context/providers/derived-provider.tsx`
- [ ] Create `context/providers/actions-provider.tsx`
- [ ] Update `components/providers/dashboard-providers.tsx`
- [ ] Find all components using `useData()` and update imports
- [ ] Test all dashboard functionality still works
- [ ] **Expected Result:** 70-90% reduction in unnecessary re-renders

### Day 4: Memoize Expensive Computations
- [ ] Add `useMemo` to `formattedTrades` filtering
- [ ] Add `useMemo` to `statistics` calculation
- [ ] Add `useMemo` to `calendarData` formatting
- [ ] Add `useMemo` to all widget chart computations
- [ ] Add `useMemo` to all statistics card calculations
- [ ] Test filter changes are instant
- [ ] **Expected Result:** 90% reduction in calculation overhead

### Day 5: Add useCallback to Actions
- [ ] Wrap all action functions in `useCallback`
- [ ] Wrap event handlers in `useCallback`
- [ ] Verify no unnecessary re-renders from action changes
- [ ] **Expected Result:** 20-30% reduction in re-renders

---

## 🚀 Phase 2: High Priority (Week 2)

### Day 6-7: Lazy Load Widgets
- [ ] Update `widget-registry.tsx` to use `next/dynamic`
- [ ] Add loading skeletons for all widgets
- [ ] Test lazy-loaded widgets render correctly
- [ ] Verify initial dashboard load is faster
- [ ] **Expected Result:** 40-60% faster initial load

### Day 8-9: Break Down Large Components
#### Trade Table (1733 lines)
- [ ] Extract `TradeTableRow` component
- [ ] Extract `TradeTableFilters` component
- [ ] Extract `TradeTablePagination` component
- [ ] Test trade table functionality

#### Accounts Overview (1668 lines)
- [ ] Extract `AccountCard` component
- [ ] Extract `AccountStats` component
- [ ] Extract `AccountFilters` component
- [ ] Test accounts functionality

#### Equity Chart (1029 lines)
- [ ] Extract chart rendering logic
- [ ] Extract tooltip logic
- [ ] Test chart functionality

- [ ] **Expected Result:** Faster component mounting

### Day 10: Optimize Widget Canvas
- [ ] Add `React.memo` to `WidgetWrapper`
- [ ] Limit animations to first 6 widgets
- [ ] Replace spring animations with simple tween
- [ ] Test layout customization works
- [ ] **Expected Result:** Constant render time

---

## 📊 Measurement & Verification

### Before Starting (Baseline)
- [ ] Open Chrome DevTools → Performance
- [ ] Record dashboard load
- [ ] Note scripting time: _____ms
- [ ] Note rendering time: _____ms
- [ ] Change filter and record
- [ ] Note filter change time: _____ms
- [ ] Count re-renders: _____

### After Phase 1 (Week 1)
- [ ] Dashboard scripting time: < 1000ms
- [ ] Dashboard rendering time: < 200ms
- [ ] Filter change time: < 100ms
- [ ] Re-render count: < 5
- [ ] CPU during interactions: < 40%

### After Phase 2 (Week 2)
- [ ] Dashboard load time: < 1.5s
- [ ] Initial bundle size: < 250KB
- [ ] Time to Interactive: < 2s

---

## 🚨 Common Pitfalls to Avoid

- ❌ Don't forget dependency arrays in `useMemo`/`useCallback`
- ❌ Don't memoize everything (only expensive operations)
- ❌ Don't split contexts without testing thoroughly
- ❌ Don't forget to update all imports after splitting
- ❌ Don't measure performance - verify improvements with profiler

---

## 📝 Notes

- **Deploy after each phase** to monitor impact
- **Test with real datasets** (1000+ trades)
- **Use React DevTools Profiler** to verify improvements
- **Monitor production metrics** after each deployment

---

**Start with Day 1 (Quick Win) - you'll see immediate results!**
