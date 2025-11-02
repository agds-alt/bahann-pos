import Redis from 'ioredis'

let redisClient: Redis | null = null

/**
 * Get singleton Redis client
 * Session TTL: 7 days (604800 seconds)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis connected successfully')
    })
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
 * Create session in Redis
 */
export async function createSession(
  userId: string,
  data: Omit<SessionData, 'userId' | 'createdAt' | 'lastAccessedAt'>
): Promise<void> {
  const redis = getRedisClient()
  const now = Date.now()

  const sessionData: SessionData = {
    userId,
    ...data,
    createdAt: now,
    lastAccessedAt: now,
  }

  await redis.setex(`session:${userId}`, SESSION_TTL, JSON.stringify(sessionData))
}

/**
 * Get session from Redis
 */
export async function getSession(userId: string): Promise<SessionData | null> {
  const redis = getRedisClient()
  const data = await redis.get(`session:${userId}`)

  if (!data) return null

  const session = JSON.parse(data) as SessionData

  // Update last accessed time
  session.lastAccessedAt = Date.now()
  await redis.setex(`session:${userId}`, SESSION_TTL, JSON.stringify(session))

  return session
}

/**
 * Delete session from Redis
 */
export async function deleteSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  await redis.del(`session:${userId}`)
}

/**
 * Extend session TTL (refresh on activity)
 */
export async function extendSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  await redis.expire(`session:${userId}`, SESSION_TTL)
}
