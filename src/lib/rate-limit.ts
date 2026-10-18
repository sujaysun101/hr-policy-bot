import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Bucket = { tokens: number; updatedAt: number }

const buckets = new Map<string, Bucket>()
const CAPACITY = 12
const WINDOW_MS = 60 * 60 * 1000

let upstash: Ratelimit | null | undefined

function getUpstash(): Ratelimit | null {
  if (upstash !== undefined) return upstash
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    upstash = null
    return upstash
  }
  upstash = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.tokenBucket(CAPACITY, "1 h", CAPACITY),
    prefix: "handbookly",
    analytics: false,
  })
  return upstash
}

export async function rateLimit(key: string): Promise<{ ok: boolean; remaining: number }> {
  const limiter = getUpstash()
  if (limiter) {
    const result = await limiter.limit(key)
    return { ok: result.success, remaining: result.remaining }
  }
  const now = Date.now()
  const bucket = buckets.get(key) ?? { tokens: CAPACITY, updatedAt: now }
  const refill = ((now - bucket.updatedAt) / WINDOW_MS) * CAPACITY
  bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill)
  bucket.updatedAt = now
  if (bucket.tokens < 1) {
    buckets.set(key, bucket)
    return { ok: false, remaining: 0 }
  }
  bucket.tokens -= 1
  buckets.set(key, bucket)
  return { ok: true, remaining: Math.floor(bucket.tokens) }
}
