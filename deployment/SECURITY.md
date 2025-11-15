# Security Audit & Best Practices

Comprehensive security guide for AGDS Corp POS production deployment.

## Table of Contents

1. [Security Checklist](#security-checklist)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Security](#api-security)
4. [Data Security](#data-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Secrets Management](#secrets-management)
7. [Security Headers](#security-headers)
8. [Rate Limiting](#rate-limiting)
9. [Input Validation](#input-validation)
10. [Security Monitoring](#security-monitoring)
11. [Incident Response](#incident-response)
12. [Compliance](#compliance)

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets rotated and strong
- [ ] No credentials in code or git history
- [ ] Environment variables properly configured
- [ ] Security headers enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention enabled
- [ ] CSRF protection for forms
- [ ] Dependencies security audit passed
- [ ] No exposed admin panels
- [ ] Error messages don't leak information

### Post-Deployment

- [ ] SSL/TLS verified (HTTPS only)
- [ ] Security headers confirmed active
- [ ] Authentication working correctly
- [ ] Failed login attempts logged
- [ ] Error tracking configured
- [ ] Security monitoring active
- [ ] Backup strategy tested
- [ ] Incident response plan ready

---

## Authentication & Authorization

### JWT Security

**Current Implementation:**
- JWT-based authentication
- 7-day token expiration
- Optional Redis session storage

**Security Measures:**

1. **Strong Secrets**
```bash
# Generate secure JWT_SECRET
openssl rand -base64 32
```

2. **Token Validation**
```typescript
// Always verify JWT on server side
import jwt from 'jsonwebtoken'

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    // Invalid or expired token
    return null
  }
}
```

3. **Secure Cookie Settings**
```typescript
// Set JWT in secure HTTP-only cookie
response.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`)
```

### Password Security

**Requirements:**
- Minimum 8 characters
- BCrypt hashing (cost factor 10+)
- No password hints
- No plaintext storage

**Implementation:**
```typescript
import bcrypt from 'bcryptjs'

// Hash password
const hash = await bcrypt.hash(password, 12)

// Verify password
const isValid = await bcrypt.compare(password, hash)
```

### Session Management

**Best Practices:**
- Store sessions in Redis (ephemeral)
- Invalidate on logout
- Automatic expiration (7 days)
- Refresh on activity
- Limit concurrent sessions (optional)

### Authorization

**Role-Based Access Control (RBAC):**

```typescript
// Middleware to check permissions
export function requireRole(allowedRoles: string[]) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
```

**Supabase Row Level Security (RLS):**

Enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see products from their outlets
CREATE POLICY "Users see own outlet products" ON products
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM users WHERE outlet_id = products.outlet_id
  ));

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admin full access" ON products
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## API Security

### Rate Limiting

**Implementation:**

Already configured in `src/middleware.ts`:

```typescript
// 100 requests per minute per IP
const RATE_LIMIT = 100
const WINDOW = 60 // seconds
```

**Bypass for trusted IPs (optional):**

```typescript
const TRUSTED_IPS = ['1.2.3.4', '5.6.7.8']

if (TRUSTED_IPS.includes(ip)) {
  return NextResponse.next()
}
```

### CORS Configuration

**Restrict origins in production:**

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NEXT_PUBLIC_APP_URL || '*'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization'
        }
      ]
    }
  ]
}
```

### API Key Management

For third-party integrations:

```typescript
// Validate API key
function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key')

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
}
```

---

## Data Security

### Encryption at Rest

**Supabase (PostgreSQL):**
- Automatic encryption at rest
- TLS 1.2+ for connections
- Encrypted backups

**Redis/Upstash:**
- TLS enabled by default
- Encrypted data at rest

### Encryption in Transit

**Enforce HTTPS:**

```typescript
// next.config.ts
async redirects() {
  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: 'http',
        },
      ],
      destination: 'https://pos.yourdomain.com/:path*',
      permanent: true,
    },
  ]
}
```

### Sensitive Data Handling

**Never log:**
- Passwords
- API keys
- JWT tokens
- Credit card numbers
- Social security numbers

**Sanitize logs:**

```typescript
function sanitizeLog(data: any) {
  const sensitive = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card']

  return Object.keys(data).reduce((acc, key) => {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      acc[key] = '[REDACTED]'
    } else {
      acc[key] = data[key]
    }
    return acc
  }, {})
}
```

### PII (Personally Identifiable Information)

**GDPR Compliance (if applicable):**

1. **Data Minimization**: Only collect necessary data
2. **Right to Access**: Users can request their data
3. **Right to Deletion**: Users can delete their account
4. **Data Portability**: Export user data in machine-readable format
5. **Consent**: Get explicit consent for data processing

**Implementation:**

```typescript
// Export user data
export async function exportUserData(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return {
    user: sanitizeForExport(data),
    transactions: await getUserTransactions(userId),
    // ... other user data
  }
}

// Delete user account
export async function deleteUserAccount(userId: string) {
  // Soft delete or anonymize
  await supabase
    .from('users')
    .update({ deleted_at: new Date(), email: null, name: 'Deleted User' })
    .eq('id', userId)
}
```

---

## Infrastructure Security

### Vercel Security

**Built-in Security:**
- ✅ DDoS protection
- ✅ SSL/TLS certificates (automatic)
- ✅ Edge network
- ✅ Environment variable encryption
- ✅ Git integration security

**Additional Configuration:**

1. **Deployment Protection**
   - Go to Project Settings → Deployment Protection
   - Enable Vercel Authentication for preview deployments

2. **Environment Variables**
   - Never use `NEXT_PUBLIC_` for secrets
   - Separate production/preview/development values

3. **Access Control**
   - Limit team member permissions
   - Use least privilege principle

### Supabase Security

**Database Security:**

1. **Enable RLS on all tables**
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ... etc
```

2. **Network Restrictions** (optional)
   - Configure IP allowlist
   - Restrict database access to known IPs

3. **Database Roles**
   - Use service_role key only on server
   - Never expose service_role key to client

### Redis/Upstash Security

**Configuration:**

1. **TLS Enabled**
   - Always use `rediss://` (TLS) not `redis://`

2. **Strong Password**
   - Use complex password (auto-generated by Upstash)

3. **Network Security**
   - Upstash automatically restricts access
   - No public internet access

---

## Secrets Management

### Environment Variable Security

**Best Practices:**

1. **Different values per environment**
```bash
# Development
JWT_SECRET=dev-secret-not-secure

# Production
JWT_SECRET=<strong-random-32-char-secret>
```

2. **Rotation Schedule**

| Secret | Frequency | Last Rotated | Next Due |
|--------|-----------|--------------|----------|
| JWT_SECRET | 90 days | - | - |
| API_KEY | 90 days | - | - |
| WEBHOOK_SECRET | 90 days | - | - |

3. **Access Control**
   - Limit who can view production secrets
   - Use Vercel teams/roles

### Secret Rotation

**Rotate JWT_SECRET:**

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# 2. Add to Vercel (keep old one for grace period)
vercel env add JWT_SECRET_NEW production

# 3. Update code to check both secrets
# 4. After 7 days (token TTL), remove old secret
vercel env rm JWT_SECRET production
vercel env rename JWT_SECRET_NEW JWT_SECRET production
```

---

## Security Headers

### Already Configured

In `next.config.ts`:

```typescript
headers: [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### Content Security Policy (CSP)

**Add to headers:**

```typescript
{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://*.upstash.io;
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim()
}
```

### Test Security Headers

```bash
# Using securityheaders.com
curl -I https://pos.yourdomain.com | grep -E "(X-|Strict|Content-Security)"

# Or use online tool
https://securityheaders.com/?q=pos.yourdomain.com
```

---

## Rate Limiting

### Already Implemented

See `src/middleware.ts` - 100 requests/minute per IP.

### Enhanced Rate Limiting

**Different limits per endpoint:**

```typescript
const RATE_LIMITS = {
  '/api/auth/login': { limit: 5, window: 60 }, // 5 per minute
  '/api/auth/register': { limit: 3, window: 60 }, // 3 per minute
  '/api/transactions': { limit: 100, window: 60 }, // 100 per minute
  '/api/products': { limit: 200, window: 60 }, // 200 per minute
}
```

**IP-based blocking:**

```typescript
// Block after repeated violations
if (violations > 10) {
  await redis.setex(`blocked:${ip}`, 3600, 'true') // 1 hour block
}
```

---

## Input Validation

### Zod Schemas

Already implemented in `src/shared/schemas/`.

**Example:**

```typescript
import { z } from 'zod'

const CreateProductSchema = z.object({
  sku: z.string().min(1).max(50).regex(/^[A-Z0-9-]+$/),
  name: z.string().min(1).max(200),
  price: z.number().positive().max(1000000000),
})
```

### SQL Injection Prevention

**Using Supabase:**
- ✅ Automatic parameterization
- ✅ No raw SQL in application code
- ✅ RLS policies prevent unauthorized access

**Example (safe):**

```typescript
// ✅ Safe: Parameterized query
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('sku', userInput)
```

### XSS Prevention

**React Default Protection:**
- ✅ Automatic escaping of JSX
- ✅ `dangerouslySetInnerHTML` avoided

**Sanitize User Content:**

```typescript
import DOMPurify from 'dompurify'

function sanitizeHTML(dirty: string) {
  return DOMPurify.sanitize(dirty)
}
```

---

## Security Monitoring

### Failed Login Attempts

**Log and alert on suspicious activity:**

```typescript
// Log failed login
await supabase.from('security_logs').insert({
  event: 'failed_login',
  user_email: email,
  ip_address: ip,
  user_agent: userAgent,
  timestamp: new Date(),
})

// Alert after 5 failures
const failures = await getFailedAttempts(email, last5Minutes)
if (failures >= 5) {
  await sendSecurityAlert({
    type: 'brute_force_attempt',
    email,
    ip,
  })
}
```

### Audit Logging

**Already implemented** in `src/lib/audit.ts`.

Track all critical operations:
- User creation/deletion
- Permission changes
- Data modifications
- Failed access attempts

### Security Scanning

**Regular Scans:**

```bash
# Dependency vulnerabilities
npm audit

# Fix issues
npm audit fix

# OWASP ZAP (GUI tool)
# Download from https://www.zaproxy.org/

# Snyk (automated)
npm install -g snyk
snyk test
```

---

## Incident Response

### Security Incident Playbook

**1. Detection**
- Automated alerts
- User reports
- Security monitoring

**2. Assessment**
- Severity: Critical/High/Medium/Low
- Scope: Affected systems/data
- Impact: User/business impact

**3. Containment**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs

**4. Eradication**
- Identify root cause
- Remove malicious code
- Patch vulnerabilities

**5. Recovery**
- Restore from backups if needed
- Verify system integrity
- Resume normal operations

**6. Post-Incident**
- Document incident
- Update security measures
- Improve detection/prevention

### Common Incidents

**Compromised Credentials:**
1. Revoke all user sessions
2. Reset password
3. Review access logs
4. Notify user

**Data Breach:**
1. Assess extent of breach
2. Notify affected users (legally required)
3. Review access logs
4. Strengthen security

**DDoS Attack:**
1. Vercel handles mitigation automatically
2. Monitor for application-level attacks
3. Implement additional rate limiting if needed

---

## Compliance

### GDPR (if applicable)

**Requirements:**
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data export functionality
- [ ] Right to deletion implemented
- [ ] Data retention policy defined
- [ ] Data processing agreements signed

### PCI DSS (if handling payments)

**Important:** Do NOT store credit card numbers.
Use payment processor (Stripe, etc.) for PCI compliance.

### Data Retention

**Policy:**

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| User accounts | Until deletion request | Soft delete + anonymize |
| Transactions | 7 years (tax law) | Archive then delete |
| Audit logs | 1 year | Permanent delete |
| Session data | 7 days (Redis TTL) | Automatic expiration |
| Backup data | 30 days | Encrypted deletion |

---

## Security Best Practices Summary

### Do's ✅

- Use strong, random secrets (32+ characters)
- Rotate secrets every 90 days
- Enable RLS on all Supabase tables
- Validate all user inputs
- Use HTTPS everywhere
- Implement rate limiting
- Log security events
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper error handling
- Use security headers
- Monitor for suspicious activity

### Don'ts ❌

- Never commit secrets to git
- Never log sensitive data
- Never trust user input
- Never expose server-only secrets to client
- Never use weak passwords
- Never disable security features
- Never ignore security updates
- Never share production credentials
- Never skip security testing
- Never use HTTP in production

---

## Security Review Schedule

### Daily
- [ ] Review error logs for anomalies
- [ ] Check failed login attempts
- [ ] Monitor traffic patterns

### Weekly
- [ ] Review security alerts
- [ ] Check dependency updates
- [ ] Audit access logs

### Monthly
- [ ] Run security scan (npm audit)
- [ ] Review user permissions
- [ ] Test backup restoration
- [ ] Review incident response plan

### Quarterly
- [ ] Rotate secrets
- [ ] Full security audit
- [ ] Penetration testing (optional)
- [ ] Update security documentation

---

## External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security](https://vercel.com/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated:** November 15, 2025
**Next Security Audit:** February 2026
