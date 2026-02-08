# Card Component System Documentation

A comprehensive, modern card design system with multiple variants, sizes, and interactive states.

## Overview

The card system provides:
- **Multiple variants** for different use cases (default, glass, elevated, outlined, flat)
- **Consistent sizing** (sm, md, lg) across all card components
- **Responsive design** with mobile-first approach
- **Accessibility** with proper ARIA attributes and keyboard navigation
- **Interactive states** with smooth transitions and animations
- **Dark mode support** using design tokens

## Base Card Component

The `Card` component is the foundation of the card system.

### Variants

```tsx
import { Card } from "@/components/ui/card"

// Default card with border and subtle shadow
<Card variant="default">...</Card>

// Glass morphism effect with backdrop blur
<Card variant="glass">...</Card>

// Elevated card with stronger shadow
<Card variant="elevated">...</Card>

// Outlined card with 2px border and no background
<Card variant="outlined">...</Card>

// Flat card with no border or shadow
<Card variant="flat">...</Card>
```

### Sizes

```tsx
// Small padding (0.75rem / 12px)
<Card size="sm">...</Card>

// Medium padding (1rem / 16px) - default
<Card size="md">...</Card>

// Large padding (1.5rem / 24px)
<Card size="lg">...</Card>
```

### Interactive States

```tsx
// Hover effect with elevation and border color change
<Card hover>...</Card>

// Clickable with cursor and active state
<Card clickable onClick={handleClick}>
  ...
</Card>
```

### Composition

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Actions or footer content
  </CardFooter>
</Card>
```

## Specialized Card Components

### StatsCard

For displaying statistics with icons, trends, and descriptions.

```tsx
import { StatsCard } from "@/components/ui/stats-card"
import { TrendingUp } from "lucide-react"

<StatsCard
  title="Total Revenue"
  value="$125,430"
  icon={TrendingUp}
  trend={{
    value: 12.5,
    isPositive: true
  }}
  description="vs last month"
  size="md"
  onClick={handleClick}
/>
```

**Props:**
- `title` (string) - Label for the stat
- `value` (string | number) - Main value to display
- `icon?` (LucideIcon) - Optional icon component
- `trend?` (object) - Optional trend indicator
  - `value` (number) - Percentage change
  - `isPositive` (boolean) - Whether trend is positive
- `description?` (string) - Optional description text
- `size?` ('sm' | 'md' | 'lg') - Size variant
- `onClick?` () => void - Click handler

### MediaCard

For displaying images/videos with titles and metadata.

```tsx
import { MediaCard } from "@/components/ui/media-card"

<MediaCard
  image="/path/to/image.jpg"
  title="Amazing Landscape"
  subtitle="Photography Collection"
  description="A beautiful view of mountains during sunset."
  badges={[
    { label: "Featured", variant: "default" },
    { label: "New", variant: "secondary" }
  ]}
  actions={
    <>
      <Button variant="outline">Share</Button>
      <Button>View Details</Button>
    </>
  }
  imageAspect="video"
  size="md"
  onClick={handleClick}
/>
```

**Props:**
- `image` (string) - Image URL
- `title` (string) - Card title
- `subtitle?` (string) - Optional subtitle
- `description?` (string) - Optional description
- `badges?` (array) - Optional badges
  - `label` (string) - Badge text
  - `variant?` - Badge style variant
- `actions?` (ReactNode) - Action buttons
- `imageAspect?` ('video' | 'square' | 'portrait') - Image aspect ratio
- `size?` ('sm' | 'md' | 'lg') - Size variant
- `onClick?` () => void - Click handler

### ActionCard

For cards with call-to-action buttons.

```tsx
import { ActionCard } from "@/components/ui/action-card"
import { CheckCircle2 } from "lucide-react"

<ActionCard
  title="Complete Your Profile"
  description="Add your profile information to get discovered by more clients."
  icon={CheckCircle2}
  status="default"
  primaryAction={{
    label: "Complete Profile",
    onClick: handleComplete,
    variant: "default"
  }}
  secondaryAction={{
    label: "Skip for Now",
    onClick: handleSkip
  }}
  size="md"
/>
```

**Props:**
- `title` (string) - Card title
- `description?` (string) - Optional description
- `icon?` (LucideIcon) - Optional icon
- `primaryAction?` (object) - Primary action button
  - `label` (string) - Button text
  - `onClick` () => void - Click handler
  - `variant?` - Button style variant
- `secondaryAction?` (object) - Secondary action button
  - `label` (string) - Button text
  - `onClick` () => void - Click handler
- `size?` ('sm' | 'md' | 'lg') - Size variant
- `status?` ('default' | 'success' | 'warning' | 'error') - Icon background color

### GlassCard

For glass morphism effect with backdrop blur.

```tsx
import { GlassCard } from "@/components/ui/glass-card"

<GlassCard
  variant="default"
  hover
  size="md"
  clickable
  onClick={handleClick}
>
  Content with glass effect
