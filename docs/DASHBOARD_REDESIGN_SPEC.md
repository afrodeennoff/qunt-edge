# Dashboard Redesign Specification
## Modern Trading Analytics Platform

**Version:** 2.0  
**Date:** 2026-01-31  
**Status:** Design Phase  

---

## Executive Summary

This document outlines the complete redesign of the Qunt Edge trading dashboard with focus on:
- **Modern, intuitive UI** with improved data visualization
- **Responsive design** for desktop, tablet, and mobile
- **Enhanced accessibility** (WCAG 2.1 AA compliance)
- **Interactive visualizations** with real-time updates
- **Customizable widgets** with improved UX
- **Cohesive design system** with reusable components

---

## 1. Design System Architecture

### 1.1 Core Principles

1. **Data-First Design**: Visualizations take precedence, with clear hierarchy
2. **Progressive Disclosure**: Show key metrics first, details on demand
3. **Responsive by Default**: Mobile-first approach with breakpoints at 640px, 768px, 1024px, 1280px, 1536px
4. **Accessibility First**: WCAG 2.1 AA compliance minimum, AAA where possible
5. **Performance Optimized**: 60fps animations, <100ms interaction response

### 1.2 Information Hierarchy

#### **Level 1: Critical Metrics** (Always Visible)
- Total P&L (current session/day/week)
- Win Rate
- Active Account
- Quick Actions (Add Trade, Refresh)

#### **Level 2: Performance Overview** (Above Fold)
- Equity Chart
- Today's Calendar
- Recent Trades (last 5)
- Key Statistics (Profit Factor, Risk-Reward, Expectancy)

#### **Level 3: Detailed Analysis** (Scroll/Tab)
- P&L Breakdown (by contract, time, side)
- Trade Distribution
- Advanced Metrics
- Historical Comparisons

#### **Level 4: Contextual Tools** (Drawer/Modal)
- Filters (Date range, accounts, instruments)
- Settings & Preferences
- Export & Sharing
- Help & Documentation

---

## 2. Layout System

### 2.1 Responsive Breakpoints

```typescript
// Breakpoints (Tailwind-based)
const breakpoints = {
  xs: '375px',   // Small mobile
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
}
```

### 2.2 Grid System

#### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│ Header (64px)                                            │
├─────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌─────────────────────────────────────────┐ │
│ │ Side   │ │                                         │ │
│ │ Nav    │ │          Widget Canvas                  │ │
│ │ (240px)│ │       (12-column grid)                  │ │
│ │        │ │                                         │ │
│ │        │ │                                         │ │
│ └────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌────────────────────────────────────────────┐
│ Header (56px)                              │
├────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────┐ │
│ │ Collapsed│ │                          │ │
│ │ Nav      │ │    Widget Canvas        │ │
│ │ (64px)   │ │    (6-column grid)      │ │
│ └──────────┘ │                          │ │
│             │                          │ │
│             └──────────────────────────┘ │
└────────────────────────────────────────────┘
```

#### Mobile (<768px)
```
┌─────────────────────────┐
│ Header (56px)           │
│ + Hamburger             │
├─────────────────────────┤
│ Widget Canvas           │
│ (Single column stack)   │
│                         │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

### 2.3 Spacing System

```typescript
const spacing = {
  xs: '0.25rem',   // 4px   - Tight spacing
  sm: '0.5rem',    // 8px   - Compact
  md: '1rem',      // 16px  - Default
  lg: '1.5rem',    // 24px  - Comfortable
  xl: '2rem',      // 32px  - Spacious
  '2xl': '3rem',   // 48px  - Extra spacious
  '3xl': '4rem'    // 64px  - Hero sections
}
```

---

## 3. Color System Enhancement

### 3.1 Semantic Color Tokens

Build on existing "Chromatic Performance" system:

