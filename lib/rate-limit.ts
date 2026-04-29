// lib/rate-limit.ts
// Distributed sliding-window rate limiter using Upstash Redis (H-2 fix).
// Falls back to in-memory (best-effort, unreliable in serverless) when
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set.
//
// Setup (free):
//   1. Create a Redis DB at https://upstash.com
//   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars

import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitOptions {
  /** Unique name for this limiter (e.g. "checkout", "delete-account") */
  name: string
  /** Max requests allowed in the window */
  maxRequests: number
  /** Window size in seconds */
  windowSeconds: number
}

// ── Upstash distributed limiters ─────────────────────────────────────────────
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

const upstashLimiters = new Map<string, Ratelimit>()

function getUpstashLimiter(
  name: string,
  maxRequests: number,
  windowSeconds: number
): Ratelimit {
  const key = `${name}:${maxRequests}:${windowSeconds}`
  if (!upstashLimiters.has(key)) {
    upstashLimiters.set(
      key,
      new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        }),
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        prefix: `rl:${name}`,
      })
    )
  }
  return upstashLimiters.get(key)!
}

// ── In-memory fallback (single-instance only) ─────────────────────────────────
interface InMemoryEntry {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, Map<string, InMemoryEntry>>()

function inMemoryCheck(
  identifier: string,
  { name, maxRequests, windowSeconds }: RateLimitOptions
): boolean {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  if (!buckets.has(name)) buckets.set(name, new Map())
  const bucket = buckets.get(name)!
  const entry = bucket.get(identifier)

  if (!entry) {
    bucket.set(identifier, { tokens: maxRequests - 1, lastRefill: now })
    return false // allowed
  }

  const refill = Math.floor(((now - entry.lastRefill) / windowMs) * maxRequests)
  if (refill > 0) {
    entry.tokens = Math.min(maxRequests, entry.tokens + refill)
    entry.lastRefill = now
  }

  if (entry.tokens <= 0) return true // blocked
  entry.tokens -= 1
  return false // allowed
}

// Cleanup stale in-memory entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const MAX_AGE = 10 * 60 * 1000
  buckets.forEach((bucket) => {
    bucket.forEach((entry, key) => {
      if (now - entry.lastRefill > MAX_AGE) bucket.delete(key)
    })
  })
}, 5 * 60 * 1000)

// ── Identifier extraction (IP-based) — L-4 fix ───────────────────────────────
function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown'
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Check the rate limit for a request.
 * Returns `null` if allowed, or a `NextResponse` 429 if blocked.
 *
 * Usage in an API route:
 * ```ts
 * const limited = await rateLimit(request, { name: 'checkout', maxRequests: 5, windowSeconds: 60 })
 * if (limited) return limited
 * ```
 */
export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { name, maxRequests, windowSeconds } = options
  const identifier = getIdentifier(request)

  if (isUpstashConfigured) {
    const limiter = getUpstashLimiter(name, maxRequests, windowSeconds)
    const { success, reset } = await limiter.limit(identifier)
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
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
    return null
  }

  // Fallback to in-memory (best-effort — not reliable across serverless instances)
  const blocked = inMemoryCheck(identifier, options)
  if (blocked) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(windowSeconds / maxRequests)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }
  return null
}
