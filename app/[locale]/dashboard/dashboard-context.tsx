"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useUserStore } from '@/store/user-store'
import { useI18n } from "@/locales/client"
import { Widget, WidgetType, WidgetSize, LayoutItem } from './types/dashboard'
import { toast } from "sonner"
import { defaultLayouts } from "@/lib/default-layouts"
import { DashboardLayoutWithWidgets } from '@/store/user-store'
import { useDashboardActions } from '@/context/data-provider'
import type { DashboardLayout as PrismaDashboardLayout, Prisma } from '@/prisma/generated/prisma'
import { getNextWidgetPlacement, normalizeWidgetSize, sizeToGrid } from "@/lib/widget-layout"

// --- Context Definition ---

interface DashboardContextType {
    isCustomizing: boolean
    setIsCustomizing: (val: boolean) => void
    toggleCustomizing: () => void
    layouts: DashboardLayoutWithWidgets | null
    currentLayout: Widget[]
    activeLayout: 'desktop' | 'mobile'

    // Actions
    addWidget: (type: WidgetType, size?: WidgetSize) => void
    removeWidget: (id: string) => void
    changeWidgetType: (id: string, newType: WidgetType) => void
    changeWidgetSize: (id: string, newSize: WidgetSize) => void
    removeAllWidgets: () => void
    restoreDefaultLayout: () => void
    handleLayoutChange: (layout: LayoutItem[]) => void

    // Helpers
    isMobile: boolean

    // Auto-save status
    autoSaveStatus: {
        hasPending: boolean
        isInitialized: boolean
    }
    flushPendingSaves: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const t = useI18n()
    const isMobile = useUserStore(state => state.isMobile)
    const layouts = useUserStore(state => state.dashboardLayout)
    const setLayouts = useUserStore(state => state.setDashboardLayout)
    const user = useUserStore(state => state.user)
    const supabaseUser = useUserStore(state => state.supabaseUser)
    const { saveDashboardLayout } = useDashboardActions()
    const [isCustomizing, setIsCustomizing] = useState(false)
    const [pendingSaves, setPendingSaves] = useState(0)

    const activeLayout = useMemo(() => isMobile ? 'mobile' : 'desktop', [isMobile])

    const userId = user?.id || supabaseUser?.id

    const toPrismaLayout = useCallback(
        (layout: DashboardLayoutWithWidgets): PrismaDashboardLayout => ({
            id: layout.id || userId || '',
            userId: layout.userId || userId || '',
            desktop: layout.desktop as unknown as Prisma.JsonValue,
            mobile: layout.mobile as unknown as Prisma.JsonValue,
            version: layout.version ?? 1,
            checksum: layout.checksum ?? null,
            deviceId: layout.deviceId ?? null,
            createdAt: layout.createdAt ?? new Date(),
            updatedAt: new Date(),
        }),
        [userId],
    )

    const currentLayout = useMemo(() => {
        return layouts?.[activeLayout] || []
    }, [layouts, activeLayout])

    const toggleCustomizing = useCallback(async () => {
        setIsCustomizing(prev => !prev)
    }, [])

    const persistLayout = useCallback(async (layout: DashboardLayoutWithWidgets) => {
        if (!userId) return
        setPendingSaves(count => count + 1)
        try {
            await saveDashboardLayout(toPrismaLayout(layout))
        } catch (error) {
            console.error('[DashboardContext] Error saving dashboard layout:', error)
            throw error
        } finally {
            setPendingSaves(count => Math.max(0, count - 1))
        }
    }, [saveDashboardLayout, toPrismaLayout, userId])

    const handleLayoutChange = useCallback((layout: LayoutItem[]) => {
        if (!userId || !setLayouts || !layouts || !isCustomizing) return

        try {
            const currentWidgets = layouts[activeLayout] || []

            const updatedWidgets = layout.map(item => {
                const existingWidget = currentWidgets.find(w => w.i === item.i)
                if (!existingWidget) {
                    console.warn('[DashboardContext] Widget not found:', item.i)
                    return null
                }
                return {
                    ...existingWidget,
                    x: isMobile ? 0 : item.x,
                    y: item.y,
                    w: isMobile ? 12 : item.w,
                    h: item.h,
                    updatedAt: new Date()
                }
            }).filter((item): item is NonNullable<typeof item> => item !== null)

            const updatedLayouts = {
                ...layouts,
                [activeLayout]: updatedWidgets,
                updatedAt: new Date()
            }

            setLayouts(updatedLayouts)
            void persistLayout(updatedLayouts)
        } catch (error) {
            console.error('[DashboardContext] Error updating layout:', error)
            setLayouts(layouts)
        }
    }, [userId, setLayouts, layouts, activeLayout, isMobile, isCustomizing, persistLayout])