</GlassCard>
```

**Props:**
- `variant?` ('default' | 'strong' | 'subtle') - Glass intensity
- `hover?` (boolean) - Enable hover effect
- `size?` ('sm' | 'md' | 'lg') - Size variant
- `clickable?` (boolean) - Enable click interaction

## Design Tokens

Card-specific CSS custom properties defined in `styles/tokens.css`:

```css
--card-radius-sm: 0.5rem;
--card-radius-md: 0.75rem;
--card-radius-lg: 1rem;

--card-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--card-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--card-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--card-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

--card-padding-sm: 0.75rem;
--card-padding-md: 1rem;
--card-padding-lg: 1.5rem;
--card-padding-xl: 2rem;
```

## Utility Classes

Card utility classes available in `styles/tokens.css`:

```css
/* Shadow utilities */
.card-shadow-sm
.card-shadow-md
.card-shadow-lg
.card-shadow-xl

/* Border radius utilities */
.card-radius-sm
.card-radius-md
.card-radius-lg

/* Hover effect */
.card-hover

/* Clickable interaction */
.card-clickable
```

## Accessibility Features

- **Semantic HTML** - Proper use of `<article>`, `<section>`, `<h3>` elements
- **ARIA attributes** - Proper role attributes where needed
- **Keyboard navigation** - All interactive cards are keyboard accessible
- **Focus indicators** - Visible focus states for keyboard users
- **Screen reader support** - Proper labeling and descriptions
- **Touch targets** - Minimum 44x44px touch target size for mobile

## Responsive Behavior

All card components are responsive with:

- **Mobile-first approach** - Base styles optimized for mobile
- **Fluid spacing** - Spacing scales with viewport size
- **Flexible widths** - Cards adapt to container width
- **Breakpoint-aware** - Adjust layouts at different screen sizes

Example responsive grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

## Animation & Transitions

All cards use consistent animation tokens:

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
```

Hover effects:
- Subtle lift (`translateY(-2px)`)
- Shadow enhancement
- Border color change
- Smooth 200ms transition

## Dark Mode Support

All card components automatically adapt to dark mode using CSS custom properties:

```css
.dark {
  --background: ...;
  --card: ...;
  --border: ...;
  --card-foreground: ...;
}
```

## Best Practices

1. **Choose the right variant** for your use case:
   - Use `default` for general content
   - Use `glass` for overlays and modern designs
   - Use `elevated` for important cards that need emphasis
   - Use `outlined` for subtle boundaries without background
   - Use `flat` for minimal borders

2. **Maintain consistent sizing** within the same context

3. **Provide meaningful hover states** for interactive cards

4. **Include proper ARIA labels** for cards with actions

5. **Test with keyboard navigation** and screen readers

6. **Use appropriate image aspect ratios** for MediaCard

7. **Keep card content focused** - avoid overcrowding

## Migration Guide

### From Old Card Component

**Before:**
```tsx
<Card className="rounded-lg border bg-card shadow-xs">
  ...
</Card>
```

**After:**
```tsx
<Card variant="default" size="md" hover>
  ...
</Card>
```

### Key Changes

1. **Removed manual styling** - Use variant prop instead
2. **Added size prop** - Consistent sizing system
3. **Added hover prop** - Built-in hover effects
4. **Enhanced accessibility** - Better ARIA support
5. **Improved TypeScript** - Exported interfaces for all components

## Examples

### Dashboard Stats Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard title="Revenue" value="$45,231" icon={DollarSign} trend={{value: 20, isPositive: true}} />
  <StatsCard title="Users" value="2,345" icon={Users} trend={{value: 5, isPositive: true}} />
  <StatsCard title="Orders" value="1,234" icon={ShoppingCart} trend={{value: 2, isPositive: false}} />
  <StatsCard title="Growth" value="45%" icon={TrendingUp} />
</div>
```

### Feature Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <ActionCard
    title="Real-time Analytics"
    description="Monitor your performance with live updates."
    icon={BarChart3}
    primaryAction={{label: "Get Started", onClick: handleStart}}
    size="lg"
  />
  <ActionCard
    title="Team Collaboration"
    description="Work together seamlessly with your team."
    icon={Users}
    primaryAction={{label: "Learn More", onClick: handleLearn}}
    size="lg"
  />
</div>
```

### Content Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(post => (
    <MediaCard
      key={post.id}
      image={post.image}
      title={post.title}
      description={post.excerpt}
      badges={[{label: post.category}]}
      actions={<Button variant="ghost">Read More</Button>}
      onClick={() => navigate(post.slug)}
    />
  ))}
</div>
```

## Future Enhancements

Potential additions to the card system:
- `SwipeableCard` for mobile gesture interactions
- `DraggableCard` for dashboard layouts
- `ExpandableCard` with collapse/expand functionality
- `StackedCard` for card stack layouts
- `SortableCard` with drag-and-drop reordering
- `TimelineCard` for chronological content

## Contributing

When adding new card variants:

1. Follow the existing naming conventions
2. Use the size system (sm, md, lg)
3. Support all variant props
4. Include proper TypeScript interfaces
5. Add accessibility attributes
6. Update this documentation
7. Add examples to the storybook/knobs

## Support

For issues or questions about the card system:
- Check existing components for similar patterns
- Refer to design tokens in `styles/tokens.css`
- Follow accessibility guidelines (WCAG 2.1 AA)
- Test in both light and dark modes
- Verify responsive behavior at breakpoints