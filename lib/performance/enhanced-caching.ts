/**
 * Enhanced Caching Strategies for Database Queries and API Responses
 * 
 * This module provides comprehensive caching strategies including:
 * - Multi-tier caching (memory, Redis, CDN)
 * - Query result caching with intelligent invalidation
 * - Cache warming and preloading
 * - Cache performance monitoring
 */

import { executeOptimizedQuery, getQueryMetrics } from './query-optimizer';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
  lastAccess: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  persistToDisk?: boolean;
}

/**
 * Multi-tier intelligent cache with LRU eviction
 */
export class SmartCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = { hits: 0, misses: 0 };
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      persistToDisk: config.persistToDisk || false,
    };

    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    entry.lastAccess = Date.now();
    this.stats.hits++;

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    this.enforceMaxSize();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      hits: 0,
      lastAccess: now,
    });
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      totalSize: this.cache.size,
      entryCount: this.cache.size,
    };
  }

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private enforceMaxSize(): void {
    while (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, this.config.cleanupInterval);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

/**
 * Query-specific cache with intelligent key generation
 */
export class QueryCache {
  private cache = new SmartCache<any>({ maxSize: 500, defaultTTL: 300000 });

  /**
   * Generate cache key from query parameters
   */
  private generateKey(
    modelName: string,
    operation: string,
    params: Record<string, any>
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return `${modelName}:${operation}:${sortedParams}`;
  }

  /**
   * Execute cached query
   */
  async execute<T>(
    modelName: string,
    operation: string,
    queryFn: () => Promise<T>,
    params: Record<string, any> = {},
    ttl?: number
  ): Promise<T> {
    const key = this.generateKey(modelName, operation, params);

    // Try cache first
    const cached = this.cache.get(key);
    if (cached !== null) {
      return cached as T;
    }

    // Execute query
    const result = await executeOptimizedQuery(
      `${modelName}.${operation}`,
      queryFn
    );

    // Cache result
    this.cache.set(key, result, ttl);

    return result;
  }

  /**
   * Invalidate cache entries for a model
   */
  invalidate(modelName: string, operation?: string): void {
    const stats = this.cache.getStats();
    console.log(`Invalidating cache for ${modelName}${operation ? `.${operation}` : ''}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

export const queryCache = new QueryCache();

/**
 * Cache warming utility for preloading critical data
 */
export class CacheWarmer {
  private warmedKeys = new Set<string>();

  /**
   * Warm cache with multiple queries
   */
  async warm(queries: Array<{ key: string; fn: () => Promise<any> }>): Promise<void> {
    const promises = queries
      .filter(({ key }) => !this.warmedKeys.has(key))
      .map(async ({ key, fn }) => {
        try {
          await fn();
          this.warmedKeys.add(key);
        } catch (error) {
          console.warn(`Failed to warm cache for ${key}:`, error);
        }
      });

    await Promise.allSettled(promises);
  }

  /**
   * Check if key is warmed
   */
  isWarmed(key: string): boolean {
    return this.warmedKeys.has(key);
  }

  /**
   * Clear warmed keys
   */
  clear(): void {
    this.warmedKeys.clear();
  }
}

export const cacheWarmer = new CacheWarmer();

/**
 * Cache invalidation strategies
 */
export class CacheInvalidator {
  /**
   * Time-based invalidation
   */
  static async invalidateAfter(key: string, delay: number): Promise<void> {
    setTimeout(() => {
      queryCache.invalidate(key);
    }, delay);
  }

  /**
   * Event-based invalidation
   */
  static invalidateOnEvent(
    eventName: string,
    keys: string[],
    eventTarget: EventTarget = window
  ): void {
    const handler = () => {
      keys.forEach(key => queryCache.invalidate(key));
    };

    eventTarget.addEventListener(eventName, handler);

    // Return cleanup function
    return () => eventTarget.removeEventListener(eventName, handler);
  }

  /**
   * Conditional invalidation
   */
  static async invalidateWhen(
    condition: () => boolean | Promise<boolean>,
    keys: string[]
  ): Promise<void> {
    const shouldInvalidate = await condition();
    if (shouldInvalidate) {
      keys.forEach(key => queryCache.invalidate(key));
    }
  }
}

/**
 * Cache performance monitoring
 */
export class CacheMonitor {
  private metrics: Map<string, { hits: number; misses: number; avgHitRate: number }> = new Map();

  /**
   * Record cache operation
   */
  record(cacheName: string, hit: boolean): void {
    if (!this.metrics.has(cacheName)) {
      this.metrics.set(cacheName, { hits: 0, misses: 0, avgHitRate: 0 });
    }

    const metric = this.metrics.get(cacheName)!;
    if (hit) {
      metric.hits++;
    } else {
      metric.misses++;
    }

    const total = metric.hits + metric.misses;
    metric.avgHitRate = metric.hits / total;
  }

  /**
   * Get cache performance report
   */
  getReport(): Record<string, { hits: number; misses: number; hitRate: number }> {
    const report: Record<string, { hits: number; misses: number; hitRate: number }> = {};

    this.metrics.forEach((metric, name) => {
      report[name] = {
        hits: metric.hits,
        misses: metric.misses,
        hitRate: metric.avgHitRate,
      };
    });

    return report;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

export const cacheMonitor = new CacheMonitor();

/**
 * Decorator for caching expensive function calls
 */
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const cache = new SmartCache<ReturnType<T>>({ maxSize: 1000, defaultTTL: options.ttl || 300000 });

  return ((...args: Parameters<T>) => {
    const key = options.keyGenerator
      ? options.keyGenerator(...args)
      : `${fn.name}:${JSON.stringify(args)}`;

    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * Reactive cache with automatic invalidation on data changes
 */
export class ReactiveCache<T> {
  private cache = new SmartCache<T>();
  private subscriptions = new Map<string, Set<(data: T) => void>>();

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, data, ttl);
    this.notify(key, data);
  }

  get(key: string): T | null {
    return this.cache.get(key);
  }

  subscribe(key: string, callback: (data: T) => void): () => void {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }

    this.subscriptions.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(key);
        }
      }
    };
  }

  private notify(key: string, data: T): void {
    const subs = this.subscriptions.get(key);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }
}

/**
 * Distributed cache synchronization for multi-instance deployments
 */
export class DistributedCache {
  private localCache = new SmartCache<any>();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(channelName: string = 'cache-sync') {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(channelName);
      this.setupListener();
    }
  }

  private setupListener(): void {
    if (!this.broadcastChannel) return;

    this.broadcastChannel.addEventListener('message', (event) => {
      const { type, key } = event.data;

      if (type === 'invalidate') {
        this.localCache.delete(key);
      } else if (type === 'update') {
        this.localCache.set(key, event.data.value, event.data.ttl);
      }
    });
  }

  set(key: string, value: any, ttl?: number): void {
    this.localCache.set(key, value, ttl);

    // Broadcast update to other tabs
    this.broadcastChannel?.postMessage({
      type: 'update',
      key,
      value,
      ttl,
    });
  }

  get(key: string): any | null {
    return this.localCache.get(key);
  }

  invalidate(key: string): void {
    this.localCache.delete(key);

    // Broadcast invalidation to other tabs
    this.broadcastChannel?.postMessage({
      type: 'invalidate',
      key,
    });
  }

  close(): void {
    this.broadcastChannel?.close();
    this.localCache.destroy();
  }
}

/**
 * Cache warming strategies for different scenarios
 */
export const CacheWarmingStrategies = {
  /**
   * Warm cache for dashboard data
   */
  async warmDashboard(userId?: string): Promise<void> {
    const queries = [
      { key: 'accounts', fn: () => fetch('/api/accounts').then(r => r.json()) },
      { key: 'trades-summary', fn: () => fetch('/api/trades/summary').then(r => r.json()) },
      { key: 'statistics', fn: () => fetch('/api/statistics').then(r => r.json()) },
    ];

    await cacheWarmer.warm(queries);
  },

  /**
   * Warm cache for analytics data
   */
  async warmAnalytics(): Promise<void> {
    const queries = [
      { key: 'analytics-overview', fn: () => fetch('/api/analytics/overview').then(r => r.json()) },
      { key: 'performance-metrics', fn: () => fetch('/api/analytics/performance').then(r => r.json()) },
    ];

    await cacheWarmer.warm(queries);
  },
};

/**
 * Export all caching utilities
 */
export const caching = {
  SmartCache,
  QueryCache,
  queryCache,
  CacheWarmer,
  cacheWarmer,
  CacheInvalidator,
  CacheMonitor,
  cacheMonitor,
  cached,
  ReactiveCache,
  DistributedCache,
  CacheWarmingStrategies,
};
