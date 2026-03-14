'use server'

import { prisma } from '@/lib/prisma'
import { createClient, getDatabaseUserId } from '@/server/auth'
import { PostType, PostStatus, VoteType } from '@/prisma/generated/prisma'

import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import { Resend } from 'resend'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import CommentNotificationEmail from '@/components/emails/blog/comment-notification'

// resend will be initialized inside functions that need it
const POST_NOT_FOUND_SENTINEL = "__POST_NOT_FOUND__"

type CommunityUser = {
  id: string
  displayName: string
}

type RawPrismaComment = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  postId: string
  parentId: string | null
  userId: string
  user: { id: string; email?: string | null }
  replies?: RawPrismaComment[]
}

type SanitizedComment = Omit<RawPrismaComment, 'user' | 'replies'> & {
  user: CommunityUser
  replies: SanitizedComment[]
}

function getCommunityDisplayName(email?: string | null) {
  if (!email) return 'User'
  const localPart = email.split('@')[0].trim()
  return localPart || 'User'
}

function sanitizeCommunityUser(user: { id: string; email?: string | null }): CommunityUser {
  return {
    id: user.id,
    displayName: getCommunityDisplayName(user.email ?? null)
  }
}

function sanitizeComment(comment: {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  postId: string
  parentId: string | null
  userId: string
  user?: { id: string; email?: string | null }
  replies?: unknown[]
}): SanitizedComment {
  const normalizedReplies = Array.isArray(comment.replies)
    ? comment.replies
        .filter((reply): reply is Parameters<typeof sanitizeComment>[0] => typeof reply === 'object' && reply !== null)
        .map(sanitizeComment)
    : []

  return {
    ...comment,
    user: sanitizeCommunityUser(comment.user ?? { id: comment.userId, email: null }),
    replies: normalizedReplies
  }
}

// Helper function to check if user is admin
async function isAdmin(userId: string) {
  return userId === process.env.ALLOWED_ADMIN_USER_ID
}

async function requireCommunityActor() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const databaseUserId = await getDatabaseUserId()
  return { authUser: user, databaseUserId }
}

// Get all posts with votes and user information
export async function getPosts() {
  try {
    let currentUserId: string | null = null
    try {
      const { databaseUserId } = await requireCommunityActor()
      currentUserId = databaseUserId
    } catch {
      currentUserId = null
    }

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            email: true,
            id: true,
          }
        },
        votes: true,
        comments: {
          select: {
            id: true,
            parentId: true,
            _count: {
              select: {
                replies: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate total comments for each post and add isAuthor flag
    const postsWithCommentCount = posts.map((post: typeof posts[number]) => {
      const totalComments = post.comments.reduce((acc: number, comment: typeof post.comments[number]) => {
        // Add 1 for the comment itself and the number of its replies
        return acc + 1 + (comment._count?.replies || 0)
      }, 0)

      // Remove the comments array from the post object since we only need the count
      const { comments, user, ...postWithoutComments } = post
      void comments
      return {
        ...postWithoutComments,
        user: sanitizeCommunityUser(user),
        _count: {
          comments: totalComments
        },
        isAuthor: currentUserId ? (post.userId === currentUserId || process.env.NODE_ENV === 'development') : false
      }
    })

    return postsWithCommentCount
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    throw new Error('Failed to fetch posts')
  }
}

// Get current user's permissions for a post
export async function getPostPermissions(postUserId: string) {
  try {
    const { authUser, databaseUserId } = await requireCommunityActor()
    return {
      canDelete: postUserId === databaseUserId,
      canChangeStatus: await isAdmin(authUser.id)
    }
  } catch {
    return { canDelete: false, canChangeStatus: false }
  }
}

// Create a new post
export async function createPost(formData: {
  title: string
  content: string
  type: PostType
  screenshots?: string[]
}) {
  const { databaseUserId } = await requireCommunityActor()

  try {
    // Process screenshots if they exist
    const processedScreenshots = await Promise.all(
      (formData.screenshots || []).map(async (screenshot) => {
        try {
          // Remove the data:image/[type];base64, prefix
          const base64Data = screenshot.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')

          // Process image with sharp
          const processedBuffer = await sharp(buffer)
            .resize(1200, 1200, { // Max dimensions
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convert to WebP for better compression
            .toBuffer()

          // Convert back to base64
          return `data:image/webp;base64,${processedBuffer.toString('base64')}`
        } catch (error) {
          console.error('Failed to process screenshot:', error)
          return null
        }
      })
    )

    const post = await prisma.post.create({
      data: {
        ...formData,
        screenshots: processedScreenshots.filter(Boolean) as string[],
        userId: databaseUserId,
        status: PostStatus.OPEN,
      },
    })

    revalidatePath('/community', 'page')
    return { post }
  } catch (error) {
    console.error('Failed to create post:', error)
    throw new Error('Failed to create post')
  }
}

// Update post status (only for admins)
export async function updatePostStatus(id: string, status: PostStatus) {
  const { authUser } = await requireCommunityActor()

  // Allow status changes in development or if user is admin
  if (process.env.NODE_ENV !== 'development' && !await isAdmin(authUser.id)) {
    throw new Error('Only administrators can change post status')
  }

  try {
    await prisma.post.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to update post status:', error)
    throw new Error('Failed to update post status')
  }
}

// Delete post (only for post owner)
export async function deletePost(id: string) {
  const { databaseUserId } = await requireCommunityActor()

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!post || post.userId !== databaseUserId) {
      throw new Error('Only the author can delete this post')
    }

    await prisma.post.delete({
      where: { id }
    })

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete post:', error)
    throw new Error('Failed to delete post')
  }
}

// Vote on a post
export async function votePost(postId: string, voteType: VoteType) {
  const { databaseUserId } = await requireCommunityActor()

  try {

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: databaseUserId
        }
      }
    })

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote if clicking the same type
        await prisma.vote.delete({
          where: {
            postId_userId: {
              postId,
              userId: databaseUserId
            }
          }
        })
      } else {
        // Update vote type if different
        await prisma.vote.update({
          where: {
            postId_userId: {
              postId,
              userId: databaseUserId
            }
          },
          data: { type: voteType }
        })
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          type: voteType,
          postId,
          userId: databaseUserId
        }
      })
    }

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to vote:', error)
    throw new Error('Failed to vote on post')
  }
}

