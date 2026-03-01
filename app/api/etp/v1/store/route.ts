import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySecureToken } from '@/lib/api-auth'

const MAX_ETP_BODY_BYTES = 2 * 1024 * 1024
const MAX_ETP_ORDERS = 2_000
const MAX_PAGINATION_LIMIT = 500

function jsonError(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json(
    { error: message, code, requestId },
    { status }
  )
}

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

function normalizePositiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

function validateOrderPayload(order: unknown): order is ETPOrderPayload {
  if (!order || typeof order !== 'object') return false
  const candidate = order as Partial<ETPOrderPayload>
  return Boolean(
    typeof candidate.AccountId === 'string' &&
    typeof candidate.OrderId === 'string' &&
    typeof candidate.OrderAction === 'string' &&
    typeof candidate.Quantity === 'number' &&
    Number.isFinite(candidate.Quantity) &&
    typeof candidate.AverageFilledPrice === 'number' &&
    Number.isFinite(candidate.AverageFilledPrice) &&
    typeof candidate.IsOpeningOrder === 'boolean' &&
    typeof candidate.Time === 'string' &&
    candidate.Instrument &&
    typeof candidate.Instrument.Symbol === 'string' &&
    typeof candidate.Instrument.Type === 'string'
  )
}

function sanitizeOrders(orders: unknown[]): ETPOrderPayload[] {
  return orders.filter(validateOrderPayload)
}

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
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID()
  try {
    const contentType = req.headers.get("content-type")?.toLowerCase() ?? ""
    if (!contentType.startsWith("application/json")) {
      return jsonError(415, "UNSUPPORTED_CONTENT_TYPE", "Unsupported content type", requestId)
    }

    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_ETP_BODY_BYTES) {
      return jsonError(413, "PAYLOAD_TOO_LARGE", "Request payload is too large", requestId)
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return jsonError(auth.error?.status || 401, "UNAUTHORIZED", "Unauthorized", requestId)
    }
    
    const user = auth.user!;
    
    // Parse the request body
    const body = await req.json();
    const orders = Array.isArray(body?.orders) ? body.orders : null

    if (!orders || orders.length === 0) {
      return jsonError(400, "BAD_REQUEST", "Invalid orders data", requestId)
    }

    if (orders.length > MAX_ETP_ORDERS) {
      return jsonError(413, "PAYLOAD_TOO_LARGE", `Too many orders. Maximum is ${MAX_ETP_ORDERS}.`, requestId)
    }

    const sanitizedOrders = sanitizeOrders(orders)
    if (sanitizedOrders.length !== orders.length) {
      return jsonError(400, "BAD_REQUEST", "Invalid order payload format", requestId)
    }
    
    // Process and store each order
    const createdOrders = await Promise.all(
      sanitizedOrders.map(async (order) => {
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
    return jsonError(500, "INTERNAL_ERROR", "Failed to store orders", requestId)
  }
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID()
  try {
    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return jsonError(auth.error?.status || 401, "UNAUTHORIZED", "Unauthorized", requestId)
    }
    
    const user = auth.user!;
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const limit = normalizePositiveInt(searchParams.get('limit'), 100, MAX_PAGINATION_LIMIT);
    const offset = normalizePositiveInt(searchParams.get('offset'), 0, 50_000);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
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
    return jsonError(500, "INTERNAL_ERROR", "Failed to retrieve orders", requestId)
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID()
  try {
    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return jsonError(auth.error?.status || 401, "UNAUTHORIZED", "Unauthorized", requestId)
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
    return jsonError(500, "INTERNAL_ERROR", "Failed to delete orders", requestId)
  }
} 
