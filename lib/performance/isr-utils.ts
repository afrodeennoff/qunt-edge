import { revalidatePath, revalidateTag } from 'next/cache';

export interface ISROptions {
  revalidate?: number | false;
  tags?: string[];
}

export const ISR_DEFAULTS = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAILY: 86400,
  WEEKLY: 604800,
} as const;

export class ISRManager {
  private static instance: ISRManager;
  private revalidationQueue: Map<string, ReturnType<typeof setTimeout>> = new Map();

  static getInstance(): ISRManager {
    if (!ISRManager.instance) {
      ISRManager.instance = new ISRManager();
    }
    return ISRManager.instance;
  }

  getRevalidationTime(type: keyof typeof ISR_DEFAULTS): number {
    return ISR_DEFAULTS[type];
  }

  scheduleRevalidation(path: string, delay: number = 5000): boolean {
    const existing = this.revalidationQueue.get(path);
    if (existing) {
      clearTimeout(existing);
    }

    const timeoutId = setTimeout(() => {
      this.revalidatePath(path);
      this.revalidationQueue.delete(path);
    }, delay);

    this.revalidationQueue.set(path, timeoutId);
    return true;
  }

  revalidatePath(path: string): boolean {
    try {
      revalidatePath(path);
      return true;
    } catch (error) {
      console.error(`Revalidation failed for ${path}:`, error);
      return false;
    }
  }

  revalidateByTag(tag: string): boolean {
    try {
      revalidateTag(tag);
      return true;
    } catch (error) {
      console.error(`Tag revalidation failed for ${tag}:`, error);
      return false;
    }
  }

  createISROptions(options: ISROptions = {}): ISROptions {
    return {
      revalidate: options.revalidate ?? ISR_DEFAULTS.MEDIUM,
      tags: options.tags ?? [],
    };
  }

  generateCacheKey(path: string, params?: Record<string, string>): string {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return `${path}${queryString}`;
  }

  getCacheTags(...tags: string[]): string[] {
    return tags;
  }
}

export const isrManager = ISRManager.getInstance();

export const withISR = <T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options: ISROptions = {}
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      console.error('ISR Handler Error:', error);

      if (options.tags) {
        options.tags.forEach(tag => {
          isrManager.revalidateByTag(tag);
        });
      }

      throw error;
    }
  };
};

export const configureCacheHeaders = (
  age: number = ISR_DEFAULTS.MEDIUM
) => ({
  'Cache-Control': `public, s-maxage=${age}, stale-while-revalidate=${age * 2}`,
});

export const configureStaticGeneration = (
  revalidate: number = ISR_DEFAULTS.MEDIUM
) => ({
  revalidate,
  dynamic: 'force-static' as const,
});
