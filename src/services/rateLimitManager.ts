
export interface RateLimitConfig {
  windowSizeMs: number;
  maxRequests: number;
  burstAllowance?: number;
  cooldownMs?: number;
}

export interface ExchangeRateLimits {
  [endpoint: string]: RateLimitConfig;
}

export class RateLimitManager {
  private requestHistory: Map<string, number[]> = new Map();
  private burstCounters: Map<string, number> = new Map();
  private cooldownTimers: Map<string, number> = new Map();
  
  // Exchange-specific rate limits (requests per minute unless specified)
  private readonly EXCHANGE_LIMITS: { [exchange: string]: ExchangeRateLimits } = {
    binance: {
      'order': { windowSizeMs: 60000, maxRequests: 10, burstAllowance: 3 },
      'account': { windowSizeMs: 60000, maxRequests: 12 },
      'ticker': { windowSizeMs: 60000, maxRequests: 1200 },
      'orderbook': { windowSizeMs: 60000, maxRequests: 1000 },
      'klines': { windowSizeMs: 60000, maxRequests: 1000 },
      'trades': { windowSizeMs: 60000, maxRequests: 1000 },
      'websocket': { windowSizeMs: 60000, maxRequests: 10 },
      // Special limits
      'order_weight': { windowSizeMs: 60000, maxRequests: 1200 }, // Weight-based limit
      'raw_requests': { windowSizeMs: 60000, maxRequests: 6000 }  // Raw request limit
    },
    coinbase: {
      'private': { windowSizeMs: 60000, maxRequests: 10 },
      'public': { windowSizeMs: 60000, maxRequests: 100 },
      'order': { windowSizeMs: 60000, maxRequests: 10 },
      'account': { windowSizeMs: 60000, maxRequests: 10 },
      'fills': { windowSizeMs: 60000, maxRequests: 10 }
    },
    kraken: {
      'private': { windowSizeMs: 60000, maxRequests: 20 },
      'public': { windowSizeMs: 60000, maxRequests: 60 },
      'order': { windowSizeMs: 60000, maxRequests: 60 },
      'ledger': { windowSizeMs: 60000, maxRequests: 20 },
      'trade_history': { windowSizeMs: 60000, maxRequests: 20 }
    },
    deribit: {
      'private': { windowSizeMs: 60000, maxRequests: 20 },
      'public': { windowSizeMs: 60000, maxRequests: 100 },
      'order': { windowSizeMs: 60000, maxRequests: 20 },
      'positions': { windowSizeMs: 60000, maxRequests: 20 }
    }
  };

