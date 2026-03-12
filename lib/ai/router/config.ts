import { getEnv } from '@/lib/env';

export interface RouterConfig {
  enabled: boolean;
  openrouter: {
    apiKey?: string;
    baseUrl: string;
    models: {
      free: string;
      auto: string;
    };
  };
  liquid: {
    models: {
      lfm: string;
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

  return {
    enabled: env.AI_ROUTER_ENABLED === 'true',
    openrouter: {
      apiKey: env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      models: {
        free: 'meta-llama/llama-3.1-8b-instruct:free',
        auto: 'meta-llama/llama-3.1-8b-instruct'
      }
    },
    liquid: {
      models: {
        lfm: 'liquid/lfm-40b:free'
      }
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
