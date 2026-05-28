/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Works correctly on self-hosted deployments where a single Node.js process
 * handles all requests (docker-compose). For multi-instance deployments a
 * shared store (e.g. Redis) would be required.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

interface RateLimitOptions {
  /** Maximum number of requests allowed within the time window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the current window resets (0 when allowed). */
  retryAfter: number;
}

/**
 * Returns a per-IP check function bound to the given options.
 *
 * @example
 * const checkLimit = rateLimit({ maxRequests: 20, windowMs: 60_000 });
 * const result = checkLimit(ip);
 * if (!result.allowed) return NextResponse.json({...}, { status: 429 });
 */
export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs } = options;

  return function check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfter: 0 };
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    entry.count += 1;
    return { allowed: true, retryAfter: 0 };
  };
}
