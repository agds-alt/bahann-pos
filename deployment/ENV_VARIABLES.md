# Production Environment Variables

## Required Variables

### Supabase (Database)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the values

**Security Notes:**
- `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (public, protected by RLS)
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **NEVER expose to client** (server-side only)

### Authentication
```bash
JWT_SECRET=your-generated-secret-min-32-chars
JWT_EXPIRY=7d
```

**Generate JWT_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Security Notes:**
- Must be at least 32 characters
- Use cryptographically random generation
- NEVER commit to git
- Rotate every 90 days

### Redis (Session Management)
```bash
REDIS_URL=redis://default:password@endpoint.upstash.io:port
REDIS_TOKEN=your-upstash-token
```

**Where to get:**
1. Go to [Upstash Console](https://console.upstash.com)
2. Create database: `agds-pos-production`
3. Copy Redis URL and Token from dashboard

**Optional (Upstash REST API):**
```bash
UPSTASH_REDIS_REST_URL=https://endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
```

### Application URLs
```bash
NEXT_PUBLIC_APP_URL=https://pos.yourdomain.com
NODE_ENV=production
```

**Important:**
- `NEXT_PUBLIC_APP_URL` must match your production domain
- Update after domain configuration
- Used for OAuth callbacks, redirects, etc.

## Optional Variables

### Error Tracking (Sentry)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=agds-pos
```

### Analytics
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTAG_ID=GTM-XXXXXXX
```

### Webhooks
```bash
WEBHOOK_SECRET=your-webhook-secret
```

**Generate:**
```bash
openssl rand -hex 32
```

### Feature Flags
```bash
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
MAINTENANCE_MODE=false
```

## Environment-Specific Configuration

### Production
- All variables listed above
- `NODE_ENV=production`
- Strong secrets
- Real database

### Preview (Staging)
- Same as production but with staging database
- Can use same Redis instance (different key prefix)
- `NODE_ENV=production` (build optimization)

### Development (Local)
- Use `.env.local` file
- Can use development Supabase project
- Optional Redis (app works without it)
- `NODE_ENV=development`

## Setting Environment Variables

### Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environment (Production/Preview/Development)
4. Save

### Vercel CLI
```bash
# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add JWT_SECRET production
vercel env add REDIS_URL production
vercel env add REDIS_TOKEN production
vercel env add NEXT_PUBLIC_APP_URL production

# Preview (optional)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
# ... repeat for preview
```

### Local Development
Create `.env.local`:
```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

## Security Best Practices

### ✅ Do's
- Use strong, random secrets
- Rotate secrets every 90 days
- Use different values per environment
- Store backup in encrypted password manager
- Limit access to production secrets
- Use Vercel's encrypted storage

### ❌ Don'ts
- Never commit secrets to git
- Never share secrets in Slack/email
- Never use weak or predictable secrets
- Never reuse secrets across projects
- Never log secret values
- Never expose server-only secrets to client

## Secret Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Due |
|--------|-------------------|--------------|----------|
| JWT_SECRET | 90 days | - | - |
| WEBHOOK_SECRET | 90 days | - | - |
| REDIS_TOKEN | 180 days | - | - |
| SUPABASE_SERVICE_ROLE_KEY | On compromise | - | - |

## Backup & Recovery

### Backup Environment Variables
```bash
# Export from Vercel
vercel env pull .env.production.backup

# Encrypt the backup
gpg -c .env.production.backup

# Store encrypted file securely
# DELETE unencrypted backup
rm .env.production.backup
```

### Restore from Backup
```bash
# Decrypt backup
gpg .env.production.backup.gpg

# Import to Vercel
vercel env add VARIABLE_NAME production < value
```

## Troubleshooting

### Issue: "Missing environment variable"
- Check if variable is set in Vercel dashboard
- Verify variable name matches exactly (case-sensitive)
- Redeploy after adding variables

### Issue: "Invalid JWT secret"
- Ensure JWT_SECRET is at least 32 characters
- Check for trailing spaces or newlines
- Regenerate if uncertain

### Issue: "Redis connection failed"
- Verify REDIS_URL format is correct
- Check Upstash database is active
- Verify network connectivity
- Check Redis token is valid

### Issue: "Supabase unauthorized"
- Verify SUPABASE_ANON_KEY is correct
- Check Row Level Security policies
- Ensure service role key is used for admin operations

## Example .env.local (Development)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
JWT_SECRET=your-local-dev-secret-min-32-characters
JWT_EXPIRY=7d

# Redis (optional for local dev)
# REDIS_URL=redis://localhost:6379
# REDIS_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional
# NEXT_PUBLIC_SENTRY_DSN=
# ENABLE_ANALYTICS=false
```

## Validation Checklist

Before deploying:
- [ ] All required variables are set
- [ ] Secrets are strong and random
- [ ] No secrets in git history
- [ ] Environment-specific values are correct
- [ ] NEXT_PUBLIC_APP_URL matches domain
- [ ] Supabase keys are valid
- [ ] Redis connection tested
- [ ] JWT_SECRET is secure
- [ ] Backup of secrets created

---

**Last Updated:** November 15, 2025
**Next Review:** December 2025
