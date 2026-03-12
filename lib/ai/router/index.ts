import { FallbackRouter, RouterCompletionOptions, RouterCompletionResult } from './fallback';
import { getRouterConfig } from './config';

export class AIRouter {
  private fallbackRouter = new FallbackRouter();
  private config = getRouterConfig();
  
  async createCompletion(options: RouterCompletionOptions): Promise<RouterCompletionResult> {
    // Only use router if enabled
    if (!this.config.enabled) {
      throw new Error('AI Router is not enabled');
    }
    
    return await this.fallbackRouter.createCompletion(options);
  }
}

// Singleton instance
export const aiRouter = new AIRouter();

// Export types for convenience
export type { RouterCompletionOptions, RouterCompletionResult } from './fallback';
export type { RouterConfig } from './config';
export { getRouterConfig } from './config';
