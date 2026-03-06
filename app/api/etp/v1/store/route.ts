import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySecureToken } from '@/lib/api-auth'
import { z } from 'zod'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { parseJson, parseQuery, toValidationErrorResponse } from '@/app/api/_utils/validate'

const MAX_ETP_BODY_BYTES = 2 * 1024 * 1024
const MAX_ETP_ORDERS = 2_000
const MAX_PAGINATION_LIMIT = 500
const etpWriteRateLimit = rateLimit({ limit: 30, window: 60_000, identifier: 'etp-store-write' })
const etpReadRateLimit = rateLimit({ limit: 120, window: 60_000, identifier: 'etp-store-read' })

type ETPOrderPayload = {
  AccountId: string
  OrderId: string
  OrderAction: string
  Quantity: number
  AverageFilledPrice: number
  IsOpeningOrder: boolean
  Time: string
  Instrument: {
    Symbol: string
    Type: string
  }
}

const etpOrderSchema = z.object({
  AccountId: z.string().min(1),
  OrderId: z.string().min(1),
  OrderAction: z.string().min(1),
  Quantity: z.number().finite(),
  AverageFilledPrice: z.number().finite(),
  IsOpeningOrder: z.boolean(),
  Time: z.string().min(1),
  Instrument: z.object({
    Symbol: z.string().min(1),
    Type: z.string().min(1),
  }),
})

const etpPostBodySchema = z.object({
  orders: z.array(etpOrderSchema).min(1).max(MAX_ETP_ORDERS),
})

const etpGetQuerySchema = z.object({
  accountId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGINATION_LIMIT).default(100),
  offset: z.coerce.number().int().min(0).max(50_000).default(0),
  from: z.string().optional(),
  to: z.string().optional(),
})

// Common authentication function to use across all methods
async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      authenticated: false, 
      error: {
        message: 'No valid authorization token found',
        status: 401
      }
    };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const user = await verifySecureToken(token, 'etp')
    
    if (!user) {
      return { 
        authenticated: false, 
        error: {
          message: 'No user found with the provided token',
          status: 401
        }
      };
    }
    
    return { authenticated: true, user };
  } catch {
    return {
      authenticated: false,
      error: {
        message: 'Database error during authentication',
        status: 500
      }
    };
  }
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limit = await etpWriteRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_ETP_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request payload is too large', requestId },
        { status: 413 }
      )
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    const { orders } = await parseJson(req, etpPostBodySchema)
    
    // Process and store each order
    const createdOrders = await Promise.all(
      orders.map(async (order) => {
        const orderTime = new Date(order.Time)
        if (Number.isNaN(orderTime.getTime())) {
          throw new Error(`Invalid order timestamp: ${order.Time}`)
        }

        return prisma.order.upsert({
          where: {
            userId_orderId: {
              userId: user.id,
              orderId: order.OrderId,
            },
          },
          update: {
            accountId: order.AccountId,
            orderId: order.OrderId,
            orderAction: order.OrderAction,
            quantity: order.Quantity,
            averageFilledPrice: order.AverageFilledPrice,
            isOpeningOrder: order.IsOpeningOrder,
            time: orderTime,
            symbol: order.Instrument.Symbol,
            instrumentType: order.Instrument.Type
          },
          create: {
            accountId: order.AccountId,
            orderId: order.OrderId,
            orderAction: order.OrderAction,
            quantity: order.Quantity,
            averageFilledPrice: order.AverageFilledPrice,
            isOpeningOrder: order.IsOpeningOrder,
            time: orderTime,
            symbol: order.Instrument.Symbol,
            instrumentType: order.Instrument.Type,
            userId: user.id
          }
        });
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `${createdOrders.length} orders stored successfully` 
    }, { status: 200 });
    
  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    return NextResponse.json({ 
      error: 'Failed to store orders',
      requestId,
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await etpReadRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    
    const { accountId, limit, offset, from: fromDate, to: toDate } = parseQuery(
      req.nextUrl.searchParams,
      etpGetQuerySchema
    )
    
    // Build the query
    const query: Parameters<typeof prisma.order.findMany>[0] = {
      where: {
        userId: user.id
      },
      orderBy: {
        time: 'desc' as const
      },
      take: limit,
      skip: offset
    };

    // `where` is optional in Prisma args types; keep a stable reference for type safety.
    const where = (query.where ??= { userId: user.id });
    
    // Add filters if provided
    if (accountId) {
      where.accountId = accountId;
    }
    
    if (fromDate || toDate) {
      where.time = {};
      
      if (fromDate) {
        where.time.gte = new Date(fromDate);
      }
      
      if (toDate) {
        where.time.lte = new Date(toDate);
      }
    }
    
    // Get orders
    const orders = await prisma.order.findMany(query);
    
    // Get total count for pagination
    const totalCount = await prisma.order.count({
      where
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        orders,
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
    return NextResponse.json({ 
      error: 'Failed to retrieve orders',
      requestId,
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = crypto.randomUUID()
  try {
    const limitResult = await etpWriteRateLimit(req)
    if (!limitResult.success) {
      return createRateLimitResponse({
        limit: limitResult.limit,
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    
    // Delete all orders for this user
    const result = await prisma.order.deleteMany({
      where: {
        userId: user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `${result.count} orders deleted successfully`
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to delete orders',
      requestId,
    }, { status: 500 });
  }
} 
