const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  windowMs: number
  maxAttempts: number
}

export function checkRateLimit(key: string, options: RateLimitOptions): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Nettoyage périodique (toutes les ~100 vérifications)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) rateLimitMap.delete(k)
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  entry.count++

  if (entry.count > options.maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  return { allowed: true, retryAfterMs: 0 }
}
