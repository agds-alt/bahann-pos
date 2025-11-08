import { cookies } from 'next/headers'
import { serialize, parse } from 'cookie'

/**
 * Cookie configuration for auth tokens
 */
const AUTH_COOKIE_NAME = 'auth_token'
const REFRESH_COOKIE_NAME = 'refresh_token'
const AUTH_COOKIE_MAX_AGE = 30 * 60 // 30 minutes in seconds (short-lived)
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds (long-lived)

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
    maxAge: AUTH_COOKIE_MAX_AGE,
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
    maxAge: AUTH_COOKIE_MAX_AGE,
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

// ============================================================================
// Refresh Token Cookie Management
// ============================================================================

/**
 * Set refresh token in httpOnly cookie (Server-side only)
 * Refresh tokens are long-lived (30 days) for token rotation
 */
export async function setRefreshCookie(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,     // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',    // CSRF protection
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Get refresh token from httpOnly cookie (Server-side only)
 */
export async function getRefreshCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(REFRESH_COOKIE_NAME)
  return token?.value || null
}

/**
 * Delete refresh cookie (Server-side only)
 */
export async function deleteRefreshCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(REFRESH_COOKIE_NAME)
}

/**
 * Serialize refresh cookie for Set-Cookie header (for API routes)
 */
export function serializeRefreshCookie(token: string): string {
  return serialize(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Serialize delete refresh cookie for Set-Cookie header (for API routes)
 */
export function serializeDeleteRefreshCookie(): string {
  return serialize(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

/**
 * Parse refresh token from cookie header string
 */
export function parseRefreshCookieFromHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = parse(cookieHeader)
  return cookies[REFRESH_COOKIE_NAME] || null
}
