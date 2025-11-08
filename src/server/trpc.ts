import { initTRPC, TRPCError } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'
import { verifyJWT, JWTPayload } from '@/lib/jwt'
import { getRedisClient } from '@/lib/redis'
import { parseAuthCookieFromHeader } from '@/lib/cookies'
import { logger } from '@/lib/logger'

/**
 * Session data interface
 */
export interface SessionData extends JWTPayload {
  userId: string
  email: string
  name: string
  role?: string
  outletId?: string
}

/**
 * tRPC Context
 * Contains user session and request info
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  // Get token from httpOnly cookie (primary method)
  const cookieHeader = opts.req.headers.get('cookie')
  let token = parseAuthCookieFromHeader(cookieHeader)

  // Fallback: Check Authorization header (for API compatibility during migration)
  if (!token) {
    token = opts.req.headers.get('authorization')?.replace('Bearer ', '') || null
  }

  let userId: string | null = null
  let session: SessionData | null = null

  if (token) {
    try {
      const decoded = verifyJWT(token)
      userId = decoded.userId

      // Try to get session from Redis (optional)
      const redis = getRedisClient()
      if (redis) {
        try {
          const sessionData = await redis.get(`session:${userId}`)
          if (sessionData) {
            session = JSON.parse(sessionData)
          }
        } catch (error) {
          // Continue without Redis session, JWT is enough
          logger.debug('Failed to get session from Redis', { error })
        }
      }

      // If no Redis session, create a minimal session from JWT
      if (!session) {
        session = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          outletId: decoded.outletId,
        }
      }
    } catch (error) {
      // Invalid token, continue as unauthenticated
      logger.debug('Token verification failed', { error })
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

/**
 * Admin procedure - requires authentication AND admin role
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || !ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  // Check if user has admin role
  if (ctx.session.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource. Admin role required.',
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