```css
/* Performance-Based Colors (Existing) */
--chart-win: hsl(142, 76%, 36%);        /* Teal - Positive P&L */
--chart-loss: hsl(14, 78%, 58%);       /* Coral - Negative P&L */
--chart-break-even: hsl(45, 93%, 47%); /* Gold - Neutral */

/* Enhanced Semantic Palette */
--success: hsl(142, 76%, 36%);         /* Success states */
--warning: hsl(38, 92%, 50%);          /* Warning states */
--error: hsl(0, 84%, 60%);             /* Error states */
--info: hsl(199, 89%, 48%);            /* Informational */

/* UI Colors (Enhanced) */
--primary: hsl(45, 93%, 47%);          /* Primary CTAs */
--primary-hover: hsl(45, 93%, 42%);
--secondary: hsl(210, 20%, 30%);       /* Secondary actions */
--accent: hsl(199, 89%, 48%);          /* Highlights & links */

/* Surface Colors (Improved contrast) */
--surface-1: hsl(40, 20%, 10%);        /* Main background */
--surface-2: hsl(40, 15%, 14%);        /* Cards & panels */
--surface-3: hsl(40, 12%, 18%);        /* Hover states */
--surface-4: hsl(40, 10%, 22%);        /* Borders */

/* Text Colors (WCAG AAA) */
--text-primary: hsl(40, 10%, 98%);     /* Main text (16.87:1) */
--text-secondary: hsl(40, 8%, 75%);    /* Secondary text (9.87:1) */
--text-tertiary: hsl(40, 5%, 55%);     /* Disabled text (4.62:1) */
--text-inverse: hsl(40, 20%, 10%);     /* On primary/accent */
```

### 3.2 Chart Color Palette

```typescript
// Sequential (for magnitude)
const sequential = {
  teal1: '#1a4c3a',   // Darkest
  teal2: '#2d6a4f',
  teal3: '#408a64',
  teal4: '#52aa7a',
  teal5: '#6ec99b',   // Lightest
}

// Diverging (for positive/negative)
const diverging = {
  negative: '#e76f51',  // Coral
  neutral: '#f4a261',   // Gold
  positive: '#2d6a4f',  // Teal
}

// Categorical (for grouping)
const categorical = {
  blue: '#457b9d',
  teal: '#2d6a4f',
  green: '#6ec99b',
  yellow: '#e9c46a',
  orange: '#f4a261',
  red: '#e76f51',
  purple: '#9b5de5',
  pink: '#f15bb5',
}
```

---

## 4. Typography System

### 4.1 Type Scale (Modular Scale 1.250)

```typescript
const typeScale = {
  'display-2xl': '4.5rem',   // 72px - Hero titles
  'display-xl': '3.75rem',    // 60px - Page titles
  'display-lg': '3rem',       // 48px - Section headers
  'display-md': '2.25rem',    // 36px - Large headers
  h1: '1.875rem',             // 30px - Page title
  h2: '1.5rem',               // 24px - Section header
  h3: '1.25rem',              // 20px - Card title
  h4: '1.125rem',             // 18px - Subsection
  base: '1rem',               // 16px - Body text
  sm: '0.875rem',             // 14px - Small text
  xs: '0.75rem',              // 12px - Caption
  xxs: '0.625rem'             // 10px - Tiny labels
}
```

### 4.2 Font Weights

```typescript
const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

### 4.3 Line Heights

```typescript
const lineHeights = {
  tight: 1.25,      // Headings
  normal: 1.5,      // Body text
  relaxed: 1.75,    // Long-form content
}
```

---

## 5. Component Hierarchy

### 5.1 Atomic Design Structure

```
Atoms (Basic elements)
├── Buttons (Primary, Secondary, Ghost, Icon)
├── Inputs (Text, Select, Date, Checkbox)
├── Badges (Status, Metric, Alert)
├── Icons (Lucide React - 24x24, 16x16)
├── Typography variants
└── Progress indicators

Molecules (Simple combinations)
├── Search bar
├── Filter group
├── Metric card
├── Stat row
├── Button group
└── Tooltip

