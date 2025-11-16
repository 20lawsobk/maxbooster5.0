# Max Booster Platform - Monitoring & Alerting Guide

## Overview

Max Booster includes comprehensive built-in monitoring and health check endpoints. This guide explains how to monitor your production deployment and set up external alerting.

---

## Built-In Health Endpoints

### 1. Basic Health Check

**Endpoint:** `GET /api/health`

Returns overall system health status.

```bash
curl https://your-deployment.replit.app/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": "2.5h",
  "version": "1.0.0",
  "timestamp": "2025-11-16T10:00:00.000Z"
}
```

### 2. Readiness Check

**Endpoint:** `GET /api/health/ready`

Confirms the application is ready to serve requests (database connected, services initialized).

```bash
curl https://your-deployment.replit.app/api/health/ready
```

**Response:**
```json
{
  "ready": true,
  "database": "connected",
  "redis": "connected",
  "services": "initialized"
}
```

### 3. Liveness Check

**Endpoint:** `GET /api/health/live`

Simple ping to confirm the server is alive.

```bash
curl https://your-deployment.replit.app/api/health/live
```

**Response:**
```json
{
  "alive": true
}
```

---

## Built-In Monitoring Features

### Process Health Monitoring

The platform automatically monitors and logs:
- **Memory usage** (heap and RSS)
- **CPU usage** 
- **Uptime**
- **Active connections**
- **Database pool status**
- **Session count**

**Logged every 60 seconds** to console with format:
```
✅ Process Health: OK (3600s uptime, 205MB memory)
✅ Capacity healthy: Pool 5.0%, Sessions 77
```

### 24/7 System Status Reports

**Logged every 15 minutes** with comprehensive metrics:
```
📊 24/7 System Status Report:
   Status: healthy | Uptime: 12.5h | Reliability: 99.99%
   Avg Response: 45ms | Error Rate: 0.01%
   Memory: 205MB | DB: connected
```

### Analytics Anomaly Detection

Runs **every 5 minutes** to detect unusual patterns:
- Sudden traffic spikes
- Abnormal error rates
- Performance degradation
- User behavior anomalies

### Security Monitoring

Continuous monitoring for:
- Failed login attempts
- Unauthorized access attempts
- Suspicious API usage patterns
- System intrusion attempts

---

## Setting Up External Monitoring

### Option 1: UptimeRobot (Free Tier Available)

**Best for:** Basic uptime monitoring and alerting

1. Sign up at https://uptimerobot.com
2. Create a new monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://your-deployment.replit.app/api/health`
   - **Interval:** 5 minutes
   - **Expected Status Code:** 200

3. Configure alerts:
   - Email notifications
   - Slack webhook
   - SMS (paid tier)

**Advantages:**
- Free tier includes 50 monitors
- Multiple alert channels
- Status page generation

### Option 2: Replit Built-in Monitoring

**Best for:** Integrated Replit deployments

1. Access deployment dashboard in Replit
2. Navigate to "Monitoring" tab
3. View:
   - Request logs
   - Error rates
   - Response times
   - Resource usage

**Features:**
- Real-time logs
- Resource graphs
- Automatic alerting
- No additional setup required

### Option 3: Sentry (Error Tracking)

**Best for:** Detailed error tracking and debugging

1. Sign up at https://sentry.io
2. Create a new project (Node.js)
3. Install Sentry SDK:

```bash
npm install @sentry/node
```

4. Add to `server/index.ts`:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

5. Set `SENTRY_DSN` in Replit Secrets

**Advantages:**
- Detailed error stack traces
- Performance monitoring
- Release tracking
- User impact analysis

### Option 4: LogTail (Log Management)

**Best for:** Centralized log management

1. Sign up at https://logtail.com
2. Get your source token
3. Install winston-logtail:

```bash
npm install winston @logtail/winston
```

4. Configure logging:

```typescript
import { Logtail } from '@logtail/winston';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  ]
});
```

5. Set `LOGTAIL_SOURCE_TOKEN` in Replit Secrets

**Advantages:**
- SQL-like log querying
- Real-time log tailing
- Alert rules
- Dashboard creation

---

## Recommended Monitoring Setup

### Minimum (Free Tier)

1. **UptimeRobot** - Basic uptime monitoring
   - Monitor `/api/health` every 5 minutes
   - Email alerts on downtime

2. **Replit Built-in Monitoring** - Resource usage
   - Check deployment logs daily
   - Monitor error rates

### Standard (Paid Tier - ~$25/month)

1. **UptimeRobot Pro** - Advanced uptime monitoring
   - 1-minute check intervals
   - Multiple alert channels
   - Status page

2. **Sentry** - Error tracking
   - Automatic error reporting
   - Performance monitoring

3. **Replit Monitoring** - Infrastructure metrics

