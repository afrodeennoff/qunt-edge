import { NextResponse } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { getAccountsAction } from '@/server/accounts'
import { apiError } from '@/lib/api-response'


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

export async function GET() {
  try {
    const accounts = await getAccountsAction()
    return NextResponse.json(serializeWithDecimals(accounts))
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch accounts',
      500,
      error instanceof Error ? error.message : undefined,
    )
  }
}
