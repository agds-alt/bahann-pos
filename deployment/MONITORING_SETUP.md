# Production Monitoring Setup

Complete guide to monitoring the AGDS Corp POS application in production.

## Table of Contents

1. [Vercel Analytics (Built-in)](#vercel-analytics)
2. [Uptime Monitoring](#uptime-monitoring)
3. [Error Tracking](#error-tracking)
4. [Performance Monitoring](#performance-monitoring)
5. [Database Monitoring](#database-monitoring)
6. [Alert Configuration](#alert-configuration)
7. [Dashboards](#dashboards)

---

## Vercel Analytics (Built-in)

Vercel provides built-in analytics for Next.js applications.

### Setup

1. Go to Project → Analytics in Vercel Dashboard
2. Enable Web Analytics (free on all plans)
3. Enable Speed Insights (provides Core Web Vitals)

### Metrics Tracked

- **Page Views**: Total visits to each page
- **Unique Visitors**: Distinct users over time
- **Top Pages**: Most visited pages
- **Top Referrers**: Traffic sources
- **Core Web Vitals**:
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - TTFB (Time to First Byte)

### Accessing Analytics

```bash
# Via Dashboard
https://vercel.com/<team>/<project>/analytics

# Or use Vercel CLI
vercel analytics
```

### Goals & Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| FCP | <1.8s | >2.5s | >4.0s |
| LCP | <2.5s | >3.5s | >5.0s |
| FID | <100ms | >200ms | >300ms |
| CLS | <0.1 | >0.15 | >0.25 |
| TTFB | <600ms | >1000ms | >1500ms |

---

## Uptime Monitoring

Monitor application availability 24/7.

### Option A: UptimeRobot (Free)

**Setup:**

1. Sign up at [https://uptimerobot.com](https://uptimerobot.com)
2. Create monitors:

**Monitor 1: Health Check Endpoint**
```
Type: HTTP(s)
Name: AGDS POS - Health Check
URL: https://pos.yourdomain.com/api/health
Interval: 5 minutes
Expected Response: 200
Alert Contacts: your-email@domain.com
```

**Monitor 2: Homepage**
```
Type: HTTP(s)
Name: AGDS POS - Homepage
URL: https://pos.yourdomain.com
Interval: 5 minutes
Keyword: "AGDS Corp POS" (or any expected text)
```

**Monitor 3: Login Page**
```
Type: HTTP(s)
Name: AGDS POS - Login
URL: https://pos.yourdomain.com/login
Interval: 5 minutes
```

**Monitor 4: Database Health**
```
Type: HTTP(s)
Name: AGDS POS - Database
URL: https://pos.yourdomain.com/api/health/database
Interval: 5 minutes
Expected Response: 200
```

**Alert Configuration:**
- Email: Immediate
- SMS: After 2 consecutive failures
- Downtime Threshold: 2 minutes

### Option B: Better Uptime (Recommended for Teams)

**Setup:**

1. Sign up at [https://betteruptime.com](https://betteruptime.com)
2. Create monitors (similar to UptimeRobot)
3. Additional features:
   - Status page (status.yourdomain.com)
   - Incident management
   - On-call scheduling
   - Slack/Discord/PagerDuty integration

### Option C: Pingdom

Professional uptime monitoring with advanced features.

### Status Page

Create a public status page showing system health:

**Using Better Uptime:**
1. Enable Status Page in dashboard
2. Add domain: status.agdscorp.com
3. Configure which monitors to display
4. Customize branding

**Self-hosted (Uptime Kuma):**
```bash
# Deploy to separate server or Vercel
git clone https://github.com/louislam/uptime-kuma
cd uptime-kuma
docker-compose up -d
```

---

## Error Tracking

Track and debug application errors in production.

### Option A: Sentry (Recommended)

**Setup:**

1. Create account at [https://sentry.io](https://sentry.io)
2. Create new Next.js project
3. Install SDK:

```bash
npm install @sentry/nextjs
```

4. Run setup wizard:

```bash
npx @sentry/wizard -i nextjs
```

5. Configure environment variables:

```bash
# Add to Vercel
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=agds-pos
```

6. The wizard creates these files:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`

**Configuration Example:**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
})
```

**Alert Configuration:**
1. Go to Alerts in Sentry
2. Create alert rule:
   - Trigger: Error count > 10 in 5 minutes
   - Action: Email + Slack notification
3. Set up issue routing by severity

### Option B: Vercel Logs (Basic)

Free error logging included with Vercel:

```bash
# View logs
vercel logs --prod

# Filter by errors
vercel logs --prod | grep ERROR

# Follow live
vercel logs --prod --follow
```

Access in dashboard: Project → Logs

---

## Performance Monitoring

### Lighthouse CI

Automated performance audits on every deploy.

**Setup:**

1. Install:
```bash
npm install -D @lhci/cli
```

2. Create `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'https://pos.yourdomain.com',
        'https://pos.yourdomain.com/login',
        'https://pos.yourdomain.com/dashboard',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

3. Add to `package.json`:
```json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}
```

4. Run after deployment:
```bash
npm run lighthouse
```

### Real User Monitoring (RUM)

Track actual user experience.

**Vercel Speed Insights (Built-in):**
- Automatically tracks Core Web Vitals
- Real user data vs synthetic testing
- Breakdowns by page, device, location

**Web Vitals Library:**

```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  const body = JSON.stringify(metric)
  const url = '/api/analytics'

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { body, method: 'POST', keepalive: true })
  }
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

## Database Monitoring

Monitor Supabase database performance.

### Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to:
   - **Database → Query Performance**: View slow queries
   - **Database → Database Health**: Check connection pool
   - **Reports**: View usage metrics

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| Connection pool usage | >80% | Increase pool size |
| Slow queries | >1000ms | Add indexes |
| Database size | >80% of plan | Upgrade plan |
| CPU usage | >70% | Optimize queries |

### Query Performance

**Enable Query Insights:**

```sql
-- In SQL Editor
ALTER SYSTEM SET pg_stat_statements.track = all;
SELECT pg_reload_conf();
```

**Find slow queries:**

```sql
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Database Alerts

Set up alerts in Supabase:
1. Database → Settings
2. Enable alerts for:
   - High CPU usage
   - Connection pool saturation
   - Disk space warnings

---

## Alert Configuration

### Alert Channels

Configure multiple channels for redundancy:

#### 1. Email
- Primary: team@agdscorp.com
- On-call: oncall@agdscorp.com
- Individual: developers

#### 2. Slack

**Setup:**
1. Create Slack webhook:
   - Go to Slack App Directory
   - Search "Incoming Webhooks"
   - Add to workspace
   - Create webhook for #alerts channel

2. Configure in monitoring tools:
   - UptimeRobot: Integrations → Slack
   - Sentry: Settings → Integrations → Slack
   - Better Uptime: Integrations → Slack

#### 3. SMS (via Twilio)

For critical alerts only:

**Setup:**
1. Sign up at [Twilio](https://www.twilio.com)
2. Get phone number
3. Configure in UptimeRobot/Better Uptime

#### 4. PagerDuty (Enterprise)

For on-call rotation:
1. Set up PagerDuty account
2. Create escalation policies
3. Integrate with monitoring tools

### Alert Severity Levels

| Level | Response Time | Channels | Example |
|-------|---------------|----------|---------|
| Critical | Immediate | SMS + Slack + Email | Database down |
| High | 15 minutes | Slack + Email | API errors spiking |
| Medium | 1 hour | Email | Performance degraded |
| Low | Next business day | Email | Non-critical warnings |

### Alert Rules

**Critical Alerts:**
- Health check failing for >2 minutes
- Error rate >10 errors/minute
- Database connection failed
- Redis connection lost (degraded, not critical)

**High Priority Alerts:**
- Response time >5 seconds
- Error rate >5 errors/minute
- CPU usage >80%
- Memory usage >80%

**Medium Priority:**
- Response time >3 seconds
- Core Web Vitals degraded
- Disk usage >70%

---

## Dashboards

### Create Monitoring Dashboard

**Option 1: Grafana Cloud (Free tier available)**

1. Sign up at [Grafana Cloud](https://grafana.com)
2. Create dashboards for:
   - Application health
   - API performance
   - Database metrics
   - User analytics

**Option 2: Custom Dashboard**

Create internal dashboard at `/admin/monitoring`:

```typescript
// pages/admin/monitoring.tsx
export default function MonitoringDashboard() {
  const [healthData, setHealthData] = useState(null)

  useEffect(() => {
    // Fetch health data
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealthData)
  }, [])

  return (
    <div>
      <h1>System Monitoring</h1>
      {/* Display health metrics */}
      {/* Display charts */}
      {/* Display recent errors */}
    </div>
  )
}
```

### Key Metrics to Display

1. **System Health**
   - Uptime percentage (target: 99.9%)
   - Current status (all systems)
   - Response time (avg, p95, p99)

2. **Traffic**
   - Requests per minute
   - Active users
   - Top pages

3. **Errors**
   - Error rate
   - Recent errors
   - Error types

4. **Performance**
   - Core Web Vitals
   - API response times
   - Database query times

---

## Monitoring Checklist

### Initial Setup
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Enable database monitoring
- [ ] Set up alert channels
- [ ] Create status page
- [ ] Configure Lighthouse CI

### Daily
- [ ] Check error rate
- [ ] Review failed requests
- [ ] Check system health
- [ ] Monitor performance metrics

### Weekly
- [ ] Review slow queries
- [ ] Analyze traffic patterns
- [ ] Check alert accuracy
- [ ] Review incident responses

### Monthly
- [ ] Performance audit
- [ ] Security review
- [ ] Cost analysis
- [ ] Update alert thresholds

---

## Incident Response

### When Alert Fires

1. **Acknowledge**
   - Respond to alert immediately
   - Silence duplicate alerts

2. **Assess**
   - Check health endpoints
   - Review recent deployments
   - Check error logs

3. **Diagnose**
   - Identify root cause
   - Check related systems

4. **Fix**
   - Apply fix (rollback if needed)
   - Monitor for resolution

5. **Document**
   - Record in incident log
   - Update runbook if needed

### Escalation Path

1. On-call developer (immediate)
2. DevOps lead (15 minutes)
3. CTO (30 minutes)
4. Emergency hotline (critical only)

---

**Last Updated:** November 15, 2025
**Next Review:** December 2025
