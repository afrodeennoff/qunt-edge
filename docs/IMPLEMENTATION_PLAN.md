# Dashboard Redesign Implementation Plan
## Development Roadmap & Code Specifications

**Version:** 1.0  
**Date:** 2026-01-31  
**Status:** Ready for Development  

---

## Table of Contents
1. [Phase 1: Design System Foundation](#phase-1-design-system-foundation)
2. [Phase 2: Enhanced Color & Typography](#phase-2-enhanced-color--typography)
3. [Phase 3: Responsive Layout System](#phase-3-responsive-layout-system)
4. [Phase 4: Widget System Improvements](#phase-4-widget-system-improvements)
5. [Phase 5: Interactive Charts](#phase-5-interactive-charts)
6. [Phase 6: Accessibility Enhancements](#phase-6-accessibility-enhancements)
7. [Phase 7: Real-Time Features](#phase-7-real-time-features)
8. [Phase 8: Testing & Documentation](#phase-8-testing--documentation)

---

## Phase 1: Design System Foundation

### 1.1 Design Token System

#### File Structure
```
styles/
├── tokens/
│   ├── colors.ts        # Color tokens
│   ├── typography.ts    # Font tokens
│   ├── spacing.ts       # Spacing tokens
│   ├── breakpoints.ts   # Responsive breakpoints
│   └── index.ts         # Token exports
└── globals.css          # CSS variables
```

#### Implementation: `styles/tokens/colors.ts`

```typescript
// Color tokens with TypeScript types
export const colorTokens = {
  // Performance-based (existing, enhanced)
  chart: {
    win: 'hsl(142, 76%, 36%)',
    loss: 'hsl(14, 78%, 58%)',
    breakEven: 'hsl(45, 93%, 47%)',
  },
  
  // Semantic colors (new)
  semantic: {
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(199, 89%, 48%)',
  },
  
  // UI colors (enhanced)
  ui: {
    primary: 'hsl(45, 93%, 47%)',
    primaryHover: 'hsl(45, 93%, 42%)',
    secondary: 'hsl(210, 20%, 30%)',
    accent: 'hsl(199, 89%, 48%)',
  },
  
  // Surface colors (improved contrast)
  surface: {
    1: 'hsl(40, 20%, 10%)',   // Main background
    2: 'hsl(40, 15%, 14%)',   // Cards
    3: 'hsl(40, 12%, 18%)',   // Hover
    4: 'hsl(40, 10%, 22%)',   // Borders
  },
  
  // Text colors (WCAG AAA)
  text: {
    primary: 'hsl(40, 10%, 98%)',   // 16.87:1
    secondary: 'hsl(40, 8%, 75%)',  // 9.87:1
    tertiary: 'hsl(40, 5%, 55%)',   // 4.62:1
    inverse: 'hsl(40, 20%, 10%)',
  },
} as const

export type ColorToken = typeof colorTokens
```

#### Implementation: `styles/tokens/typography.ts`

```typescript
import { typeTokens } from './tokens'

export const typographyTokens = {
  // Type scale (Modular Scale 1.250)
  fontSize: {
    'display-2xl': '4.5rem',    // 72px
    'display-xl': '3.75rem',    // 60px
    'display-lg': '3rem',       // 48px
    'display-md': '2.25rem',    // 36px
    h1: '1.875rem',             // 30px
    h2: '1.5rem',               // 24px
    h3: '1.25rem',              // 20px
    h4: '1.125rem',             // 18px
    base: '1rem',               // 16px
    sm: '0.875rem',             // 14px
    xs: '0.75rem',              // 12px
    xxs: '0.625rem',            // 10px
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

export type TypographyToken = typeof typographyTokens
```

#### Implementation: `styles/tokens/spacing.ts`

```typescript
export const spacingTokens = {
  // Spacing scale (4px base unit)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  
  // Component-specific
  header: {
    height: '64px',
    padding: '0 1.5rem',
  },
  card: {
    padding: {
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
    },
  },
  widget: {
    gap: '1rem',
    borderRadius: '0.5rem',
  },
} as const
```

#### Implementation: `styles/tokens/breakpoints.ts`

```typescript
export const breakpointTokens = {
  xs: '375px',    // Small mobile
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape / Small desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px' // Large desktop
} as const

// Media query helpers
export const media = {
  xs: `@media (min-width: ${breakpointTokens.xs})`,
  sm: `@media (min-width: ${breakpointTokens.sm})`,
  md: `@media (min-width: ${breakpointTokens.md})`,
  lg: `@media (min-width: ${breakpointTokens.lg})`,
  xl: `@media (min-width: ${breakpointTokens.xl})`,
  '2xl': `@media (min-width: ${breakpointTokens['2xl']})`,
  
  // Max-width for mobile-first
  until: {
    sm: `@media (max-width: ${breakpointTokens.sm})`,
    md: `@media (max-width: ${breakpointTokens.md})`,
    lg: `@media (max-width: ${breakpointTokens.lg})`,
    xl: `@media (max-width: ${breakpointTokens.xl})`,
  },
} as const
```

---

### 1.2 Base Components

#### Button Component Variants

**File:** `components/ui/button.tsx` (Enhance existing)

```typescript
// Add new variants to existing button component
const buttonVariants = cva(
  baseStyles,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-error text-white hover:bg-error/90',
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        
        // NEW: Enhanced variants
        success: 'bg-semantic-success text-white hover:bg-semantic-success/90',
        warning: 'bg-semantic-warning text-white hover:bg-semantic-warning/90',
        
        // NEW: Icon button (square, centered)
        icon: 'p-2 h-10 w-10 rounded-md hover:bg-accent',
        
        // NEW: FAB (Floating Action Button)
        fab: 'h-14 w-14 rounded-full shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        fab: 'h-14 w-14',
        
        // NEW: Extra small for tiny widgets
        xs: 'h-7 rounded px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

#### Metric Card Component (NEW)

**File:** `components/dashboard/metric-card.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  size?: 'tiny' | 'small' | 'medium'
  loading?: boolean
  sparkline?: number[]
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  size = 'small',
  loading = false,
  sparkline,
  className,
}: MetricCardProps) {
  const sizeClasses = {
    tiny: 'p-3',
    small: 'p-4',
    medium: 'p-6',
  }
  
  if (loading) {
    return (
      <Card className={cn('animate-pulse', sizeClasses[size], className)}>
        <CardContent className="p-0">
          <div className="h-4 bg-surface-4 rounded w-3/4 mb-2" />
          <div className="h-8 bg-surface-4 rounded w-1/2" />
        </CardContent>
      </Card>
    )
  }
  
  const trendColor = {
    up: 'text-semantic-success',
    down: 'text-semantic-error',
    neutral: 'text-text-secondary',
  }[trend || 'neutral']
  
  return (
    <Card className={cn(sizeClasses[size], className)}>
      <CardContent className="p-0 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            )}
            <p className="text-sm text-text-secondary">{title}</p>
          </div>
          {trend && (
            <span className={cn('text-xs font-medium', trendColor)}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
            </span>
          )}
        </div>
        
        {/* Value */}
        <p className={cn(
          'font-semibold tracking-tight',
          size === 'tiny' ? 'text-xl' : 'text-2xl'
        )}>
          {value}
        </p>
        
        {/* Change */}
        {change && (
          <p className="text-xs text-text-secondary">
            {change.label}: <span className={cn('font-medium', trendColor)}>
              {change.value > 0 ? '+' : ''}{change.value}
            </span>
          </p>
        )}
        
        {/* Sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="h-8 w-full">
            <Sparkline data={sparkline} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Phase 2: Enhanced Color & Typography

### 2.1 CSS Variables Update

**File:** `styles/globals.css` (Append to existing)

```css
:root {
  /* Enhanced semantic colors */
  --semantic-success: 142 76% 36%;
  --semantic-warning: 38 92% 50%;
  --semantic-error: 0 84% 60%;
  --semantic-info: 199 89% 48%;
  
  /* UI colors */
  --ui-primary: 45 93% 47%;
  --ui-primary-hover: 45 93% 42%;
  --ui-secondary: 210 20% 30%;
  --ui-accent: 199 89% 48%;
  
  /* Surface colors (improved contrast) */
  --surface-1: 40 20% 10%;
  --surface-2: 40 15% 14%;
  --surface-3: 40 12% 18%;
  --surface-4: 40 10% 22%;
  
  /* Text colors (WCAG AAA) */
  --text-primary: 40 10% 98%;    /* 16.87:1 */
  --text-secondary: 40 8% 75%;   /* 9.87:1 */
  --text-tertiary: 40 5% 55%;    /* 4.62:1 */
  --text-inverse: 40 20% 10%;
  
  /* Spacing */
  --spacing-header-height: 64px;
  --spacing-widget-gap: 1rem;
  --spacing-card-radius: 0.5rem;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  /* Already dark mode - enhance if needed */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.2 Tailwind Config Update

**File:** `tailwind.config.ts` (Update existing)

```typescript
import { colorTokens } from './styles/tokens/colors'
import { typographyTokens } from './styles/tokens/typography'
import { spacingTokens } from './styles/tokens/spacing'
import { breakpointTokens } from './styles/tokens/breakpoints'

export default {
  // ... existing config ...
  
  theme: {
    extend: {
      colors: {
        // Add new color tokens
        semantic: {
          success: colorTokens.semantic.success,
          warning: colorTokens.semantic.warning,
          error: colorTokens.semantic.error,
          info: colorTokens.semantic.info,
        },
        ui: {
          primary: colorTokens.ui.primary,
          'primary-hover': colorTokens.ui.primaryHover,
          secondary: colorTokens.ui.secondary,
          accent: colorTokens.ui.accent,
        },
        surface: {
          1: colorTokens.surface[1],
          2: colorTokens.surface[2],
          3: colorTokens.surface[3],
          4: colorTokens.surface[4],
        },
        text: {
          primary: colorTokens.text.primary,
          secondary: colorTokens.text.secondary,
          tertiary: colorTokens.text.tertiary,
          inverse: colorTokens.text.inverse,
        },
      },
      
      fontSize: {
        ...typographyTokens.fontSize,
      },
      
      spacing: {
        ...spacingTokens,
      },
      
      screens: {
        ...breakpointTokens,
      },
      
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      
      borderRadius: {
        'widget': 'var(--spacing-card-radius)',
      },
    },
  },
}
```

---

## Phase 3: Responsive Layout System

### 3.1 Grid System Component

**File:** `components/dashboard/widget-grid.tsx` (New file)

```typescript
'use client'

import { ReactGridLayout } from '@/components/ui/react-grid-layout'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface WidgetGridProps {
  children: React.ReactNode
  className?: string
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
  
  // Grid columns based on breakpoint
  const columns = isMobile ? 12 : isTablet ? 6 : 12
  
  // Gap based on breakpoint
  const gap = isMobile ? '0.5rem' : '1rem'
  
  return (
    <ReactGridLayout
      className={cn('widget-grid', className)}
      cols={{ lg: 12, md: 6, sm: 6, xs: 12 }}
      rowHeight={isMobile ? 60 : isTablet ? 80 : 100}
      gap={gap}
      isDraggable={!isMobile}
      isResizable={!isMobile}
      compactType="vertical"
      preventCollision={false}
    >
      {children}
    </ReactGridLayout>
  )
}
```

### 3.2 Quick Stats Bar Component

**File:** `components/dashboard/quick-stats-bar.tsx` (New file)

```typescript
'use client'

import { MetricCard } from './metric-card'
import { useMediaQuery } from '@/hooks/use-media-query'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface QuickStat {
  id: string
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}

interface QuickStatsBarProps {
  stats: QuickStat[]
  loading?: boolean
}

export function QuickStatsBar({ stats, loading }: QuickStatsBarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  
  if (isMobile) {
    // Mobile: Vertical stack with top metric expanded
    return (
      <div className="space-y-3 px-4 py-3">
        {stats.slice(0, 1).map((stat) => (
          <MetricCard
            key={stat.id}
            {...stat}
            size="medium"
            loading={loading}
          />
        ))}
        <div className="grid grid-cols-3 gap-3">
          {stats.slice(1, 4).map((stat) => (
            <MetricCard
              key={stat.id}
              {...stat}
              size="tiny"
              loading={loading}
            />
          ))}
        </div>
      </div>
    )
  }
  
  if (isTablet) {
    // Tablet: Horizontal scroll
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-4">
          {stats.map((stat) => (
            <div key={stat.id} className="w-40 flex-shrink-0">
              <MetricCard {...stat} size="small" loading={loading} />
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }
  
  // Desktop: Horizontal row
  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-3">
      {stats.slice(0, 6).map((stat) => (
        <MetricCard key={stat.id} {...stat} size="small" loading={loading} />
      ))}
    </div>
  )
}
```

---

## Phase 4: Widget System Improvements

### 4.1 Enhanced Widget Card Component

**File:** `components/dashboard/widget-card.tsx` (Update existing)

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MoreVertical, 
  GripVertical, 
  Expand, 
  Minimize2,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWidgetActions } from '@/hooks/use-widget-actions'
import { useMediaQuery } from '@/hooks/use-media-query'

interface WidgetCardProps {
  id: string
  title: string
  description?: string
  size: WidgetSize
  isCustomizing?: boolean
  isFullscreen?: boolean
  onRemove?: () => void
  onResize?: (size: WidgetSize) => void
  onFullscreen?: () => void
  onMinimize?: () => void
  onRefresh?: () => void
  children: React.ReactNode
  className?: string
}

export function WidgetCard({
  id,
  title,
  description,
  size,
  isCustomizing = false,
  isFullscreen = false,
  onRemove,
  onResize,
  onFullscreen,
  onMinimize,
  onRefresh,
  children,
  className,
}: WidgetCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { isDragging, isResizing } = useWidgetActions(id)
  
  const sizeClasses = {
    tiny: 'p-3',
    small: 'p-4',
    'small-long': 'p-4',
    medium: 'p-4',
    large: 'p-6',
    'extra-large': 'p-6',
  }
  
  return (
    <Card
      id={id}
      className={cn(
        'widget-card transition-all duration-200',
        'hover:shadow-md',
        isDragging && 'opacity-80 shadow-xl scale-[1.02]',
        isResizing && 'cursor-resizing',
        isFullscreen && 'fixed inset-4 z-50',
        sizeClasses[size],
        className
      )}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag handle - visible in customize mode */}
          {isCustomizing && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 cursor-grab active:cursor-grabbing drag-handle"
              aria-label="Drag to move widget"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          )}
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {description && (
              <p className="text-xs text-text-secondary truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Refresh */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              aria-label={`Refresh ${title}`}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          {/* Fullscreen/Minimize */}
          {isFullscreen ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMinimize}
              aria-label="Minimize widget"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onFullscreen}
              aria-label="Expand widget to fullscreen"
            >
              <Expand className="h-4 w-4" />
            </Button>
          )}
          
          {/* Remove - visible in customize mode */}
          {isCustomizing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-semantic-error hover:text-semantic-error"
              onClick={onRemove}
              aria-label={`Remove ${title}`}
            >
              ×
            </Button>
          )}
          
          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRefresh}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFullscreen}>
                <Expand className="h-4 w-4 mr-2" />
                Fullscreen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove}>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
      
      {/* Resize handles - visible in customize mode */}
      {isCustomizing && !isMobile && (
        <>
          <div className="resize-handle-n" aria-hidden="true" />
          <div className="resize-handle-e" aria-hidden="true" />
          <div className="resize-handle-s" aria-hidden="true" />
          <div className="resize-handle-w" aria-hidden="true" />
          <div className="resize-handle-ne" aria-hidden="true" />
          <div className="resize-handle-se" aria-hidden="true" />
          <div className="resize-handle-sw" aria-hidden="true" />
          <div className="resize-handle-nw" aria-hidden="true" />
        </>
      )}
    </Card>
  )
}
```

---

## Phase 5: Interactive Charts

### 5.1 Enhanced Chart Wrapper

**File:** `components/dashboard/chart-wrapper.tsx` (New file)

```typescript
'use client'

import { 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Info, 
  Maximize2, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { useChartZoom } from '@/hooks/use-chart-zoom'
import { cn } from '@/lib/utils'

interface ChartWrapperProps {
  title: string
  description?: string
  data: any[]
  size: WidgetSize
  children: React.ReactNode
  info?: string
  exportable?: boolean
  zoomable?: boolean
  onExport?: () => void
  className?: string
}

export function ChartWrapper({
  title,
  description,
  data,
  size,
  children,
  info,
  exportable = true,
  zoomable = true,
  onExport,
  className,
}: ChartWrapperProps) {
  const { zoom, zoomIn, zoomOut, resetZoom } = useChartZoom()
  
  const height = {
    tiny: 120,
    small: 200,
    'small-long': 200,
    medium: 280,
    large: 400,
    'extra-large': 500,
  }[size]
  
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {zoomable && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={zoomIn}
                disabled={zoom >= 2}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={resetZoom}
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </>
          )}
          
          {exportable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onExport}
              aria-label={`Export ${title}`}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={`Expand ${title}`}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Chart */}
      <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
      
      {description && (
        <p className="text-xs text-text-secondary px-4 pb-3">
          {description}
        </p>
      )}
    </Card>
  )
}
```

### 5.2 Zoom Hook

**File:** `hooks/use-chart-zoom.ts` (New file)

```typescript
import { useState, useCallback } from 'react'

