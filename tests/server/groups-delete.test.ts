import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getDatabaseUserIdMock,
  groupFindFirstMock,
  groupDeleteMock,
  accountUpdateManyMock,
  updateTagMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  groupFindFirstMock: vi.fn(),
  groupDeleteMock: vi.fn(),
  accountUpdateManyMock: vi.fn(),
  updateTagMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findFirst: groupFindFirstMock,
      delete: groupDeleteMock,
    },
    account: {
      updateMany: accountUpdateManyMock,
    },
  },
}))

import { deleteGroupAction } from '@/server/groups'

describe('deleteGroupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('nulls linked accounts and deletes the group for the owner', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue({ id: 'group-1' })
    accountUpdateManyMock.mockResolvedValue({ count: 2 })
    groupDeleteMock.mockResolvedValue({})

    await deleteGroupAction('group-1')

    expect(accountUpdateManyMock).toHaveBeenCalledWith({
      where: {
        groupId: 'group-1',
        userId: 'db-user-1',
      },
      data: {
        groupId: null,
      },
    })
    expect(groupDeleteMock).toHaveBeenCalledWith({
      where: { id: 'group-1' },
    })
    expect(updateTagMock).toHaveBeenCalledWith('user-data-db-user-1')
    expect(
      accountUpdateManyMock.mock.invocationCallOrder?.[0],
    ).toBeLessThan(groupDeleteMock.mock.invocationCallOrder?.[0])
  })

  it('blocks unauthorized deletes', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue(null)

    await expect(deleteGroupAction('group-1')).rejects.toThrow('Group not found')

    expect(accountUpdateManyMock).not.toHaveBeenCalled()
    expect(groupDeleteMock).not.toHaveBeenCalled()
  })
})
