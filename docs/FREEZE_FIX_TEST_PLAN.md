# Sidebar and Dashboard Freezing - Test Plan

## Test Environment Setup

### 1. Enable Debugging Tools

Add to your dashboard URL:
- `?debugPerf=1` - Enable performance monitoring
- `?debugData=1` - Show data debug info

In browser console, run:
```javascript
// Enable all debugging tools
import { performanceMonitor, eventListenerTracker, renderTracker } from './lib/debug'

performanceMonitor.start()
eventListenerTracker.enable()
renderTracker.enable()

// View reports
setInterval(() => {
  performanceMonitor.printReport()
  eventListenerTracker.printReport()
  renderTracker.printReport()
}, 30000)
```

### 2. Browser DevTools Setup

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Enable "Memory" and "Screenshots"
4. Set CPU throttling to "6x slowdown" for testing
5. Start recording before interactions

**Firefox:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Enable "Memory" and "Screenshots"
4. Start recording before interactions

**Safari:**
1. Open Develop menu (Cmd+Option+I)
2. Go to Timelines tab
3. Start recording before interactions

## Test Scenarios

### Test 1: Sidebar Toggle Performance

**Steps:**
1. Open application
2. Press Cmd/Ctrl+B 10 times rapidly
3. Observe frame rate and responsiveness
4. Check for memory leaks

**Expected Results:**
- ✅ Sidebar toggles instantly (<100ms)
- ✅ No frame drops (should maintain 60fps)
- ✅ No memory accumulation
- ✅ No console warnings

**Failure Criteria:**
- ❌ Freeze >500ms on toggle
- ❌ Frame rate drops below 30fps
- ❌ Memory increases by >10MB
- ❌ Console shows errors or warnings

### Test 2: Widget Customization (Desktop)

**Steps:**
1. Click "Edit" button to enter customization mode
2. Drag a widget to new position
3. Hold widget for 30 seconds
4. Drop widget
5. Click outside to exit customization mode
6. Check performance metrics

**Expected Results:**
- ✅ Drag is smooth (60fps maintained)
- ✅ No memory leaks during hold
- ✅ Layout saves within 250ms after drop
- ✅ No event listeners accumulate

**Failure Criteria:**
- ❌ Drag janks or freezes
- ❌ Memory increases >20MB during drag
- ❌ Layout save fails or takes >1s
- ❌ Event listeners increase with each drag

### Test 3: Widget Customization (Mobile)

**Steps:**
1. Use mobile viewport (375x667)
2. Enable customization mode
3. Drag widget near top edge
4. Observe auto-scroll behavior
5. Drag widget near bottom edge
6. Observe auto-scroll behavior
7. Check CPU usage

**Expected Results:**
- ✅ Auto-scroll is smooth
- ✅ No high CPU usage (<50%)
- ✅ Touch events respond quickly
- ✅ No memory leaks from intervals

**Failure Criteria:**
- ❌ Auto-scroll janks or stutters
- ❌ CPU usage >80%
- ❌ Touch response delayed >100ms
- ❌ Memory leaks detected

### Test 4: Rapid State Changes

**Steps:**
1. Rapidly toggle customization mode on/off (20 times)
2. Rapidly resize window (mobile → desktop → mobile) 10 times
3. Check for race conditions or memory leaks
4. Monitor event listener count

**Expected Results:**
- ✅ All interactions complete without error
- ✅ Event listeners don't accumulate
- ✅ No memory leaks
- ✅ Console shows no errors

**Failure Criteria:**
- ❌ Event listener count increases >10
- ❌ Memory increases >50MB
- ❌ React warnings about setState on unmounted components
- ❌ Application freezes or crashes

### Test 5: Memory Leak Test

**Steps:**
1. Open Memory tab in DevTools
2. Take heap snapshot
3. Use dashboard for 10 minutes (customize, resize, toggle)
4. Take second heap snapshot
5. Compare snapshots
6. Look for detached DOM nodes

**Expected Results:**
- ✅ Memory increase <20MB after 10 minutes
- ✅ No detached DOM nodes
- ✅ No event listeners on removed elements
- ✅ GC cleans up properly

