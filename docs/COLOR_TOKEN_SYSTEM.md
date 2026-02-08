# Color Token System Documentation

## Overview

This document provides comprehensive documentation for the centralized color token system. The token-based architecture replaces arbitrary color values with semantic, maintainable design tokens.

## Token Categories

### Background Hierarchy (7 Levels)

Semantic background tokens from darkest to lightest for layered interfaces:

| Token | CSS Variable | Usage | Example |
|-------|--------------|-------|---------|
| `--bg-base` | `240 10% 3.9%` | Deepest background, main page background | Page body, main content area |
| `--bg-elevated` | `240 10% 5%` | Slightly elevated elements | Floating panels, dropdowns |
| `--bg-card` | `240 10% 7%` | Card backgrounds | Default cards, content cards |
| `--bg-card-hover` | `240 10% 9%` | Card hover state | Hovered cards |
| `--bg-overlay` | `240 10% 11%` | Overlay backgrounds | Modals, sheet overlays |
| `--bg-modal` | `240 10% 13%` | Modal backgrounds | Active modal content |
| `--bg-highlight` | `240 10% 15%` | Highlighted elements | Selected items, active states |

**Implementation:**
```css
.element { background-color: hsl(var(--bg-base)); }
.hover-element { background-color: hsl(var(--bg-card-hover)); }
```

### Primary Accent (Teal-500)

Standardized teal accent color for CTAs and success states:

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-teal` | `173 58% 39%` | Primary CTAs, success states |
| `--accent-teal-hover` | `173 58% 44%` | Hover states |
| `--accent-teal-active` | `173 58% 34%` | Active/pressed states |
| `--accent-teal-subtle` | `173 58% 39% / 0.1` | Background accents |
| `--accent-teal-glow` | `173 58% 39% / 0.3` | Glow effects |

**Implementation:**
```tsx
<Button className="bg-accent-teal hover:bg-accent-teal-hover">
  Primary Action
</Button>
```

### Neutral Palette (Zinc Scale)

Complete zinc palette for neutral elements:

| Token | Lightness | Usage |
|-------|-----------|-------|
| `--neutral-50` | 96% | Light backgrounds (light mode) |
| `--neutral-100` | 90% | Subtle borders |
| `--neutral-200` | 80% | Disabled elements |
| `--neutral-300` | 70% | Placeholder text |
| `--neutral-400` | 60% | Secondary borders |
| `--neutral-500` | 50% | Muted text |
| `--neutral-600` | 40% | Secondary text |
| `--neutral-700` | 30% | Primary text (light mode) |
| `--neutral-800` | 20% | Darker backgrounds |
| `--neutral-900` | 10% | Cards, elevated surfaces |
| `--neutral-950` | 3.9% | Deepest backgrounds |

**Implementation:**
```tsx
<div className="bg-neutral-900 text-neutral-500">
  Dark card with muted text
</div>
```

### Foreground Colors

Semantic text color tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--fg-primary` | `0 0% 98%` | Primary text, headings |
| `--fg-secondary` | `240 5% 65%` | Secondary text, descriptions |
| `--fg-tertiary` | `240 5% 45%` | Tertiary text, labels |
| `--fg-muted` | `240 5% 35%` | Muted text, timestamps |
| `--fg-disabled` | `240 5% 25%` | Disabled text |

### Border Colors

Semantic border tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--border-default` | `240 4% 20%` | Default borders |
| `--border-subtle` | `240 4% 15%` | Subtle borders, separators |
| `--border-strong` | `240 4% 25%` | Strong borders, focus indicators |
| `--border-focus` | `173 58% 39%` | Focus rings |
| `--border-error` | `0 62% 50%` | Error borders |
| `--border-warning` | `35 85% 55%` | Warning borders |
| `--border-success` | `173 58% 39%` | Success borders |

### Glassmorphism Tokens

Standardized glass effects:

| Token | Value | Usage |
|-------|-------|-------|
| `--glass-bg` | `hsl(240 10% 5% / 0.6)` | Default glass background |
| `--glass-bg-strong` | `hsl(240 10% 7% / 0.8)` | Stronger glass effect |
| `--glass-bg-subtle` | `hsl(240 10% 3.9% / 0.4)` | Subtle glass effect |
| `--glass-blur` | `blur(20px)` | Default blur amount |
| `--glass-blur-strong` | `blur(40px)` | Strong blur amount |
| `--glass-border` | `255 255 255 / 0.05` | Glass border color |
| `--glass-shadow` | `0 8px 32px rgba(0, 0, 0, 0.4)` | Glass shadow |

**Utility Classes:**
```tsx
<div className="glass">Default glass effect</div>
<div className="glass-strong">Strong glass effect</div>
<div className="glass-subtle">Subtle glass effect</div>
```

### Interactive States

Standardized interactive state tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--hover-overlay` | `255 255 255 / 0.05` | Hover overlay |
| `--hover-accent` | `173 58% 39% / 0.1` | Accent hover |
| `--active-overlay` | `255 255 255 / 0.1` | Active overlay |
| `--focus-ring` | `173 58% 39% / 0.5` | Focus ring color |
| `--focus-ring-offset` | `0 0 0 2px var(--bg-base)` | Focus ring offset |

