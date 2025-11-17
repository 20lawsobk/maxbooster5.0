# 📊 Email Bounce Handling & Metrics Alerting Setup Guide

## Overview
This guide will walk you through completing the database migration and testing the new monitoring systems end-to-end.

---

## 🚀 Step-by-Step Instructions

### **Step 1: Complete Database Migration** ✅ REQUIRED

Run the migration to create all new monitoring tables:

```bash
cd Max-Booster
npm run db:push -- --force
```

**What happens:**
- Creates `email_messages` table (tracks sent emails)
- Creates `email_events` table (SendGrid webhook events)
- Creates `system_metrics` table (time-series metrics storage)
- Creates `alert_rules` table (alert configuration)
- Creates `alert_incidents` table (triggered alerts)
- Creates necessary indexes and constraints

**Expected output:**
```
✓ Pulling schema from database...
✓ Changes applied successfully
```

---

### **Step 2: Verify Database Schema** ✅ REQUIRED

Option A - Using Drizzle Studio (Visual):
```bash
npm run db:studio
```
Then open http://localhost:4983 and verify all 5 new tables exist.

Option B - Using SQL Script (Command line):
```bash
psql $DATABASE_URL -f verify-monitoring-schema.sql
```

**Expected result:**
All 5 tables should show `✅ EXISTS`:
- email_messages
- email_events  
- system_metrics
- alert_rules
- alert_incidents

---

### **Step 3: Restart Server** ✅ REQUIRED

The server needs to be restarted to pick up the new database tables:

```bash
# Server will auto-restart via the workflow
# Or manually: Ctrl+C and restart the workflow
```

**Verify server started successfully:**
Check logs for `✅ Max Booster Platform - 24/7/365 Ready!`

---

### **Step 4: Test Admin Authentication** ⚠️ PREREQUISITE

Before testing monitoring endpoints, ensure you have admin access:

1. **Login as admin user** at http://localhost:5000
2. **Verify admin status** by checking the database:
   ```sql
   SELECT id, email, is_admin FROM users WHERE is_admin = true;
   ```
3. If no admin exists, create one:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your@email.com';
   ```

---

### **Step 5: Test Metrics Recording** 🧪 TESTING

Test recording a metric to the database:

```bash
# Login first and get your session cookie from browser DevTools → Application → Cookies
# Then run:

curl -X POST http://localhost:5000/api/admin/metrics/test \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "metricName": "test.cpu.usage",
    "value": 45.5,
    "source": "test-server",
    "tags": {"environment": "test"}
  }'
```

**Expected response:**
```json
{"success": true, "message": "Test metric recorded"}
```

**Verify in database:**
```sql
SELECT * FROM system_metrics WHERE metric_name = 'test.cpu.usage';
```

---

### **Step 6: Test Metrics Retrieval** 🧪 TESTING

Query the recorded metrics:

```bash
curl -X GET "http://localhost:5000/api/admin/metrics?metric=test.cpu.usage&period=1" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**Expected response:**
```json
{
  "metrics": [
    {
      "bucketStart": "2025-11-17T14:00:00.000Z",
      "avgValue": 45.5,
      "minValue": 45.5,
      "maxValue": 45.5
    }
  ]
}
```

---

### **Step 7: Test Alert Rule Creation** 🧪 TESTING

Create an alert rule for high CPU usage:

```bash
curl -X POST http://localhost:5000/api/admin/alerts/rules \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "High CPU Usage Alert",
    "metricName": "test.cpu.usage",
    "condition": "gt",
    "threshold": 80,
    "durationSecs": 300,
    "channels": {"email": true}
  }'
```

**Expected response:**
```json
{"success": true, "message": "Alert rule created"}
```

**Verify in database:**
```sql
SELECT * FROM alert_rules WHERE metric_name = 'test.cpu.usage';
```

---

### **Step 8: Test Email Statistics** 🧪 TESTING

Get email delivery statistics:

```bash
curl -X GET "http://localhost:5000/api/admin/email/stats?days=30" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**Expected response:**
```json
{
  "stats": {
    "sent": 0,
    "delivered": 0,
    "bounced": 0,
    "spam": 0,
    "unsubscribed": 0,
    "opened": 0,
    "clicked": 0
  },
  "recentBounces": []
}
```

---

### **Step 9: Test SendGrid Webhook (Development)** 🧪 TESTING

Test the webhook endpoint (will work without signature in development):

```bash
curl -X POST http://localhost:5000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '[{
    "sg_message_id": "test-msg-001",
    "email": "test@example.com",
    "event": "delivered",
    "timestamp": '$(date +%s)',
    "smtp_response": "250 OK"
  }]'
