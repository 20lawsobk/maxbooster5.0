# Max Booster Platform - Production Readiness Guide

## Overview

This document outlines the complete production readiness infrastructure for Max Booster Platform, including monitoring, alerting, baseline metrics, and burn-in testing procedures.

---

## 1. 24-Hour Burn-In Testing

### What is Burn-In Testing?

**Burn-in testing** is running your platform continuously for 24 hours under realistic load to validate stability before production launch. This catches issues that only appear after extended operation, such as:

- Memory leaks
- Connection pool exhaustion
- Slow performance degradation
- Queue backlogs
- Cache saturation

### Running the Burn-In Test

```bash
# Start the burn-in test (runs for 24 hours)
npm run test:burn-in

# The test will:
# ✅ Check queue health every 5 minutes
# ✅ Check AI model telemetry every 5 minutes
# ✅ Check system health every 5 minutes
# ✅ Monitor memory usage trends
# ✅ Track Redis latency
# ✅ Generate comprehensive final report
```

### What the Test Monitors

| Metric | Check Interval | Threshold |
|--------|---------------|-----------|
| Queue Health | 5 minutes | Redis latency < 100ms |
| AI Model Cache | 5 minutes | Utilization < 90% |
| System Memory | 5 minutes | Growth < 500MB/24h |
| Redis Latency | 5 minutes | < 100ms average |
| Failed Jobs | 5 minutes | < 50 total |

### Interpreting Results

**✅ PASS Criteria:**
- Success rate ≥ 99.9%
- Memory growth < 500MB over 24 hours
- Redis latency < 100ms average
- No critical errors

**⚠️ CONDITIONAL PASS:**
- Success rate ≥ 95%
- Minor warnings present
- Review issues before deploying

**❌ FAIL:**
- Success rate < 95%
- Critical errors or crashes
- DO NOT deploy to production

### Early Termination

Press `Ctrl+C` to stop the test early. A partial report will be generated, but this is **not recommended** for production validation.

---

## 2. Production Alerting Integration

### Available Alert Channels

#### Email Alerts (via SendGrid)

**Setup:**
1. Set `SENDGRID_API_KEY` secret
2. Set `ALERT_EMAIL_RECIPIENTS` environment variable (comma-separated)

```bash
# Example
ALERT_EMAIL_RECIPIENTS=admin@maxbooster.com,ops@maxbooster.com
```

**Features:**
- HTML formatted emails
- Severity-based coloring (info/warning/critical)
- Automatic cooldown (15 minutes between duplicate alerts)
- Detailed metadata in alerts

#### Webhook Alerts (Slack, Discord, PagerDuty, etc.)

**Setup:**
1. Set `ALERT_WEBHOOK_URL` environment variable

```bash
# Example for Slack
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Webhook Payload Format:**
```json
{
  "severity": "warning",
  "title": "High Queue Backlog",
  "message": "Queue has 150 waiting jobs (threshold: 100)",
  "timestamp": "2025-11-20T02:00:00.000Z",
  "metadata": {
    "queueName": "scheduled-posts",
    "waiting": 150
  },
  "source": "Max Booster Platform"
}
```

### Alert Thresholds (Configurable)

| Alert Type | Default Threshold | Environment Variable |
|------------|------------------|---------------------|
| Queue Waiting Jobs | 100 | `ALERT_QUEUE_MAX_WAITING` |
| Queue Failed Jobs | 50 | `ALERT_QUEUE_MAX_FAILED` |
| Redis Latency | 100ms | `ALERT_QUEUE_MAX_LATENCY` |
| AI Cache Utilization | 90% | `ALERT_AI_CACHE_MAX_UTIL` |
| Memory Usage | 2048MB | `ALERT_MEMORY_MAX_MB` |
| Error Rate | 5% | `ALERT_ERROR_RATE_MAX` |

### Testing Alerts

```bash
# Test your alert configuration (admin only)
curl -X POST http://localhost:5000/api/monitoring/alerting/test \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "message": "Test alert sent successfully"
}
```

### Alert Configuration Endpoint

```bash
# Check current alert configuration
curl http://localhost:5000/api/monitoring/alerting/config | jq

# Response:
{
  "success": true,
  "config": {
    "emailEnabled": true,
    "webhookEnabled": false,
    "recipientCount": 2,
    "thresholds": {
      "queueMaxWaiting": 100,
      "queueMaxFailed": 50,
      "queueMaxLatency": 100,
      "aiCacheMaxUtilization": 90,
      "memoryMaxMB": 2048,
      "errorRateMaxPercent": 5
    }
  }
}
```

---

## 3. Baseline Metrics Dashboard

### What are Baseline Metrics?

**Baseline metrics** are snapshots of your platform's performance under normal operating conditions. They serve as reference points for detecting anomalies and performance degradation.

### Automatic Metrics Collection

The system automatically collects metrics every 30 seconds:

- ✅ Queue performance (waiting, active, failed, latency)
- ✅ AI cache utilization (social & advertising)
- ✅ System resources (memory, uptime, CPU)
- ✅ Performance trends

### Viewing the Dashboard

```bash
# View live dashboard
npm run monitor:dashboard

