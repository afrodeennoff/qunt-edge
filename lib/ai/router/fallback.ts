import { OpenRouterClient, OpenRouterCompletionOptions, OpenRouterMessage } from './openrouter';
import { CircuitBreaker } from './circuit';
import { TenantSafeCache } from './cache';
import { BudgetReservation } from './reservations';
import { getRouterConfig } from './config';

export interface RouterCompletionOptions {
  userId: string;
  feature: string;
  budgetLimit: number;
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
    // Check cache first
    const cacheKey = options.messages.map(m => m.content).join('\n');
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
      { name: 'liquid', model: this.config.liquid.models.lfm },
    ];
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        // Check budget before making request
        const estimatedCost = this.estimateCost(options.messages, provider.model);
        const reservationSuccess = await BudgetReservation.reserve(
          options.userId, 
          estimatedCost, 
          options.budgetLimit
        );
        
        if (!reservationSuccess) {
          throw new Error('Budget limit exceeded');
        }
        
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
        console.warn(`Provider ${provider.name}/${provider.model} failed:`, error);
        // Continue to next provider
      }
    }
    
    throw new Error('All providers failed');
  }
  
  private estimateCost(messages: OpenRouterMessage[], model: string): number {
    // Simple cost estimation based on token count
    // In a real implementation, this would be more sophisticated
    const tokenCount = messages.reduce((acc, message) => 
      acc + message.content.length / 4, 0); // Rough approximation
    
    // Different models have different costs
    if (model.includes('free')) {
      return 0; // Free tier
    }
    
    // Approximate cost per 1k tokens
    const costPer1kTokens = model.includes('liquid') ? 0.0001 : 0.0005;
    return (tokenCount / 1000) * costPer1kTokens;
  }
}
