import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger, withLogContext } from '@/lib/logger'

const DB_LATENCY_ALERT_MS = Number.parseInt(process.env.DB_LATENCY_ALERT_MS || "250", 10)


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
  const requestId = crypto.randomUUID()
  return withLogContext(
    {
      requestId,
      correlationId: requestId,
      route: "/api/health",
      method: "GET",
    },
    async () => {
      const startedAt = Date.now()
      const db = await checkDatabase()
      const alerts: string[] = []

      if (!db.ok) {
        alerts.push("database-unhealthy")
      }
      if (db.latencyMs > DB_LATENCY_ALERT_MS) {
        alerts.push(`database-latency-above-threshold:${db.latencyMs}ms`)
      }

      const status = !db.ok ? "down" : alerts.length > 0 ? "degraded" : "ok"
      const memory = process.memoryUsage()

      const body = {
        status,
        timestamp: new Date().toISOString(),
        requestId,
        checks: {
          database: db,
        },
        alerts,
        uptimeSeconds: Math.floor(process.uptime()),
        memory: {
          rssMb: Number((memory.rss / 1024 / 1024).toFixed(2)),
          heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
          heapTotalMb: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
        },
      }

      if (alerts.length > 0) {
        logger.warn('[health] threshold warning', {
          status,
          alerts,
          latencyMs: Date.now() - startedAt,
        })
      } else {
        logger.info('[health] readiness check', {
          status,
          latencyMs: Date.now() - startedAt,
        })
      }

      return NextResponse.json(body, { status: db.ok ? 200 : 503 })
    }
  )
}
