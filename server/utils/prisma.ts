import pkg from '@prisma/client'
const { PrismaClient, Prisma } = pkg
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function clientLooksFresh(cached: any) {
  if (!cached) return false
  if (typeof cached.certificate?.findMany !== 'function') return false

  // Schema drift: User.loginAlerts was added — drop stale in-memory client
  const enumHasLoginAlerts = !!(Prisma as any)?.UserScalarFieldEnum?.loginAlerts
  if (enumHasLoginAlerts && !(globalThis as any).__prismaHasLoginAlerts) {
    return false
  }
  return true
}

function getPrismaClient() {
  const cached = (globalThis as any).prisma as any
  if (clientLooksFresh(cached)) {
    return cached
  }

  try {
    cached?.$disconnect?.()
  } catch {
    /* ignore */
  }

  const client = createPrismaClient()
  ;(globalThis as any).prisma = client
  ;(globalThis as any).__prismaHasLoginAlerts = !!(Prisma as any)?.UserScalarFieldEnum?.loginAlerts
  return client
}

// Always resolve through getter so a stale cached client is refreshed after prisma generate
export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_target, prop) {
    const client = getPrismaClient() as any
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
