// lib/rate-limit.ts
// In-memory sliding-window rate limiter.
// Each serverless instance maintains its own window map, so this is
// best-effort — but it still blocks the vast majority of abuse.
// For bullet-proof limiting, swap this for Upstash Redis (@upstash/ratelimit).

import { NextResponse } from 'next/server'

interface RateLimitEntry {
  tokens: number
  lastRefill: number
}

// Separate buckets for different routes
const buckets = new Map<string, Map<string, RateLimitEntry>>()

interface RateLimitOptions {
  /** Unique name for this limiter (e.g. "checkout", "delete-account") */
  name: string
  /** Max requests allowed in the window */
  maxRequests: number
  /** Window size in seconds */
  windowSeconds: number
}

/**
 * Extract a stable identifier from the request.
 * Prefers the auth token (user-scoped) and falls back to IP.
 */
function getIdentifier(request: Request): string {
  const auth = request.headers.get('Authorization')
  if (auth) {
    // Hash-ish: use last 16 chars of the token so we don't store the full JWT
    return 'tok:' + auth.slice(-16)
  }

  // Vercel/Cloudflare set these headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return 'ip:' + (forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown')
}

/**
 * Check the rate limit for a request.
 * Returns `null` if allowed, or a `NextResponse` 429 if blocked.
 *
 * Usage in an API route:
 * ```ts
 * const limited = rateLimit(request, { name: 'checkout', maxRequests: 5, windowSeconds: 60 })
 * if (limited) return limited
 * ```
 */
export function rateLimit(
  request: Request,
  { name, maxRequests, windowSeconds }: RateLimitOptions
): NextResponse | null {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const identifier = getIdentifier(request)
  const key = `${name}:${identifier}`

  // Get or create the bucket for this limiter
  if (!buckets.has(name)) {
    buckets.set(name, new Map())
  }
  const bucket = buckets.get(name)!

  const entry = bucket.get(key)

  if (!entry) {
    // First request — start with maxRequests - 1 tokens
    bucket.set(key, { tokens: maxRequests - 1, lastRefill: now })
    return null
  }

  // Refill tokens based on elapsed time (token-bucket algorithm)
  const elapsed = now - entry.lastRefill
  const refill = Math.floor((elapsed / windowMs) * maxRequests)

  if (refill > 0) {
    entry.tokens = Math.min(maxRequests, entry.tokens + refill)
    entry.lastRefill = now
  }

  if (entry.tokens <= 0) {
    // Calculate when the next token becomes available
    const retryAfter = Math.ceil(windowSeconds / maxRequests)
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  entry.tokens -= 1
  return null
}

// ─── Cleanup stale entries every 5 minutes to prevent memory leaks ─────────
setInterval(() => {
  const now = Date.now()
  const MAX_AGE = 10 * 60 * 1000 // 10 minutes

  buckets.forEach((bucket) => {
    bucket.forEach((entry, key) => {
      if (now - entry.lastRefill > MAX_AGE) {
        bucket.delete(key)
      }
    })
  })
}, 5 * 60 * 1000)
