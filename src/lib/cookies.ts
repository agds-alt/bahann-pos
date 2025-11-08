import { cookies } from 'next/headers'
import { serialize, parse } from 'cookie'

/**
 * Cookie configuration for auth token
 */
const AUTH_COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * Set auth token in httpOnly cookie (Server-side only)
 * This is secure against XSS attacks
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,     // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',    // CSRF protection
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Get auth token from httpOnly cookie (Server-side only)
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)
  return token?.value || null
}

/**
 * Delete auth cookie (Server-side only)
 */
export async function deleteAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

/**
 * Serialize cookie for Set-Cookie header (for API routes)
 */
export function serializeAuthCookie(token: string): string {
  return serialize(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Serialize delete cookie for Set-Cookie header (for API routes)
 */
export function serializeDeleteAuthCookie(): string {
  return serialize(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

/**
 * Parse auth token from cookie header string
 */
export function parseAuthCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = parse(cookieHeader)
  return cookies[AUTH_COOKIE_NAME] || null
}
