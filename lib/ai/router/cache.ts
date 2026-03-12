import { getRedisJson, setRedisJson } from '@/lib/redis-cache';
import { getRouterConfig } from './config';
import crypto from 'crypto';

export class TenantSafeCache {
  private config = getRouterConfig();
  
  async get(userId: string, feature: string, prompt: string): Promise<string | null> {
    const hash = crypto.createHash('sha256').update(prompt).digest('hex');
    const cacheKey = `ai:exact:${userId}:${feature}:${hash}`;
    
    return await getRedisJson<string>('ai-router', cacheKey);
  }
  
  async set(userId: string, feature: string, prompt: string, response: string): Promise<void> {
    const hash = crypto.createHash('sha256').update(prompt).digest('hex');
    const cacheKey = `ai:exact:${userId}:${feature}:${hash}`;
    
    await setRedisJson('ai-router', cacheKey, response, this.config.cache.ttlSeconds);
  }
}