  constructor() {
    // Clean up old request history every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async checkRateLimit(
    exchange: string, 
    endpoint: string, 
    userId?: string,
    weight: number = 1
  ): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number; reason?: string }> {
    const now = Date.now();
    const key = this.getRateLimitKey(exchange, endpoint, userId);
    
    // Check if in cooldown
    const cooldownUntil = this.cooldownTimers.get(key) || 0;
    if (now < cooldownUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: cooldownUntil,
        reason: `Cooldown active until ${new Date(cooldownUntil).toISOString()}`
      };
    }

    // Get rate limit configuration
    const exchangeLimits = this.EXCHANGE_LIMITS[exchange.toLowerCase()];
    if (!exchangeLimits) {
      console.warn(`No rate limits configured for exchange: ${exchange}`);
      return { allowed: true, remainingRequests: 999, resetTime: now + 60000 };
    }

    const config = exchangeLimits[endpoint] || exchangeLimits['default'];
    if (!config) {
      console.warn(`No rate limit config for ${exchange}:${endpoint}`);
      return { allowed: true, remainingRequests: 999, resetTime: now + 60000 };
    }

    // Get request history
    const history = this.requestHistory.get(key) || [];
    
    // Filter recent requests within the time window
    const windowStart = now - config.windowSizeMs;
    const recentRequests = history.filter(timestamp => timestamp > windowStart);
    
    // Calculate current usage (considering weight)
    const currentUsage = recentRequests.reduce((sum, _, index) => {
      // If we stored weights, we'd retrieve them here
      // For now, assume each request has weight 1
      return sum + 1;
    }, 0);

    const totalUsageWithWeight = currentUsage + weight;
    const remainingRequests = Math.max(0, config.maxRequests - totalUsageWithWeight);
    const resetTime = Math.max(...recentRequests, now - config.windowSizeMs) + config.windowSizeMs;

    // Check burst allowance
    if (config.burstAllowance) {
      const burstCount = this.burstCounters.get(key) || 0;
      if (totalUsageWithWeight > config.maxRequests && burstCount < config.burstAllowance) {
        // Allow burst but increment counter
        this.burstCounters.set(key, burstCount + 1);
        console.log(`⚡ Burst allowance used for ${key}: ${burstCount + 1}/${config.burstAllowance}`);
      }
    }

    // Check if request is allowed
    const allowed = totalUsageWithWeight <= config.maxRequests + (config.burstAllowance || 0);

    if (!allowed) {
      // Implement progressive cooldown for repeated violations
      const violations = this.getViolationCount(key);
      const cooldownDuration = Math.min(300000, 5000 * Math.pow(2, violations)); // Max 5 minutes
      
      this.cooldownTimers.set(key, now + cooldownDuration);
      this.incrementViolationCount(key);
      
      console.warn(`🚫 Rate limit exceeded for ${key}`);
      console.warn(`📊 Usage: ${totalUsageWithWeight}/${config.maxRequests} (${remainingRequests} remaining)`);
      console.warn(`⏰ Cooldown: ${cooldownDuration/1000}s`);
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + cooldownDuration,
        reason: `Rate limit exceeded: ${totalUsageWithWeight}/${config.maxRequests} requests in window`
      };
    }

    // Record the request
    recentRequests.push(now);
    this.requestHistory.set(key, recentRequests);

    return {
      allowed: true,
      remainingRequests,
      resetTime
    };
  }

  private getRateLimitKey(exchange: string, endpoint: string, userId?: string): string {
    return `${exchange}:${endpoint}${userId ? `:${userId}` : ''}`;
  }

  private getViolationCount(key: string): number {
    const violationKey = `violations:${key}`;
    return this.burstCounters.get(violationKey) || 0;
  }

  private incrementViolationCount(key: string): void {
    const violationKey = `violations:${key}`;
    const current = this.getViolationCount(key);
    this.burstCounters.set(violationKey, current + 1);
    
    // Reset violation counter after 1 hour
    setTimeout(() => {
      this.burstCounters.delete(violationKey);
    }, 3600000);
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    // Cleanup request history
    for (const [key, history] of this.requestHistory) {
      const validRequests = history.filter(timestamp => now - timestamp < maxAge);
      if (validRequests.length === 0) {
        this.requestHistory.delete(key);
      } else {
        this.requestHistory.set(key, validRequests);
      }
    }
    
    // Cleanup expired cooldowns
    for (const [key, cooldownUntil] of this.cooldownTimers) {
      if (now > cooldownUntil) {
        this.cooldownTimers.delete(key);
      }
    }
    
    // Reset burst counters periodically
    if (now % 1800000 < 60000) { // Every 30 minutes
      this.burstCounters.clear();
    }
  }

  // Utility methods
  getRemainingRequests(exchange: string, endpoint: string, userId?: string): number {
    const key = this.getRateLimitKey(exchange, endpoint, userId);
    const config = this.EXCHANGE_LIMITS[exchange.toLowerCase()]?.[endpoint];
    
    if (!config) return 999;
    
    const history = this.requestHistory.get(key) || [];
    const now = Date.now();
    const windowStart = now - config.windowSizeMs;
    const recentRequests = history.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  getResetTime(exchange: string, endpoint: string, userId?: string): number {
    const key = this.getRateLimitKey(exchange, endpoint, userId);
    const history = this.requestHistory.get(key) || [];
    
    if (history.length === 0) return Date.now() + 60000;
    
    const config = this.EXCHANGE_LIMITS[exchange.toLowerCase()]?.[endpoint];
    if (!config) return Date.now() + 60000;
    
    const oldestRelevantRequest = Math.max(...history) - config.windowSizeMs;
    return oldestRelevantRequest + config.windowSizeMs;
  }

  async waitForAvailability(
    exchange: string, 
    endpoint: string, 
    userId?: string,
    maxWaitMs: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const check = await this.checkRateLimit(exchange, endpoint, userId);
      
      if (check.allowed) {
        return true;
      }
      
      const waitTime = Math.min(check.resetTime - Date.now(), 5000);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    return false;
  }

  // Emergency reset methods
  resetLimitsForExchange(exchange: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.requestHistory.keys()) {
      if (key.startsWith(`${exchange}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.requestHistory.delete(key);
      this.cooldownTimers.delete(key);
    });
    
    console.log(`🔄 Rate limits reset for ${exchange}`);
  }

  getStatus(): { [key: string]: any } {
    const status: { [key: string]: any } = {};
    
    for (const [key, history] of this.requestHistory) {
      const [exchange, endpoint] = key.split(':');
      const config = this.EXCHANGE_LIMITS[exchange]?.[endpoint];
      
      if (config) {
        const now = Date.now();
        const windowStart = now - config.windowSizeMs;
        const recentRequests = history.filter(timestamp => timestamp > windowStart);
        
        status[key] = {
          current: recentRequests.length,
          limit: config.maxRequests,
          remaining: Math.max(0, config.maxRequests - recentRequests.length),
          resetTime: this.getResetTime(exchange, endpoint),
          inCooldown: (this.cooldownTimers.get(key) || 0) > now
        };
      }
    }
    
    return status;
  }
}

// Global rate limit manager instance
export const rateLimitManager = new RateLimitManager();