### Semantic Colors

Application-specific semantic colors:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-error` | `0 62% 50%` | Error text, icons |
| `--color-error-bg` | `0 62% 50% / 0.1` | Error backgrounds |
| `--color-warning` | `35 85% 55%` | Warning text, icons |
| `--color-warning-bg` | `35 85% 55% / 0.1` | Warning backgrounds |
| `--color-success` | `173 58% 39%` | Success text, icons |
| `--color-success-bg` | `173 58% 39% / 0.1` | Success backgrounds |
| `--color-info` | `217 91% 60%` | Info text, icons |
| `--color-info-bg` | `217 91% 60% / 0.1` | Info backgrounds |

### Chart Colors

Unified chart color system:

| Token | Value | Usage |
|-------|-------|-------|
| `--chart-positive` | `173 58% 39%` | Positive PnL, gains |
| `--chart-negative` | `0 62% 55%` | Negative PnL, losses |
| `--chart-neutral` | `240 5% 50%` | Neutral values |
| `--chart-1` through `--chart-8` | Various colors | Multi-category charts |

**Implementation:**
```tsx
import { getPnLColor } from '@/lib/chart-colors';

<div style={{ color: getPnLColor(value) }}>
  {value > 0 ? 'Profit' : 'Loss'}
</div>
```

## Component Integration

### Button Component

```tsx
import { getFocusRingClasses } from '@/components/ui/focus-extensions';

<Button className={getFocusRingClasses({ color: 'accent' })}>
  Primary Action
</Button>
```

### Glass Card Component

```tsx
import { GlassCard } from '@/components/ui/glass-card';

<GlassCard variant="strong" hover>
  Content with glass effect
</GlassCard>
```

### Interactive Border Component

```tsx
import { InteractiveBorder } from '@/components/ui/interactive-border';

<InteractiveBorder focusColor="accent">
  Content with interactive borders
</InteractiveBorder>
```

## Accessibility

### Contrast Validation

Use the contrast validator to ensure accessibility compliance:

```tsx
import { validateColorPair, CONTRAST_RATIOS } from '@/lib/contrast-validator';

const result = validateColorPair(
  'hsl(0 0% 98%)',  // foreground
  'hsl(240 10% 3.9%)',  // background
  'AA_NORMAL'
);

console.log(result.isValid, result.ratio);
```

### Focus States

Expanded focus state animations beyond teal:

```tsx
import { focusRingVariants } from '@/components/ui/focus-extensions';

// Accent focus (default)
<Button className={focusRingVariants.accent()}>Action</Button>

// Error focus
<Button className={focusRingVariants.error()}>Delete</Button>

// Warning focus
<Button className={focusRingVariants.warning()}>Warning</Button>

// Success focus
<Button className={focusRingVariants.success()}>Confirm</Button>
```

## Best Practices

### DO ✅

- Use semantic token names (`--bg-card`, `--fg-primary`)
- Apply tokens through utility classes
- Test contrast ratios for new color combinations
- Use HSL format for consistency
- Document any custom color additions

### DON'T ❌

- Use arbitrary values (`bg-[#09090b]`)
- Mix color formats (HEX, RGBA, HSL)
- Skip focus states for interactive elements
- Create new tokens without review
- Hardcode colors in components

## Migration Guide

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## Governance

### Adding New Colors

1. Define token in `styles/tokens.css`
2. Add TypeScript types in `lib/color-tokens.ts`
3. Update Tailwind config in `styles/tailwind-theme.ts`
4. Run contrast validation tests
5. Update this documentation

### Color Modification Process

1. Proposal with use case examples
2. Accessibility review (contrast ratios)
3. Design team approval
4. Implementation in token system
5. Update documentation
6. Migration plan for existing usage

## Resources

- Token definitions: `styles/tokens.css`
- TypeScript utilities: `lib/color-tokens.ts`
- Contrast validation: `lib/contrast-validator.ts`
- Chart colors: `lib/chart-colors.ts`
- Focus extensions: `components/ui/focus-extensions.tsx`
