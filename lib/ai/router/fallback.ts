import { OpenRouterClient, OpenRouterMessage } from './openrouter';
import { CircuitBreaker } from './circuit';
import { TenantSafeCache } from './cache';
import { getRouterConfig } from './config';
import { logAiWarn } from '@/lib/ai/error-utils';

export interface RouterCompletionOptions {
  userId: string;
  feature: string;
  messages: OpenRouterMessage[];
  temperature?: number;
}

export interface RouterCompletionResult {
  content: string;
  provider: string;
  model: string;
}

export class FallbackRouter {
  private openrouter = new OpenRouterClient();
  private circuitBreaker = new CircuitBreaker();
  private cache = new TenantSafeCache();
  private config = getRouterConfig();
  
  async createCompletion(options: RouterCompletionOptions): Promise<RouterCompletionResult> {
    // Check cache first - include message count to prevent collisions
    const cacheKey = `${options.messages.length}:${options.messages.map(m => m.content).join('\n')}`;
    const cached = await this.cache.get(options.userId, options.feature, cacheKey);
    
    if (cached) {
      return {
        content: cached,
        provider: 'cache',
        model: 'cached',
      };
    }
    
    // Define provider chain
    const providers = [
      { name: 'openrouter', model: this.config.openrouter.models.free },
      { name: 'openrouter', model: this.config.openrouter.models.auto },
      // This is still served via OpenRouter model routing; keep provider label truthful.
      { name: 'openrouter', model: this.config.liquid.models.lfm },
    ];
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        // Make API call through circuit breaker
        const result = await this.circuitBreaker.call(
          provider.name,
          provider.model,
          () => this.openrouter.createCompletion({
            model: provider.model,
            messages: options.messages,
            temperature: options.temperature,
          })
        );
        
        // Cache the result
        await this.cache.set(
          options.userId,
          options.feature,
          cacheKey,
          result.content
        );
        
        return {
          content: result.content,
          provider: provider.name,
          model: provider.model,
        };
      } catch (error) {
        logAiWarn('[AI Router] Provider attempt failed', error, {
          provider: provider.name,
          model: provider.model,
        });
        // Continue to next provider
      }
    }
    
    throw new Error('All providers failed');
  }
}
