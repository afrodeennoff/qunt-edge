'use server'

import { prisma } from '@/lib/prisma'
import { Group, Account } from '@/context/data-provider'
import { getDatabaseUserId } from './auth'

export interface GroupWithAccounts extends Group {
  accounts: Account[]
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

export async function renameGroupAction(groupId: string, name: string): Promise<Group> {
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
    return group
  } catch (error) {
    console.error('Error renaming group:', error)
    throw error
  }
}

export async function saveGroupAction(name: string): Promise<Group> {
  const userId = await getDatabaseUserId()
  try {
    // Check if group already exists
    const existingGroup = await prisma.group.findFirst({
      where: { name, userId },
      include: {
        accounts: true,
      },
    })
    if (existingGroup) {
      return existingGroup
    }
    // Create new group
    const group = await prisma.group.create({
      data: {
        name,
        userId,
      },
      include: {
        accounts: true,
      },
    })
    return group
  } catch (error) {
    console.error('Error creating group:', error)
    throw error
  }
}

export async function updateGroupAction(groupId: string, name: string): Promise<Group> {
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
  } catch (error) {
    console.error('Error moving account to group:', error)
    throw error
  }
} 
