'use server'

import { createClient } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { generateSecureToken } from '@/lib/api-auth'

export async function generateThorToken() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true },
    })
    if (!dbUser?.id) {
      return { error: 'Failed to generate token' }
    }
    const token = await generateSecureToken(dbUser.id, 'thor')

    return { token }
  } catch (error) {
    console.error('Failed to generate Thor token:', error)
    return { error: 'Failed to generate token' }
  }
}

export async function getThorToken() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  try {
    const userData = await prisma.user.findUnique({
      where: {
        auth_user_id: user.id
      },
      select: {
        thorTokenHash: true,
        thorTokenExpiresAt: true,
      }
    })

    const hasToken = Boolean(
      userData?.thorTokenHash &&
      userData.thorTokenExpiresAt &&
      userData.thorTokenExpiresAt > new Date()
    )
    return { token: null, hasToken }
  } catch (error) {
    console.error('Failed to get Thor token:', error)
    return { error: 'Failed to get token' }
  }
} 
