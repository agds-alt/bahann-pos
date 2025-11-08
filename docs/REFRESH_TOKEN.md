# Refresh Token Rotation System

## Overview

This document describes the refresh token rotation system for improved authentication security. Refresh token rotation allows for long-lived sessions while keeping access tokens short-lived, significantly reducing the impact of token theft.

## Why Refresh Tokens?

### Current System (Simple JWT)
- Single JWT token with 7-day expiry
- If token is stolen, attacker has 7 days of access
- No way to revoke token without database
- User stays logged in for full 7 days even after security breach

### With Refresh Tokens
- Short-lived access token (30 minutes)
- Long-lived refresh token (30 days)
- If access token is stolen, only 30 minutes of access
- Refresh tokens can be revoked immediately
- Support for "logout from all devices"
- Better security posture

## Architecture

### Token Types

**Access Token (JWT)**:
- Expiry: 30 minutes
- Stored: httpOnly cookie
- Used for: API authentication
- Contains: user ID, email, name, role, outlet

**Refresh Token**:
- Expiry: 30 days
- Stored: httpOnly cookie (separate from access token)
- Used for: Getting new access tokens
- One-time use (rotation on each refresh)

### Security Features

1. **Token Rotation**: Each time a refresh token is used, it's invalidated and a new one is issued
2. **Reuse Detection**: If a refresh token is used twice, all tokens for that user are revoked (potential breach)
3. **Token Hashing**: Refresh tokens are SHA-256 hashed before storage (never store plain tokens)
4. **Device Tracking**: Optional tracking of device info and IP for monitoring
5. **Manual Revocation**: Users can revoke specific tokens or all tokens
6. **Automatic Cleanup**: Expired and used tokens are automatically cleaned up

## Database Schema

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  device_info JSONB,
  ip_address VARCHAR(45)
);
```

## Setup

### 1. Run Database Migration

```bash
cd supabase/migrations
psql -h your-supabase-host -U postgres -d postgres -f 006_refresh_tokens.sql
```

Or in Supabase Dashboard:
1. Go to **SQL Editor**
2. Copy contents of `supabase/migrations/006_refresh_tokens.sql`
3. Execute the query

### 2. Update Environment Variables (Optional)

```env
# Optional: Configure token expiry
JWT_ACCESS_TOKEN_EXPIRY=30m      # 30 minutes (default)
JWT_REFRESH_TOKEN_EXPIRY=30d     # 30 days (default)
```

### 3. Verify Installation

```sql
-- Check table exists
SELECT * FROM refresh_tokens LIMIT 1;

-- Check indexes
\d refresh_tokens

-- Check cleanup function
SELECT cleanup_expired_refresh_tokens();
```

## Usage

### Creating Tokens (Login)

```typescript
import { createRefreshToken } from '@/lib/refreshToken'

// On successful login
const { refreshToken, accessToken } = await createRefreshToken(userId, {
  deviceInfo: {
    userAgent: req.headers.get('user-agent'),
    platform: 'web',
  },
  ipAddress: req.headers.get('x-forwarded-for'),
})

// Set cookies
await setAuthCookie(accessToken)         // Access token (30 min)
await setRefreshCookie(refreshToken)     // Refresh token (30 days)
```

### Token Rotation (Refresh)

```typescript
import { rotateRefreshToken } from '@/lib/refreshToken'

// When access token expires
try {
  const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
    await rotateRefreshToken(currentRefreshToken)

  // Set new cookies
  await setAuthCookie(newAccessToken)
  await setRefreshCookie(newRefreshToken)
} catch (error) {
  // Invalid/expired/revoked token - redirect to login
  redirect('/login')
}
```

### Revoking Tokens (Logout)

```typescript
import { revokeRefreshToken, revokeAllUserTokens } from '@/lib/refreshToken'

// Logout from current device
await revokeRefreshToken(refreshToken)
await deleteAuthCookie()
await deleteRefreshCookie()

// Logout from all devices (password change, security breach)
await revokeAllUserTokens(userId)
```

### Listing Active Sessions

```typescript
import { getUserActiveTokens } from '@/lib/refreshToken'

// Get user's active sessions
const sessions = await getUserActiveTokens(userId)

