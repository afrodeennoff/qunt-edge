import { Post, Vote } from '@/prisma/generated/prisma'

export type CommunityUser = {
  id: string
  displayName: string
}

export type ExtendedPost = Post & {
  user: CommunityUser
  votes: Vote[]
  _count: {
    comments: number
  }
  isAuthor: boolean
} 
