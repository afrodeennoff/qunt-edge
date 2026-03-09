import { DashboardLayoutWithWidgets, Widget } from "@/store/user-store"

export interface ConflictMetadata {
  localVersion: number
  remoteVersion: number
  lastModified: number
  deviceId: string
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge'
  reason: string
}

export class WidgetConflictResolver {
  private deviceId: string
  private versionMap = new Map<string, number>()

  constructor() {
    this.deviceId = this.getOrCreateDeviceId()
  }

  private getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') return 'server'

    let deviceId = localStorage.getItem('widget_device_id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('widget_device_id', deviceId)
    }
    return deviceId
  }

  detectConflict(
    localLayout: DashboardLayoutWithWidgets,
    remoteLayout: DashboardLayoutWithWidgets,
    localMetadata?: ConflictMetadata,
    remoteMetadata?: ConflictMetadata
  ): boolean {
    if (!localMetadata || !remoteMetadata) return false

    if (localMetadata.deviceId === this.deviceId) {
      return false
    }

    const localChecksum = this.calculateChecksum(localLayout)
    const remoteChecksum = this.calculateChecksum(remoteLayout)

    if (localChecksum === remoteChecksum) return false

    if (remoteMetadata.lastModified > localMetadata.lastModified) {
      return localMetadata.localVersion < remoteMetadata.remoteVersion
    }

    return false
  }

  private calculateChecksum(layout: DashboardLayoutWithWidgets): string {
    const str = JSON.stringify({ desktop: layout.desktop, mobile: layout.mobile })
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  resolveConflict(
    localLayout: DashboardLayoutWithWidgets,
    remoteLayout: DashboardLayoutWithWidgets,
    strategy: ConflictResolution['strategy'] = 'merge'
  ): DashboardLayoutWithWidgets {
    switch (strategy) {
      case 'local':
        return localLayout

      case 'remote':
        return remoteLayout

      case 'merge':
        return this.mergeLayouts(localLayout, remoteLayout)

      default:
        return this.mergeLayouts(localLayout, remoteLayout)
    }
  }

  private mergeLayouts(
    localLayout: DashboardLayoutWithWidgets,
    remoteLayout: DashboardLayoutWithWidgets
  ): DashboardLayoutWithWidgets {
    const mergedDesktop = this.mergeWidgetArrays(localLayout.desktop, remoteLayout.desktop)
    const mergedMobile = this.mergeWidgetArrays(localLayout.mobile, remoteLayout.mobile)

    return {
      ...localLayout,
      desktop: mergedDesktop,
      mobile: mergedMobile,
      updatedAt: new Date(Math.max(
        new Date(localLayout.updatedAt).getTime(),
        new Date(remoteLayout.updatedAt).getTime()
      ))
    }
  }

  private mergeWidgetArrays(local: Widget[], remote: Widget[]): Widget[] {
    const widgetMap = new Map<string, Widget>()

    local.forEach(widget => {
      widgetMap.set(widget.i, widget)
    })

    remote.forEach(widget => {
      const existing = widgetMap.get(widget.i)
      if (!existing) {
        widgetMap.set(widget.i, widget)
      } else {
        const localModified = new Date(existing.updatedAt || 0).getTime()
        const remoteModified = new Date(widget.updatedAt || 0).getTime()

        if (remoteModified > localModified) {
          widgetMap.set(widget.i, widget)
        }
      }
    })

    return Array.from(widgetMap.values())
  }

  suggestResolution(
    localLayout: DashboardLayoutWithWidgets,
    remoteLayout: DashboardLayoutWithWidgets,
    localMetadata?: ConflictMetadata,
    remoteMetadata?: ConflictMetadata
  ): ConflictResolution {
    if (!remoteMetadata) {
      return { strategy: 'local', reason: 'No remote metadata available' }
    }

    if (!localMetadata) {
      return { strategy: 'remote', reason: 'No local metadata available' }
    }

    if (remoteMetadata.deviceId === this.deviceId) {
      return { strategy: 'remote', reason: 'Changes from this device' }
    }

    const localWidgetCount = localLayout.desktop.length + localLayout.mobile.length
    const remoteWidgetCount = remoteLayout.desktop.length + remoteLayout.mobile.length
    const localTime = localMetadata.lastModified
    const remoteTime = remoteMetadata.lastModified

    if (remoteTime > localTime + 60000) {
      if (remoteWidgetCount > localWidgetCount * 1.5) {
        return { strategy: 'merge', reason: 'Remote has significantly more widgets' }
      }
      return { strategy: 'remote', reason: 'Remote changes are much more recent' }
    }

    if (localTime > remoteTime + 60000) {
      return { strategy: 'local', reason: 'Local changes are more recent' }
    }

    if (Math.abs(localWidgetCount - remoteWidgetCount) > 3) {
      return { strategy: 'merge', reason: 'Significant difference in widget count' }
    }

    return { strategy: 'merge', reason: 'Both versions have recent changes' }
  }

  createMetadata(layout: DashboardLayoutWithWidgets): ConflictMetadata {
    const currentVersion = this.versionMap.get('global') || 0
    return {
      localVersion: currentVersion,
      remoteVersion: currentVersion,
      lastModified: Date.now(),
      deviceId: this.deviceId
    }
  }

  incrementVersion(): void {
    const current = this.versionMap.get('global') || 0
    this.versionMap.set('global', current + 1)
  }
}

export const widgetConflictResolver = new WidgetConflictResolver()