# Or curl directly
curl http://localhost:5000/api/monitoring/dashboard | jq
```

**Dashboard Response:**
```json
{
  "success": true,
  "dashboard": {
    "current": {
      "timestamp": "2025-11-20T02:00:00.000Z",
      "queue": { "waiting": 0, "active": 0, "redisLatency": 1 },
      "aiCache": { "socialUtilization": 5.2, "advertisingUtilization": 3.1 },
      "system": { "memoryMB": 268, "uptime": 3600 }
    },
    "last60Minutes": [ /* 60 snapshots */ ],
    "summary": {
      "queue": { "avgWaiting": 2, "avgLatency": 1.2, "totalFailed": 0 },
      "aiCache": { "avgSocialUtil": 4.8, "avgAdUtil": 2.9 },
      "system": { "avgMemoryMB": 265, "maxMemoryMB": 270 }
    },
    "trends": {
      "memory": "stable",
      "queueBacklog": "stable",
      "redisLatency": "stable"
    }
  }
}
```

### Saving Baseline Snapshots

```bash
# Save current metrics as baseline (admin only)
curl -X POST http://localhost:5000/api/monitoring/baseline/save \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"name": "production-launch-baseline"}'

# Response:
{
  "success": true,
  "message": "Baseline metrics saved successfully",
  "filepath": "metrics-baseline/production-launch-baseline-2025-11-20T02-00-00.000Z.json"
}
```

### Baseline Files

Baselines are saved to `metrics-baseline/` directory with complete data:

```json
{
  "name": "production-launch-baseline",
  "generatedAt": "2025-11-20T02:00:00.000Z",
  "duration": "2h 30m",
  "summary": {
    "queue": { "avgWaiting": 2, "avgLatency": 1.2, "totalFailed": 0 },
    "aiCache": { "avgSocialUtil": 4.8, "avgAdUtil": 2.9 },
    "system": { "avgMemoryMB": 265, "maxMemoryMB": 270 }
  },
  "snapshots": [ /* All collected snapshots */ ]
}
```

### Recommended Baselines

1. **Pre-Launch Baseline** - Before first production deployment
2. **Post-Launch Baseline** - After 24 hours of production traffic
3. **Weekly Baselines** - Every Monday at midnight
4. **Post-Update Baselines** - After major feature deployments

---

## Monitoring API Endpoints

### Queue Monitoring

```bash
# All queue metrics
GET /api/monitoring/queue-metrics

# Specific queue
GET /api/monitoring/queue-metrics/:queueName

# Queue health status
GET /api/monitoring/queue-health
```

### AI Model Monitoring

```bash
# AI model cache telemetry
GET /api/monitoring/ai-models
```

### System Health

```bash
# Comprehensive system health check
GET /api/monitoring/system-health
```

### Dashboard & Baselines

```bash
# Live dashboard with trends
GET /api/monitoring/dashboard

# Save baseline (admin)
POST /api/monitoring/baseline/save
{ "name": "baseline-name" }
```

### Alerting

```bash
# Alert configuration
GET /api/monitoring/alerting/config

# Test alerts (admin)
POST /api/monitoring/alerting/test
```

### Admin Controls

```bash
# Update alert thresholds (admin)
POST /api/monitoring/set-thresholds
{
  "maxWaitingJobs": 100,
  "maxFailedRate": 0.1,
  "maxStalledJobs": 10,
  "maxRedisLatency": 100
}
```

---

## Quick Start Guide

### Before Production Launch

1. **Run 24-hour burn-in test**
   ```bash
   npm run test:burn-in
   ```

2. **Configure alerting**
   ```bash
   # Set environment variables
   export SENDGRID_API_KEY=your_key
   export ALERT_EMAIL_RECIPIENTS=admin@example.com
   export ALERT_WEBHOOK_URL=https://hooks.slack.com/...
   ```

3. **Save baseline metrics**
   - Let system run for 2-4 hours under normal load
   - Save baseline via API
   - Compare future metrics against this baseline

4. **Verify all systems healthy**
   ```bash
   curl http://localhost:5000/api/monitoring/system-health | jq
   ```

### Post-Launch Monitoring

- Check dashboard daily: `npm run monitor:dashboard`
- Review alerts in your email/Slack
- Save weekly baselines for trending
- Compare current metrics vs baselines monthly

---

## Troubleshooting

### No Alerts Being Sent

1. Check `SENDGRID_API_KEY` is set
2. Check `ALERT_EMAIL_RECIPIENTS` is configured
3. Test alerts: `POST /api/monitoring/alerting/test`
4. Check server logs for alert errors

### Metrics Not Collecting

1. Verify queue monitoring started (check logs for "Queue monitoring started")
2. Check Redis connection is healthy
3. Verify endpoints return data: `GET /api/monitoring/queue-metrics`

### Burn-In Test Failing

1. Review error logs in test output
2. Check specific failed requests
3. Verify server is running: `GET /api/monitoring/system-health`
4. Check for resource constraints (memory, connections)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Queue Monitor                         │
│  - Collects metrics every 30s                          │
│  - Checks alert thresholds                             │
│  - Sends alerts via AlertingService                    │
│  - Stores snapshots via MetricsCollector               │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼────────┐
│ AlertingService│                 │MetricsCollector │
│                │                 │                 │
│ • Email (SMTP) │                 │ • Snapshots     │
│ • Webhooks     │                 │ • Baselines     │
│ • Cooldowns    │                 │ • Trends        │
└────────────────┘                 └─────────────────┘
```

---

## Security Considerations

- Alert endpoints require admin authentication
- Baseline save requires admin access
- Webhook URLs should be kept secret
- Email recipients should be internal team only
- Monitoring endpoints are rate-limited

---

## Support

For questions or issues with production monitoring:
1. Check this documentation
2. Review server logs for errors
3. Test individual monitoring endpoints
4. Verify environment variables are set correctly

**Remember:** All 3 safeguards (queue monitoring, AI telemetry, chaos testing) must be operational before production launch!
