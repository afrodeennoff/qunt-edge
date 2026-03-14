import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveTradesForUserAction } from '@/server/database';
import type { ImportTradeDraft } from '@/lib/trade-types';
import { verifySecureToken } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { parseJson, parseQuery, toValidationErrorResponse } from '@/app/api/_utils/validate'

const MAX_THOR_BODY_BYTES = 3 * 1024 * 1024
const MAX_THOR_TRADES = 5_000
const MAX_PAGINATION_LIMIT = 500
const thorWriteRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'thor-store-write' })
const thorReadRateLimit = rateLimit({ limit: 120, window: 60_000, identifier: 'thor-store-read' })

const thorTradeSchema = z.object({
  symbol: z.string().min(1),
  pnl: z.number().finite(),
  pnltick: z.number().finite(),
  entry_time: z.string().min(1),
  exit_time: z.string().min(1),
  entry_price: z.number().finite(),
  exit_price: z.number().finite(),
  quantity: z.number().finite(),
  side: z.enum(['Buy', 'Sell']),
  is_shared: z.boolean(),
})

const thorDateSchema = z.object({
  date: z.string().min(1),
  trades: z.array(thorTradeSchema),
})

const thorPostBodySchema = z.object({
  account_id: z.string().min(1),
  dates: z.array(thorDateSchema).min(1),
})

const thorGetQuerySchema = z.object({
  accountNumber: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGINATION_LIMIT).default(100),
  offset: z.coerce.number().int().min(0).max(50_000).default(0),
  from: z.string().optional(),
  to: z.string().optional(),
})

const thorDeleteQuerySchema = z.object({
  accountNumber: z.string().min(1),
})

// Common authentication function to use across all methods
async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: {
        status: 401
      }
    };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const user = await verifySecureToken(token, 'thor')
    
    if (!user) {
      return {
        authenticated: false,
        error: {
          status: 401
        }
      };
    }
    
    return { authenticated: true, user };
  } catch {
    return {
      authenticated: false,
      error: {
        status: 401
      }
    };
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limit = await thorWriteRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_THOR_BODY_BYTES) {
      return apiError('PAYLOAD_TOO_LARGE', 'Request payload is too large', 413, { requestId })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return apiError('UNAUTHORIZED', 'Unauthorized', auth.error?.status || 401)
    }
    
    const user = auth.user!;
    const data = await parseJson(req, thorPostBodySchema);

    const totalTrades = Array.isArray(data?.dates)
      ? data.dates.reduce((sum, dateData) => sum + (Array.isArray(dateData?.trades) ? dateData.trades.length : 0), 0)
      : 0
    if (totalTrades === 0) {
      return apiError('VALIDATION_FAILED', 'Invalid payload: no trades provided', 400)
    }
    if (totalTrades > MAX_THOR_TRADES) {
      return apiError('PAYLOAD_TOO_LARGE', `Too many trades. Maximum is ${MAX_THOR_TRADES}.`, 413)
    }
    
    // Transform the data to match the Trade schema
    const trades: ImportTradeDraft[] = data.dates.flatMap(dateData => 
      dateData.trades.map(trade => {
        const entryTime = new Date(trade.entry_time)
        const exitTime = new Date(trade.exit_time)
        const timeInPosition = Math.round((exitTime.getTime() - entryTime.getTime()) / 1000) // in seconds

        return {
          id: `${dateData.date}-${trade.symbol}-${trade.entry_time}-${trade.quantity}`,
          userId: user.id,
          accountNumber: data.account_id,
          instrument: trade.symbol.slice(0, -2),
          entryDate: entryTime.toISOString(),
          closeDate: exitTime.toISOString(),
          entryPrice: trade.entry_price,
          closePrice: trade.exit_price,
          quantity: Math.abs(trade.quantity),
          side: trade.side === 'Buy' ? 'Long' : 'Short',
          pnl: trade.pnl,
          timeInPosition,
          commission: 0,
          tags: [],
          comment: null,
          videoUrl: null,
          entryId: null,
          closeId: null,
          imageBase64: null,
          imageBase64Second: null,
          createdAt: new Date(),
        }
      })
    )

    const result = await saveTradesForUserAction(trades, user.id)

    // Handle duplicate trades as success, but return errors for other cases
    if (result.error && result.error !== 'DUPLICATE_TRADES') {
      return apiError('BAD_REQUEST', result.error, 400, result.details)
    }

    return NextResponse.json({
      success: true,
      tradesAdded: result.numberOfTradesAdded,
    })

  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('[thor/store] Error processing request:', error)
    return apiError('INTERNAL_ERROR', 'Internal server error', 500, { requestId })
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await thorReadRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return apiError('UNAUTHORIZED', 'Unauthorized', auth.error?.status || 401)
    }
    
    const user = auth.user!;
    const {
      accountNumber,
      limit,
      offset,
      from: fromDate,
      to: toDate,
    } = parseQuery(req.nextUrl.searchParams, thorGetQuerySchema)
    
    // Build the query
    const query: Parameters<typeof prisma.trade.findMany>[0] = {
      where: {
        userId: user.id,
        accountNumber: accountNumber
      },
      orderBy: {
        entryDate: 'desc' as const
      },
      take: limit,
      skip: offset
    };

    // `where` is optional in Prisma args types; keep a stable reference for type safety.
    const where = (query.where ??= { userId: user.id, accountNumber });
    
    if (fromDate || toDate) {
      where.entryDate = {};
      
      if (fromDate) {
        where.entryDate.gte = new Date(fromDate);
      }
      
      if (toDate) {
        where.entryDate.lte = new Date(toDate);
      }
    }
    
    // Get trades
    const trades = await prisma.trade.findMany(query);
    
    // Get total count for pagination
    const totalCount = await prisma.trade.count({
      where
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        trades,
        pagination: {
          total: totalCount,
          limit,
          offset
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('[thor/store] Error retrieving trades:', error);
    return apiError('INTERNAL_ERROR', 'Failed to retrieve trades', 500, { requestId })
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await thorWriteRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return apiError('UNAUTHORIZED', 'Unauthorized', auth.error?.status || 401)
    }
    
    const user = auth.user!;
    const { accountNumber } = parseQuery(req.nextUrl.searchParams, thorDeleteQuerySchema)
    
    // Delete trades for this user and specific account
    const result = await prisma.trade.deleteMany({
      where: {
        userId: user.id,
        accountNumber: accountNumber
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `${result.count} trades deleted successfully for account ${accountNumber}`
    }, { status: 200 });
    
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    console.error('[thor/store] Error deleting trades:', error);
    return apiError('INTERNAL_ERROR', 'Failed to delete trades', 500, { requestId })
  }
}
