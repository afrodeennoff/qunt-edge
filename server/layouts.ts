'use server'

import { DashboardLayout, Prisma } from '@/prisma/generated/prisma'
import { revalidatePath, updateTag } from 'next/cache'
import { Widget, Layouts } from '@/app/[locale]/dashboard/types/dashboard'
import { createClient, getUserId } from './auth'
import { prisma } from '@/lib/prisma'
import { defaultLayouts } from '@/lib/default-layouts'
import { logger } from '@/lib/logger'

interface SaveLayoutResult {
  success: boolean
  error?: string
}

const saveLocks = new Map<string, Promise<SaveLayoutResult>>()

function validateLayouts(layouts: DashboardLayout): boolean {
  if (!layouts || typeof layouts !== 'object') return false

  const validateArray = (arr: unknown): arr is Prisma.JsonArray => {
    if (!Array.isArray(arr)) return false
    return arr.every(item =>
      item &&
      typeof item === 'object' &&
      'i' in item &&
      'type' in item &&
      'x' in item &&
      'y' in item &&
      'w' in item &&
      'h' in item
    )
  }

  return validateArray(layouts.desktop) && validateArray(layouts.mobile)
}

export async function loadDashboardLayoutAction(): Promise<Layouts | null> {
  const userId = await getUserId()
  try {
    const dashboard = await prisma.dashboardLayout.findUnique({
      where: { userId },
    })

    if (!dashboard) return null

    const parse = (json: any): Widget[] => {
      if (Array.isArray(json)) return json as unknown as Widget[]
      return []
    }

    return {
      desktop: parse(dashboard.desktop),
      mobile: parse(dashboard.mobile)
    }
  } catch (error) {
    logger.error('[loadDashboardLayout] Error', { error })
    return null
  }
}

export async function saveDashboardLayoutAction(layouts: DashboardLayout): Promise<SaveLayoutResult> {
  const userId = await getUserId()

  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayout] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const resolvedEmail = user?.email || ''

    if (!resolvedEmail) {
      logger.error('[saveDashboardLayout] Missing user email for ensureUserInDatabase', { userId })
      return { success: false, error: 'User email not available' }
    }

    await prisma.user.upsert({
      where: { auth_user_id: userId },
      create: {
        id: userId,
        auth_user_id: userId,
        email: resolvedEmail,
      },
      update: {
        email: resolvedEmail,
      },
    })
  } catch (error) {
    logger.error('[saveDashboardLayout] Failed to ensure user record', { error, userId })
    return { success: false, error: 'Failed to ensure user record' }
  }

  const verifiedUser = await prisma.user.findUnique({
    where: { auth_user_id: userId },
    select: { id: true },
  })

  if (!verifiedUser) {
    logger.error('[saveDashboardLayout] Missing user record for layout save', { userId })
    return { success: false, error: 'User record not found' }
  }

  const lockKey = `layout:${userId}`

  if (saveLocks.has(lockKey)) {
    logger.info('[saveDashboardLayout] Debouncing concurrent save', { userId })
    return { success: true }
  }

  const savePromise = (async (): Promise<SaveLayoutResult> => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.dashboardLayout.upsert({
          where: { userId },
          update: {
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray,
            updatedAt: new Date()
          },
          create: {
            userId,
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray
          },
        })
      })

      updateTag(`dashboard-${userId}`)
      revalidatePath('/')

      logger.info('[saveDashboardLayout] Success', { userId })
      return { success: true }
    } catch (error) {
      logger.error('[saveDashboardLayout] Error', { error, userId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    }
  })()

  saveLocks.set(lockKey, savePromise)

  try {
    const result = await savePromise
    return result
  } finally {
    saveLocks.delete(lockKey)
  }
}

export async function createDefaultDashboardLayout(userId: string): Promise<void> {
  try {
    const existing = await prisma.dashboardLayout.findUnique({ where: { userId } })
    if (existing) return

    await prisma.dashboardLayout.create({
      data: {
        userId,
        desktop: defaultLayouts.desktop as unknown as Prisma.JsonArray,
        mobile: defaultLayouts.mobile as unknown as Prisma.JsonArray
      }
    })
  } catch (error) {
    logger.warn('[createDefaultDashboardLayout] Failed (likely exists)', { error })
  }
}

