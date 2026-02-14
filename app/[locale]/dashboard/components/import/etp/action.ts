'use server'

import { createClient } from '@/server/auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { generateSecureToken } from '@/lib/api-auth'

export async function generateEtpToken() {
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
    const token = await generateSecureToken(dbUser.id, 'etp')

    revalidatePath('/dashboard')
    return { token }
  } catch (error) {
    console.error('Failed to generate ETP token:', error)
    return { error: 'Failed to generate token' }
  }
}

export async function getEtpToken() {
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
        etpTokenHash: true,
        etpTokenExpiresAt: true,
      }
    })

    const hasToken = Boolean(
      userData?.etpTokenHash &&
      userData.etpTokenExpiresAt &&
      userData.etpTokenExpiresAt > new Date()
    )
    return { token: null, hasToken }
  } catch (error) {
    console.error('Failed to get ETP token:', error)
    return { error: 'Failed to get token' }
  }
} 
