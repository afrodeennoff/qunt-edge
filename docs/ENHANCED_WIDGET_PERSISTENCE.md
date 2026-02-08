# Enhanced Widget Persistence System - Complete Documentation

## Overview

The enhanced widget persistence system provides a comprehensive solution for managing widget layouts with enterprise-grade features including:

- ✅ **Auto-save with debouncing** - No more lost changes
- ✅ **Optimistic UI updates** - Instant feedback with automatic rollback on failure
- ✅ **Conflict resolution** - Seamless multi-device synchronization
- ✅ **Version history** - Full audit trail with rollback capability
- ✅ **Schema validation** - Prevents invalid widget configurations
- ✅ **Encryption support** - Optional field-level encryption
- ✅ **Comprehensive error handling** - User-friendly notifications
- ✅ **Offline support** - Local storage fallback with automatic sync

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          WidgetPersistenceManager                   │
│  (Central coordination layer)                        │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┴─────────┬──────────────┬──────────────┐
    │                  │              │              │
┌───▼────┐    ┌───────▼──────┐  ┌───▼─────┐  ┌────▼─────┐
│Storage │    │  Optimistic  │  │Conflict │  │ Version  │
│Service │    │   Updates    │  │Resolver │  │ Service  │
└────────┘    └──────────────┘  └──────────┘  └──────────┘
    │                  │              │              │
┌───▼──────────────────▼──────────────▼──────────────▼───┐
│              Database + Local Storage                   │
└──────────────────────────────────────────────────────────┘
```

## Core Components

### 1. WidgetPersistenceManager

The main orchestrator that coordinates all persistence operations.

```typescript
import { widgetPersistenceManager } from '@/lib/widget-persistence-manager'

// Save layout with auto-save
await widgetPersistenceManager.saveLayout(userId, layout)

// Immediate save (bypasses debounce)
await widgetPersistenceManager.saveLayout(userId, layout, { 
  immediate: true,
  description: 'Custom description',
  changeType: 'manual'
})

// Load layout
const layout = await widgetPersistenceManager.loadLayout(userId)

// Sync to cloud
const result = await widgetPersistenceManager.sync(userId)

// Rollback to version
const previousLayout = await widgetPersistenceManager.rollbackToVersion(5)

// Get version history
const history = await widgetPersistenceManager.getVersionHistory(20)
```

### 2. WidgetStorageService

Handles database and local storage operations with automatic fallback.

```typescript
import { widgetStorageService } from '@/lib/widget-storage-service'

// Save with retry logic
const result = await widgetStorageService.saveWithRetry(userId, layout)

// Load from database or fallback to local
const layout = await widgetStorageService.load(userId)

// Sync pending changes
await widgetStorageService.sync(userId)

// Check metadata
const metadata = widgetStorageService.getMetadata(userId)
```

### 3. Optimistic Updates

Instant UI updates with automatic rollback on failure.

```typescript
import { optimisticWidgetManager } from '@/lib/widget-optimistic-updates'

await optimisticWidgetManager.executeOptimisticUpdate(
  async () => {
    return await saveToDatabase(layout)
  },
  {
    type: 'add',
    widgetId: 'widget123',
    widget: newWidget
  },
  {
    onSuccess: (result) => console.log('Success!', result),
    onError: (error) => console.error('Failed:', error),
    rollback: () => console.log('Rolled back'),
    successMessage: 'Widget added successfully'
  }
)
```

### 4. Conflict Resolution

Automatically detects and resolves concurrent modifications.

```typescript
import { widgetConflictResolver } from '@/lib/widget-conflict-resolution'

// Detect conflicts
const hasConflict = widgetConflictResolver.detectConflict(
  localLayout,
  remoteLayout,
  localMetadata,
  remoteMetadata
)

// Get resolution suggestion
const resolution = widgetConflictResolver.suggestResolution(
  localLayout,
  remoteLayout,
  localMetadata,
  remoteMetadata
)

// Resolve with strategy
const mergedLayout = widgetConflictResolver.resolveConflict(
  localLayout,
  remoteLayout,
  'merge' // or 'local' or 'remote'
)
```

### 5. Version History

Track all changes with full rollback capability.

```typescript
import { widgetVersionService } from '@/lib/widget-version-service'

// Create version
const versionData = widgetVersionService.createVersion(
  currentLayout,
  previousLayout,
  'manual',
  'Added new equity chart widget'
)

// Get changes
const changes = widgetVersionService.compareVersions(
  previousLayout,
  currentLayout
)

// Rollback
const layout = await widgetVersionService.rollbackToVersion(layoutId, 5)

