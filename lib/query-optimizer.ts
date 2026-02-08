import { prisma } from './prisma'

export interface QueryMetrics {
  queryName: string
  executionTime: number
  recordCount: number
  timestamp: Date
}

const queryMetrics: QueryMetrics[] = []

export function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()
  
  return queryFn().then(result => {
    const executionTime = Date.now() - startTime
    
    queryMetrics.push({
      queryName,
      executionTime,
      recordCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date()
    })
    
    if (executionTime > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${executionTime}ms`)
    }
    
    return result
  })
}

export function getQueryMetrics(): QueryMetrics[] {
  return [...queryMetrics]
}

export function clearQueryMetrics(): void {
  queryMetrics.length = 0
}

export async function executeOptimizedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cacheKey?: string,
  cacheTtl?: number
): Promise<T> {
  if (cacheKey) {
    const cached = getCachedResult<T>(cacheKey)
    if (cached) {
      return cached
    }
  }
  
  const result = await measureQueryPerformance(queryName, queryFn)
  
  if (cacheKey && cacheTtl) {
    setCachedResult(cacheKey, result, cacheTtl)
  }
  
  return result
}

const queryCache = new Map<string, { data: any; expiresAt: number }>()

function getCachedResult<T>(key: string): T | null {
  const cached = queryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T
  }
  if (cached) {
    queryCache.delete(key)
  }
  return null
}

function setCachedResult<T>(key: string, data: T, ttlSeconds: number): void {
  queryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000
  })
}

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key)
    }
  }
}, 60000)
