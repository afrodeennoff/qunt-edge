import { MemberRole, Prisma } from "@/prisma/generated/prisma"
import { resolveDatabaseUserId } from "@/lib/identity-resolver"

type TeamTx = Prisma.TransactionClient

export async function resolveTeamUserId(rawUserId: string): Promise<string> {
  return resolveDatabaseUserId(rawUserId)
}

export function withUniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)))
}

export async function ensureTeamMembership(
  tx: TeamTx,
  params: {
    teamId: string
    userId: string
    role: MemberRole
  }
) {
  const { teamId, userId, role } = params

  const team = await tx.team.findUnique({
    where: { id: teamId },
    select: { traderIds: true },
  })

  if (!team) {
    throw new Error("Team not found")
  }

  const traderIds = withUniqueIds([...team.traderIds, userId])

  await tx.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    update: {
      role,
      isActive: true,
    },
    create: {
      teamId,
      userId,
      role,
      isActive: true,
    },
  })

  if (traderIds.length !== team.traderIds.length) {
    await tx.team.update({
      where: { id: teamId },
      data: { traderIds },
    })
  }
}
