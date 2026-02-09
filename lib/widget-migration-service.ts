import { DashboardLayoutWithWidgets, Widget } from "@/store/user-store"
import { defaultLayouts } from "@/lib/default-layouts"

export interface MigrationResult {
  success: boolean
  migrated: boolean
  fromVersion: number
  toVersion: number
  changes: string[]
  error?: string
}

export interface WidgetMigration {
  version: number
  description: string
  migrate: (layout: DashboardLayoutWithWidgets) => DashboardLayoutWithWidgets
}

const WIDGET_SCHEMA_VERSION = 1

class WidgetMigrationService {
  private migrations: WidgetMigration[] = []
  private currentVersion = WIDGET_SCHEMA_VERSION

  constructor() {
    this.registerMigrations()
  }

  private registerMigrations() {
    this.migrations = [
      {
        version: 1,
        description: 'Initial schema version',
        migrate: (layout) => layout
      }
    ]
  }

  getSchemaVersion(): number {
    return this.currentVersion
  }

  getLayoutVersion(layout: DashboardLayoutWithWidgets): number {
    return (layout as any).schemaVersion || 0
  }

  needsMigration(layout: DashboardLayoutWithWidgets): boolean {
    const layoutVersion = this.getLayoutVersion(layout)
    return layoutVersion < this.currentVersion
  }

  async migrate(layout: DashboardLayoutWithWidgets): Promise<MigrationResult> {
    const fromVersion = this.getLayoutVersion(layout)
    const changes: string[] = []

    if (fromVersion >= this.currentVersion) {
      return {
        success: true,
        migrated: false,
        fromVersion,
        toVersion: fromVersion,
        changes: []
      }
    }

    let currentLayout = { ...layout }
    let currentVersion = fromVersion

    try {
      for (const migration of this.migrations) {
        if (migration.version > currentVersion && migration.version <= this.currentVersion) {
          console.log(`[WidgetMigration] Applying migration v${migration.version}: ${migration.description}`)

          currentLayout = migration.migrate(currentLayout)
          currentVersion = migration.version
          changes.push(`v${migration.version}: ${migration.description}`)
        }
      }

      currentLayout = {
        ...currentLayout,
        schemaVersion: this.currentVersion,
        updatedAt: new Date()
      }

      return {
        success: true,
        migrated: true,
        fromVersion,
        toVersion: this.currentVersion,
        changes
      }
    } catch (error) {
      return {
        success: false,
        migrated: false,
        fromVersion,
        toVersion: fromVersion,
        changes,
        error: error instanceof Error ? error.message : 'Unknown migration error'
      }
    }
  }

  migrateForAccountUpgrade(
    layout: DashboardLayoutWithWidgets,
    fromTier: 'free' | 'plus' | 'pro',
    toTier: 'free' | 'plus' | 'pro'
  ): DashboardLayoutWithWidgets {
    if (fromTier === toTier) return layout

    const migratedLayout = { ...layout }

    if (fromTier === 'free' && (toTier === 'plus' || toTier === 'pro')) {
      migratedLayout.desktop = this.addUpgradeWidgets(migratedLayout.desktop)
      migratedLayout.mobile = this.addUpgradeWidgets(migratedLayout.mobile)
    }

    if ((fromTier === 'plus' || fromTier === 'pro') && toTier === 'free') {
      migratedLayout.desktop = this.filterFreeWidgets(migratedLayout.desktop)
      migratedLayout.mobile = this.filterFreeWidgets(migratedLayout.mobile)
    }

    return migratedLayout
  }

  private addUpgradeWidgets(widgets: Widget[]): Widget[] {
    const premiumWidgets: Widget[] = [
      {
        i: `widget${Date.now()}_risk`,
        type: 'riskMetrics',
        size: 'medium',
        x: 0,
        y: widgets.length,
        w: 6,
        h: 4,
        updatedAt: new Date()
      }
    ]

    return [...widgets, ...premiumWidgets]
  }