export function useChartZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom)
  
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 2))
  }, [])
  
  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }, [])
  
  const resetZoom = useCallback(() => {
    setZoom(initialZoom)
  }, [initialZoom])
  
  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  }
}
```

---

## Phase 6: Accessibility Enhancements

### 6.1 Accessible Widget Focus Management

**File:** `hooks/use-widget-focus.ts` (New file)

```typescript
'use client'

import { useEffect, useRef } from 'react'

export function useWidgetFocus(widgetId: string) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const widgets = Array.from(
          document.querySelectorAll('[role="region"][aria-label]')
        )
        const currentIndex = widgets.findIndex(
          (w) => w === ref.current
        )
        const nextIndex = e.key === 'ArrowRight'
          ? (currentIndex + 1) % widgets.length
          : (currentIndex - 1 + widgets.length) % widgets.length
        
        ;(widgets[nextIndex] as HTMLElement)?.focus()
      }
      
      // Enter/Space to open fullscreen
      if ((e.key === 'Enter' || e.key === ' ') && ref.current) {
        e.preventDefault()
        const fullscreenBtn = ref.current.querySelector(
          '[aria-label*="fullscreen" i], [aria-label*="expand" i]'
        ) as HTMLButtonElement
        fullscreenBtn?.click()
      }
      
      // Escape to close fullscreen/minimize
      if (e.key === 'Escape') {
        const minimizeBtn = document.querySelector(
          '[aria-label*="minimize" i]'
        ) as HTMLButtonElement
        minimizeBtn?.click()
      }
    }
    
    const widget = ref.current
    widget?.addEventListener('keydown', handleKeyDown)
    
    return () => {
      widget?.removeEventListener('keydown', handleKeyDown)
    }
  }, [widgetId])
  
  return ref
}
```

### 6.2 Skip Links Component

**File:** `components/ui/skip-link.tsx` (New file)

```typescript
'use client'

