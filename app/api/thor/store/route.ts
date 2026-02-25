import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveTradesAction } from '@/server/database';
import type { ImportTradeDraft } from '@/lib/trade-types';
import { verifySecureToken } from '@/lib/api-auth';

const MAX_THOR_BODY_BYTES = 3 * 1024 * 1024
const MAX_THOR_TRADES = 5_000
const MAX_PAGINATION_LIMIT = 500

function normalizePositiveInt(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
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
    const user = await verifySecureToken(token, 'thor')
    
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

interface ThorTrade {
  symbol: string
  pnl: number
  pnltick: number
  entry_time: string
  exit_time: string
  entry_price: number
  exit_price: number
  quantity: number
  side: 'Buy' | 'Sell'
  is_shared: boolean
}

interface ThorDate {
  date: string
  trades: ThorTrade[]
}

interface ThorRequest {
  account_id: string
  dates: ThorDate[]
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_THOR_BODY_BYTES) {
      return NextResponse.json({ error: 'Request payload is too large' }, { status: 413 })
    }

    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    const data: ThorRequest = await req.json();

    const totalTrades = Array.isArray(data?.dates)
      ? data.dates.reduce((sum, dateData) => sum + (Array.isArray(dateData?.trades) ? dateData.trades.length : 0), 0)
      : 0
    if (totalTrades === 0) {
      return NextResponse.json({ error: 'Invalid payload: no trades provided' }, { status: 400 })
    }
    if (totalTrades > MAX_THOR_TRADES) {
      return NextResponse.json(
        { error: `Too many trades. Maximum is ${MAX_THOR_TRADES}.` },
        { status: 413 }
      )
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
          side: trade.quantity > 0 ? 'Long' : 'Short',
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

    const result = await saveTradesAction(trades, { userId: user.id })

    // Handle duplicate trades as success, but return errors for other cases
    if (result.error && result.error !== 'DUPLICATE_TRADES') {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tradesAdded: result.numberOfTradesAdded,
    })

  } catch (error) {
    console.error('[thor/store] Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const accountNumber = searchParams.get('accountNumber');
    
    if (!accountNumber) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'accountNumber parameter is required' 
      }, { status: 400 });
    }
    
    const limit = normalizePositiveInt(searchParams.get('limit'), 100, MAX_PAGINATION_LIMIT);
    const offset = normalizePositiveInt(searchParams.get('offset'), 0, 50_000);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
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
    console.error('[thor/store] Error retrieving trades:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve trades', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    
    if (!auth.authenticated) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: auth.error?.message 
      }, { status: auth.error?.status || 401 });
    }
    
    const user = auth.user!;
    
    // Get accountNumber from query parameters
    const searchParams = req.nextUrl.searchParams;
    const accountNumber = searchParams.get('accountNumber');
    
    if (!accountNumber) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        message: 'accountNumber parameter is required' 
      }, { status: 400 });
    }
    
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
    console.error('[thor/store] Error deleting trades:', error);
    return NextResponse.json({ 
      error: 'Failed to delete trades', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
