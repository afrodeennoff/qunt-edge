import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto"
import { prisma } from "@/lib/prisma"

function normalizeCode(code: string): string {
  return code.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
}

function hashCode(code: string): string {
  return createHash("sha256").update(normalizeCode(code)).digest("hex")
}

function generateReadableCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(8)
  const chars = Array.from(bytes).map((byte) => alphabet[byte % alphabet.length])
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`
}

export async function generateRecoveryCodes(userId: string, count = 8): Promise<string[]> {
  const rawCodes = Array.from({ length: count }, () => generateReadableCode())

  await prisma.$transaction(async (tx) => {
    await tx.recoveryCode.deleteMany({ where: { userId } })
    for (const code of rawCodes) {
      await tx.recoveryCode.create({
        data: {
          id: randomUUID(),
          userId,
          codeHash: hashCode(code),
        },
      })
    }
  })

  return rawCodes
}

export async function consumeRecoveryCode(userId: string, submittedCode: string): Promise<boolean> {
  const normalized = normalizeCode(submittedCode)
  const submittedHash = hashCode(normalized)
  const records = await prisma.recoveryCode.findMany({
    where: {
      userId,
      usedAt: null,
    },
    select: {
      id: true,
      codeHash: true,
    },
  })

  const match = records.find((record) => {
    try {
      return timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(submittedHash))
    } catch {
      return false
    }
  })
  if (!match) return false

  const updated = await prisma.recoveryCode.updateMany({
    where: {
      id: match.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  })
  return updated.count === 1
}

