export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  consume(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      return {
        allowed: true,
        remaining: Math.max(limit - 1, 0),
        retryAfterMs: windowMs
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(existing.resetAt - now, 0)
      };
    }

    existing.count += 1;
    this.buckets.set(key, existing);

    return {
      allowed: true,
      remaining: Math.max(limit - existing.count, 0),
      retryAfterMs: Math.max(existing.resetAt - now, 0)
    };
  }
}
