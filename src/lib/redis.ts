import Redis from 'ioredis'
import { logger } from './logger'

let redisClient: Redis | null = null
let redisAvailable = true

/**
 * Get singleton Redis client
 * Session TTL: 7 days (604800 seconds)
 * Returns null if Redis is not available
 */
export function getRedisClient(): Redis | null {
  // If Redis is disabled or unavailable, return null
  if (!redisAvailable) return null

  if (!redisClient) {
    try {
      // Check if REDIS_URL is provided
      const redisUrl = process.env.REDIS_URL

      if (redisUrl) {
        // Use REDIS_URL if provided (Upstash, Heroku, etc.)
        redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            if (times > 3) {
              logger.warn('Redis connection failed, disabling Redis features')
              redisAvailable = false
              return null
            }
            const delay = Math.min(times * 50, 2000)
            return delay
          },
        })
      } else if (process.env.REDIS_HOST) {
        // Fallback to individual config
        redisClient = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            if (times > 3) {
              logger.warn('Redis connection failed, disabling Redis features')
              redisAvailable = false
              return null
            }
            const delay = Math.min(times * 50, 2000)
            return delay
          },
        })
      } else {
        // No Redis config found, disable Redis
        logger.info('No Redis configuration found, sessions will be JWT-only')
        redisAvailable = false
        return null
      }

      redisClient.on('error', (err) => {
        logger.error('Redis connection error', err)
        // Don't crash the app, just disable Redis
        redisAvailable = false
      })

      redisClient.on('connect', () => {
        logger.success('Redis connected successfully')
        redisAvailable = true
      })
    } catch (error) {
      logger.error('Failed to initialize Redis', error)
      redisAvailable = false
      return null
    }
  }

  return redisClient
}

/**
 * Session management utilities
 */
export const SESSION_TTL = 7 * 24 * 60 * 60 // 7 days in seconds

export interface SessionData {
  userId: string
  email: string
  name: string
  outletId?: string
  role?: string
  createdAt: number
  lastAccessedAt: number
}

/**
 * Create session in Redis (optional)
 * If Redis is not available, this will silently skip
 */
export async function createSession(
  userId: string,
  data: Omit<SessionData, 'userId' | 'createdAt' | 'lastAccessedAt'>
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) {
    logger.debug('Redis not available, skipping session creation')
    return
  }

  try {
    const now = Date.now()
    const sessionData: SessionData = {
      userId,
      ...data,
      createdAt: now,
      lastAccessedAt: now,
    }

    await redis.setex(`session:${userId}`, SESSION_TTL, JSON.stringify(sessionData))
  } catch (error) {
    logger.error('Failed to create session in Redis', error)
    // Don't throw, just log
  }
}

/**
 * Get session from Redis (optional)
 * Returns null if Redis is not available
 */
export async function getSession(userId: string): Promise<SessionData | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const data = await redis.get(`session:${userId}`)
    if (!data) return null

    const session = JSON.parse(data) as SessionData

    // Update last accessed time
    session.lastAccessedAt = Date.now()
    await redis.setex(`session:${userId}`, SESSION_TTL, JSON.stringify(session))

    return session
  } catch (error) {
    logger.error('Failed to get session from Redis', error)
    return null
  }
}

/**
 * Delete session from Redis (optional)
 */
export async function deleteSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.del(`session:${userId}`)
  } catch (error) {
    logger.error('Failed to delete session from Redis', error)
  }
}

/**
 * Extend session TTL (refresh on activity) (optional)
 */
export async function extendSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.expire(`session:${userId}`, SESSION_TTL)
  } catch (error) {
    logger.error('Failed to extend session in Redis', error)
  }
}
