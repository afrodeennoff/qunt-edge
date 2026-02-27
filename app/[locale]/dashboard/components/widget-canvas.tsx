"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Minus, Maximize2, GripVertical } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useDashboardActions, useDashboardFilters, useDashboardStats, useDashboardTrades } from '@/context/data-provider'
import { useI18n } from "@/locales/client"
import { WIDGET_REGISTRY, getWidgetComponent } from '../config/widget-registry'
import { useAutoScroll } from '../../../../hooks/use-auto-scroll'
import { cn } from '@/lib/utils'
import { Widget, WidgetType, WidgetSize, LayoutItem } from '../types/dashboard'
import { useUserStore, DashboardLayoutWithWidgets } from '../../../../store/user-store'
import { toast } from "sonner"
import { defaultLayouts } from "@/lib/default-layouts"
import { Prisma, DashboardLayout } from "@/prisma/generated/prisma"
import { useDashboard } from '../dashboard-context'
import { motion, useReducedMotion } from 'framer-motion'
import { WidgetShell } from "@/components/ui/widget-shell"
import { isUiV2Enabled } from "@/lib/ui-v2"
import { useSearchParams } from "next/navigation"
// Helper function to convert internal layout to Prisma type
const toPrismaLayout = (layout: DashboardLayoutWithWidgets): DashboardLayout => {
  return {
    ...layout,
    version: layout.version ?? 1,
    checksum: layout.checksum ?? null,
    deviceId: layout.deviceId ?? null,
    desktop: layout.desktop as unknown as Prisma.JsonValue,
    mobile: layout.mobile as unknown as Prisma.JsonValue,
  }
}

// Update sizeToGrid to handle responsive sizes
const sizeToGrid = (size: WidgetSize, isSmallScreen = false): { w: number, h: number } => {
  if (isSmallScreen) {
    switch (size) {
      case 'tiny':
        return { w: 12, h: 1 }
      case 'small':
        return { w: 12, h: 2 }
      case 'small-long':
        return { w: 12, h: 2 }
      case 'medium':
        return { w: 12, h: 3 }
      case 'large':
      case 'extra-large':
        return { w: 12, h: 4 }
      default:
        return { w: 12, h: 3 }
    }
  }

  // Desktop sizes
  switch (size) {
    case 'tiny':
      return { w: 3, h: 1 }
    case 'small':
      return { w: 3, h: 4 }
    case 'small-long':
      return { w: 6, h: 2 }
    case 'medium':
      return { w: 6, h: 4 }
    case 'large':
      return { w: 6, h: 8 }
    case 'extra-large':
      return { w: 12, h: 8 }
    default:
      return { w: 6, h: 4 }
  }
}

// Add a function to get grid dimensions based on widget type and size
const getWidgetGrid = (type: WidgetType, size: WidgetSize, isSmallScreen = false): { w: number, h: number } => {
  const config = WIDGET_REGISTRY[type]
  if (!config) {
    // Return a default medium size grid for deprecated widgets
    return isSmallScreen ? { w: 12, h: 4 } : { w: 6, h: 4 }
  }
  if (isSmallScreen) {
    return sizeToGrid(size, true)
  }
  return sizeToGrid(size)
}

// Create layouts for different breakpoints
const generateResponsiveLayout = (widgets: Widget[]) => {
  const widgetArray = Array.isArray(widgets) ? widgets : []

  const layouts = {
    lg: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize)
    })),
    md: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize),
    })),
    sm: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0 // Align to left
    })),
    xs: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0 // Align to left
    })),
    xxs: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0 // Align to left
    }))
  }
  return layouts
}

const LAYOUT_SAVE_DEBOUNCE_MS = 250

const createLayoutSignature = (widgets: Widget[]) =>
  widgets
    .map((widget) => `${widget.i}:${widget.x}:${widget.y}:${widget.w}:${widget.h}`)
    .sort()
    .join("|")

function DeprecatedWidget({ onRemove }: { onRemove: () => void }) {
  const t = useI18n()
  return (
    <WidgetShell
      title={t('widgets.deprecated.title')}
      description={t('widgets.deprecated.description')}
      state="error"
      errorMessage={t('widgets.deprecated.description')}
      actions={(
        <Button variant="destructive" size="sm" onClick={onRemove}>
          {t('widgets.deprecated.remove')}
        </Button>
      )}
    />
  )
}

