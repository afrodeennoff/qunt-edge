import { getEnv } from '@/lib/env';

export interface RouterConfig {
  enabled: boolean;
  openrouter: {
    apiKey?: string;
    baseUrl: string;
    models: {
      free: string;
      auto: string;
      liquid: string;
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
  const providerOrder = (env.AI_ROUTER_PROVIDER_ORDER || 'openrouter')
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
        free: env.AI_ROUTER_MODEL_FREE || 'openrouter/free',
        auto: env.AI_ROUTER_MODEL_AUTO || 'openrouter/auto',
        liquid: env.AI_ROUTER_MODEL_LIQUID || env.AI_ROUTER_LIQUID_MODEL || 'liquid/lfm2-8b-a1b',
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