// Get post by ID with votes and user information
export async function getPost(id: string) {
  try {
    let currentUserId: string | null = null
    try {
      const { databaseUserId } = await requireCommunityActor()
      currentUserId = databaseUserId
    } catch {
      currentUserId = null
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            id: true,
          }
        },
        votes: true,
      },
    })

    if (!post) throw new Error(POST_NOT_FOUND_SENTINEL)

    return {
      ...post,
      user: sanitizeCommunityUser(post.user),
      isAuthor: currentUserId ? (post.userId === currentUserId || process.env.NODE_ENV === 'development') : false
    }
  } catch (error) {
    if (error instanceof Error && error.message === POST_NOT_FOUND_SENTINEL) {
      throw error
    }
    console.error('Failed to fetch post:', error)
    throw new Error('Failed to fetch post')
  }
}

// Get comments for a post
export async function getComments(postId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Get only top-level comments
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    email: true,
                    id: true,
                  }
                },
                replies: {
                  include: {
                    user: {
                      select: {
                        email: true,
                        id: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments.map(sanitizeComment)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    throw new Error('Failed to fetch comments')
  }
}

// Helper function to send comment notification email
async function sendCommentNotificationEmail({
  recipientEmail,
  recipientName,
  postTitle,
  postId,
  commentAuthor,
  commentContent,
  commentDate,
  language
}: {
  recipientEmail: string
  recipientName: string
  postTitle: string
  postId: string
  commentAuthor: string
  commentContent: string
  commentDate: Date
  language: string
}) {
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/community/post/${postId}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`
  const dateLocale = language === 'fr' ? fr : enUS
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: 'Qunt Edge Community <community@eu.updates.qunt-edge.vercel.app>',
      to: recipientEmail,
      subject: language === 'fr' ? 'Nouveau commentaire sur votre publication' : 'New comment on your post',
      react: CommentNotificationEmail({
        postTitle,
        postUrl,
        commentAuthor: commentAuthor.split('@')[0],
        commentContent,
        commentDate: formatDistanceToNow(commentDate, { locale: dateLocale }),
        recipientName: recipientName.split('@')[0],
        unsubscribeUrl,
        language
      }),
      replyTo: 'hugo.demenez@qunt-edge.vercel.app'
    })
  } catch (error) {
    console.error('Failed to send comment notification email:', error)
  }
}

// Add a comment
export async function addComment(postId: string, content: string, parentId: string | null = null) {
  const { authUser, databaseUserId } = await requireCommunityActor()

  try {
    // Get the post and its author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            email: true,
            id: true,
            language: true
          }
        }
      }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: databaseUserId,
        parentId
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
          }
        }
      }
    }) as RawPrismaComment

    // Send email notification to post author if it's not their own comment
    if (post.user.id !== databaseUserId) {
      try {
        await sendCommentNotificationEmail({
          recipientEmail: post.user.email,
          recipientName: post.user.email,
          postTitle: post.title,
          postId: post.id,
          commentAuthor: authUser.email ?? 'Anonymous User',
          commentContent: content,
          commentDate: comment.createdAt,
          language: post.user.language ?? 'en'
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't throw the error to prevent comment creation from failing
      }
    }

    revalidatePath('/community')
    return {
      ...comment,
      user: sanitizeCommunityUser(comment.user),
      replies: [],
    }
  } catch (error) {
    console.error('Failed to add comment:', error)
    throw new Error('Failed to add comment')
  }
}

// Edit a comment
export async function editComment(commentId: string, content: string) {
  const { databaseUserId } = await requireCommunityActor()

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    })

    if (!comment || comment.userId !== databaseUserId) {
      throw new Error('Only the author can edit this comment')
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    })

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to edit comment:', error)
    throw new Error('Failed to edit comment')
  }
}

// Delete a comment
export async function deleteComment(commentId: string) {
  const { databaseUserId } = await requireCommunityActor()

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    })

    if (!comment || comment.userId !== databaseUserId) {
      throw new Error('Only the author can delete this comment')
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    throw new Error('Failed to delete comment')
  }
}

// Edit a post (only for post owner)
export async function editPost(id: string, content: string) {
  const { databaseUserId } = await requireCommunityActor()

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    // Allow editing in development or if user is the author
    if (process.env.NODE_ENV !== 'development' && post.userId !== databaseUserId) {
      throw new Error('Only the author can edit this post')
    }

    await prisma.post.update({
      where: { id },
      data: { content }
    })

    revalidatePath('/community')
    return { success: true }
  } catch (error) {
    console.error('Failed to edit post:', error)
    throw new Error('Failed to edit post')
  }
} 
