import { prisma } from '@/lib/prisma'

type UserIdRecord = { id: string }

export async function resolveDatabaseUserId(rawUserId: string): Promise<string> {
  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })
  if (byId?.id) return byId.id

  const byAuthId = await prisma.user.findUnique({
    where: { auth_user_id: rawUserId },
    select: { id: true },
  })
  if (byAuthId?.id) return byAuthId.id

  throw new Error('Unable to resolve database user')
}

export async function resolveDatabaseUserByEmail(email: string): Promise<UserIdRecord | null> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return null

  return prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })
}