```

**Expected response:**
```json
{"received": true}
```

**Note:** In development, signature verification is optional. In production, you MUST configure `SENDGRID_WEBHOOK_PUBLIC_KEY`.

---

### **Step 10: Configure Production Webhook** 🔐 PRODUCTION

For production SendGrid webhook verification:

1. **Get your SendGrid Webhook Public Key:**
   - Login to SendGrid Dashboard
   - Go to Settings → Mail Settings → Event Webhook
   - Copy the "Verification Key" (base64 encoded Ed25519 public key)

2. **Add to environment:**
   ```bash
   # Add to .env or deployment secrets:
   SENDGRID_WEBHOOK_PUBLIC_KEY=your_base64_encoded_public_key_here
   ```

3. **Configure SendGrid webhook URL:**
   - URL: `https://your-domain.com/api/webhooks/sendgrid`
   - HTTP POST with Event Notification
   - Select events: Delivered, Bounced, Spam Report, Unsubscribe, Opens, Clicks

---

## ✅ Verification Checklist

Before marking as production-ready, verify:

- [ ] All 5 database tables created successfully
- [ ] Metrics recording works (Step 5)
- [ ] Metrics retrieval works (Step 6)
- [ ] Alert rule creation works (Step 7)
- [ ] Email stats endpoint works (Step 8)
- [ ] SendGrid webhook endpoint responds (Step 9)
- [ ] Admin authentication required for all /api/admin routes
- [ ] Server builds without errors
- [ ] Server runs without errors

---

## 🔧 Troubleshooting

### Migration fails with "table already exists"
```bash
# Check if tables exist:
psql $DATABASE_URL -c "\dt"

# If they exist, skip migration and proceed to testing
```

### "Authentication required" errors
```bash
# Verify you're logged in:
curl http://localhost:5000/api/auth/me -H "Cookie: connect.sid=YOUR_COOKIE"

# Should return your user object with isAdmin: true
```

### SendGrid webhook returns 401 in production
```bash
# Verify public key is configured:
echo $SENDGRID_WEBHOOK_PUBLIC_KEY

# Test without signature (will fail in production):
NODE_ENV=development npm run dev
```

---

## 📚 Database Queries for Verification

```sql
-- Check metrics count
SELECT COUNT(*) FROM system_metrics;

-- Check recent metrics
SELECT metric_name, bucket_start, avg_value 
FROM system_metrics 
ORDER BY bucket_start DESC 
LIMIT 10;

-- Check alert rules
SELECT name, metric_name, condition, threshold 
FROM alert_rules 
WHERE is_active = true;

-- Check email events
SELECT event_type, COUNT(*) 
FROM email_events 
GROUP BY event_type;

-- Check active alert incidents
SELECT ar.name, ai.status, ai.triggered_at
FROM alert_incidents ai
JOIN alert_rules ar ON ai.rule_id = ar.id
WHERE ai.status = 'triggered'
ORDER BY ai.triggered_at DESC;
```

---

## 🎯 Production Deployment Notes

1. **Environment Variables Required:**
   - `SENDGRID_WEBHOOK_PUBLIC_KEY` - For webhook signature verification
   - `DATABASE_URL` - PostgreSQL connection (already configured)
   - `REDIS_URL` - Redis for sessions (already configured)

2. **Webhook Configuration:**
   - Configure SendGrid Event Webhook to point to your production URL
   - Ensure HTTPS is enabled (Replit deployment handles this)
   - Test with SendGrid's "Test Your Integration" feature

3. **Monitoring:**
   - Check `/api/admin/email/stats` weekly for bounce rates
   - Set up alert rules for critical metrics
   - Monitor `/api/admin/alerts/incidents` for triggered alerts

---

## 🚀 Ready for Production

Once all verification steps pass, the monitoring systems are production-ready! The platform now has:
- ✅ Real-time email delivery tracking
- ✅ Bounce/spam detection and reporting  
- ✅ Time-series metrics storage
- ✅ Threshold-based alerting
- ✅ Admin dashboards for observability

**Total Features Added:** 5 database tables, 8 API endpoints, full monitoring infrastructure