**Failure Criteria:**
- ❌ Memory increases >50MB
- ❌ Many detached DOM nodes found
- ❌ Event listeners on removed elements
- ❌ GC unable to free memory

### Test 6: Cross-Browser Testing

**Browsers to Test:**
- Chrome 120+ (Desktop & Mobile)
- Safari 17+ (Desktop & iOS)
- Firefox 121+ (Desktop)
- Edge 120+ (Desktop)

**Test Each:**
- All scenarios above
- Touch interactions on mobile
- Keyboard shortcuts
- Responsive behavior

**Expected Results:**
- ✅ Consistent behavior across browsers
- ✅ No browser-specific freezes
- ✅ Performance within acceptable limits

### Test 7: Performance Regression Test

**Steps:**
1. Establish baseline metrics on current version
2. Run all test scenarios
3. Record metrics:
   - Average render time
   - Peak memory usage
   - Event listener count
   - Frame rate during interactions
4. Compare with pre-fix metrics

**Expected Results:**
- ✅ 95% reduction in widget re-renders
- ✅ 80% reduction in layout regenerations
- ✅ 70% reduction in CPU usage during drag
- ✅ 100% fix of memory leaks

## Automated Testing Script

Create a test file at `tests/performance/sidebar-freezing.test.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Sidebar and Dashboard Freezing Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard?debugPerf=1')
    await page.waitForLoadState('networkidle')
  })

  test('sidebar toggle should be instant', async ({ page }) => {
    const startTime = Date.now()
    await page.keyboard.press('Meta+b')
    await page.waitForTimeout(100)
    const duration = Date.now() - startTime
    
    expect(duration).toBeLessThan(200)
  })

  test('widget drag should maintain 60fps', async ({ page }) => {
    const fps = await page.evaluate(async () => {
      let frames = 0
      const startTime = performance.now()
      
      return new Promise((resolve) => {
        function countFrames() {
          frames++
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames)
          } else {
            resolve(frames)
          }
        }
        requestAnimationFrame(countFrames)
      })
    })
    
    expect(fps).toBeGreaterThan(50) // Allow some margin
  })

  test('should not leak memory during customization', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // Perform 20 customization cycles
    for (let i = 0; i < 20; i++) {
      await page.click('#customize-mode')
      await page.waitForTimeout(100)
      await page.click('body') // Exit customization
      await page.waitForTimeout(100)
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024
    expect(memoryIncrease).toBeLessThan(10) // Less than 10MB increase
  })

  test('event listeners should not accumulate', async ({ page }) => {
    const initialListeners = await page.evaluate(() => {
      return window.getEventListeners?.(document).click?.length || 0
    })
    
    // Perform multiple interactions
    for (let i = 0; i < 10; i++) {
      await page.click('#customize-mode')
      await page.waitForTimeout(50)
      await page.click('body')
      await page.waitForTimeout(50)
    }
    
    const finalListeners = await page.evaluate(() => {
      return window.getEventListeners?.(document).click?.length || 0
    })
    
    expect(finalListeners).toBeLessThanOrEqual(initialListeners + 2)
  })
})
```

## Success Criteria

All tests must pass with:
- ✅ No freezing >500ms
- ✅ Frame rate ≥30fps (60fps target)
- ✅ Memory increase <20MB after 10 minutes
- ✅ No accumulating event listeners
- ✅ No console errors or warnings
- ✅ Smooth interactions on all tested browsers
- ✅ Responsive design works correctly

## Issue Escalation

If tests fail:
1. Document the specific failure
2. Capture browser console output
3. Save performance profile
4. Check for browser-specific issues
5. Verify fixes were applied correctly
6. Report bug with reproduction steps

## Continuous Monitoring

After deployment:
1. Monitor error rates in production
2. Track performance metrics with RUM (Real User Monitoring)
3. Set up alerts for:
   - High memory usage
   - Long task duration (>50ms)
   - Freeze detection
   - Error spikes

## Rollback Plan

If critical issues arise:
1. Revert changes to affected files
2. Clear CDN cache
3. Monitor for stability
4. Investigate root cause
5. Apply fixes incrementally
