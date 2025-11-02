import { initTRPC, TRPCError } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'
import { verifyJWT } from '@/lib/jwt'
import { getRedisClient } from '@/lib/redis'

/**
 * tRPC Context
 * Contains user session and request info
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const token = opts.req.headers.get('authorization')?.replace('Bearer ', '')

  let userId: string | null = null
  let session: any = null

  if (token) {
    try {
      const decoded = verifyJWT(token)
      userId = decoded.userId

      // Get session from Redis
      const redis = getRedisClient()
      const sessionData = await redis.get(`session:${userId}`)
      if (sessionData) {
        session = JSON.parse(sessionData)
      }
    } catch (error) {
      // Invalid token, continue as unauthenticated
      console.error('Token verification failed:', error)
    }
  }

  return {
    userId,
    session,
    req: opts.req,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

/**
 * Initialize tRPC with context and transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      session: ctx.session,
    },
  })
})
