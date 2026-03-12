import { OpenRouterClient, OpenRouterMessage } from './openrouter';
import { CircuitBreaker } from './circuit';
import { TenantSafeCache } from './cache';
import { getRouterConfig } from './config';
import { logAiWarn } from '@/lib/ai/error-utils';
import { createHash } from 'crypto';

export interface RouterCompletionOptions {
  userId: string;
  feature: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  requestedModel?: string;
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
  
  async createCompletion(options: RouterCompletionOptions): Promise<RouterCompletionResult> {
    const config = getRouterConfig();
    // Include role/model/temperature to avoid cross-request collisions.
    const cacheKeyPayload = JSON.stringify({
      requestedModel: options.requestedModel ?? null,
      temperature: options.temperature ?? null,
      messages: options.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });
    const cacheKey = createHash('sha256').update(cacheKeyPayload).digest('hex');
    const cached = await this.cache.get(options.userId, options.feature, cacheKey);
    
    if (cached) {
      return {
        content: cached,
        provider: 'cache',
        model: 'cached',
      };
    }
    
    const requestedModel = options.requestedModel?.trim();
    const byokFirstModels = requestedModel
      ? [requestedModel, ...config.openrouter.models.byokFree]
      : config.openrouter.models.byokFree;
    const providerHints = {
      order: config.openrouter.provider.order,
      sort: config.openrouter.provider.sort,
      max_price: {
        input: config.openrouter.provider.maxPrice.input,
        output: config.openrouter.provider.maxPrice.output,
      },
    } as const;

    // Deduplicate while preserving order.
    const seen = new Set<string>();
    const byokChain = byokFirstModels
      .filter((model) => {
        if (!model || seen.has(model)) return false;
        seen.add(model);
        return true;
      })
      .map((model) => ({ name: 'openrouter-byok', model, provider: providerHints }));

    const providers = [
      ...byokChain,
      { name: 'openrouter-free', model: config.openrouter.models.free },
      { name: 'openrouter-auto', model: config.openrouter.models.auto },
      ...(requestedModel ? [{ name: 'openrouter-requested-fallback', model: requestedModel }] : []),
      { name: 'openrouter-liquid', model: config.liquid.models.lfm },
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
            provider: 'provider' in provider ? provider.provider : undefined,
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
