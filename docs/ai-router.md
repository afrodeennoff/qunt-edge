# AI Router System

## Overview

The AI Router is a production-ready fallback system that provides intelligent routing between multiple AI providers. It enables automatic failover, cost optimization, and improved reliability for AI features across the Qunt Edge platform.

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Client    │───>│ AI Router    │───>│ Provider Chain  │
│  Request    │    │              │    │                 │
└─────────────┘    └──────────────┘    │ 1. BYOK         │
                                       │ 2. OpenRouter   │
                                       │    (free)       │
                                       │ 3. OpenRouter   │
                                       │    (auto)       │
                                       │ 4. Liquid LFM   │
                                       └─────────────────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │   Response  │
                                      └─────────────┘
```

## Features

- **Intelligent Fallback Chain**: Automatic provider switching based on availability and cost
- **Circuit Breaker**: Prevents cascading failures by temporarily disabling failing providers
- **Tenant-Safe Caching**: Per-user caching with automatic TTL management
- **Budget Reservation**: Atomic budget checking before API calls
- **Feature Flag Rollout**: Gradual deployment via `AI_ROUTER_ENABLED` environment variable

## Configuration

### Environment Variables

```bash
# Enable/disable the AI Router (default: false)
AI_ROUTER_ENABLED=true

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_key

# Existing AI Configuration (fallback)
OPENAI_API_KEY=your_openai_key
AI_BASE_URL=https://api.z.ai/api/paas/v4
AI_MODEL=glm-4.7-flash
```

### Provider Chain

The router attempts providers in this order:

1. **BYOK (Bring Your Own Key)**: User-configured OpenAI key
2. **OpenRouter Free**: `meta-llama/llama-3.1-8b-instruct:free`
3. **OpenRouter Auto**: `meta-llama/llama-3.1-8b-instruct`
4. **Liquid LFM**: `liquid/lfm-40b:free`

## Integration Guide

### Basic Usage

```typescript
import { aiRouter } from '@/lib/ai/router';

const result = await aiRouter.createCompletion({
  userId: 'user-123',
  feature: 'chat',
  budgetLimit: 100, // USD
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7
});

console.log(result.content); // AI response
console.log(result.provider); // 'openrouter', 'liquid', etc.
console.log(result.model); // Model identifier
```

### Integration with Existing AI Client

The router integrates seamlessly with the existing AI client:

```typescript
// lib/ai/client.ts
import { getRouterConfig } from '@/lib/ai/router/config';

export function getAiLanguageModel(feature: AiFeature) {
  const routerConfig = getRouterConfig();
  
  if (routerConfig.enabled) {
    // Use router when enabled
    return createRouterModel(feature);
  }
  
  // Fall back to original behavior
  return aiClient(model);
}
```

### Route Integration

Example integration for `/api/ai/support`:

```typescript
import { aiRouter, type RouterCompletionOptions } from '@/lib/ai/router';

export async function POST(req: NextRequest) {
  // ... authentication and validation ...
  
  try {
    // Extract text content from UI messages
    const routerMessages = messages.map(m => ({
      role: m.role,
      content: extractTextContent(m) // Handle UIMessage parts
    }));

    const routerOptions: RouterCompletionOptions = {
      userId,
      feature: 'support',
      budgetLimit: 100,
      messages: routerMessages,
      temperature: 0.3
    };

    const result = await aiRouter.createCompletion(routerOptions);
    
    return Response.json({ 
      choices: [{ message: { content: result.content } }] 
    });
  } catch (error) {
    // Fall back to original implementation
    console.warn('[AI Router] Failed, using fallback:', error);
    // ... original OpenAI client code ...
  }
}
```

## Testing

### Unit Tests

```bash
# Run router integration tests
npm test tests/lib/ai-router-integration.test.ts
```

### Manual Testing

1. Enable the router:
   ```bash
   export AI_ROUTER_ENABLED=true
   ```

2. Test with a support request:
   ```bash
   curl -X POST http://localhost:3000/api/ai/support \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [{"role": "user", "content": "Hello!"}]
     }'
   ```

3. Check logs for router activity:
   ```
   [AI Router] Using router for feature: support
   [Router] Attempting provider: openrouter/free
   [Router] Success with provider: openrouter
   ```

### Feature Flag Testing

Test the router independently of the main application:

```typescript
// Test with router enabled
process.env.AI_ROUTER_ENABLED = 'true';
const router = await aiRouter.createCompletion(options);

