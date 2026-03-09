import { DashboardLayoutWithWidgets, Widget } from '@/store/user-store'

export interface LayoutVersion {
  id: string
  version: number
  desktop: Widget[]
  mobile: Widget[]
  checksum: string
  description?: string
  deviceId: string
  changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
  createdAt: Date
}

export interface VersionDiff {
  version: number
  changes: WidgetChange[]
  timestamp: Date
  description?: string
}

export interface WidgetChange {
  type: 'added' | 'removed' | 'modified' | 'moved'
  widgetId: string
  widgetType?: string
  previous?: Partial<Widget>
  current?: Partial<Widget>
}

class WidgetVersionService {
  private maxVersionsPerLayout = 50
  private deviceId: string

  constructor() {
    this.deviceId = this.getOrCreateDeviceId()
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let deviceId = localStorage.getItem('widget_version_device_id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('widget_version_device_id', deviceId)
    }
    return deviceId
  }

  generateChecksum(layout: DashboardLayoutWithWidgets): string {
    const str = JSON.stringify({ desktop: layout.desktop, mobile: layout.mobile })
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  createVersion(
    layout: DashboardLayoutWithWidgets,
    previousLayout: DashboardLayoutWithWidgets | null,
    changeType: LayoutVersion['changeType'] = 'manual',
    description?: string
  ): Omit<LayoutVersion, 'id' | 'createdAt'> {
    const version = (previousLayout?.version || 0) + 1
    const checksum = this.generateChecksum(layout)

    return {
      version,
      desktop: layout.desktop,
      mobile: layout.mobile,
      checksum,
      description,
      deviceId: this.deviceId,
      changeType
    }
  }

  compareVersions(
    previous: DashboardLayoutWithWidgets,
    current: DashboardLayoutWithWidgets
  ): WidgetChange[] {
    const changes: WidgetChange[] = []
    const previousWidgets = new Map(previous.desktop.map(w => [w.i, w]))
    const currentWidgets = new Map(current.desktop.map(w => [w.i, w]))

    currentWidgets.forEach((currentWidget, id) => {
      const previousWidget = previousWidgets.get(id)

      if (!previousWidget) {
        changes.push({
          type: 'added',
          widgetId: id,
          widgetType: currentWidget.type,
          current: currentWidget
        })
      } else if (this.widgetChanged(previousWidget, currentWidget)) {
        changes.push({
          type: 'modified',
          widgetId: id,
          widgetType: currentWidget.type,
          previous: previousWidget,
          current: currentWidget
        })
      }
    })

    previousWidgets.forEach((previousWidget, id) => {
      if (!currentWidgets.has(id)) {
        changes.push({
          type: 'removed',
          widgetId: id,
          widgetType: previousWidget.type,
          previous: previousWidget
        })
      }
    })

    return changes
  }

  private widgetChanged(prev: Widget, curr: Widget): boolean {
    return (
      prev.x !== curr.x ||
      prev.y !== curr.y ||
      prev.w !== curr.w ||
      prev.h !== curr.h ||
      prev.type !== curr.type ||
      prev.size !== curr.size
    )
  }

  generateDescription(changes: WidgetChange[]): string {
    if (changes.length === 0) return 'No changes'

    const added = changes.filter(c => c.type === 'added').length
    const removed = changes.filter(c => c.type === 'removed').length
    const modified = changes.filter(c => c.type === 'modified').length

    const parts: string[] = []
    if (added > 0) parts.push(`${added} added`)
    if (removed > 0) parts.push(`${removed} removed`)
    if (modified > 0) parts.push(`${modified} modified`)

    return parts.join(', ')
  }

  shouldCreateVersion(
    currentLayout: DashboardLayoutWithWidgets,
    lastChecksum: string | null
  ): boolean {
    const newChecksum = this.generateChecksum(currentLayout)
    return newChecksum !== lastChecksum
  }

  async saveVersionToDatabase(
    layoutId: string,
    versionData: Omit<LayoutVersion, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      const { createLayoutVersionAction } = await import('@/server/database')
      await createLayoutVersionAction(layoutId, versionData)
    } catch (error) {
      console.error('[WidgetVersionService] Failed to save version:', error)
      throw error
    }
  }

  async getVersionHistory(layoutId: string, limit = 20): Promise<LayoutVersion[]> {
    try {
      const { getLayoutVersionHistoryAction } = await import('@/server/database')
      const versions = await getLayoutVersionHistoryAction(layoutId, limit)
      return versions.map(v => ({
        ...v,
        desktop: v.desktop as Widget[],
        mobile: v.mobile as Widget[],
        changeType: v.changeType as 'manual' | 'auto' | 'migration' | 'conflict_resolution'
      }))
    } catch (error) {
      console.error('[WidgetVersionService] Failed to load version history:', error)
      return []
    }
  }

  async rollbackToVersion(
    layoutId: string,
    versionNumber: number
  ): Promise<DashboardLayoutWithWidgets | null> {
    try {
      const { getLayoutVersionByNumberAction } = await import('@/server/database')
      const version = await getLayoutVersionByNumberAction(layoutId, versionNumber)

      if (!version) {
        throw new Error(`Version ${versionNumber} not found`)
      }

      return {
        desktop: version.desktop,
        mobile: version.mobile,
        updatedAt: new Date(),
        version: versionNumber
      } as DashboardLayoutWithWidgets
    } catch (error) {
      console.error('[WidgetVersionService] Failed to rollback:', error)
      return null
    }
  }

  async cleanupOldVersions(layoutId: string, keepCount = this.maxVersionsPerLayout): Promise<void> {
    try {
      const { cleanupOldLayoutVersionsAction } = await import('@/server/database')
      await cleanupOldLayoutVersionsAction(layoutId, keepCount)
    } catch (error) {
      console.error('[WidgetVersionService] Failed to cleanup old versions:', error)
    }
  }
}

export const widgetVersionService = new WidgetVersionService()