Organisms (Complex components)
├── Header
├── Sidebar navigation
├── Widget cards
├── Chart containers
├── Data tables
├── Forms
└── Modal dialogs

Templates (Page structures)
├── Dashboard layout
├── Settings page
├── Analysis view
└── Mobile navigation

Pages (Complete views)
├── Dashboard
├── Trades table
├── Accounts
└── Settings
```

### 5.2 Widget Card Component

```typescript
interface WidgetCardProps {
  title: string
  description?: string
  size: WidgetSize
  children: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: Error
  onRemove?: () => void
  onResize?: (size: WidgetSize) => void
  menu?: {
    onEdit?: () => void
    onRefresh?: () => void
    onExport?: () => void
  }
}
```

**Features:**
- Collapsible header
- Loading skeleton
- Error boundary
- Responsive padding
- Touch-friendly actions
- Keyboard navigation
- Focus management

---

## 6. Accessibility (WCAG 2.1 AA)

### 6.1 Color Contrast Requirements

- **Normal text** (<24px): Minimum 4.5:1 (AA), 7:1 (AAA)
- **Large text** (≥24px): Minimum 3:1 (AA), 4.5:1 (AAA)
- **UI components**: Minimum 3:1 against adjacent colors
- **Graphics**: Important visual elements need 3:1 contrast

### 6.2 Keyboard Navigation

```typescript
// Tab order must be logical
// Skip links for main content
// Focus indicators (2px solid, 3px offset)
// Focus trap in modals
// Escape to close
// Arrow keys for widgets
// Enter/Space to activate
```

### 6.3 Screen Reader Support

```tsx
// ARIA labels
<Button aria-label="Add new trade" />
<div role="status" aria-live="polite">{status}</div>
<nav aria-label="Main navigation">
<Chart aria-label="Equity curve over time" />

// Semantic HTML
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

// Hidden labels for screen readers
<span className="sr-only">Current P&L: $1,234</span>
```

### 6.4 Touch Targets

```typescript
const touchTargets = {
  minSize: '44px x 44px',  // WCAG 2.1
  recommended: '48px x 48px',
  spacing: '8px'           // Between targets
}
```

### 6.5 Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Interactive Charts Enhancement

### 7.1 Chart Features

#### **Interactivity**
- Hover tooltips with contextual data
- Click to drill down
- Zoom on double-click
- Pan on drag
- Brush selection for time range
- Data export on right-click

#### **Responsiveness**
- Resize observer for container
- Dynamic margin calculation
- Adaptive tick intervals
- Responsive font sizes
- Mobile-optimized interactions

#### **Performance**
- Virtualization for large datasets
- Canvas rendering for 10k+ points
- Memoized calculations
- Lazy loading off-screen charts
- Debounced resize handlers

### 7.2 Chart Component Structure

```typescript
interface ChartProps {
  data: ChartData
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter'
  size: WidgetSize
  theme: 'light' | 'dark'
  interactive?: boolean
  exportable?: boolean
  zoomable?: boolean
  onDrillDown?: (data: DataPoint) => void
}
```

---

## 8. Widget System Improvements

### 8.1 Enhanced Widget Canvas

#### **Grid System**
- 12-column grid (desktop)
- 4-column grid (tablet)
- Single column (mobile)
- Drag-and-drop with snap-to-grid
- Resize handles (8px touch target)
- Collision detection
- Auto-arrange option

#### **Widget Controls**
```typescript
interface WidgetControls {
  drag: Handle       // Drag handle (top-left)
  resize: Handle[]   // Resize handles (corners + edges)
  remove: Button     // Remove button (top-right)
  menu: Menu         // More options menu
  minimize: Button   // Collapse to header
  expand: Button     // Fullscreen overlay
}
```

### 8.2 Widget Categories

#### **Quick Actions** (New)
- Add Trade (FAB on mobile)
- Quick Stats toggle
- Theme switcher
- Language selector

#### **Performance** (Existing, Enhanced)
- Cumulative P&L
- Win Rate
- Profit Factor
- Risk-Reward Ratio
- Expectancy
- **New:** Session P&L (real-time)
- **New:** Daily Goal Progress

#### **Visualizations** (Existing, Enhanced)
- Equity Chart
- Daily P&L
- P&L per Contract
- **New:** Real-time P&L Stream
- **New:** Heatmap Calendar
- **New:** Performance Radar

#### **Analysis** (Existing, Enhanced)
- Trade Distribution
- Time of Day
- Day of Week
- Time in Position
- Tick Distribution
- **New:** Drawdown Chart
- **New:** Win/Loss Streak

#### **Tools** (New)
- Calculator (position size, risk)
- Trading journal
- Notes widget
- Watchlist

---

## 9. Real-Time Updates

### 9.1 Update Mechanisms

#### **Strategy 1: Server-Sent Events (SSE)**
```typescript
// For real-time P&L updates
const eventSource = new EventSource('/api/trades/stream')