const WidgetWrapper = React.memo(({ children, onRemove, onChangeSize, isCustomizing, size, currentType }: {
  children: React.ReactNode
  onRemove: () => void
  onChangeSize: (size: WidgetSize) => void
  isCustomizing: boolean
  size: WidgetSize
  currentType: WidgetType
}) => {
  const t = useI18n()
  const { isMobile } = useDashboardTrades()
  const uiV2Enabled = isUiV2Enabled()
  const widgetRef = useRef<HTMLDivElement>(null)
  const [isSizePopoverOpen, setIsSizePopoverOpen] = useState(false)

  const handleSizeChange = (newSize: WidgetSize) => {
    onChangeSize(newSize)
    setIsSizePopoverOpen(false)
  }

  // Add touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCustomizing) {
      // Prevent default touch behavior when customizing
      e.preventDefault()
    }
  }

  const isValidSize = (widgetType: WidgetType, size: WidgetSize) => {
    const config = WIDGET_REGISTRY[widgetType]
    if (!config) return true // Allow any size for deprecated widgets
    if (isMobile) {
      // On mobile, only allow tiny (shown as Small), medium (shown as Medium), and large (shown as Large)
      if (size === 'small' || size === 'small-long') return false
      return config.allowedSizes.includes(size)
    }
    return config.allowedSizes.includes(size)
  }

  return (
    <div
      ref={widgetRef}
      className="relative h-full min-h-0 w-full group isolate overflow-hidden"
      onTouchStart={handleTouchStart}
    >
      <div
        data-widget-shell="true"
        className={cn(
          "h-full min-h-0 w-full",
          uiV2Enabled && "rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm",
          isCustomizing && "blur-[2px]"
        )}
      >
        {children}
      </div>
      {isCustomizing && (
        <>
          <div className="absolute inset-0 rounded-xl border border-white/25 border-dashed shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.08)]" />
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,hsl(var(--foreground)/0.18),hsl(var(--background)/0.74)_62%)] opacity-100 backdrop-blur-[2px]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-100 drag-handle cursor-grab active:cursor-grabbing">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-white/20 bg-black/45 px-4 py-3 text-foreground/85 backdrop-blur-md">
              <GripVertical className="h-6 w-4" />
              <p className="text-sm font-medium">{t('widgets.dragToMove')}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2 opacity-100 z-10">
            <Popover open={isSizePopoverOpen} onOpenChange={setIsSizePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-white/25 bg-black/55 text-foreground hover:bg-black/75 hover:border-white/40 backdrop-blur-md"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 border-white/15 bg-black/85 p-2 text-foreground backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {isMobile ? (
                    <>
                      <Button
                        variant={size === 'tiny' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('tiny')}
                        disabled={!isValidSize(currentType, 'tiny') || size === 'tiny'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-4 rounded",
                            size === 'tiny' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.mobile.small')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'medium' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('medium')}
                        disabled={!isValidSize(currentType, 'medium') || size === 'medium'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-8 rounded",
                            size === 'medium' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.mobile.medium')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'large' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('large')}
                        disabled={!isValidSize(currentType, 'large') || size === 'large'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-12 rounded",
                            size === 'large' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.mobile.large')}</span>
                        </div>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={size === 'tiny' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('tiny')}
                        disabled={!isValidSize(currentType, 'tiny') || size === 'tiny'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-4 rounded",
                            size === 'tiny' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.tiny')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'small' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('small')}
                        disabled={!isValidSize(currentType, 'small') || size === 'small'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-6 rounded",
                            size === 'small' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.small')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'medium' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('medium')}
                        disabled={!isValidSize(currentType, 'medium') || size === 'medium'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-8 rounded",
                            size === 'medium' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.medium')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'large' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('large')}
                        disabled={!isValidSize(currentType, 'large') || size === 'large'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-10 rounded",
                            size === 'large' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.large')}</span>
                        </div>
                      </Button>
                      <Button
                        variant={size === 'extra-large' ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSizeChange('extra-large')}
                        disabled={!isValidSize(currentType, 'extra-large') || size === 'extra-large'}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-12 rounded",
                            size === 'extra-large' ? "bg-primary" : "bg-muted"
                          )} />
                          <span>{t('widgets.size.extra-large')}</span>
                        </div>
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-white/20 bg-semantic-error-bg/80 text-foreground hover:bg-semantic-error-bg"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('widgets.removeWidgetConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('widgets.removeWidgetDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('widgets.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>{t('widgets.removeWidget')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.isCustomizing === nextProps.isCustomizing &&
    prevProps.size === nextProps.size &&
    prevProps.currentType === nextProps.currentType &&
    prevProps.children === nextProps.children
  )
})
WidgetWrapper.displayName = "WidgetWrapper"

export default function WidgetCanvas() {
  const { isMobile, dashboardLayout: layouts, setDashboardLayout: setLayouts } = useUserStore(state => state)
  const user = useUserStore(state => state.user)
  const { saveDashboardLayout } = useDashboardActions()
  const { trades } = useDashboardTrades()
  const { formattedTrades } = useDashboardStats()
  const { instruments, accountNumbers, dateRange } = useDashboardFilters()
  const searchParams = useSearchParams()
  const {
    isCustomizing,
    setIsCustomizing,
  } = useDashboard()
  const t = useI18n()
  const shouldReduceMotion = useReducedMotion()
  const showDataDebug = searchParams.get("debugData") === "1"
  const pendingSaveRef = useRef<DashboardLayoutWithWidgets | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Add this state to track if the layout change is from user interaction
  const activeLayout = useMemo(() => isMobile ? 'mobile' : 'desktop', [isMobile])

  // Move all memoized values up, out of conditional rendering paths
  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), [])
  const activeWidgets = useMemo(
    () => (Array.isArray(layouts?.[activeLayout]) ? layouts[activeLayout] : []),
    [layouts, activeLayout]
  )

  const responsiveLayout = useMemo(() => {
    if (!layouts) return {}
    return generateResponsiveLayout(activeWidgets)
  }, [layouts, activeWidgets])

  const currentLayout = activeWidgets

  // Define handleOutsideClick with stable reference
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    // Check if the click is on a widget or its children
    const isWidgetClick = (e.target as HTMLElement).closest('.react-grid-item')
    const isContextMenuClick = (e.target as HTMLElement).closest('[role="menu"]')
    const isCustomizationSwitchClick = (e.target as HTMLElement).closest('#customize-mode')
    const isDialogClick = (e.target as HTMLElement).closest('[role="dialog"]')
    const isDialogTriggerClick = (e.target as HTMLElement).closest('[data-state="open"]')

    // If click is outside widgets and not on context menu, customization switch, or dialog elements, turn off customization
    if (!isWidgetClick && !isContextMenuClick && !isCustomizationSwitchClick && !isDialogClick && !isDialogTriggerClick) {
      setIsCustomizing(false)
    }
  }, [])

  const flushPendingLayoutSave = useCallback(async () => {
    if (!pendingSaveRef.current) return

    const pendingLayouts = pendingSaveRef.current
    pendingSaveRef.current = null

    try {
      await saveDashboardLayout(toPrismaLayout(pendingLayouts))
    } catch (error) {
      console.error('Error saving dashboard layout:', error)
    }
  }, [saveDashboardLayout])

  const queueLayoutSave = useCallback((nextLayouts: DashboardLayoutWithWidgets) => {
    pendingSaveRef.current = nextLayouts

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      void flushPendingLayoutSave()
    }, LAYOUT_SAVE_DEBOUNCE_MS)
  }, [flushPendingLayoutSave])

  const handleOutsideClickRef = useRef(handleOutsideClick)
  handleOutsideClickRef.current = handleOutsideClick

  // Update handleLayoutChange with proper type handling and all dependencies
  const handleLayoutChange = useCallback((layout: LayoutItem[]) => {
    if (!user?.id || !isCustomizing || !setLayouts || !layouts) return;

    const currentActiveLayout = Array.isArray(layouts[activeLayout]) ? layouts[activeLayout] : []

    try {
      const updatedActiveLayout = layout.map(item => {
        const existingWidget = currentActiveLayout.find(w => w.i === item.i);
        if (!existingWidget) return null;

        return {
          ...existingWidget,
          x: isMobile ? 0 : item.x,
          y: item.y,
          w: isMobile ? 12 : item.w,
          h: item.h,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null)

      const currentSignature = createLayoutSignature(currentActiveLayout)
      const nextSignature = createLayoutSignature(updatedActiveLayout)
      if (currentSignature === nextSignature) {
        return
      }

      const updatedLayouts: DashboardLayoutWithWidgets = {
        ...layouts,
        [activeLayout]: updatedActiveLayout,
        updatedAt: new Date()
      }

      setLayouts(updatedLayouts);
      queueLayoutSave(updatedLayouts)
    } catch (error) {
      console.error('Error updating layout:', error);
      // Revert to previous layout on error
      setLayouts(layouts);
    }
  }, [user?.id, isCustomizing, setLayouts, layouts, activeLayout, isMobile, queueLayoutSave]);

  // Define removeWidget with all dependencies
  const removeWidget = useCallback(async (i: string) => {
    if (!user?.id || !layouts) return
    const currentActiveLayout = Array.isArray(layouts[activeLayout]) ? layouts[activeLayout] : []
    const updatedWidgets = currentActiveLayout.filter(widget => widget.i !== i)
    const newLayouts = {
      ...layouts,
      [activeLayout]: updatedWidgets,
      updatedAt: new Date()
    }
    setLayouts(newLayouts)
    await saveDashboardLayout(toPrismaLayout(newLayouts))
  }, [user?.id, layouts, activeLayout, setLayouts, saveDashboardLayout]);

  // Define changeWidgetSize with all dependencies
  const changeWidgetSize = useCallback(async (i: string, newSize: WidgetSize) => {
    if (!user?.id || !layouts) return

    // Find the widget
    const currentActiveLayout = Array.isArray(layouts[activeLayout]) ? layouts[activeLayout] : []
    const widget = currentActiveLayout.find(w => w.i === i)
    if (!widget) return

    // Prevent charts from being set to tiny size
    let effectiveSize = newSize
    if (widget.type.includes('Chart') && newSize === 'tiny') {
      effectiveSize = 'medium'
    }

    const grid = sizeToGrid(effectiveSize, activeLayout === 'mobile')
    const updatedWidgets = currentActiveLayout.map(widget =>
      widget.i === i ? { ...widget, size: effectiveSize, ...grid } : widget
    )
    const newLayouts = {
      ...layouts,
      [activeLayout]: updatedWidgets,
      updatedAt: new Date()
    }
    setLayouts(newLayouts)
    await saveDashboardLayout(toPrismaLayout(newLayouts))
  }, [user?.id, layouts, activeLayout, setLayouts, saveDashboardLayout]);

  // Restore default layout for both desktop and mobile
  const restoreDefaultLayout = useCallback(async () => {
    if (!user?.id || !layouts) return
    const newLayouts = {
      ...layouts,
      desktop: defaultLayouts.desktop as unknown as Widget[],
      mobile: defaultLayouts.mobile as unknown as Widget[],
      updatedAt: new Date()
    }
    setLayouts(newLayouts)
    await saveDashboardLayout(toPrismaLayout(newLayouts))
    toast.success(t('widgets.restoredDefaultsTitle'), {
      description: t('widgets.restoredDefaultsDescription')
    })
  }, [user?.id, layouts, setLayouts, saveDashboardLayout, t, toast])

  // Define renderWidget with all dependencies
  const renderWidget = useCallback((widget: Widget) => {
    // Ensure widget.type is a valid WidgetType
    if (!Object.keys(WIDGET_REGISTRY).includes(widget.type)) {
      return (
        <DeprecatedWidget onRemove={() => removeWidget(widget.i)} />
      )
    }

    const config = WIDGET_REGISTRY[widget.type as keyof typeof WIDGET_REGISTRY]

    // For charts, ensure size is at least small-long
    const effectiveSize = (() => {
      if (config.requiresFullWidth) {
        return config.defaultSize
      }
      if (config.allowedSizes.length === 1) {
        return config.allowedSizes[0]
      }
      if (isMobile && widget.size !== 'tiny') {
        return 'small' as WidgetSize
      }
      return widget.size as WidgetSize
    })()

    return getWidgetComponent(widget.type as WidgetType, effectiveSize)
  }, [isMobile, removeWidget]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      handleOutsideClickRef.current(e)
    }
    if (isCustomizing) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [isCustomizing]);

  useEffect(() => {
    if (!isCustomizing) {
      void flushPendingLayoutSave()
    }
  }, [isCustomizing, flushPendingLayoutSave])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      void flushPendingLayoutSave()
    }
  }, [flushPendingLayoutSave])



  // Add auto-scroll functionality for mobile
  useAutoScroll(isMobile && isCustomizing)

  if (!layouts) {
    return (
      <div className="relative mt-0 w-full min-h-screen">
        <div className="animate-pulse rounded-2xl border border-white/12 bg-black/60 p-6">
          <div className="h-4 w-48 rounded bg-white/10" />
          <div className="mt-3 h-3 w-96 max-w-full rounded bg-white/10" />
          <div className="mt-6 flex gap-2">
            <div className="h-9 w-44 rounded bg-white/10" />
            <div className="h-9 w-28 rounded bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  if (currentLayout.length === 0) {
    return (
      <div className="relative mt-0 w-full min-h-screen">
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/12 bg-card/90 p-6 text-foreground shadow-2xl">
          <div className="text-sm font-semibold tracking-tight">
            {(t as any)("widgets.emptyLayoutTitle") ?? "No widgets on your dashboard."}
          </div>
          <div className="mt-2 text-sm text-foreground/60 leading-relaxed">
            {(t as any)("widgets.emptyLayoutDescription") ?? "Restore the default layout to show charts and stats, or switch to Edit mode to add widgets."}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={restoreDefaultLayout}
              className="bg-white text-black hover:bg-white/90 font-semibold"
            >
              {(t as any)("widgets.restoreDefaults") ?? "Restore default layout"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(true)}
              className="border-white/15 bg-transparent text-foreground hover:bg-white/5 hover:text-foreground"
            >
              {(t as any)("widgets.edit") ?? "Edit"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative mt-0 w-full min-h-screen",
    )}>
      {layouts && (
        <div className="relative">
          <div id="tooltip-portal" className="fixed inset-0 pointer-events-none z-9999" />
          <ResponsiveGridLayout
            layouts={responsiveLayout}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
            rowHeight={isMobile ? 56 : 68}
            isDraggable={isCustomizing}
            isResizable={false}
            draggableHandle=".drag-handle"
            onDragStop={() => {
              void flushPendingLayoutSave()
            }}
            onLayoutChange={handleLayoutChange}
            margin={isMobile ? [6, 4] : [8, 8]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
          >
            {currentLayout.map((widget, index) => {
              return (
                <motion.div
                  key={widget.i}
                  className="h-full min-h-0"
                  data-customizing={isCustomizing}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                        delay: Math.min(0.035 * index, 0.42),
                        type: "spring",
                        stiffness: 165,
                        damping: 21,
                        mass: 0.88,
                      }
                  }
                  whileHover={shouldReduceMotion || isCustomizing ? undefined : { scale: 1.01 }}
                >
                  <WidgetWrapper
                    onRemove={() => removeWidget(widget.i)}
                    onChangeSize={(size) => changeWidgetSize(widget.i, size)}
                    isCustomizing={isCustomizing}
                    size={widget.size}
                    currentType={widget.type}
                  >
                    <div className={cn(
                      "h-full w-full rounded-xl transition-all duration-500 group/widget overflow-hidden relative precision-panel border border-white/12",
                      isCustomizing
                        ? "border-[hsl(var(--precision-cobalt)/0.7)] bg-[hsl(var(--precision-panel-elevated)/0.98)] shadow-[0_18px_34px_-24px_hsl(var(--background)/0.95)]"
                        : "bg-black/95 hover:border-white/20"
                    )}>
                      {showDataDebug && !isCustomizing && (
                        <div className="absolute left-2 top-2 z-30 rounded-md border border-white/15 bg-black/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground/80 backdrop-blur-sm">
                          T:{trades.length} F:{formattedTrades.length}
                          {(instruments.length > 0 || accountNumbers.length > 0 || Boolean(dateRange?.from || dateRange?.to)) && (
                            <span className="ml-2 text-foreground/40">filtered</span>
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-b from-white/[0.02] to-transparent pointer-events-none" />
                      <div className="relative h-full w-full">
                        {renderWidget(widget)}
                      </div>
                    </div>
                  </WidgetWrapper>
                </motion.div>
              )
            })}
          </ResponsiveGridLayout>
        </div>
      )}
    </div>
  )
}
