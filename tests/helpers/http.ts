import { loadEnvFile, getTestBaseUrl } from './env'
import jwt from 'jsonwebtoken'

loadEnvFile()

export type TestUser = {
  email: string
  password: string
  role: 'APPRENANT' | 'FORMATEUR' | 'ADMINISTRATEUR'
  /** Stable seed ids (after typical seed) — refreshed via DB lookup when possible */
  userId?: number
}

export const SEED_USERS = {
  learner: {
    email: 'marie.apprenant@edupulse.com',
    password: 'apprenant123',
    role: 'APPRENANT' as const,
  },
  trainer: {
    email: 'jean.formateur@edupulse.com',
    password: 'formateur123',
    role: 'FORMATEUR' as const,
  },
  admin: {
    email: 'admin@edupulse.com',
    password: 'admin123',
    role: 'ADMINISTRATEUR' as const,
  },
}

const tokenCache = new Map<string, string>()

export function baseUrl() {
  return getTestBaseUrl()
}

export async function serverIsUp(url = baseUrl()) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual' })
    return res.status > 0
  } catch {
    return false
  }
}

export async function api(
  path: string,
  opts: RequestInit & { token?: string | null } = {},
) {
  const headers = new Headers(opts.headers || {})
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`)
  if (opts.body && !headers.has('Content-Type') && typeof opts.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  const { token: _t, ...rest } = opts
  return fetch(`${baseUrl()}${path}`, { ...rest, headers })
}

async function resolveUserId(email: string): Promise<number | null> {
  if (!process.env.DATABASE_URL) return null
  try {
    const pkg = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const pg = await import('pg')
    const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL })
    const prisma = new pkg.PrismaClient({ adapter: new PrismaPg(pool) })
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    await prisma.$disconnect()
    await pool.end()
    return user?.id ?? null
  } catch {
    return null
  }
}

/** Prefer signed JWT (no rate-limit); fallback to /api/auth/login. */
export async function loginAs(user: TestUser): Promise<{ token: string; user: any } | null> {
  const cacheKey = user.email
  if (tokenCache.has(cacheKey)) {
    return { token: tokenCache.get(cacheKey)!, user: { email: user.email, role: user.role } }
  }

  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) {
    const userId = user.userId ?? (await resolveUserId(user.email))
    if (userId) {
      const token = jwt.sign(
        { userId, email: user.email, role: user.role },
        secret,
        { expiresIn: '2h' },
      )
      tokenCache.set(cacheKey, token)
      return { token, user: { id: userId, email: user.email, role: user.role } }
    }
  }

  const res = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: user.email, password: user.password }),
  })
  if (res.status === 429) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Login failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  tokenCache.set(cacheKey, data.token)
  return data
}
