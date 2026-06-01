import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const databaseEnabled = Boolean(process.env.DATABASE_URL)

let prismaClient: PrismaClient | undefined = globalForPrisma.prisma

function getPrismaClient(): PrismaClient {
  if (!databaseEnabled) {
    throw new Error(
      'DATABASE_URL is required to initialize Prisma. Set DATABASE_URL in your environment or Vercel project settings.'
    )
  }

  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient
    }
  }

  return prismaClient
}

export const prisma = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
}) as PrismaClient
