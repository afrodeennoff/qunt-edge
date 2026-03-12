# Database Pool Sizing Guidelines

## Overview

This document explains the Prisma connection pool configuration and provides guidelines for monitoring and scaling.

## Current Configuration

### Production Settings
- **Max connections:** `20` (increased from 2 for production-grade concurrency)
- **Min connections:** `5` (keep warm connections ready for reuse)
- **Idle timeout:** `30 seconds` (close idle connections after 30s)
- **Connection timeout:** `10 seconds` (fail fast if DB doesn't respond)

### Development Settings
- **Max connections:** `5`
- **Min connections:** `2`
- **Idle timeout:** `10 seconds`
- **Connection timeout:** `15 seconds`

### Environment Variables

```bash
# Override default pool settings
PG_POOL_MAX=20              # Max connections (default: 20 in prod, 5 in dev)
PG_POOL_MIN=5               # Min connections (default: 5 in prod, 2 in dev)
PG_POOL_IDLE_TIMEOUT_MS=30000   # Close idle connections after N ms
PG_POOL_CONNECT_TIMEOUT_MS=10000 # Fail fast if DB doesn't respond in N ms
```

## Capacity Planning

### Current Capacity (Pool: 20)

With a max pool of 20 connections:

- **Estimated capacity:** ~200-400 concurrent queries per second
- **Suitable for:** Small to medium production workloads
- **Concurrent users:** ~50-100 active users (depending on query patterns)

### When to Increase Pool Size

Monitor these metrics to determine if you need to increase pool size:

#### Indicators of Pool Exhaustion

1. **Error logs:**
   - "Insufficient connections reserved"
   - "Timeout acquiring connection"
   - Connection wait times > 1000ms

2. **Performance metrics:**
   - Average query time consistently > 500ms
   - P95 query latency increasing with load
   - Connection wait time > 1000ms

3. **Pool utilization:**
   - Consistently hitting 80%+ utilization (16+ connections active)
   - High connection churn (frequent connect/disconnect cycles)

### Scaling Guidelines

| Concurrent Queries | Recommended Pool Size | Expected Capacity |
|-------------------|----------------------|-------------------|
| 200-400 qps       | 20 connections       | Current setting ✅ |
| 500-800 qps       | 30 connections       | 2.5x current capacity |
| 1000-1500 qps     | 50 connections       | 4x current capacity |
| 2000+ qps         | 100+ connections     | Consider connection pooling proxy (e.g., PgBouncer) |

**To increase pool size:**

1. Update `.env.production`:
   ```bash
   PG_POOL_MAX=30  # or 50 for higher capacity
   PG_POOL_MIN=10  # keep min at ~33% of max
   ```

2. Restart your application:
   ```bash
   # Deploy with new environment variables
   ```

3. Monitor after scaling:
   - Watch logs for high utilization warnings
   - Check query performance metrics
   - Verify connection errors are resolved

## Monitoring

### Built-in Monitoring

The pool automatically logs when utilization reaches 80%:

```
[DB Pool] High connection usage
  active: 16
  max: 20
  utilization: "80%"
  idle: 4
  total: 20
```

### Manual Testing

Test pool performance locally:

```bash
# Test with 30 concurrent queries
node scripts/test-db-pool.mjs 30

# Expected: All queries succeed, avg duration < 100ms
```

### Production Monitoring

Key metrics to track:

1. **Connection utilization:**
   - Monitor for 80%+ warnings
   - Track frequency of high-utilization events

2. **Query performance:**
   - Average query duration
   - P95/P99 query latency
   - Slow query log

3. **Error rates:**
   - Connection timeout errors
   - Pool exhaustion errors
   - Overall DB error rate

## Best Practices

1. **Start conservative:** Begin with pool size 20, scale up based on metrics

2. **Keep min pool size reasonable:** Set min to ~25-33% of max to maintain warm connections without wasting resources

3. **Monitor before scaling:** Use metrics to justify pool size increases

4. **Consider connection pooling proxies:** For very high throughput (1000+ qps), use PgBouncer or Supabase pooler

5. **Set appropriate timeouts:**
   - Connection timeout: 5-10 seconds (fail fast)
   - Idle timeout: 30-60 seconds (balance between reuse and resource cleanup)

## Troubleshooting

### High Connection Usage Warnings

**Symptom:** Frequent "[DB Pool] High connection usage" warnings

**Solutions:**
- Increase `PG_POOL_MAX` in increments of 10
- Optimize slow queries (check query performance)
- Review connection handling (ensure connections are released promptly)
- Consider query batching or connection pooling patterns

### Connection Timeout Errors

**Symptom:** "Timeout acquiring connection" errors

**Solutions:**
- Increase pool size
- Increase `PG_POOL_CONNECT_TIMEOUT_MS` (temporary fix)
- Optimize slow queries that are holding connections too long
- Check for connection leaks (unclosed connections)

### Pool Exhaustion

**Symptom:** "Insufficient connections reserved" errors

**Solutions:**
- Increase `PG_POOL_MAX` immediately
- Review connection handling code for leaks
- Implement query result caching to reduce DB load
- Consider read replicas for read-heavy workloads

## References

- [Prisma Connection Pool Documentation](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#configuring-the-connection-pool)
- [pg.Pool Documentation](https://node-postgres.com/apis/pool)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)
