# Environment Configuration Guide

This guide covers all environment variables and secrets needed for Max Booster Platform production deployment.

---

## Critical Secrets (Required)

These secrets are absolutely required for the platform to function:

### Database & Cache

```bash
# PostgreSQL Database (Neon serverless)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
PGHOST=your-postgres-host.neon.tech
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database-name

# Redis Cache & Queue System
REDIS_URL=redis://default:password@host:port
```

**How to Get These:**
- Database: Already configured via Replit's PostgreSQL integration
- Redis: Already configured via Replit's Redis integration

---

## Optional but Recommended Secrets

These enhance functionality but aren't required for basic operation:

### Email & Alerting

```bash
# SendGrid for transactional emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@maxbooster.com

# Production alerting
ALERT_EMAIL_RECIPIENTS=admin@maxbooster.com,ops@maxbooster.com
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**How to Get These:**
1. SendGrid: Sign up at sendgrid.com → Create API key with "Mail Send" permissions
2. Slack Webhook: Slack → Settings → Apps → Incoming Webhooks → Add to Channel

### Payment Processing

```bash
# Stripe for payments and marketplace
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**How to Get These:**
1. Sign up at stripe.com
2. Dashboard → Developers → API Keys
3. Dashboard → Developers → Webhooks → Add endpoint

### Social Media OAuth

```bash
# Facebook/Instagram
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# Twitter/X
TWITTER_CLIENT_ID=your-client-id
TWITTER_CLIENT_SECRET=your-client-secret

# Google/YouTube
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**How to Get These:**
- Facebook: developers.facebook.com → Create App → Settings
- Twitter: developer.twitter.com → Projects & Apps → Create App
- Google: console.cloud.google.com → APIs & Services → Credentials

---

## Alert Threshold Configuration

Customize when alerts are sent:

```bash
# Queue Monitoring Thresholds
ALERT_QUEUE_MAX_WAITING=100        # Max waiting jobs before alert
ALERT_QUEUE_MAX_FAILED=50          # Max failed jobs before alert
ALERT_QUEUE_MAX_LATENCY=100        # Max Redis latency (ms) before alert

# AI Cache Thresholds
ALERT_AI_CACHE_MAX_UTIL=90         # Max cache utilization (%) before alert

# System Resource Thresholds
ALERT_MEMORY_MAX_MB=2048           # Max memory usage (MB) before alert
ALERT_ERROR_RATE_MAX=5             # Max error rate (%) before alert
```

---

## Application Configuration

```bash
# Environment
NODE_ENV=production                # Or 'development' for local testing

# Session Security
SESSION_SECRET=generate-a-long-random-string-here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=https://your-deployment-url.repl.co
```

**Generating SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Secret Validation

Before deploying, validate all secrets are configured:

```bash
# Run the pre-deployment checklist
npm run deploy:checklist
```

This will check:
- ✅ All required secrets are set
- ✅ Database connection works
- ✅ Redis connection works
- ✅ Monitoring endpoints operational
- ⚠️ Optional secrets missing (warnings only)

---

## Adding Secrets to Replit

### Via Secrets Tab (Recommended)

1. Click "Secrets" in left sidebar
2. Click "Add New Secret"
3. Enter key name (e.g., `SENDGRID_API_KEY`)
4. Enter secret value
5. Click "Add Secret"

### Via .env File (Development Only)

**⚠️ NEVER commit .env to git!**

Create `.env` in project root:

```bash
SENDGRID_API_KEY=SG.xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
# ... other secrets
```

The `.gitignore` already excludes `.env` files.

---

## Secret Rotation

For security, rotate secrets periodically:

### Recommended Rotation Schedule

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| Database passwords | Every 90 days |
| API keys (Stripe, SendGrid) | Every 180 days |
| OAuth secrets | Yearly or when compromised |
| Session secrets | Every 90 days |

### How to Rotate

1. Generate new secret value
2. Update in Replit Secrets tab
3. Test application functionality
4. Revoke old secret from provider

---

## Troubleshooting

### "Missing required variables" Error

**Problem:** Pre-deployment checklist fails with missing variables.

**Solution:**
1. Check the error message for which variables are missing
2. Add them via Replit Secrets tab
3. Restart the workflow
4. Run checklist again

### "Database connection failed" Error

**Problem:** DATABASE_URL not connecting.

**Solution:**
1. Verify DATABASE_URL is set in Secrets
2. Check Neon database is active (not paused)
3. Verify SSL mode: `?sslmode=require`
4. Test connection: `npm run deploy:checklist`

### "Redis connection issues" Error

**Problem:** Queue system not working.

**Solution:**
1. Verify REDIS_URL is set in Secrets
2. Check Redis service is running
3. Restart workflow: workflows restart in Replit UI
4. Check logs for specific Redis errors

---

## Security Best Practices

1. **Never log secrets** - Our logger automatically redacts them
2. **Use Replit Secrets** - Don't use .env in production
3. **Rotate regularly** - Follow rotation schedule above
4. **Limit access** - Only admins should see secrets
5. **Monitor usage** - Check for unauthorized API calls
6. **Revoke immediately** - If compromised, rotate ASAP

---

## Quick Reference

```bash
# View current secrets configuration (redacted)
npm run deploy:checklist

# Test database connection
npm run deploy:checklist | grep "Database"

# Test Redis connection
npm run deploy:checklist | grep "Redis"

# Verify all monitoring systems
curl http://localhost:5000/api/monitoring/system-health | jq
```

---

## Support

**Common Issues:**
- Missing secrets → Add via Replit Secrets tab
- Connection errors → Check DATABASE_URL and REDIS_URL format
- Alert not sending → Verify SENDGRID_API_KEY and ALERT_EMAIL_RECIPIENTS

**For Help:**
1. Run `npm run deploy:checklist` for diagnostics
2. Check logs: `npm run monitor:health`
3. Review this guide for secret format examples