eventSource.addEventListener('new-trade', (event) => {
  const trade = JSON.parse(event.data)
  // Optimistic update
  addTrade(trade)
})
```

#### **Strategy 2: Polling (Fallback)**
```typescript
// For browsers without SSE support
const POLL_INTERVAL = 30000 // 30 seconds

setInterval(async () => {
  const updates = await fetchUpdates()
  if (updates.hasNew) {
    refreshTradesOnly()
  }
}, POLL_INTERVAL)
```

#### **Strategy 3: WebSocket** (Future)
```typescript
// For collaborative features
const ws = new WebSocket('wss://api.quntedge.com/ws')

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  switch (message.type) {
    case 'trade-added':
    case 'trade-updated':
    case 'trade-deleted':
      handleTradeUpdate(message.data)
  }
}
```

### 9.2 Update Indicators

```tsx
// Show last update time
<UpdateIndicator 
  lastUpdate={lastUpdate}
  isLive={isConnected}
  onUpdate={() => refreshAllData()}
/>
```

---

## 10. Mobile Enhancements

### 10.1 Mobile-Specific Patterns

#### **Bottom Navigation**
```tsx
<BottomNav>
  <NavItem icon="layout" label="Dashboard" />
  <NavItem icon="list" label="Trades" />
  <NavItem icon="plus-circle" label="Add" highlight />
  <NavItem icon="pie-chart" label="Analysis" />
  <NavItem icon="settings" label="Settings" />
</BottomNav>
```

#### **Swipe Gestures**
- Swipe right to reveal sidebar
- Swipe left for quick actions
- Pull to refresh
- Swipe to remove widget

#### **Touch-Optimized**
- 44px minimum touch targets
- Haptic feedback on actions
- Long-press for context menu
- Pinch to zoom charts

### 10.2 Progressive Enhancement

```typescript
// Detect capabilities
const capabilities = {
  sse: typeof EventSource !== 'undefined',
  webWorker: typeof Worker !== 'undefined',
  localStorage: checkStorage(),
  touch: 'ontouchstart' in window,
  darkMode: matchMedia('(prefers-color-scheme: dark)').matches
}