// Test with router disabled
process.env.AI_ROUTER_ENABLED = 'false';
const fallback = await originalAIClient(options);
```

## Troubleshooting

### Router Not Activating

**Issue**: Requests bypass the router and use the original client

**Solutions**:
1. Check `AI_ROUTER_ENABLED=true` is set
2. Verify environment variables are loaded: `console.log(process.env.AI_ROUTER_ENABLED)`
3. Check for import conflicts: ensure `@/lib/ai/router` imports are correct

### Provider Failures

**Issue**: All providers in the chain are failing

**Solutions**:
1. Check OpenRouter API key validity
2. Verify network connectivity to OpenRouter
3. Check circuit breaker state in Redis
4. Review provider-specific error messages in logs

### Cache Issues

**Issue**: Stale responses or unexpected cache hits

**Solutions**:
1. Check Redis connection: `redis-cli ping`
2. Verify cache keys: `redis-cli keys "ai:exact:*"`
3. Adjust cache TTL in `lib/ai/router/config.ts`
4. Clear cache: `redis-cli keys "ai:exact:*" | xargs redis-cli del`

### Budget Enforcement

**Issue**: Requests rejected due to budget limits

**Solutions**:
1. Check user's current budget: `redis-cli get "router:budget_usd:user-123"`
2. Adjust budget limits in route handlers
3. Review cost estimation logic in `fallback.ts`
4. Monitor budget usage via telemetry

## Performance Considerations

### Latency

- **Cache Hit**: ~10ms (Redis lookup)
- **Router Miss + OpenRouter**: ~500-1000ms
- **Fallback to Original**: ~300-800ms

### Cost Optimization

The router prioritizes free and low-cost providers:

1. OpenRouter Free Tier (when available)
2. OpenRouter Auto (cost-optimized routing)
3. Liquid LFM Free Tier

### Circuit Breaker Thresholds

Default configuration (adjustable in `config.ts`):

- **Failure Threshold**: 5 consecutive failures
- **Recovery Timeout**: 60 seconds
- **Half-Open Attempts**: 1 test request after recovery

## Security Considerations

### API Key Management

- **Never log API keys**: All keys are redacted from logs
- **Environment variables**: Keys stored only in process environment
- **No key exposure**: Keys never included in API responses

### Tenant Isolation

- **Per-user budget tracking**: Each user has isolated budget keys
- **User-scoped cache**: Cache keys include userId for isolation
- **Circuit breaker separation**: Circuit breaker state is provider-scoped, not user-scoped

### Rate Limiting

The router respects existing rate limiters:

```typescript
const supportRateLimit = rateLimit({ 
  limit: 12, 
  window: 60_000, 
  identifier: "ai-support" 
});
```

## Monitoring and Observability

### Log Patterns

```
[AI Router] Using router for feature: support
[Router] Attempting provider: openrouter/free
[Router] Provider failed: openrouter/free - Error: ...
[Router] Attempting provider: openrouter/auto
[Router] Success with provider: openrouter, model: meta-llama/llama-3.1-8b-instruct
[Cache] Cache hit for user-123, feature: support
```

### Metrics to Track

- Router activation rate (`AI_ROUTER_ENABLED=true` requests)
- Provider success rates (per provider)
- Cache hit/miss ratios
- Circuit breaker trigger counts
- Budget enforcement rejections
- Average latency per provider

## Migration Path

### Phase 1: Testing (Current)

- Router implemented but disabled by default
- Manual testing via `AI_ROUTER_ENABLED=true`
- Integration tests passing

### Phase 2: Gradual Rollout

1. Enable for low-risk features (`support`)
2. Monitor metrics and logs
3. Gradually enable for additional features
4. A/B test router vs. original

### Phase 3: Full Migration

- Enable router globally
- Deprecate original AI client paths
- Remove feature flag (optional)

## Future Enhancements

Potential improvements to consider:

1. **Smart Routing**: ML-based provider selection based on request characteristics
2. **Cost Predictions**: More accurate cost estimation before routing
3. **Quality Scoring**: Track response quality per provider
4. **Dynamic Provider Addition**: Runtime provider configuration
5. **Multi-Region Support**: Geographic provider routing
6. **Advanced Circuit Breaking**: Adaptive thresholds based on historical data

## Support

For issues or questions:

1. Check this documentation first
2. Review logs for error patterns
3. Run integration tests to verify setup
4. Check GitHub Issues for known problems
5. Contact the AI team for escalations
