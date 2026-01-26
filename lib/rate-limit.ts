interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // 10 requests per minute (快速限流，防止短时间大量请求)

export function rateLimit(ip: string): {
  success: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetIn: WINDOW_MS,
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    resetIn: entry.resetTime - now,
  };
}
