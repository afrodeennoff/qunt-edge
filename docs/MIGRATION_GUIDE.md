# Color Token Migration Guide

This guide helps you migrate from arbitrary color values to the centralized token system.

## Quick Reference

### Common Migrations

| Arbitrary Value | Token Replacement | Utility Class |
|----------------|-------------------|---------------|
| `bg-[#020202]` | `--bg-base` | `bg-base` |
| `bg-[#09090b]/60` | `--glass-bg` | `glass` |
| `border-white/5` | `--border-subtle` | `border-border-subtle` |
| `hover:border-teal-500/20` | `--border-focus` | `hover:border-border-focus` |
| `text-zinc-400` | `--fg-muted` | `text-fg-muted` |
| `bg-zinc-950/40` | `--glass-bg-subtle` | `bg-glass-subtle` |

## Step-by-Step Migration

### Step 1: Identify Arbitrary Values

Search for arbitrary color patterns in your codebase:

```bash
# Find arbitrary HEX colors
grep -r "bg-\[#" app/ components/

# Find arbitrary opacity values
grep -r "border-white/\|bg-white/" app/ components/

# Find zinc color usage
grep -r "text-zinc-\|bg-zinc-\|border-zinc-" app/ components/
```

### Step 2: Select Replacement Token

Review the token categories in [COLOR_TOKEN_SYSTEM.md](./COLOR_TOKEN_SYSTEM.md) and select the appropriate replacement.

**Example:**
```tsx
// Before
<div className="bg-[#09090b]/60 backdrop-blur-xl border border-white/5">

// After
<div className="glass border border-border-subtle">
```

### Step 3: Apply Migration

Replace arbitrary values with token-based classes:

```tsx
// Glassmorphism migration
// Before
<div className="bg-[#09090b]/60 backdrop-blur-xl border border-white/5">

// After (default glass)
<div className="glass">

// After (strong glass for cards)
<div className="glass-strong">

// After (subtle glass for overlays)
<div className="glass-subtle">
```

```tsx
// Border state migration
// Before
<div className="border border-white/5 hover:border-teal-500/20">

// After
<div className="border border-border-subtle hover:border-border-focus">
```

```tsx
// Text color migration
// Before
<p className="text-zinc-400">Secondary text</p>

// After
<p className="text-fg-muted">Secondary text</p>
```

### Step 4: Verify Visual Consistency

After migration, verify that the visual appearance matches the original:

1. Check component in dark mode
2. Test hover states
3. Verify focus indicators
4. Test responsive layouts
5. Validate contrast ratios

## Component-Specific Migrations

### Navbar Component

**Before:**
```tsx
<nav className="bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-[0_2px_20px_-12px_rgba(0,0,0,0.5)]">
  <SidebarTrigger className="text-zinc-400 hover:text-foreground hover:bg-white/5" />
  <div className="bg-white/5 border border-white/5 backdrop-blur-md">
    <Button className="text-zinc-400 hover:text-zinc-100 hover:bg-white/10">
      Action
    </Button>
  </div>
</nav>
```

**After:**
```tsx
<nav className="glass border-b border-border-subtle shadow-lg">
  <SidebarTrigger className="text-fg-muted hover:text-fg-primary hover:bg-glass" />
  <div className="bg-glass-subtle border border-border-subtle backdrop-blur-glass">
    <Button className="text-fg-muted hover:text-fg-primary hover:bg-glass-subtle">
      Action
    </Button>
  </div>
</nav>
```

### Card Components

**Before:**
```tsx
<div className="bg-[#09090b] border border-white/5 rounded-xl hover:border-white/10">
  <p className="text-zinc-100">Title</p>
  <p className="text-zinc-400">Description</p>
</div>
```

**After:**
```tsx
<GlassCard variant="default" hover>
  <p className="text-fg-primary">Title</p>
  <p className="text-fg-muted">Description</p>
</GlassCard>
```

### Chart Components

**Before:**
```tsx
<div style={{ color: value > 0 ? '#2dd4bf' : '#ef4444' }}>
  {value}
</div>
```

**After:**
```tsx
import { getPnLColor } from '@/lib/chart-colors';

<div style={{ color: getPnLColor(value) }}>
  {value}
</div>
```

### Interactive Elements

**Before:**
```tsx
<button className="focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2">
  Click me
</button>
```

**After:**
```tsx
import { focusRingVariants } from '@/components/ui/focus-extensions';

<button className={focusRingVariants.accent()}>
  Click me
</button>
```

## Token Selection Guide

### Background Selection

