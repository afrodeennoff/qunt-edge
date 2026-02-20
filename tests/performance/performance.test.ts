import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMonitor } from '@/lib/performance/performance-monitor';
import { CacheManager, CacheStrategies } from '@/lib/performance/caching-strategies';
import { ISRManager, ISR_DEFAULTS } from '@/lib/performance/isr-utils';

describe('Performance Optimizations', () => {
  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should record and retrieve metrics', () => {
      monitor.recordMetric('LCP', 2500);
      const metrics = monitor.getMetrics('LCP');
      
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(2500);
      expect(metrics[0].rating).toBe('good');
    });

    it('should calculate average metrics correctly', () => {
      monitor.recordMetric('LCP', 2000);
      monitor.recordMetric('LCP', 3000);
      monitor.recordMetric('LCP', 4000);
      
      const avg = monitor.getAverageMetric('LCP');
      expect(avg).toBe(3000);
    });

    it('should rate metrics correctly', () => {
      const good = monitor.recordMetric('FCP', 1500);
      const needsImprovement = monitor.recordMetric('FCP', 2500);
      const poor = monitor.recordMetric('FCP', 3500);
      
      expect(good.rating).toBe('good');
      expect(needsImprovement.rating).toBe('needs-improvement');
      expect(poor.rating).toBe('poor');
    });

    it('should calculate performance score', () => {
      monitor.recordMetric('FCP', 1500);
      monitor.recordMetric('LCP', 2000);
      monitor.recordMetric('CLS', 0.05);
      
      const score = monitor.getPerformanceScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should export metrics as JSON', () => {
      monitor.recordMetric('LCP', 2500);
      const exported = monitor.exportMetrics();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('metrics');
      expect(parsed).toHaveProperty('score');
    });
  });

  describe('CacheManager', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should cache and retrieve data', async () => {
      const fetcher = async () => ({ data: 'test' });
      const result = await cache.get('test-key', fetcher, CacheStrategies.API_DATA);
      
      expect(result).toEqual({ data: 'test' });
    });

    it('should use stale cache while revalidating', async () => {
      let callCount = 0;
      const fetcher = async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: `test-${callCount}` };
      };

      const strategy = {
        ttl: 1,
        staleWhileRevalidate: 10,
      };

      const first = await cache.get('stale-key', fetcher, strategy);
      const second = await cache.get('stale-key', fetcher, strategy);
      
      expect(first).toEqual({ data: 'test-1' });
      expect(callCount).toBeGreaterThan(1);
    });

    it('should invalidate cache', async () => {
      const fetcher = async () => ({ data: 'test' });
      await cache.get('invalidate-key', fetcher);
      
      cache.invalidate('invalidate-key');
      const stats = cache.getStats();
      
      expect(stats.keys).not.toContain('invalidate-key');
    });

    it('should invalidate cache by pattern', async () => {
      await cache.get('user:1', async () => 'user1');
      await cache.get('user:2', async () => 'user2');
      await cache.get('post:1', async () => 'post1');
      
      cache.invalidatePattern(/^user:/);
      
      expect(cache.getStats().keys).not.toContain('user:1');
      expect(cache.getStats().keys).not.toContain('user:2');
      expect(cache.getStats().keys).toContain('post:1');
    });
  });

  describe('ISRManager', () => {
    let isr: ISRManager;

    beforeEach(() => {
      isr = ISRManager.getInstance();
    });

    it('should return correct revalidation times', () => {
      expect(isr.getRevalidationTime('SHORT')).toBe(ISR_DEFAULTS.SHORT);
      expect(isr.getRevalidationTime('MEDIUM')).toBe(ISR_DEFAULTS.MEDIUM);
      expect(isr.getRevalidationTime('LONG')).toBe(ISR_DEFAULTS.LONG);
    });

    it('should generate cache keys correctly', () => {
      const key = isr.generateCacheKey('/api/trades', { page: '1', limit: '10' });
      expect(key).toContain('/api/trades');
      expect(key).toContain('page=1');
      expect(key).toContain('limit=10');
    });

    it('should create ISR options with defaults', () => {
      const options = isr.createISROptions();
      
      expect(options.revalidate).toBe(ISR_DEFAULTS.MEDIUM);
      expect(options.tags).toEqual([]);
    });

    it('should create ISR options with custom values', () => {
      const options = isr.createISROptions({
        revalidate: ISR_DEFAULTS.SHORT,
        tags: ['trades', 'dashboard'],
      });
      
      expect(options.revalidate).toBe(ISR_DEFAULTS.SHORT);
      expect(options.tags).toEqual(['trades', 'dashboard']);
    });

    it('should generate cache tags', () => {
      const tags = isr.getCacheTags('user-data', 'dashboard');
      expect(tags).toEqual(['user-data', 'dashboard']);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete caching workflow', async () => {
      const cache = new CacheManager();
      const monitor = new PerformanceMonitor();
      
      const fetcher = async () => {
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 50));
        const duration = Date.now() - start;
        
        monitor.recordMetric('API_RESPONSE', duration);
        return { data: 'test' };
      };

      const result = await cache.get('integration-key', fetcher, CacheStrategies.API_DATA);
      const metrics = monitor.getMetrics('API_RESPONSE');
      
      expect(result).toEqual({ data: 'test' });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBeGreaterThanOrEqual(50);
    });
  });
});