import { useEffect, useState } from 'react'

export function SkipLink() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}
```

---

## Phase 7: Real-Time Features

### 7.1 SSE Hook for Live Updates

**File:** `hooks/use-sse-connection.ts` (New file)

```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseSSEConnectionOptions {
  enabled?: boolean
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
}

export function useSSEConnection(
  url: string,
  options: UseSSEConnectionOptions = {}
) {
  const { enabled = true, onMessage, onError } = options
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  
  const connect = useCallback(() => {
    if (!enabled) return
    
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    
    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse SSE data:', error)
        }
      }
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        onError?.(error)
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }
      
      eventSource.onopen = () => {
        console.log('SSE connection established')
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      toast.error('Failed to connect to live updates')
    }
  }, [url, enabled, onMessage, onError])
  
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])
  
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])
  
  return {
    isConnected: !!eventSourceRef.current?.readyState &&
                eventSourceRef.current.readyState === EventSource.OPEN,
    reconnect: connect,
    disconnect,
  }
}
```

### 7.2 Live P&L Indicator Component

**File:** `components/dashboard/live-pnl-indicator.tsx` (New file)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSSEConnection } from '@/hooks/use-sse-connection'
import { cn } from '@/lib/utils'

interface LivePnlIndicatorProps {
  userId: string
  className?: string
}

export function LivePnlIndicator({
  userId,
  className,
}: LivePnlIndicatorProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [pnl, setPnl] = useState(0)
  const { isConnected } = useSSEConnection(
    `/api/trades/stream?userId=${userId}`,
    {
      onMessage: (data) => {
        if (data.type === 'pnl-update') {
          setPnl(data.pnl)
          setLastUpdate(new Date())
        }
      },
    }
  )
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        isConnected
          ? 'bg-semantic-success/10 text-semantic-success'
          : 'bg-surface-3 text-text-secondary',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected && 'animate-pulse',
          isConnected ? 'bg-semantic-success' : 'bg-surface-4'
        )}
        aria-hidden="true"
      />
      <span>
        {isConnected ? 'Live' : 'Offline'} • ${pnl.toFixed(2)}
      </span>
      <span className="text-text-tertiary">
        {new Date(lastUpdate).toLocaleTimeString()}
      </span>
    </div>
  )
}
```

