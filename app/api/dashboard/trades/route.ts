import { NextRequest, NextResponse } from 'next/server'
import { getTradesAction } from '@/server/database'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'


const MAX_PAGE_SIZE = 200

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? '1')
    const pageSizeRaw = Number(searchParams.get('pageSize') ?? '50')
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), MAX_PAGE_SIZE)

    if (!Number.isFinite(page) || page < 1) {
      return apiError('BAD_REQUEST', 'Invalid page parameter', 400)
    }

    const result = await getTradesAction(null, page, pageSize)
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      'Failed to fetch trades',
      500,
      error instanceof Error ? error.message : undefined,
    )
  }
}