// Serve appropriate experience
```

---

## 11. Performance Requirements

### 11.1 Core Web Vitals Targets

```typescript
const vitals = {
  LCP: '2.5s',  // Largest Contentful Paint
  FID: '100ms', // First Input Delay
  CLS: '0.1',   // Cumulative Layout Shift
  FCP: '1.8s',  // First Contentful Paint
  TTI: '3.8s'   // Time to Interactive
}
```

### 11.2 Optimization Strategies

1. **Code Splitting**: Route-based + component-based
2. **Lazy Loading**: Widgets loaded on-demand
3. **Image Optimization**: WebP, lazy loading, responsive images
4. **Bundle Size**: <250kb initial, <500kb total
5. **Caching**: Service worker for assets
6. **Prefetching**: Predictive navigation
7. **Compression**: Brotli + gzip fallback

---

## 12. Testing Strategy

### 12.1 Cross-Browser Testing

```typescript
// Target browsers
const browsers = {
  chrome: 'last 2 versions',
  firefox: 'last 2 versions',
  safari: 'last 2 versions',
  edge: 'last 2 versions',
  ios_saf: 'last 2 versions',
  android: 'last 2 versions'
}
```

### 12.2 Device Testing

- Desktop: 1920x1080, 2560x1440, 3840x2160
- Laptop: 1366x768, 1536x864
- Tablet: 768x1024, 1024x1366
- Mobile: 375x667, 390x844, 414x896

### 12.3 Accessibility Testing

- Automated: axe-core, pa11y
- Manual: Keyboard navigation, screen readers
- Tools: NVDA, JAWS, VoiceOver, TalkBack

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Design system setup (tokens, components)
- [ ] Layout structure (grid, spacing)
- [ ] Color system implementation
- [ ] Typography system
- [ ] Accessibility framework

### Phase 2: Core Components (Week 3-4)
- [ ] Header & navigation
- [ ] Widget card component
- [ ] Chart wrapper component
- [ ] Filter components
- [ ] Loading & error states

### Phase 3: Responsive Layouts (Week 5-6)
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout
- [ ] Breakpoint testing
- [ ] Touch interactions

### Phase 4: Interactive Features (Week 7-8)
- [ ] Enhanced charts (zoom, drill-down)
- [ ] Widget drag-and-drop
- [ ] Real-time updates (SSE)
- [ ] Live P&L indicator
- [ ] Animations & transitions

### Phase 5: Polish & Testing (Week 9-10)
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Edge case handling
- [ ] Documentation

---

## 14. Success Metrics

### 14.1 User Experience
- **Task Completion Rate**: >95% for common tasks
- **Time to First Trade**: <30 seconds from login
- **Dashboard Load Time**: <2 seconds
- **User Satisfaction**: >4.5/5 rating

### 14.2 Accessibility
- **WCAG 2.1 Compliance**: 100% AA, 80% AAA
- **Keyboard Navigation**: 100% functional
- **Screen Reader Compatibility**: NVDA, JAWS, VoiceOver, TalkBack

### 14.3 Performance
- **Lighthouse Score**: >90 (Performance, Accessibility, Best Practices)
- **Bundle Size**: <500kb total
- **Frame Rate**: Consistent 60fps
- **Load Time**: <2s on 4G

---

## 15. Future Enhancements

### 15.1 Phase 2 Features (Post-Launch)
- [ ] Custom widget builder
- [ ] Widget templates & presets
- [ ] Dashboard sharing (public/private)
- [ ] Collaborative annotations
- [ ] AI-powered insights
- [ ] Voice commands
- [ ] Offline mode
- [ ] PWA support

### 15.2 Advanced Visualizations
- [ ] 3D charts (Three.js)
- [ ] Sankey diagrams
- [ ] Heatmaps with time dimension
- [ ] Correlation matrices
- [ ] Monte Carlo simulations

---

## 16. Documentation Requirements

### 16.1 Developer Documentation
- Component API reference
- Design token documentation
- Accessibility guidelines
- Performance guidelines
- Testing guidelines

### 16.2 User Documentation
- Getting started guide
- Widget guide
- Customization tutorial
- Keyboard shortcuts
- Video tutorials

---

## Conclusion

This redesign will transform Qunt Edge into a modern, accessible, and performant trading analytics platform. The phased approach ensures incremental delivery while maintaining quality standards throughout the development process.

**Next Steps:**
1. Review and approve this specification
2. Create detailed wireframes
3. Build design system prototype
4. Begin Phase 1 implementation

---

**Last Updated:** 2026-01-31  
**Document Owner:** Design Team  
**Review Cycle:** Bi-weekly during implementation
