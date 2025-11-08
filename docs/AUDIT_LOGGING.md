# Audit Logging System

## Overview

The audit logging system tracks all critical operations in the application for compliance, security monitoring, and debugging purposes.

## Features

- **Comprehensive Tracking**: Logs WHO did WHAT, WHEN, and WHERE
- **Critical Operations**: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, REGISTER
- **Entity Types**: user, product, outlet, sale, stock, auth
- **Change Tracking**: Before/after values for UPDATE operations
- **Metadata**: Additional context including IP address and user agent
- **Automatic**: Integrated into tRPC mutations, no manual intervention needed

## Database Schema

The audit logs are stored in the `audit_logs` table with the following structure:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## Setup

### 1. Run Database Migration

Execute the migration script in your Supabase database:

```bash
# Navigate to migrations directory
cd supabase/migrations

# Run the migration
psql -h your-supabase-host -U postgres -d postgres -f 005_audit_logs.sql
```

Or in Supabase Dashboard:
1. Go to **SQL Editor**
2. Copy contents of `supabase/migrations/005_audit_logs.sql`
3. Execute the query

### 2. Verify Installation

Check that the table and indexes were created:

```sql
-- Check table
SELECT * FROM audit_logs LIMIT 1;

-- Check indexes
\d audit_logs
```

## Usage

### Automatic Logging

Audit logging is automatically enabled for:

**Products**:
- ✅ Create product
- ✅ Update product
- ✅ Delete product

**Outlets**:
- ✅ Create outlet
- ✅ Update outlet
- ✅ Delete outlet

**Authentication**:
- ✅ User registration
- ✅ User login
- ✅ User logout

### Manual Logging

To manually create an audit log entry:

```typescript
import { createAuditLog } from '@/lib/audit'

await createAuditLog({
  userId: 'user-uuid',
  userEmail: 'user@example.com',
  action: 'CREATE',
  entityType: 'product',
  entityId: 'product-uuid',
  changes: { created: { name: 'New Product', price: 100000 } },
  metadata: { category: 'Electronics' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
})
```

### Query Audit Logs

```typescript
import { getAuditLogs, getAuditLogsCount } from '@/lib/audit'

// Get all audit logs for a user
const logs = await getAuditLogs({ userId: 'user-uuid' })

// Get product-related audit logs
const productLogs = await getAuditLogs({
  entityType: 'product',
  limit: 50,
})

// Get audit logs for a specific date range
const rangeLogs = await getAuditLogs({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
})

// Get count
const count = await getAuditLogsCount({ entityType: 'product' })
```

## Audit Log Structure

### Example: Product Creation

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "user_email": "admin@example.com",
  "action": "CREATE",
  "entity_type": "product",
  "entity_id": "product-uuid",
  "changes": {
    "created": {
      "sku": "PROD-001",
      "name": "New Product",
      "price": 100000,
      "category": "Electronics"
    }
  },
  "metadata": {
    "sku": "PROD-001",
    "name": "New Product"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Example: Product Update

```json
{
  "action": "UPDATE",
  "entity_type": "product",
  "changes": {
    "before": {
      "sku": "PROD-001",
      "name": "Old Product Name",
      "price": 100000
    },
    "after": {
      "sku": "PROD-001",
      "name": "Updated Product Name",
      "price": 150000
    }
  }
}
```

## Security & Access Control

### Row Level Security (RLS)

The `audit_logs` table has RLS enabled with the following policies:

1. **Read Access**: Only admins can read audit logs
   ```sql
   CREATE POLICY "Admins can read all audit logs"
     ON audit_logs FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM users
         WHERE users.id = auth.uid()
         AND users.role = 'admin'
       )
     );
   ```

2. **Write Access**: System can insert audit logs (no restrictions)
   ```sql
   CREATE POLICY "System can insert audit logs"
     ON audit_logs FOR INSERT
     WITH CHECK (true);
   ```

### Best Practices

1. **Never delete audit logs** - They're for historical record
2. **Implement retention policy** - Keep logs for 90 days (or per compliance requirements)
3. **Regular backups** - Backup audit logs separately
4. **Monitor access** - Alert on unusual patterns (e.g., mass deletions)

## Retention Policy

Currently, audit logs are kept indefinitely. To implement automatic cleanup:

### Option 1: Supabase pg_cron (Recommended)

```sql
-- Install pg_cron extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup job (runs daily at 2 AM)
SELECT cron.schedule(
  'audit-logs-cleanup',
  '0 2 * * *',  -- Every day at 2 AM
  $$DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
);
```

### Option 2: Application-level Cleanup

Create a cron job or scheduled task to run:

```typescript
import { supabase } from '@/infra/supabase/client'

async function cleanupOldAuditLogs() {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .lt('created_at', ninetyDaysAgo.toISOString())

  if (error) {
    console.error('Failed to cleanup audit logs:', error)
  }
}
```

## Monitoring & Alerts

### Query Examples

**Most Active Users**:
```sql
SELECT user_email, COUNT(*) as action_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_email
ORDER BY action_count DESC
LIMIT 10;
```

**Deletion Activity**:
```sql
SELECT user_email, entity_type, COUNT(*) as deletions
FROM audit_logs
WHERE action = 'DELETE'
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY user_email, entity_type
ORDER BY deletions DESC;
```

**Login Activity**:
```sql
SELECT user_email, COUNT(*) as login_count,
       MAX(created_at) as last_login
FROM audit_logs
WHERE action = 'LOGIN'
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY user_email;
```

## Integration with External Services

The audit logging system can be integrated with external monitoring services:

### Sentry Integration

```typescript
import * as Sentry from '@sentry/nextjs'

// In lib/audit.ts
if (data.action === 'DELETE') {
  Sentry.captureMessage(`${data.action} on ${data.entityType}`, {
    level: 'info',
    extra: data,
  })
}
```

### Webhook Integration

```typescript
// Send audit logs to external webhook
await fetch('https://your-webhook-url.com/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(auditEntry),
})
```

## Compliance

This audit logging system helps meet compliance requirements for:

- **GDPR**: Track data access and modifications
- **SOC 2**: Audit trail for security controls
- **ISO 27001**: Information security management
- **PCI DSS**: Track access to sensitive data

## Troubleshooting

### Audit logs not appearing

1. Check that migration was run successfully
2. Verify RLS policies are enabled
3. Check application logs for errors

### Performance issues

1. Ensure indexes are created (automatically done by migration)
2. Implement retention policy to limit table size
3. Consider partitioning for very large datasets

### Access denied errors

1. Verify user has admin role
2. Check RLS policies
3. Ensure user is authenticated

## Future Enhancements

- [ ] Add audit log viewer UI for admins
- [ ] Export audit logs to CSV/PDF
- [ ] Real-time alerts for critical operations
- [ ] Advanced filtering and search
- [ ] Automated compliance reports