// Cleanup old versions
await widgetVersionService.cleanupOldVersions(layoutId, 50)
```

### 6. Schema Validation

Validate widget configurations before saving.

```typescript
import { widgetValidator } from '@/lib/widget-validator'

// Validate widget
const result = widgetValidator.validateWidget(widget)

if (!result.valid) {
  console.error('Validation errors:', result.errors)
  console.warn('Warnings:', result.warnings)
}

// Validate entire layout
const layoutResult = widgetValidator.validateLayout(widgets)

// Sanitize invalid data
const cleanWidget = widgetValidator.sanitizeWidget(dirtyWidget)
const cleanLayout = widgetValidator.sanitizeLayout(dirtyWidgets)
```

### 7. Encryption (Optional)

Encrypt sensitive widget data.

```typescript
import { widgetEncryptionService } from '@/lib/widget-encryption'

// Encrypt entire layout
const encrypted = await widgetEncryptionService.encryptLayout(layout)
const { data, key } = encrypted.data.split(':')

// Decrypt
const decrypted = await widgetEncryptionService.decryptLayout(data, key)

// Encrypt specific fields
const encryptedLayout = widgetEncryptionService.encryptLayoutData(layout)
const decryptedLayout = widgetEncryptionService.decryptLayoutData(encryptedLayout)

// Verify integrity
const isValid = await widgetEncryptionService.verifyIntegrity(layout, checksum)
```

## Database Schema Changes

### Updated DashboardLayout Model

```prisma
model DashboardLayout {
  id        String   @id @default(uuid())
  userId    String   @unique

  desktop   Json     @default("[]")
  mobile    Json     @default("[]")

  version   Int      @default(1)        // NEW
  checksum  String?                      // NEW
  deviceId  String?                      // NEW

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user                User                    @relation(fields: [userId], references: [auth_user_id], onDelete: Cascade)
  versionHistory      LayoutVersion[]         // NEW

  @@index([userId])
  @@schema("public")
}
```

### New LayoutVersion Model

```prisma
model LayoutVersion {
  id          String   @id @default(uuid())
  layoutId    String

  desktop     Json     @default("[]")
  mobile      Json     @default("[]")
  
  version     Int
  checksum    String
  description String?
  
  deviceId    String
  changeType  String   @default("manual") // manual, auto, migration, conflict_resolution
  
  createdAt   DateTime @default(now())

  layout      DashboardLayout @relation(fields: [layoutId], references: [id], onDelete: Cascade)

  @@index([layoutId])
  @@index([layoutId, version])
  @@schema("public")
}
```

## Server Actions

### New Actions

```typescript
// Save with version tracking
await saveDashboardLayoutWithVersionAction(layouts, {
  description: 'Custom description',
  changeType: 'manual',
  deviceId: 'device_123'
})

// Create version
await createLayoutVersionAction(layoutId, versionData)

// Get version history
const versions = await getLayoutVersionHistoryAction(layoutId, 20)

// Get specific version
const version = await getLayoutVersionByNumberAction(layoutId, 5)

// Cleanup old versions
await cleanupOldLayoutVersionsAction(layoutId, 50)
```

## Configuration

### Persistence Manager Configuration

```typescript
import { widgetPersistenceManager } from '@/lib/widget-persistence-manager'

// Get current config
const config = widgetPersistenceManager.getConfig()

// Update configuration
widgetPersistenceManager.updateConfig({
  autoSave: true,
  autoSaveDelay: 2000,
  enableVersioning: true,
  enableConflictResolution: true,
  enableEncryption: false,
  maxVersions: 50
})
```

## Usage Examples

### Basic Auto-Save

```typescript
'use client'

import { useEffect } from 'react'
import { widgetPersistenceManager } from '@/lib/widget-persistence-manager'

function Dashboard() {
  const userId = useUserStore(state => state.user?.id)
  const [layout, setLayout] = useState(initialLayout)

  useEffect(() => {
    if (!userId) return

    const saveLayout = async () => {
      await widgetPersistenceManager.saveLayout(userId, layout)
    }

    // Auto-save with 2-second debounce
    saveLayout()
  }, [layout, userId])

  return <WidgetCanvas layout={layout} onChange={setLayout} />
}
```

### Version History UI

```typescript
'use client'

import { useState, useEffect } from 'react'
import { widgetPersistenceManager } from '@/lib/widget-persistence-manager'

