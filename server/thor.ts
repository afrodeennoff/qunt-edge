'use server'

import { createClient } from './auth'
import { updateTag } from 'next/cache'
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

    updateTag(`user-data-${dbUser.id}`)
    return { token }
  } catch (error) {
    // Security: Log only error type and message, not full error object
    console.error('Failed to generate Thor token:', error instanceof Error ? error.message : 'Unknown error')
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
    // Security: Log only error type and message, not full error object
    console.error('Failed to get Thor token:', error instanceof Error ? error.message : 'Unknown error')
    return { error: 'Failed to get token' }
  }
} 
