import { getEnv } from '@/lib/env';

export interface RouterConfig {
  enabled: boolean;
  openrouter: {
    apiKey?: string;
    baseUrl: string;
    models: {
      byokFree: string[];
      free: string;
      auto: string;
    };
    provider: {
      order: string[];
      sort: 'price';
      maxPrice: {
        input: number;
        output: number;
      };
    };
  };
  cache: {
    ttlSeconds: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeoutMs: number;
  };
}

export function getRouterConfig(): RouterConfig {
  const env = getEnv();
  const byokFreeModels = (env.AI_ROUTER_BYOK_FREE_MODELS || 'groq/llama-3.1-8b-instant,zai/glm-4.7-flash,cerebras/llama-3.1-8b,together/mixtral-8x7b,deepinfra/qwen2-7b')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  const providerOrder = (env.AI_ROUTER_PROVIDER_ORDER || 'groq,cerebras,zai,together,deepinfra,openrouter')
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean);
  const maxPriceInput = Number(env.AI_ROUTER_MAX_PRICE_INPUT || '0.05');
  const maxPriceOutput = Number(env.AI_ROUTER_MAX_PRICE_OUTPUT || '0.05');

  return {
    enabled: env.AI_ROUTER_ENABLED === 'true',
    openrouter: {
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      models: {
        byokFree: byokFreeModels,
        free: 'openrouter/free',
        auto: 'openrouter/auto',
      },
      provider: {
        order: providerOrder,
        sort: 'price',
        maxPrice: {
          input: Number.isFinite(maxPriceInput) ? maxPriceInput : 0.05,
          output: Number.isFinite(maxPriceOutput) ? maxPriceOutput : 0.05,
        },
      },
    },
    cache: {
      ttlSeconds: 300 // 5 minutes
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeoutMs: 60000 // 1 minute
    }
  };
}
