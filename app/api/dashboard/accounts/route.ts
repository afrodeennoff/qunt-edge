import { NextResponse } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { getAccountsAction } from '@/server/accounts'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'


export const dynamic = 'force-dynamic'

function serializeWithDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) {
        return nested.toString()
      }
      return nested
    }),
  ) as T
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, {
        "Cache-Control": "no-store, max-age=0",
      })
    }

    const accounts = await getAccountsAction()
    return NextResponse.json(serializeWithDecimals(accounts), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch accounts',
      500,
      error instanceof Error ? error.message : undefined,
      {
        "Cache-Control": "no-store, max-age=0",
      },
    )
  }
}
