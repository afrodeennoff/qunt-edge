'use client'

import { useMemo } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { getWidgetComponent } from '@/app/[locale]/dashboard/config/widget-registry'
import { Widget } from '@/app/[locale]/dashboard/types/dashboard'
import { useData } from '@/context/data-provider'
import { defaultLayouts } from '@/lib/default-layouts'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import {
  coerceWidgetForLayout,
  generateResponsiveLayouts,
  getEffectiveWidgetSize,
  isRegisteredWidgetType,
} from '@/lib/widget-layout'

export function SharedWidgetCanvas() {
  const { isMobile, sharedParams } = useData()
  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), [])
  
  const activeLayout = isMobile ? 'mobile' : 'desktop'
  const layoutMode = isMobile ? 'mobile' : 'desktop'

  const renderWidget = (widget: Widget) => {
    if (!isRegisteredWidgetType(widget.type)) {
      return null
    }

    const effectiveSize = getEffectiveWidgetSize(widget.type, widget.size, isMobile)

    return getWidgetComponent(widget.type, effectiveSize)
  }

  // Transform shared layout items to include required grid properties
  const transformedLayout = useMemo(() => {
    const sharedLayout = (
      activeLayout === 'desktop'
        ? sharedParams?.desktop
        : sharedParams?.mobile
    ) as Widget[] | undefined

    const fallbackLayout = (
      activeLayout === 'desktop' ? defaultLayouts.desktop : defaultLayouts.mobile
    ) as unknown as Widget[]

    const layoutItems = (sharedLayout && sharedLayout.length > 0 ? sharedLayout : fallbackLayout)
      .filter((item): item is Widget => Boolean(item?.type))
      .map((item) => coerceWidgetForLayout(item, layoutMode))

    return layoutItems
  }, [activeLayout, layoutMode, sharedParams?.desktop, sharedParams?.mobile])

  return (
    <div className="relative mt-6 w-full">
      <div id="tooltip-portal" className="fixed inset-0 pointer-events-none z-9999" />
      <ResponsiveGridLayout
        className="layout"
        layouts={generateResponsiveLayouts(transformedLayout)}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={isMobile ? 65 : 70}
        isDraggable={false}
        isResizable={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
        style={{ 
          minHeight: isMobile ? '100vh' : 'auto',
          touchAction: 'auto'
        }}
      >
        {transformedLayout.map((widget: Widget) => (
          <div key={widget.i} className="h-full">
            <div className="relative h-full w-full overflow-hidden rounded-lg bg-background shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md">
              {renderWidget(widget)}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
} 