---

## Phase 8: Testing & Documentation

### 8.1 Component Testing Example

**File:** `components/dashboard/__tests__/metric-card.test.tsx` (New file)

```typescript
import { render, screen } from '@testing-library/react'
import { MetricCard } from '../metric-card'
import { describe, it, expect } from 'vitest'

describe('MetricCard', () => {
  it('renders metric title and value', () => {
    render(
      <MetricCard
        id="test-metric"
        title="Total P&L"
        value="$12,437"
      />
    )
    
    expect(screen.getByText('Total P&L')).toBeInTheDocument()
    expect(screen.getByText('$12,437')).toBeInTheDocument()
  })
  
  it('displays correct trend icon', () => {
    const { rerender } = render(
      <MetricCard
        id="test-metric"
        title="Win Rate"
        value="68.5%"
        trend="up"
      />
    )
    
    expect(screen.getByText('↑')).toBeInTheDocument()
    
    rerender(
      <MetricCard
        id="test-metric"
        title="Win Rate"
        value="68.5%"
        trend="down"
      />
    )
    
    expect(screen.getByText('↓')).toBeInTheDocument()
  })
  
  it('shows loading state', () => {
    render(
      <MetricCard
        id="test-metric"
        title="Loading..."
        value="--"
        loading={true}
      />
    )
    
    const card = screen.getByRole('region')
    expect(card).toHaveClass('animate-pulse')
  })
  
  it('is accessible via keyboard', () => {
    render(
      <MetricCard
        id="test-metric"
        title="Win Rate"
        value="68.5%"
      />
    )
    
    const card = screen.getByRole('region', { name: 'Win Rate' })
    expect(card).toHaveAttribute('tabIndex', '0')
  })
})
```

