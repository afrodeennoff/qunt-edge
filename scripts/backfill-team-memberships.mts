import { prisma } from "../lib/prisma"
import { MemberRole } from "../prisma/generated/prisma"

async function run() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      userId: true,
      traderIds: true,
    },
  })

  let created = 0

  for (const team of teams) {
    const userIds = Array.from(new Set([...team.traderIds, team.userId].filter(Boolean)))

    if (userIds.length === 0) continue

    await prisma.$transaction(async (tx) => {
      for (const userId of userIds) {
        const existing = await tx.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId: team.id,
              userId,
            },
          },
          select: { id: true },
        })

        if (existing) continue

        await tx.teamMember.create({
          data: {
            teamId: team.id,
            userId,
            role: userId === team.userId ? MemberRole.ADMIN : MemberRole.TRADER,
            isActive: true,
          },
        })
        created++
      }
    })
  }

  console.log(`[backfill-team-memberships] processed ${teams.length} teams, created ${created} memberships`)
}

run()
  .catch((error) => {
    console.error("[backfill-team-memberships] failed", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
