import { FallbackRouter, RouterCompletionOptions, RouterCompletionResult } from './fallback';
import { getRouterConfig } from './config';

export class AIRouter {
  private fallbackRouter = new FallbackRouter();
  
  async createCompletion(options: RouterCompletionOptions): Promise<RouterCompletionResult> {
    // Check config dynamically each time
    const config = getRouterConfig();
    
    // Only use router if enabled
    if (!config.enabled) {
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