### Enterprise (Recommended for Production)

1. **UptimeRobot** - Uptime monitoring
2. **Sentry** - Error tracking and performance
3. **LogTail** - Centralized logging
4. **PagerDuty** - On-call alerting
5. **Grafana Cloud** - Custom dashboards

---

## Alert Configuration Best Practices

### Critical Alerts (Immediate Response)

- Server down for >2 minutes
- Error rate >5%
- Database connection lost
- Payment processing failures

**Action:** Page on-call engineer

### Warning Alerts (Monitor Closely)

- Response time >1 second
- Memory usage >80%
- Error rate >1%
- Queue backlog >1000 jobs

**Action:** Email notification

### Info Alerts (Review Daily)

- Slow queries (>300ms)
- Failed login attempts
- API rate limit hits

**Action:** Daily digest email

---

## Health Check Scripts

### Simple Uptime Check

```bash
#!/bin/bash
# check-health.sh

ENDPOINT="https://your-deployment.replit.app/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ $response -eq 200 ]; then
  echo "✅ Service is healthy"
  exit 0
else
  echo "❌ Service is down (HTTP $response)"
  exit 1
fi
```

### Comprehensive Health Monitor

```bash
#!/bin/bash
# comprehensive-health.sh

BASE_URL="https://your-deployment.replit.app"

echo "🔍 Max Booster Health Check"
echo "============================"

# Basic health
echo -n "Health Check: "
curl -s $BASE_URL/api/health | jq -r '.status'

# Readiness
echo -n "Ready State: "
curl -s $BASE_URL/api/health/ready | jq -r '.ready'

# Database
echo -n "Database: "
curl -s $BASE_URL/api/health/ready | jq -r '.database'

# Response time
echo -n "Response Time: "
curl -s -w "%{time_total}s\n" -o /dev/null $BASE_URL/api/health
```

### Automated Daily Report

```bash
#!/bin/bash
# daily-report.sh

# Run health check and email results
REPORT=$(./comprehensive-health.sh)

echo "$REPORT" | mail -s "Max Booster Daily Health Report" admin@example.com
```

---

## Monitoring Dashboards

### Metrics to Track

**Application Metrics:**
- Request rate (requests/minute)
- Average response time
- Error rate percentage
- Active user count
- Queue length

**Infrastructure Metrics:**
- CPU usage percentage
- Memory usage (MB)
- Database connections
- Network throughput
- Disk usage

**Business Metrics:**
- New signups per day
- Active subscriptions
- Revenue per day
- Churn rate
- Support tickets

---

## Troubleshooting with Monitoring

### High Memory Usage

**Symptom:** Memory >80% for >5 minutes

**Check:**
```bash
curl https://your-deployment.replit.app/api/health
# Look for memory in response
```

**Action:**
1. Check for memory leaks in recent deployments
2. Restart server if memory >90%
3. Scale to larger instance if consistent

### Slow Response Times

**Symptom:** Response time >1 second

**Check:**
- Slow query logs in database
- Queue backlog size
- External API latency

**Action:**
1. Optimize slow database queries
2. Add caching for frequently accessed data
3. Scale horizontally if needed

### High Error Rate

**Symptom:** Error rate >1%

**Check:**
```bash
# View recent errors in logs
curl https://your-deployment.replit.app/api/errors | jq '.recent[]'
```

**Action:**
1. Check deployment logs for stack traces
2. Roll back to previous deployment if severe
3. Fix root cause and redeploy

---

## Monitoring Checklist

### Daily

- [ ] Check uptime status (99%+ expected)
- [ ] Review error logs for new issues
- [ ] Monitor response times (<500ms average)
- [ ] Check memory usage (<70% expected)

### Weekly

- [ ] Review performance trends
- [ ] Analyze slow query patterns
- [ ] Check security alerts
- [ ] Verify backup completion

### Monthly

- [ ] Audit alert configurations
- [ ] Review monitoring coverage
- [ ] Update runbooks
- [ ] Test disaster recovery

---

## Support and Escalation

### Severity Levels

**P0 - Critical (Response: Immediate)**
- Production down
- Data loss
- Security breach
- Payment processing failure

**P1 - High (Response: <1 hour)**
- Significant performance degradation
- Feature unavailable
- High error rate

**P2 - Medium (Response: <4 hours)**
- Non-critical feature issues
- Slow performance
- Intermittent errors

**P3 - Low (Response: <24 hours)**
- Minor bugs
- UI glitches
- Feature requests

---

## Additional Resources

- Replit Deployment Docs: https://docs.replit.com/deployments
- Health Check Best Practices: https://docs.microsoft.com/en-us/azure/architecture/best-practices/monitoring
- SRE Handbook: https://sre.google/books/

---

**Last Updated:** November 16, 2025