// Display to user
sessions.forEach(session => {
  console.log({
    device: session.deviceInfo?.userAgent,
    ip: session.ipAddress,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  })
})
```

## Implementation Checklist

### Backend (Complete)
- [x] Create `refresh_tokens` table migration
- [x] Implement `createRefreshToken()` function
- [x] Implement `rotateRefreshToken()` function
- [x] Implement `revokeRefreshToken()` function
- [x] Implement `revokeAllUserTokens()` function
- [x] Add token cleanup function

### Backend (TODO)
- [ ] Add refresh endpoint to auth router
- [ ] Update login to create refresh tokens
- [ ] Update JWT expiry to 30 minutes
- [ ] Add refresh cookie management
- [ ] Add middleware to auto-refresh tokens

### Frontend (TODO)
- [ ] Add token refresh logic to tRPC client
- [ ] Auto-refresh before access token expires
- [ ] Handle refresh failures (redirect to login)
- [ ] Add "Active Sessions" page
- [ ] Add "Logout from all devices" button

## API Endpoints

### POST `/api/trpc/auth.refresh` (TODO)

Refresh access token using refresh token.

**Input**:
```typescript
{
  // Refresh token from httpOnly cookie
}
```

**Output**:
```typescript
{
  success: true,
  accessToken: "new-jwt-token"
}
```

**Cookies Set**:
- `auth_token`: New access token (httpOnly, 30 min)
- `refresh_token`: New refresh token (httpOnly, 30 days)

### POST `/api/trpc/auth.revokeAllSessions` (TODO)

Revoke all refresh tokens for current user (logout from all devices).

**Input**:
```typescript
{
  userId: string
}
```

**Output**:
```typescript
{
  success: true,
  revokedCount: number
}
```

### GET `/api/trpc/auth.getActiveSessions` (TODO)

Get all active sessions for current user.

**Output**:
```typescript
{
  sessions: [
    {
      id: string
      createdAt: Date
      expiresAt: Date
      deviceInfo: {
        userAgent: string
        platform: string
      }
      ipAddress: string
      isCurrent: boolean
    }
  ]
}
```

## Client-Side Implementation

### Auto-Refresh Pattern

```typescript
// src/lib/trpc/client.ts

let refreshTimer: NodeJS.Timeout | null = null

// Schedule refresh 5 minutes before expiry
function scheduleTokenRefresh(expiresIn: number) {
  if (refreshTimer) clearTimeout(refreshTimer)

  const refreshTime = expiresIn - 5 * 60 * 1000 // 5 min before expiry
  refreshTimer = setTimeout(async () => {
    try {
      await trpc.auth.refresh.mutate()
      // Schedule next refresh
      scheduleTokenRefresh(30 * 60 * 1000) // 30 minutes
    } catch (error) {
      // Refresh failed - redirect to login
      window.location.href = '/login'
    }
  }, refreshTime)
}

// Start auto-refresh on login
scheduleTokenRefresh(30 * 60 * 1000) // 30 minutes
```

### Handling Refresh Failures

```typescript
// tRPC link with automatic refresh
import { httpBatchLink } from '@trpc/client'

const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      async fetch(url, options) {
        const response = await fetch(url, options)

        // If 401 Unauthorized, try to refresh
        if (response.status === 401) {
          try {
            await trpc.auth.refresh.mutate()
            // Retry original request
            return fetch(url, options)
          } catch {
            // Refresh failed - redirect to login
            window.location.href = '/login'
          }
        }

        return response
      },
    }),
  ],
})
```

## Security Considerations

### Best Practices

1. **Always hash refresh tokens** before storing in database
2. **Use httpOnly cookies** for both access and refresh tokens
3. **Implement token rotation** on each refresh
4. **Detect and handle reuse** of refresh tokens
5. **Revoke all tokens** on password change
6. **Track device info** for security monitoring
7. **Set reasonable expiries** (30 min access, 30 days refresh)
8. **Cleanup expired tokens** regularly

### Attack Scenarios

**Scenario 1: Access Token Stolen**
- Impact: 30 minutes of unauthorized access
- Mitigation: Short expiry limits damage

**Scenario 2: Refresh Token Stolen**
- Impact: Attacker can refresh tokens
- Mitigation: Rotation makes stolen token useless after first use

**Scenario 3: Refresh Token Reused**
- Detection: `used_at` field tracks usage
- Response: Revoke all user tokens immediately

**Scenario 4: Password Change**
- Action: Call `revokeAllUserTokens(userId)`
- Result: All devices logged out, must login again

## Monitoring & Alerts

### Key Metrics to Monitor

```sql
-- Tokens created per day
SELECT DATE(created_at), COUNT(*)
FROM refresh_tokens
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Tokens rotated per day
SELECT DATE(used_at), COUNT(*)
FROM refresh_tokens
WHERE used_at IS NOT NULL
GROUP BY DATE(used_at)
ORDER BY DATE(used_at) DESC;

-- Reuse detection events
SELECT COUNT(*)
FROM audit_logs
WHERE action = 'SECURITY_ALERT'
AND metadata->>'type' = 'token_reuse';

-- Active sessions per user
SELECT user_id, COUNT(*)
FROM refresh_tokens
WHERE expires_at > NOW()
AND revoked_at IS NULL
AND used_at IS NULL
GROUP BY user_id
ORDER BY COUNT(*) DESC;
```

### Alerts to Configure

1. **Token Reuse Detection**: Alert on any token reuse attempt
2. **Unusual Session Count**: Alert if user has >10 active sessions
3. **Failed Refresh Attempts**: Alert on high failure rate
4. **IP Changes**: Alert on rapid IP changes for same token

## Maintenance

### Daily Cleanup (Automated)

```sql
-- Via pg_cron (if available)
SELECT cron.schedule(
  'cleanup-refresh-tokens',
  '0 3 * * *',  -- Every day at 3 AM
  $$SELECT cleanup_expired_refresh_tokens()$$
);
```

Or run manually:
```sql
SELECT cleanup_expired_refresh_tokens();
```

### Manual Cleanup (If Needed)

```sql
-- Delete all expired tokens
DELETE FROM refresh_tokens
WHERE expires_at < NOW();

