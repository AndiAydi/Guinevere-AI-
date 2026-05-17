/**
 * Rate Limiter Middleware - Untuk protect API endpoints dari abuse
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 15 * 60 * 1000, // 15 minutes default
      maxRequests: config.maxRequests || 100,
      message: config.message || "Too many requests, please try again later",
    };

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const key = identifier;

    // Initialize or get existing entry
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const entry = this.store[key]!;

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.config.windowMs;
    }

    // Check if limit exceeded
    const allowed = entry.count < this.config.maxRequests;

    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get current status untuk identifier
   */
  getStatus(identifier: string): {
    count: number;
    limit: number;
    remaining: number;
    resetTime: number;
    resetIn: number;
  } {
    const entry = this.store[identifier];
    const now = Date.now();

    if (!entry) {
      return {
        count: 0,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        resetIn: this.config.windowMs,
      };
    }

    return {
      count: entry.count,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      resetIn: Math.max(0, entry.resetTime - now),
    };
  }

  /**
   * Reset limit untuk identifier
   */
  reset(identifier: string): void {
    delete this.store[identifier];
  }

  /**
   * Reset semua limits
   */
  resetAll(): void {
    this.store = {};
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(this.store)) {
      if (now > entry.resetTime + this.config.windowMs) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => delete this.store[key]);
  }
}

// Pre-configured rate limiters untuk berbagai endpoints
export const chatRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: "Terlalu banyak pesan. Silakan tunggu sebelum mengirim lagi.",
});

export const problemSolvingRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 requests per 5 minutes
  message: "Terlalu banyak permintaan problem-solving. Silakan tunggu sebelum mencoba lagi.",
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: "Terlalu banyak permintaan API. Silakan tunggu sebelum mencoba lagi.",
});