export async function createLayoutVersionAction(
  layoutId: string,
  versionData: {
    desktop: unknown
    mobile: unknown
    version: number
    checksum: string
    description?: string
    deviceId: string
    changeType: string
  }
): Promise<void> {
  try {
    await prisma.layoutVersion.create({
      data: {
        layoutId,
        desktop: versionData.desktop as Prisma.JsonArray,
        mobile: versionData.mobile as Prisma.JsonArray,
        version: versionData.version,
        checksum: versionData.checksum,
        description: versionData.description,
        deviceId: versionData.deviceId,
        changeType: versionData.changeType
      }
    })

    await prisma.dashboardLayout.update({
      where: { id: layoutId },
      data: {
        version: versionData.version,
        checksum: versionData.checksum,
        deviceId: versionData.deviceId
      }
    })

    logger.info('[createLayoutVersion] Success', { layoutId, version: versionData.version })
  } catch (error) {
    logger.error('[createLayoutVersion] Error', { error, layoutId })
    throw error
  }
}

export async function getLayoutVersionHistoryAction(
  layoutId: string,
  limit = 20
): Promise<Array<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
}>> {
  try {
    const versions = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      take: limit
    })

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      desktop: v.desktop,
      mobile: v.mobile,
      checksum: v.checksum,
      description: v.description ?? undefined,
      deviceId: v.deviceId,
      changeType: v.changeType,
      createdAt: v.createdAt
    }))
  } catch (error) {
    logger.error('[getLayoutVersionHistory] Error', { error, layoutId })
    return []
  }
}

export async function getLayoutVersionByNumberAction(
  layoutId: string,
  versionNumber: number
): Promise<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
} | null> {
  try {
    const version = await prisma.layoutVersion.findUnique({
      where: {
        id: await prisma.layoutVersion.findFirst({
          where: { layoutId, version: versionNumber },
          select: { id: true }
        }).then(v => v?.id)
      }
    })

    if (!version) return null

    return {
      id: version.id,
      version: version.version,
      desktop: version.desktop,
      mobile: version.mobile,
      checksum: version.checksum,
      description: version.description ?? undefined,
      deviceId: version.deviceId,
      changeType: version.changeType,
      createdAt: version.createdAt
    }
  } catch (error) {
    logger.error('[getLayoutVersionByNumber] Error', { error, layoutId, versionNumber })
    return null
  }
}

export async function cleanupOldLayoutVersionsAction(
  layoutId: string,
  keepCount = 50
): Promise<void> {
  try {
    const totalCount = await prisma.layoutVersion.count({ where: { layoutId } })

    if (totalCount <= keepCount) return

    const versionsToDelete = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      skip: keepCount,
      select: { id: true }
    })

    if (versionsToDelete.length === 0) return

    await prisma.layoutVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map(v => v.id) }
      }
    })

    logger.info('[cleanupOldLayoutVersions] Success', {
      layoutId,
      deletedCount: versionsToDelete.length
    })
  } catch (error) {
    logger.error('[cleanupOldLayoutVersions] Error', { error, layoutId })
  }
}

export async function saveDashboardLayoutWithVersionAction(
  layouts: DashboardLayout,
  versionData: {
    description?: string
    changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
    deviceId: string
  }
): Promise<SaveLayoutResult> {
  const userId = await getUserId()

  if (!userId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayoutWithVersion] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.dashboardLayout.findUnique({
        where: { userId },
        select: { id: true, version: true, checksum: true }
      })

      const newVersion = (existing?.version ?? 0) + 1

      const crypto = await import('crypto')
      const checksum = crypto.createHash('sha256')
        .update(JSON.stringify({ desktop: layouts.desktop, mobile: layouts.mobile }))
        .digest('hex')

      const savedLayout = await tx.dashboardLayout.upsert({
        where: { userId },
        update: {
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId,
          updatedAt: new Date()
        },
        create: {
          userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId
        },
      })

      await tx.layoutVersion.create({
        data: {
          layoutId: savedLayout.id,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          description: versionData.description,
          deviceId: versionData.deviceId,
          changeType: versionData.changeType
        }
      })
    })

    updateTag(`dashboard-${userId}`)
    revalidatePath('/')

    logger.info('[saveDashboardLayoutWithVersion] Success', { userId })
    return { success: true }
  } catch (error) {
    logger.error('[saveDashboardLayoutWithVersion] Error', { error, userId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}