    const addWidget = useCallback(async (type: WidgetType, size: WidgetSize = 'medium') => {
        if (!layouts) {
            console.error('[DashboardContext] addWidget failed: missing layouts')
            return
        }

        if (!userId) {
            console.error('[DashboardContext] addWidget failed: missing user ID')
            return
        }

        const currentItems = layouts[activeLayout]
        // Prevent adding duplicate widget types
        if (currentItems.some(widget => widget.type === type)) {
            toast.error(t('widgets.duplicate.title'), { description: t('widgets.duplicate.description') })
            return
        }

        const effectiveSize = normalizeWidgetSize(type, size)
        const grid = getNextWidgetPlacement(currentItems, type, effectiveSize, activeLayout)

        const newWidget: Widget = {
            i: `widget${Date.now()}`,
            type,
            size: effectiveSize,
            x: grid.x,
            y: grid.y,
            w: grid.w,
            h: grid.h,
            updatedAt: new Date()
        }

        const updatedWidgets = [...currentItems, newWidget]
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        setLayouts(newLayouts)
        toast.success(t('widgets.widgetAdded'), { description: t('widgets.widgetAddedDescription') })

        void persistLayout(newLayouts)
    }, [layouts, activeLayout, persistLayout, setLayouts, t, userId])

    const removeWidget = useCallback(async (i: string) => {
        if (!layouts) {
            console.error('[DashboardContext] removeWidget failed: missing layouts')
            return
        }

        const updatedWidgets = layouts[activeLayout].filter(widget => widget.i !== i)
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        setLayouts(newLayouts)

        void persistLayout(newLayouts)
    }, [layouts, activeLayout, persistLayout, setLayouts, userId])

    const changeWidgetType = useCallback(async (i: string, newType: WidgetType) => {
        if (!userId || !layouts) return
        const updatedWidgets = layouts[activeLayout].map(widget =>
            widget.i === i
                ? {
                    ...widget,
                    type: newType,
                    size: normalizeWidgetSize(newType, widget.size),
                    updatedAt: new Date()
                }
                : widget
        )
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayouts(newLayouts)
        void persistLayout(newLayouts)
    }, [userId, layouts, activeLayout, setLayouts, persistLayout])

    const changeWidgetSize = useCallback(async (i: string, newSize: WidgetSize) => {
        if (!userId || !layouts) return
        const widget = layouts[activeLayout].find(w => w.i === i)
        if (!widget) return

        const effectiveSize = normalizeWidgetSize(widget.type, newSize)
        const grid = sizeToGrid(effectiveSize, activeLayout === 'mobile')
        const updatedWidgets = layouts[activeLayout].map(widget =>
            widget.i === i ? { ...widget, size: effectiveSize, ...grid, updatedAt: new Date() } : widget
        )
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayouts(newLayouts)
        void persistLayout(newLayouts)
    }, [userId, layouts, activeLayout, setLayouts, persistLayout])

    const removeAllWidgets = useCallback(async () => {
        if (!userId || !layouts) return
        const newLayouts = { ...layouts, desktop: [], mobile: [], updatedAt: new Date() }
        setLayouts(newLayouts)
        void persistLayout(newLayouts)
    }, [userId, layouts, setLayouts, persistLayout])

    const restoreDefaultLayout = useCallback(async () => {
        if (!userId || !layouts) return
        const newLayouts = {
            ...layouts,
            desktop: defaultLayouts.desktop as unknown as Widget[],
            mobile: defaultLayouts.mobile as unknown as Widget[],
            updatedAt: new Date()
        }
        setLayouts(newLayouts)
        void persistLayout(newLayouts)
        toast.success(t('widgets.restoredDefaultsTitle'), { description: t('widgets.restoredDefaultsDescription') })
    }, [userId, layouts, setLayouts, t, persistLayout])

    const flushPendingSaves = useCallback(async () => {
        if (layouts) {
            await persistLayout(layouts)
        }
    }, [layouts, persistLayout])

    return (
        <DashboardContext.Provider value={{
            isCustomizing,
            setIsCustomizing,
            toggleCustomizing,
            layouts,
            currentLayout,
            activeLayout,
            addWidget,
            removeWidget,
            changeWidgetType,
            changeWidgetSize,
            removeAllWidgets,
            restoreDefaultLayout,
            handleLayoutChange,
            isMobile,
            autoSaveStatus: {
                hasPending: pendingSaves > 0,
                isInitialized: Boolean(userId),
            },
            flushPendingSaves,
        }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}
