import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DependencyState = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

async function checkDatabase(): Promise<DependencyState> {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "database check failed",
    };
  }
}

function checkEnv(): DependencyState {
  const startedAt = Date.now();
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "DATABASE_URL",
  ];
  const missing = required.filter((name) => !process.env[name]);
  return {
    ok: missing.length === 0,
    latencyMs: Date.now() - startedAt,
    ...(missing.length > 0 ? { error: `Missing env vars: ${missing.join(", ")}` } : {}),
  };
}

export async function GET() {
  const requestId = crypto.randomUUID();
  const [database, env] = await Promise.all([checkDatabase(), Promise.resolve(checkEnv())]);
  const ready = database.ok && env.ok;

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      requestId,
      checks: { database, env },
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
