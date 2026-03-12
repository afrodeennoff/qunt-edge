import { isRedisConfigured, runRedisCommand } from '@/lib/redis-cache';

// Lua script for atomic budget reservation
const RESERVE_BUDGET_SCRIPT = `
local key = KEYS[1]
local requested_amount = tonumber(ARGV[1])
local budget_limit = tonumber(ARGV[2])

local current_balance = redis.call('GET', key)
if current_balance == false then
  current_balance = 0
else
  current_balance = tonumber(current_balance)
end

if current_balance + requested_amount <= budget_limit then
  redis.call('INCRBYFLOAT', key, requested_amount)
  return 1
else
  return 0
end
`;

export class BudgetReservation {
  // HIGH #4: Remove in-memory fallback - fail closed if Redis is unavailable

  static async reserve(userId: string, amount: number, limit: number): Promise<boolean> {
    const budgetKey = `router:budget_usd:${userId}`;

    // HIGH #4: Budget service fails closed without Redis
    if (!isRedisConfigured()) {
      throw new Error('Budget service unavailable - Redis required');
    }

    // CRITICAL #2: Use atomic Lua script to prevent race conditions
    const result = await runRedisCommand([
      'EVAL',
      RESERVE_BUDGET_SCRIPT,
      '1',
      budgetKey,
      amount.toString(),
      limit.toString()
    ]);

    const success = Number(result) === 1;

    if (success) {
      // Set expiration for the key (1 day)
      await runRedisCommand(['EXPIRE', budgetKey, '86400']);
    }

    return success;
  }
  
  static async getBalance(userId: string): Promise<number> {
    const budgetKey = `router:budget_usd:${userId}`;
    
    if (isRedisConfigured()) {
      const result = await runRedisCommand(['GET', budgetKey]);
      return result ? parseFloat(String(result)) : 0;
    }
    
    return this.memoryStore.get(budgetKey) || 0;
  }
  
  static async resetBudget(userId: string): Promise<void> {
    const budgetKey = `router:budget_usd:${userId}`;
    
    if (isRedisConfigured()) {
      await runRedisCommand(['DEL', budgetKey]);
    } else {
      this.memoryStore.delete(budgetKey);
    }
  }
}