| Use Case | Token | Class |
|----------|-------|-------|
| Main page background | `--bg-base` | `bg-base` |
| Floating panels | `--bg-elevated` | `bg-elevated` |
| Default cards | `--bg-card` | `bg-card` |
| Hovered cards | `--bg-card-hover` | `bg-card-hover` |
| Modals/overlays | `--bg-modal` | `bg-modal` |
| Glass effect | `--glass-bg` | `glass` |

### Text Color Selection

| Use Case | Token | Class |
|----------|-------|-------|
| Headings, primary text | `--fg-primary` | `text-fg-primary` |
| Descriptions, body text | `--fg-secondary` | `text-fg-secondary` |
| Labels, metadata | `--fg-tertiary` | `text-fg-tertiary` |
| Timestamps, muted text | `--fg-muted` | `text-fg-muted` |
| Disabled text | `--fg-disabled` | `text-fg-disabled` |

### Border Selection

| Use Case | Token | Class |
|----------|-------|-------|
| Default borders | `--border-default` | `border-border-default` |
| Subtle borders | `--border-subtle` | `border-border-subtle` |
| Strong borders | `--border-strong` | `border-border-strong` |
| Focus indicators | `--border-focus` | `border-border-focus` |
| Error states | `--border-error` | `border-border-error` |

## Testing Checklist

After migration, verify:

- [ ] Visual appearance matches original design
- [ ] Dark mode displays correctly
- [ ] Hover states work as expected
- [ ] Focus indicators are visible
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Responsive layouts maintain appearance
- [ ] No console errors or warnings
- [ ] TypeScript types are correct
- [ ] Build completes successfully

## Automated Testing

Use the contrast validator to test color combinations:

```tsx
import { runAllContrastTests, generateContrastReport } from '@/lib/contrast-validator';

// Run all predefined contrast tests
const results = runAllContrastTests();

// Generate report
const report = generateContrastReport(Object.values(results).flat());

console.log(`Pass rate: ${report.summary.passRate}%`);
console.log(`Failed: ${report.failed.length} combinations`);

// Review failed combinations
report.failed.forEach(failure => {
  console.warn(`Low contrast: ${failure.ratio.toFixed(2)}:1 (required: ${failure.required})`);
});
```

## Common Issues and Solutions

### Issue: Class Not Found

**Problem:** Tailwind class not recognized after migration

**Solution:**
1. Verify token is defined in `styles/tokens.css`
2. Check Tailwind config in `tailwind.config.ts`
3. Restart dev server
4. Clear Tailwind cache: `rm -rf .next`

### Issue: Visual Mismatch

**Problem:** Migrated component looks different

**Solution:**
1. Compare opacity values
2. Check backdrop blur amounts
3. Verify color space (HSL vs HEX)
4. Test in different browsers

### Issue: TypeScript Errors

**Problem:** Type errors after using new utilities

**Solution:**
```tsx
// Import types
import type { FocusColor, GlassVariant } from '@/components/ui/focus-extensions';

// Use typed parameters
const focusColor: FocusColor = 'accent';
const glassVariant: GlassVariant = 'strong';
```

## Rollback Plan

If migration causes issues:

1. **Revert changes:**
   ```bash
   git checkout HEAD -- app/ components/
   ```

2. **Remove tokens import:**
   ```css
   /* Remove from app/globals.css */
   @import "../styles/tokens.css";
   ```

3. **Restart dev server**

4. **Address migration issues incrementally**

## Best Practices

### Incremental Migration

Migrate components incrementally rather than all at once:

1. Start with utility components (buttons, cards)
2. Move to layout components (navbar, sidebar)
3. End with complex components (charts, tables)

### Testing Strategy

Test each migrated component:

```tsx
// Test component with tokens
import { render, screen } from '@testing-library/react';
import MyComponent from './my-component';

test('migrated component renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Documentation Updates

Update component docs after migration:

```tsx
/**
 * MyComponent - Migrated to token system
 * 
 * @example
 * ```tsx
 * <MyComponent className="glass" />
 * ```
 */
export function MyComponent() {
  // ...
}
```

## Resources

- [Color Token System Documentation](./COLOR_TOKEN_SYSTEM.md)
- Token definitions: `styles/tokens.css`
- Contrast validator: `lib/contrast-validator.ts`
- Migration example: `app/[locale]/dashboard/components/navbar.tsx`

## Support

For migration issues:
1. Check this guide first
2. Review token documentation
3. Run contrast validation tests
4. Create issue with examples

## Changelog

### v1.0.0 (2026-01-31)
- Initial token system implementation
- 7-level background hierarchy
- Standardized teal accent system
- Zinc neutral palette
- Glassmorphism tokens
- Interactive border states
- Unified chart colors
- Focus state extensions
- Contrast validation utilities
