import { getRedisJson, setRedisJson } from "@/lib/redis-cache";
import { getRouterConfig } from "./config";

// Circuit breaker state
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitStateData {
  state: CircuitState;
  failures: number;
  lastFailure: number;
}

export class CircuitBreaker {
  private config = getRouterConfig();
  
  private async getCircuitState(provider: string, model: string): Promise<CircuitStateData> {
    const circuitKey = `ai:cb:${provider}:${model}`;
    const data = await getRedisJson<CircuitStateData>("ai-router", circuitKey);
    
    return data || {
      state: "CLOSED",
      failures: 0,
      lastFailure: 0,
    };
  }
  
  private async setCircuitState(provider: string, model: string, state: CircuitStateData): Promise<void> {
    const circuitKey = `ai:cb:${provider}:${model}`;
    await setRedisJson("ai-router", circuitKey, state, 3600); // 1 hour TTL
  }
  
  async call<T>(
    provider: string,
    model: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitState = await this.getCircuitState(provider, model);
    
    // Check if circuit is open
    if (circuitState.state === "OPEN") {
      // Check if recovery timeout has passed
      const now = Date.now();
      if (now - circuitState.lastFailure < this.config.circuitBreaker.recoveryTimeoutMs) {
        throw new Error(`Circuit breaker is open for ${provider}/${model}`);
      }
      // Move to half-open state
      circuitState.state = "HALF_OPEN";
      await this.setCircuitState(provider, model, circuitState);
    }
    
    try {
      const result = await operation();
      
      // Reset failure count on success
      if (circuitState.state === "HALF_OPEN" || circuitState.failures > 0) {
        await this.setCircuitState(provider, model, {
          state: "CLOSED",
          failures: 0,
          lastFailure: 0,
        });
      }
      
      return result;
    } catch (error) {
      const newFailures = circuitState.failures + 1;
      const now = Date.now();
      
      // Open circuit if threshold reached
      if (newFailures >= this.config.circuitBreaker.failureThreshold) {
        await this.setCircuitState(provider, model, {
          state: "OPEN",
          failures: newFailures,
          lastFailure: now,
        });
      } else {
        await this.setCircuitState(provider, model, {
          state: "CLOSED",
          failures: newFailures,
          lastFailure: now,
        });
      }
      
      throw error;
    }
  }
}