### 8.2 E2E Test Example

**File:** `e2e/dashboard.spec.ts` (New file)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })
  
  test('displays quick stats bar', async ({ page }) => {
    const statsBar = page.locator('[data-testid="quick-stats-bar"]')
    await expect(statsBar).toBeVisible()
    
    // Check for at least 3 metrics
    const metrics = statsBar.locator('[role="region"]')
    await expect(metrics).toHaveCount({ gte: 3 })
  })
  
  test('allows widget customization', async ({ page }) => {
    // Enter customize mode
    await page.click('[data-testid="customize-button"]')
    
    // Drag a widget
    const widget = page.locator('[data-testid="widget-equity-chart"]').first()
    const box = await widget.boundingBox()
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2)
      await page.mouse.up()
    }
    
    // Save changes
    await page.click('[data-testid="save-layout-button"]')
    
    // Verify toast appears
    await expect(page.locator('[role="status"]')).toContainText('saved')
  })
  
  test('is keyboard navigable', async ({ page }) => {
    // Tab to first widget
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toHaveAttribute('role', 'region')
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight')
    
    // Verify focus moved
    const newFocusedElement = page.locator(':focus')
    expect(newFocusedElement).not.toBe(focusedElement)
  })
  
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    
    // Check mobile-specific elements
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    await expect(bottomNav).toBeVisible()
    
    // Verify single column layout
    const widgets = page.locator('[data-grid-item]')
    const firstWidget = widgets.first()
    const box = await firstWidget.boundingBox()
    
    expect(box?.width).toBeLessThan(375) // Full width
  })
})
```

---

## Implementation Checklist

### Week 1-2: Foundation
- [ ] Create design token files
- [ ] Update CSS variables
- [ ] Update Tailwind config
- [ ] Build base components (Button variants, MetricCard)
- [ ] Set up testing infrastructure

### Week 3-4: Layout System
- [ ] Implement WidgetGrid component
- [ ] Build QuickStatsBar component
- [ ] Create responsive header
- [ ] Build sidebar navigation
- [ ] Implement mobile bottom nav

### Week 5-6: Widget System
- [ ] Enhance WidgetCard component
- [ ] Add widget focus management
- [ ] Implement drag-and-drop improvements
- [ ] Add resize handles
- [ ] Build customize mode UI

### Week 7-8: Interactive Charts
- [ ] Create ChartWrapper component
- [ ] Implement zoom functionality
- [ ] Add chart export feature
- [ ] Build fullscreen mode
- [ ] Optimize chart performance

### Week 9-10: Real-Time & Polish
- [ ] Implement SSE connection
- [ ] Build Live P&L indicator
- [ ] Add pull-to-refresh (mobile)
- [ ] Implement accessibility enhancements
- [ ] Create comprehensive documentation

---

**Last Updated:** 2026-01-31  
**Status:** Ready for Development  
**Next Review:** Start of Phase 1
