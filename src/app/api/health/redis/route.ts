/**
 * Redis Health Check Endpoint
 * Verifies Redis connection and performance
 *
 * GET /api/health/redis
 */

import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const redis = getRedisClient()

  if (!redis) {
    return NextResponse.json({
      status: 'not_configured',
      message: 'Redis not configured. Session management will use JWT only.',
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }

  try {
    const startTime = Date.now()

    // Test 1: Ping
    const pingStart = Date.now()
    await redis.ping()
    const pingTime = Date.now() - pingStart

    // Test 2: Write operation
    const writeStart = Date.now()
    const testKey = `health-check-${Date.now()}`
    await redis.set(testKey, 'ok', 'EX', 10)
    const writeTime = Date.now() - writeStart

    // Test 3: Read operation
    const readStart = Date.now()
    const result = await redis.get(testKey)
    const readTime = Date.now() - readStart

    // Test 4: Delete operation
    const deleteStart = Date.now()
    await redis.del(testKey)
    const deleteTime = Date.now() - deleteStart

    const totalTime = Date.now() - startTime

    if (result !== 'ok') {
      throw new Error('Redis test failed: value mismatch')
    }

    // Get Redis info (optional)
    let info: any = {}
    try {
      const infoStr = await redis.info('server')
      info = {
        version: infoStr.match(/redis_version:(.+)/)?.[1]?.trim(),
      }
    } catch {
      // Info command might not be available
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Redis connection successful',
      timestamp: new Date().toISOString(),
      performance: {
        ping: `${pingTime}ms`,
        write: `${writeTime}ms`,
        read: `${readTime}ms`,
        delete: `${deleteTime}ms`,
        total: `${totalTime}ms`,
      },
      info,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  }
}
