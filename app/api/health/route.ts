import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'


async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - start }
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'database check failed',
    }
  }
}

export async function GET() {
  const startedAt = Date.now()
  const requestId = crypto.randomUUID()
  const db = await checkDatabase()

  const healthy = db.ok
  const body = {
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    requestId,
    checks: {
      database: db,
    },
    uptimeSeconds: Math.floor(process.uptime()),
  }

  logger.info('[health] readiness check', {
    requestId,
    status: body.status,
    latencyMs: Date.now() - startedAt,
  })

  return NextResponse.json(body, { status: healthy ? 200 : 503 })
}
