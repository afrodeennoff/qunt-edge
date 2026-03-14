import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createClientMock, getUserMock, getDatabaseUserIdMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
  getDatabaseUserIdMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  createClient: createClientMock,
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { getComments, getPost, getPosts } from '@/app/[locale]/(landing)/actions/community'
import { PostStatus, PostType, VoteType } from '@/prisma/generated/prisma'

const postFindManyMock = vi.mocked(prisma.post.findMany)
const postFindUniqueMock = vi.mocked(prisma.post.findUnique)
const commentFindManyMock = vi.mocked(prisma.comment.findMany)

beforeEach(() => {
  vi.clearAllMocks()
  getUserMock.mockResolvedValue({ data: { user: { id: 'auth-1' } } })
  createClientMock.mockResolvedValue({ auth: { getUser: getUserMock } })
  getDatabaseUserIdMock.mockResolvedValue('db-user-1')
})

describe('community read helpers', () => {
  it('cleans email out of posts while preserving author flag', async () => {
    const now = new Date()
    const mockPost = {
      id: 'post-1',
      title: 'Test',
      content: 'Body',
      type: PostType.DISCUSSION,
      status: PostStatus.OPEN,
      userId: 'db-user-1',
      screenshots: [],
      createdAt: now,
      updatedAt: now,
      user: {
        id: 'db-user-1',
        email: 'owner@example.com',
      },
      votes: [],
      comments: [
        {
          id: 'comment-1',
          parentId: null,
          _count: { replies: 0 },
        },
      ],
    }

    postFindManyMock.mockResolvedValue([mockPost] as never)

    const posts = await getPosts()

    expect(posts[0].user.displayName).toBe('owner')
    expect((posts[0].user as { email?: string }).email).toBeUndefined()
    expect(posts[0].isAuthor).toBe(true)
  })

  it('returns sanitized user data for post detail and leaves votes intact', async () => {
    const now = new Date()
    const mockPost = {
      id: 'post-2',
      title: 'Detail',
      content: 'Detail body',
      type: PostType.BUG_REPORT,
      status: PostStatus.OPEN,
      userId: 'db-user-1',
      screenshots: [],
      createdAt: now,
      updatedAt: now,
      user: {
        id: 'db-user-1',
        email: 'owner@example.com',
      },
      votes: [
        {
          id: 'vote-1',
          type: VoteType.UPVOTE,
          userId: 'voter-1',
          postId: 'post-2',
          createdAt: now,
        },
      ],
    }

    postFindUniqueMock.mockResolvedValue(mockPost as never)

    const result = await getPost('post-2')

    expect(result.user.displayName).toBe('owner')
    expect(result.votes[0].userId).toBe('voter-1')
    expect('user' in result.votes[0]).toBe(false)
    expect(result.isAuthor).toBe(true)
  })

  it('strips emails from nested comment users', async () => {
    const now = new Date()
    const mockComments = [
      {
        id: 'comment-1',
        content: 'Root',
        postId: 'post-1',
        userId: 'user-1',
        parentId: null,
        createdAt: now,
        updatedAt: now,
        user: { id: 'user-1', email: 'commenter@example.com' },
        replies: [
          {
            id: 'reply-1',
            content: 'Reply',
            postId: 'post-1',
            userId: 'user-2',
            parentId: 'comment-1',
            createdAt: now,
            updatedAt: now,
            user: { id: 'user-2', email: 'reply@example.com' },
            replies: [],
            _count: { replies: 0 },
          },
        ],
        _count: { replies: 1 },
      },
    ]

    commentFindManyMock.mockResolvedValue(mockComments as never)

    const comments = await getComments('post-1')

    expect(comments[0].user.displayName).toBe('commenter')
    expect(comments[0].replies[0].user.displayName).toBe('reply')
    expect((comments[0].user as { email?: string }).email).toBeUndefined()
  })
})