  private filterFreeWidgets(widgets: Widget[]): Widget[] {
    const freeWidgetTypes = ['statistics', 'chart', 'calendar', 'mindset']
    return widgets.filter(w => freeWidgetTypes.includes(w.type))
  }

  migrateForDeviceChange(
    layout: DashboardLayoutWithWidgets,
    fromDevice: 'mobile' | 'desktop',
    toDevice: 'mobile' | 'desktop'
  ): DashboardLayoutWithWidgets {
    if (fromDevice === toDevice) return layout

    return {
      ...layout,
      desktop: this.adjustLayoutForDevice(layout.desktop, toDevice === 'desktop'),
      mobile: this.adjustLayoutForDevice(layout.mobile, toDevice === 'mobile')
    }
  }

  private adjustLayoutForDevice(widgets: Widget[], isTargetDevice: boolean): Widget[] {
    return widgets.map(widget => {
      const w = isTargetDevice ? widget.w : 12
      const x = isTargetDevice ? widget.x : 0

      return {
        ...widget,
        w,
        x
      }
    })
  }

  validateLayout(layout: DashboardLayoutWithWidgets): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!layout.desktop || !Array.isArray(layout.desktop)) {
      errors.push('Desktop layout is missing or invalid')
    }

    if (!layout.mobile || !Array.isArray(layout.mobile)) {
      errors.push('Mobile layout is missing or invalid')
    }

    if (layout.desktop) {
      layout.desktop.forEach((widget, index) => {
        if (!this.isValidWidget(widget)) {
          errors.push(`Invalid widget at desktop index ${index}`)
        }
      })
    }

    if (layout.mobile) {
      layout.mobile.forEach((widget, index) => {
        if (!this.isValidWidget(widget)) {
          errors.push(`Invalid widget at mobile index ${index}`)
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private isValidWidget(widget: any): boolean {
    return (
      widget &&
      typeof widget === 'object' &&
      typeof widget.i === 'string' &&
      typeof widget.type === 'string' &&
      typeof widget.x === 'number' &&
      typeof widget.y === 'number' &&
      typeof widget.w === 'number' &&
      typeof widget.h === 'number'
    )
  }

  repairLayout(layout: DashboardLayoutWithWidgets): DashboardLayoutWithWidgets {
    const repaired = { ...layout }

    if (!repaired.desktop || !Array.isArray(repaired.desktop)) {
      repaired.desktop = defaultLayouts.desktop as unknown as Widget[]
    }

    if (!repaired.mobile || !Array.isArray(repaired.mobile)) {
      repaired.mobile = defaultLayouts.mobile as unknown as Widget[]
    }

    repaired.desktop = this.repairWidgets(repaired.desktop)
    repaired.mobile = this.repairWidgets(repaired.mobile)

    return repaired
  }

  private repairWidgets(widgets: Widget[]): Widget[] {
    return widgets
      .filter(w => w && typeof w === 'object')
      .map(widget => ({
        i: widget.i || `widget${Date.now()}_${Math.random()}`,
        type: widget.type || 'chart',
        size: widget.size || 'medium',
        x: widget.x ?? 0,
        y: widget.y ?? 0,
        w: widget.w ?? 6,
        h: widget.h ?? 4,
        updatedAt: widget.updatedAt || new Date()
      }))
  }

  createBackup(layout: DashboardLayoutWithWidgets): string {
    const backup = {
      layout,
      timestamp: Date.now(),
      version: this.currentVersion
    }
    return btoa(JSON.stringify(backup))
  }

  restoreFromBackup(backupString: string): DashboardLayoutWithWidgets | null {
    try {
      const backup = JSON.parse(atob(backupString))
      return backup.layout as DashboardLayoutWithWidgets
    } catch (error) {
      console.error('[WidgetMigration] Failed to restore backup:', error)
      return null
    }
  }
}

export const widgetMigrationService = new WidgetMigrationService()
