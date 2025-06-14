import { NextRequest } from 'next/server';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return {
    check: (req: NextRequest, userId?: string): RateLimitResult => {
      const key = keyGenerator(req) + (userId ? `:user:${userId}` : '');
      const now = Date.now();
      const windowStart = now - windowMs;

      let record = rateLimitStore.get(key);

      // If no record exists or the window has expired, create a new one
      if (!record || now > record.resetTime) {
        record = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, record);
      }

      const isLimited = record.count >= maxRequests;
      const remaining = Math.max(0, maxRequests - record.count);
      const resetTime = record.resetTime;

      return {
        isLimited,
        remaining,
        resetTime,
        increment: () => {
          if (record) {
            record.count++;
          }
        },
      };
    },
  };
}

export interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
  increment: () => void;
}

function defaultKeyGenerator(req: NextRequest): string {
  // Get IP address from various headers (Cloudflare, proxy, direct)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';
  return `ip:${ip}`;
}

// Predefined rate limiters for different endpoints
export const uploadRateLimiters = {
  // Chapter uploads: 100 per hour per user, 250 per hour per IP
  chapterUpload: createRateLimit({
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),
  
  chapterUploadByIp: createRateLimit({
    maxRequests: 250,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Series submissions: 2 per day per user, 10 per day per IP
  seriesSubmission: createRateLimit({
    maxRequests: 2,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  }),
  
  seriesSubmissionByIp: createRateLimit({
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  }),

  // General API rate limit: 100 requests per 15 minutes
  general: createRateLimit({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),
};

export function formatRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
  };
}

export function createRateLimitResponse(message: string = 'Too many requests'): Response {
  return new Response(
    JSON.stringify({ 
      error: message,
      type: 'RATE_LIMIT_EXCEEDED'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Helper function to check both user and IP rate limits
export function checkDualRateLimit(
  req: NextRequest,
  userLimiter: ReturnType<typeof createRateLimit>,
  ipLimiter: ReturnType<typeof createRateLimit>,
  userId?: string
): {
  userLimit: RateLimitResult;
  ipLimit: RateLimitResult;
  isBlocked: boolean;
} {
  const userLimit = userLimiter.check(req, userId);
  const ipLimit = ipLimiter.check(req);
  
  const isBlocked = userLimit.isLimited || ipLimit.isLimited;
  
  return {
    userLimit,
    ipLimit,
    isBlocked,
  };
}