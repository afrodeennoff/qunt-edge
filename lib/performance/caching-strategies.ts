export interface CacheStrategy {
  ttl: number;
  staleWhileRevalidate?: number;
  varyOn?: string[];
}

export const CacheStrategies = {
  STATIC: {
    ttl: 31536000,
    staleWhileRevalidate: 86400,
  },
  API_DATA: {
    ttl: 300,
    staleWhileRevalidate: 600,
  },
  USER_DATA: {
    ttl: 60,
    staleWhileRevalidate: 120,
  },
  REALTIME: {
    ttl: 10,
    staleWhileRevalidate: 30,
  },
} as const;

export class CacheManager {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private staleCache: Map<string, { data: any; expiresAt: number }> = new Map();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = CacheStrategies.API_DATA
  ): Promise<T> {
    const now = Date.now();

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    const stale = this.staleCache.get(key);
    if (stale && stale.expiresAt > now) {
      this.fetchAndUpdate(key, fetcher, strategy);
      return stale.data as T;
    }

    const data = await fetcher();
    this.set(key, data, strategy);
    return data;
  }

  private async fetchAndUpdate<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy
  ) {
    try {
      const data = await fetcher();
      this.set(key, data, strategy);
    } catch (error) {
      console.error(`Background fetch failed for ${key}:`, error);
    }
  }

  set<T>(key: string, data: T, strategy: CacheStrategy) {
    const now = Date.now();
    const ttl = strategy.ttl * 1000;
    const staleTtl = (strategy.ttl + (strategy.staleWhileRevalidate || 0)) * 1000;

    this.cache.set(key, {
      data,
      expiresAt: now + ttl,
    });

    this.staleCache.set(key, {
      data,
      expiresAt: now + staleTtl,
    });
  }

  invalidate(key: string) {
    this.cache.delete(key);
    this.staleCache.delete(key);
  }

  invalidatePattern(pattern: RegExp) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (pattern.test(key)) {
        this.invalidate(key);
      }
    });
  }

  clear() {
    this.cache.clear();
    this.staleCache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      staleSize: this.staleCache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheManager = new CacheManager();

export const createCacheKey = (
  prefix: string,
  params: Record<string, any>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
};

export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyPrefix: string;
    strategy?: CacheStrategy;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = options.keyGenerator
      ? options.keyGenerator(...args)
      : createCacheKey(options.keyPrefix, args as any);

    return cacheManager.get(
      key,
      () => fn(...args),
      options.strategy ?? CacheStrategies.API_DATA
    );
  };
};