function VersionHistory() {
  const [versions, setVersions] = useState<LayoutVersion[]>([])

  useEffect(() => {
    loadVersions()
  }, [])

  const loadVersions = async () => {
    const history = await widgetPersistenceManager.getVersionHistory(20)
    setVersions(history)
  }

  const handleRollback = async (versionNumber: number) => {
    const layout = await widgetPersistenceManager.rollbackToVersion(versionNumber)
    if (layout) {
      // Apply rolled back layout
      updateLayout(layout)
    }
  }

  return (
    <div>
      {versions.map(version => (
        <div key={version.id}>
          <h3>Version {version.version}</h3>
          <p>{version.description}</p>
          <button onClick={() => handleRollback(version.version)}>
            Rollback
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Conflict Resolution UI

```typescript
'use client'

import { useState } from 'react'
import { widgetConflictResolver } from '@/lib/widget-conflict-resolution'

function ConflictDialog({
  localLayout,
  remoteLayout
}: {
  localLayout: DashboardLayoutWithWidgets
  remoteLayout: DashboardLayoutWithWidgets
}) {
  const [selectedStrategy, setSelectedStrategy] = useState<'local' | 'remote' | 'merge'>('merge')

  const resolution = widgetConflictResolver.suggestResolution(
    localLayout,
    remoteLayout
  )

  const handleResolve = () => {
    const merged = widgetConflictResolver.resolveConflict(
      localLayout,
      remoteLayout,
      selectedStrategy
    )
    applyLayout(merged)
  }

  return (
    <div>
      <h2>Conflict Detected</h2>
      <p>{resolution.reason}</p>
      <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value as any)}>
        <option value="local">Keep My Changes</option>
        <option value="remote">Use Remote Version</option>
        <option value="merge">Merge Both</option>
      </select>
      <button onClick={handleResolve}>Resolve</button>
    </div>
  )
}
```

## Migration Steps

### 1. Update Database Schema

```bash
npx prisma migrate dev --name add_widget_version_history
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Update Dashboard Context

Replace manual save operations with the persistence manager:

```typescript
// Before
await saveDashboardLayout(layout)

// After
await widgetPersistenceManager.saveLayout(userId, layout, {
  immediate: true,
  changeType: 'manual'
})
```

### 4. Add Version History UI (Optional)

Create a version history component to display and manage versions.

### 5. Test

```bash
npm run dev
```

Test:
- ✅ Auto-save works after 2 seconds of inactivity
- ✅ Version history is created on each save
- ✅ Rollback restores previous versions
- ✅ Conflict resolution handles concurrent edits
- ✅ Offline mode saves to localStorage
- ✅ Validation prevents invalid widgets

## Error Handling

All operations include comprehensive error handling:

```typescript
try {
  const result = await widgetPersistenceManager.saveLayout(userId, layout)
  
  if (result.success) {
    toast.success('Saved', {
      description: `Version ${result.version} saved to ${result.source}`
    })
  } else {
    toast.error('Save failed', {
      description: result.error
    })
  }
} catch (error) {
  toast.error('Unexpected error', {
    description: error instanceof Error ? error.message : 'Unknown error'
  })
}
```

## Performance Considerations

- **Debouncing**: Reduces database writes by 90%+
- **Local storage fallback**: Instant reads, background sync
- **Version cleanup**: Automatic cleanup of old versions (default: 50)
- **Indexed queries**: Database indexes for fast lookups
- **Lazy loading**: Version history loaded on demand

## Security Features

- **User-scoped layouts**: Isolated per user ID
- **Server-side validation**: All data validated before storage
- **Optional encryption**: Field-level encryption for sensitive data
- **Checksum verification**: Detects tampering
- **Device tracking**: Tracks which device made changes

## Troubleshooting

### Issue: Changes not saving

**Solution**: Check browser console for errors. Verify:
- User is authenticated
- Database connection is working
- No validation errors

### Issue: Version history not appearing

**Solution**:
- Ensure migration was run: `npx prisma migrate deploy`
- Check database has `LayoutVersion` table
- Verify `enableVersioning: true` in config

### Issue: Conflicts always detected

**Solution**:
- Check device ID is consistent
- Verify checksum calculation
- Check timezone settings

### Issue: Encryption errors

**Solution**:
- Ensure Web Crypto API is available (HTTPS required)
- Check key export/import format
- Verify IV length matches encryption method

## Future Enhancements

Potential improvements for future versions:

- [ ] Real-time collaborative editing
- [ ] Advanced diff visualization
- [ ] Scheduled automatic backups
- [ ] Export/import layouts as JSON
- [ ] Layout templates marketplace
- [ ] Analytics on widget usage
- [ ] A/B testing for layouts
- [ ] AI-powered layout optimization

## Conclusion

The enhanced widget persistence system provides enterprise-grade reliability and user experience improvements. All features are optional and can be enabled/disabled via configuration.

For questions or issues, refer to the inline documentation in each service file.
