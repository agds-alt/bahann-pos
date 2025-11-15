# Production Runbook

Operational guide for managing AGDS Corp POS in production.

## Table of Contents

1. [Common Tasks](#common-tasks)
2. [Deployment Procedures](#deployment-procedures)
3. [Monitoring & Health Checks](#monitoring--health-checks)
4. [Troubleshooting](#troubleshooting)
5. [Emergency Procedures](#emergency-procedures)
6. [Maintenance](#maintenance)

---

## Common Tasks

### Deploy New Version

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Review changes
git log --oneline -10

# 3. Run deployment script
./scripts/deploy.sh

# 4. Or deploy manually
vercel --prod

# 5. Verify deployment
./scripts/health-check.sh https://pos.yourdomain.com
```

**Expected Duration:** 3-5 minutes
**Downtime:** None (zero-downtime deployment)

### Rollback Deployment

**Option 1: Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select project → Deployments
3. Find last working deployment
4. Click "..." → "Promote to Production"

**Option 2: Vercel CLI**

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

**Expected Duration:** 1-2 minutes

### View Logs

**Real-time logs:**

```bash
# Follow production logs
vercel logs --prod --follow

# Filter by function
vercel logs --prod --follow --output=api/transactions

# Last 100 lines
vercel logs --prod -n 100
```

**In Vercel Dashboard:**

1. Project → Logs
2. Select time range
3. Filter by severity/function

### Update Environment Variable

```bash
# 1. Remove old variable
vercel env rm VARIABLE_NAME production

# 2. Add new variable
vercel env add VARIABLE_NAME production
# (Enter value when prompted)

# 3. Redeploy to apply changes
vercel --prod
```

**Important:** Always redeploy after changing environment variables.

### Check Application Status

```bash
# Quick health check
curl https://pos.yourdomain.com/api/health

# Detailed health check
./scripts/health-check.sh https://pos.yourdomain.com

# Check specific components
curl https://pos.yourdomain.com/api/health/database
curl https://pos.yourdomain.com/api/health/redis
```

### Restart Application

**Note:** Vercel serverless functions restart automatically. No manual restart needed.

To force redeployment:

```bash
vercel --prod --force
```

---

## Deployment Procedures

### Standard Deployment

**Prerequisites:**
- [ ] Code reviewed and approved
- [ ] Tests passing locally
- [ ] No TypeScript errors
- [ ] Dependencies up to date

**Steps:**

1. **Prepare**
```bash
git checkout main
git pull origin main
npm run build  # Verify build succeeds
```

2. **Deploy**
```bash
./scripts/deploy.sh
# Or: vercel --prod
```

3. **Verify**
```bash
./scripts/health-check.sh https://pos.yourdomain.com
```

4. **Monitor**
- Watch error rates for 10 minutes
- Check performance metrics
- Verify critical features

**Rollback Criteria:**
- Error rate >5% increase
- Response time >2x normal
- Critical feature broken
- Security vulnerability discovered

### Emergency Hotfix

**For critical bugs in production:**

1. **Create hotfix branch**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-description
```

2. **Fix and test**
```bash
# Make minimal changes
# Test thoroughly locally
npm run build
```

3. **Deploy immediately**
```bash
git add .
git commit -m "hotfix: Description of fix"
git push origin hotfix/critical-bug-description

# Deploy hotfix
vercel --prod
```

4. **Merge back to main**
```bash
git checkout main
git merge hotfix/critical-bug-description
git push origin main
```

5. **Monitor closely**
- Watch for 30 minutes
- Verify fix works
- Check for side effects

### Database Migration

**IMPORTANT:** Always test migrations in development first!

**Steps:**

1. **Backup database**
```bash
./scripts/backup-database.sh
```

2. **Test migration locally**
```sql
-- Run migration in local development database
-- Verify it works
```

3. **Apply to production (Supabase SQL Editor)**
```sql
-- Open Supabase Dashboard
-- Go to SQL Editor
-- Run migration
-- Verify results
```

4. **Verify application**
```bash
./scripts/health-check.sh https://pos.yourdomain.com
```

**Rollback Plan:**
- Keep backup for 7 days
- Have reverse migration ready
- Test rollback in development

---

## Monitoring & Health Checks

### Daily Health Check

```bash
# Run automated health check
./scripts/health-check.sh https://pos.yourdomain.com

# Check Vercel Analytics
# Visit: https://vercel.com/<team>/<project>/analytics

# Check error tracking (if using Sentry)
# Visit: https://sentry.io/<org>/<project>

# Check uptime monitoring
# Visit: UptimeRobot dashboard
```

### Performance Monitoring

**Check Core Web Vitals:**

1. Go to Vercel Dashboard → Analytics
2. Review metrics:
   - FCP (target: <1.8s)
   - LCP (target: <2.5s)
   - FID (target: <100ms)
   - CLS (target: <0.1)

**Run Lighthouse Audit:**

```bash
lighthouse https://pos.yourdomain.com --output html --output-path ./report.html
```

### Database Health

**Check Supabase Dashboard:**

1. Database → Database Health
2. Review:
   - Connection pool usage (<80%)
   - CPU usage (<70%)
   - Memory usage (<80%)
   - Disk usage (<80%)

**Find slow queries:**

```sql
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Troubleshooting

### Issue: 500 Internal Server Error

**Symptoms:**
- Users see "Internal Server Error"
- API requests failing

**Diagnosis:**

1. **Check logs**
```bash
vercel logs --prod -n 100
```

2. **Check health endpoints**
```bash
curl https://pos.yourdomain.com/api/health
```

3. **Common causes:**
   - Database connection failed
   - Environment variable missing/invalid
   - Code deployment error
   - Third-party service down

**Resolution:**

1. **Check database connection**
```bash
curl https://pos.yourdomain.com/api/health/database
```

2. **Verify environment variables**
```bash
vercel env ls production
```

3. **Check recent deployments**
```bash
vercel ls
```

4. **If recent deployment, rollback**
```bash
# Rollback to last working version
vercel rollback
```

5. **If persists, check external services**
   - Supabase status: https://status.supabase.io
   - Upstash status: https://status.upstash.com
   - Vercel status: https://www.vercel-status.com

### Issue: High Response Times

**Symptoms:**
- Pages loading slowly
- API requests timing out

**Diagnosis:**

1. **Check Vercel Analytics**
   - Response time charts
   - Slow endpoints

2. **Check database performance**
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

3. **Check Redis performance**
```bash
curl https://pos.yourdomain.com/api/health/redis
```

**Resolution:**

1. **Database optimization**
   - Add indexes on frequently queried columns
   - Optimize slow queries
   - Check connection pool settings

2. **Code optimization**
   - Review lazy loading
   - Check for N+1 queries
   - Optimize heavy computations

3. **Cache optimization**
   - Verify Redis connection
   - Review cache hit rates
   - Increase cache TTL if appropriate

### Issue: Authentication Not Working

**Symptoms:**
- Users can't log in
- "Invalid token" errors

**Diagnosis:**

1. **Check JWT_SECRET**
```bash
vercel env ls production | grep JWT
```

2. **Check Redis connection**
```bash
curl https://pos.yourdomain.com/api/health/redis
```

3. **Check Supabase**
```bash
curl https://pos.yourdomain.com/api/health/database
```

**Resolution:**

1. **Verify environment variables**
   - JWT_SECRET is set
   - SUPABASE_* variables are correct

2. **Check token expiration**
   - JWT_EXPIRY is reasonable (7d)
   - Tokens haven't been invalidated

3. **Clear sessions (if using Redis)**
```typescript
// In Redis CLI or code
KEYS session:*
DEL session:*  // Clear all sessions
```

4. **Check browser cookies**
   - Clear cookies
   - Check HttpOnly/Secure flags
   - Verify SameSite settings

### Issue: Database Connection Failed

**Symptoms:**
- "Database connection failed" errors
- Health check shows database unhealthy

**Diagnosis:**

1. **Check Supabase status**
   - Visit: https://status.supabase.io

2. **Verify connection string**
```bash
vercel env ls production | grep SUPABASE
```

3. **Test connection**
```bash
curl https://pos.yourdomain.com/api/health/database
```

**Resolution:**

1. **Verify credentials**
   - NEXT_PUBLIC_SUPABASE_URL is correct
   - NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
   - SUPABASE_SERVICE_ROLE_KEY is correct (if used)

2. **Check Supabase project**
   - Project is not paused
   - Database is running
   - Connection limit not reached

3. **Restart Supabase project** (if needed)
   - Go to Supabase Dashboard
   - Project Settings → General
   - Pause/Resume project

### Issue: Redis Connection Failed

**Symptoms:**
- "Redis connection failed" warnings
- Sessions not persisting

**Note:** Redis is optional - app will work without it.

**Diagnosis:**

1. **Check Upstash status**
   - Visit: https://status.upstash.com

2. **Verify connection**
```bash
curl https://pos.yourdomain.com/api/health/redis
```

3. **Check credentials**
```bash
vercel env ls production | grep REDIS
```

**Resolution:**

1. **Verify environment variables**
   - REDIS_URL is correct format
   - REDIS_TOKEN is valid (if using Upstash REST)

2. **Check Upstash dashboard**
   - Database is active
   - Not hitting rate limits
   - TLS enabled

3. **Fallback behavior**
   - App uses JWT-only authentication if Redis fails
   - No data loss
   - Sessions just aren't cached

### Issue: Out of Memory (OOM)

**Symptoms:**
- Functions timing out
- "Function exceeded memory limit" errors

**Diagnosis:**

1. **Check Vercel logs**
```bash
vercel logs --prod | grep "memory"
```

2. **Check function configuration**
```bash
cat vercel.json | grep memory
```

**Resolution:**

1. **Increase function memory** (in vercel.json)
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024  // Increase to 3008 (Pro plan)
    }
  }
}
```

2. **Optimize code**
   - Reduce memory usage
   - Stream large responses
   - Paginate results

3. **Upgrade Vercel plan** (if needed)
   - Pro plan: 3008 MB max
   - Hobby plan: 1024 MB max

---

## Emergency Procedures

### Complete Outage

**Severity:** Critical
**Response Time:** Immediate

**Steps:**

1. **Confirm outage**
```bash
curl -I https://pos.yourdomain.com
./scripts/health-check.sh https://pos.yourdomain.com
```

2. **Check status pages**
   - Vercel: https://www.vercel-status.com
   - Supabase: https://status.supabase.io
   - Upstash: https://status.upstash.com

3. **Check recent changes**
```bash
vercel ls  # Recent deployments
git log -5  # Recent commits
```

4. **Rollback if recent deployment**
```bash
vercel rollback
```

5. **If infrastructure issue**
   - Contact Vercel support
   - Notify users via status page
   - Provide ETA for resolution

6. **Communicate**
   - Post to status page
   - Email affected users
   - Update team on Slack

### Data Breach

**Severity:** Critical
**Response Time:** Immediate

**Steps:**

1. **Contain**
   - Revoke all API keys
   - Reset all user passwords
   - Invalidate all sessions

2. **Assess**
   - Identify what data was accessed
   - Determine scope of breach
   - Review access logs

3. **Notify**
   - Inform affected users (legally required)
   - Contact authorities if required (GDPR, etc.)
   - Notify management

4. **Remediate**
   - Patch vulnerability
   - Strengthen security measures
   - Conduct security audit

5. **Document**
   - Create incident report
   - Timeline of events
   - Lessons learned

### DDoS Attack

**Severity:** High
**Response Time:** 15 minutes

**Steps:**

1. **Verify attack**
   - Check traffic patterns in Vercel Analytics
   - Review request logs

2. **Vercel handles mitigation automatically**
   - Edge network filters malicious traffic
   - Rate limiting in place

3. **Additional measures**
   - Increase rate limits temporarily
   - Block specific IP ranges if needed
   - Enable additional DDoS protection

4. **Monitor**
   - Watch for application-level attacks
   - Check for performance degradation

---

## Maintenance

### Weekly Maintenance

**Tasks:**

```bash
# 1. Check dependency updates
npm outdated

# 2. Review security alerts
npm audit

# 3. Backup database
./scripts/backup-database.sh

# 4. Review error logs
vercel logs --prod | grep ERROR | tail -100

# 5. Check disk usage (Supabase Dashboard)
# Database → Database Health

# 6. Review performance metrics
# Vercel Dashboard → Analytics
```

### Monthly Maintenance

**Tasks:**

- [ ] Security audit (`npm audit`, Snyk)
- [ ] Performance review (Lighthouse)
- [ ] Database optimization (indexes, vacuum)
- [ ] Update dependencies (patch versions)
- [ ] Review and clean up old data
- [ ] Test backup restoration
- [ ] Review access permissions
- [ ] Update documentation

### Quarterly Maintenance

**Tasks:**

- [ ] Rotate secrets (JWT_SECRET, API keys)
- [ ] Full security audit
- [ ] Penetration testing (optional)
- [ ] Disaster recovery drill
- [ ] Review and update runbook
- [ ] Team training on new features
- [ ] Cost optimization review

---

## Emergency Contacts

| Role | Name | Email | Phone | Availability |
|------|------|-------|-------|--------------|
| On-Call DevOps | - | oncall@agdscorp.com | - | 24/7 |
| Lead Developer | - | dev-lead@agdscorp.com | - | Business hours |
| Database Admin | - | dba@agdscorp.com | - | Business hours |
| Security Lead | - | security@agdscorp.com | - | On-call |
| CTO | - | cto@agdscorp.com | - | Escalation only |

**External Support:**

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Upstash Support**: https://upstash.com/support

**Emergency Hotline:** (to be configured)

---

## Appendix

### Useful Commands

```bash
# Deploy
vercel --prod

# Rollback
vercel rollback <deployment-url>

# View logs
vercel logs --prod

# Environment variables
vercel env ls production
vercel env add VAR_NAME production
vercel env rm VAR_NAME production

# Health check
./scripts/health-check.sh https://pos.yourdomain.com

# Database backup
./scripts/backup-database.sh
```

### Quick Links

- **Vercel Dashboard**: https://vercel.com
- **Supabase Dashboard**: https://app.supabase.com
- **Upstash Console**: https://console.upstash.com
- **Status Page**: https://status.agdscorp.com (to be configured)
- **Documentation**: https://github.com/agds-alt/bahann-pos

---

**Last Updated:** November 15, 2025
**Version:** 1.0
**Next Review:** December 2025