-- Delete all used tokens older than 7 days
DELETE FROM refresh_tokens
WHERE used_at IS NOT NULL
AND used_at < NOW() - INTERVAL '7 days';

-- Delete all revoked tokens older than 30 days
DELETE FROM refresh_tokens
WHERE revoked_at IS NOT NULL
AND revoked_at < NOW() - INTERVAL '30 days';
```

## Migration Path

### From Current JWT System

1. **Phase 1**: Set up database and backend code (current status)
   - Run migration
   - Deploy refresh token functions
   - Keep existing JWT system running

2. **Phase 2**: Update authentication endpoints
   - Modify login to create refresh tokens
   - Add refresh endpoint
   - Keep access tokens long-lived (7 days) initially

3. **Phase 3**: Add client-side auto-refresh
   - Implement auto-refresh logic
   - Test thoroughly in staging

4. **Phase 4**: Shorten access token expiry
   - Reduce to 30 minutes
   - Monitor for issues
   - Rollback if needed

5. **Phase 5**: Add advanced features
   - Active sessions page
   - Device management
   - Security alerts

## Troubleshooting

### Issue: "Refresh token already used"

**Cause**: Token rotation was used twice (possible attack or client issue)

**Solution**:
1. All user tokens are automatically revoked
2. User must login again
3. Check logs for IP/device info
4. Investigate if it's an attack or client bug

### Issue: Refresh fails silently

**Cause**: Missing refresh token cookie

**Solution**:
1. Check cookie configuration (httpOnly, secure, sameSite)
2. Verify cookie is being sent with requests
3. Check browser DevTools → Application → Cookies

### Issue: Too many active sessions

**Cause**: Tokens not being cleaned up

**Solution**:
1. Run `cleanup_expired_refresh_tokens()`
2. Set up automated cleanup with pg_cron
3. Implement session limit per user (e.g., max 5 devices)

## Testing

### Manual Testing

1. **Login Flow**:
   - Login → Check cookies for access + refresh token
   - Verify access token expires in 30 min
   - Verify refresh token expires in 30 days

2. **Token Refresh**:
   - Wait for access token to expire
   - Make API request → Should auto-refresh
   - Check that old refresh token is marked as `used_at`

3. **Token Reuse**:
   - Save a refresh token
   - Use it once (should work)
   - Use it again (should fail and revoke all tokens)

4. **Logout**:
   - Logout → Verify tokens are revoked
   - Try to use old refresh token (should fail)

### Automated Testing

```typescript
// Test token creation
test('should create refresh token', async () => {
  const tokens = await createRefreshToken(userId)
  expect(tokens.accessToken).toBeDefined()
  expect(tokens.refreshToken).toBeDefined()
})

// Test token rotation
test('should rotate refresh token', async () => {
  const { refreshToken } = await createRefreshToken(userId)
  const newTokens = await rotateRefreshToken(refreshToken)

  expect(newTokens.refreshToken).not.toBe(refreshToken)
  expect(newTokens.accessToken).toBeDefined()
})

// Test reuse detection
test('should detect token reuse', async () => {
  const { refreshToken } = await createRefreshToken(userId)

  await rotateRefreshToken(refreshToken) // First use
  await expect(rotateRefreshToken(refreshToken)).rejects.toThrow(
    'already used'
  )
})
```

## Performance Considerations

- **Database Queries**: Indexed on `token_hash` for O(1) lookups
- **Cookie Size**: Refresh tokens add ~100 bytes to cookie size
- **Cleanup**: Run during off-peak hours (3 AM recommended)
- **Rotation Overhead**: Minimal (~10ms per refresh)

## Compliance

This refresh token system helps meet:

- **OWASP**: Short-lived tokens, token rotation
- **OAuth 2.0**: Follows refresh token best practices
- **GDPR**: Users can view/revoke active sessions
- **SOC 2**: Audit trail for token usage

## Resources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OWASP Token Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)

## Summary

**Status**: Infrastructure ready, implementation pending

**What's Done**:
- ✅ Database migration created
- ✅ Core functions implemented
- ✅ Security measures in place
- ✅ Documentation complete

**Next Steps**:
- [ ] Add tRPC refresh endpoint
- [ ] Update login flow
- [ ] Add client-side auto-refresh
- [ ] Test thoroughly
- [ ] Deploy incrementally

**Key Benefits**:
- 30-minute access tokens (reduced attack window from 7 days)
- Token rotation on each refresh (security)
- Revocation support (logout from all devices)
- Device tracking (security monitoring)
- Auto-cleanup (maintenance)
