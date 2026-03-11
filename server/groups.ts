'use server'

import { updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Group as PrismaGroup, Account as PrismaAccount } from '@/prisma/generated/prisma'
import { logger } from '@/lib/logger'
import { getDatabaseUserId, getUserId } from './auth'
import { resolveWritableUserId } from './trades'

export interface GroupWithAccounts extends PrismaGroup {
  accounts: PrismaAccount[]
}

function invalidateGroupRelatedCaches(userId: string) {
  updateTag(`user-data-${userId}`)
  updateTag(`trades-${userId}`)
  updateTag(`dashboard-layout-${userId}`)
  updateTag(`dashboard-${userId}`)
}

export async function getGroupsAction(): Promise<GroupWithAccounts[]> {
  const userId = await getDatabaseUserId()
  try {
    const groups = await prisma.group.findMany({
      where: { userId },
      include: {
        accounts: true,
      },
    })
    return groups
  } catch (error) {
    console.error('Error fetching groups:', error)
    throw error
  }
}

export async function renameGroupAction(groupId: string, name: string): Promise<GroupWithAccounts> {
  const userId = await getDatabaseUserId()
  try {
    const existingGroup = await prisma.group.findFirst({
      where: { id: groupId, userId },
      select: { id: true },
    })
    if (!existingGroup) {
      throw new Error('Group not found')
    }

    const group = await prisma.group.update({
      where: { id: existingGroup.id },
      data: { name },
      include: {
        accounts: true,
      },
    })
    invalidateGroupRelatedCaches(userId)
    return group
  } catch (error) {
    console.error('Error renaming group:', error)
    throw error
  }
}

export async function saveGroupAction(name: string): Promise<GroupWithAccounts> {
  const userId = await getDatabaseUserId()
  try {
    const existingGroup = await prisma.group.findFirst({
      where: { name, userId },
      include: {
        accounts: true,
      },
    })
    if (existingGroup) {
      return existingGroup
    }
    const group = await prisma.group.create({
      data: {
        name,
        userId,
      },
      include: {
        accounts: true,
      },
    })
    invalidateGroupRelatedCaches(userId)
    return group
  } catch (error) {
    console.error('Error creating group:', error)
    throw error
  }
}

export async function updateGroupAction(groupId: string, name: string): Promise<GroupWithAccounts> {
  const userId = await getDatabaseUserId()
  try {
    const existingGroup = await prisma.group.findFirst({
      where: { id: groupId, userId },
      select: { id: true },
    })
    if (!existingGroup) {
      throw new Error('Group not found')
    }

    const group = await prisma.group.update({
      where: { id: existingGroup.id },
      data: { name },
      include: {
        accounts: true,
      },
    })
    invalidateGroupRelatedCaches(userId)
    return group
  } catch (error) {
    console.error('Error updating group:', error)
    throw error
  }
}

export async function deleteGroupAction(groupId: string): Promise<void> {
  const userId = await getDatabaseUserId()
  try {
    const existingGroup = await prisma.group.findFirst({
      where: { id: groupId, userId },
      select: { id: true },
    })
    if (!existingGroup) {
      throw new Error('Group not found')
    }

    await prisma.group.delete({
      where: { id: existingGroup.id },
    })
    invalidateGroupRelatedCaches(userId)
  } catch (error) {
    console.error('Error deleting group:', error)
    throw error
  }
}

export async function moveAccountToGroupAction(accountId: string, targetGroupId: string | null): Promise<void> {
  const userId = await getDatabaseUserId()
  try {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
      select: { id: true },
    })
    if (!account) {
      throw new Error('Account not found')
    }

    if (targetGroupId) {
      const targetGroup = await prisma.group.findFirst({
        where: { id: targetGroupId, userId },
        select: { id: true },
      })
      if (!targetGroup) {
        throw new Error('Target group not found')
      }
    }

    await prisma.account.update({
      where: { id: account.id },
      data: { groupId: targetGroupId },
    })
    invalidateGroupRelatedCaches(userId)
  } catch (error) {
    console.error('Error moving account to group:', error)
    throw error
  }
}

export async function groupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await resolveWritableUserId(await getUserId())
    const groupId = crypto.randomUUID()

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId }
    })

    invalidateGroupRelatedCaches(userId)
    return true
  } catch (error) {
    logger.error('[groupTrades] Error', { error })
    return false
  }
}

export async function ungroupTradesAction(tradeIds: string[]): Promise<boolean> {
  try {
    const userId = await resolveWritableUserId(await getUserId())
    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId: "" }
    })

    invalidateGroupRelatedCaches(userId)
    return true
  } catch (error) {
    logger.error('[ungroupTrades] Error', { error })
    return false
  }
}
