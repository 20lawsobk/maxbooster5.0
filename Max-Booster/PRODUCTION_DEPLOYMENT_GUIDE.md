# Production Deployment Guide - Max Booster Platform

## 🚀 Step 1: Deploy to Production

### Publishing Process

1. **Open Publishing Tool**
   - Click the "Publish" button in your Replit workspace (top right)
   - Or open the "Publishing" tool from the left sidebar

2. **Choose Deployment Type: RESERVED VM** (Recommended)
   - **Why Reserved VM?** Your app has:
     - WebSocket connections for real-time features
     - Redis session storage (stateful connections)
     - PostgreSQL database integration
     - Long-running processes (24/7/365 reliability system)
   - Reserved VM provides consistent computing resources without interruptions
   - Autoscale may disconnect WebSocket sessions during scaling events

3. **Configure Reserved VM Settings**
   ```
   Machine Power: 2 vCPU, 4GB RAM (minimum recommended)
   Build Command: npm run build
   Run Command: npm run start
   Port: 5000 → 80 (already configured)
   App Type: Web server
   ```

4. **Verify Environment Secrets**
   - ✅ DATABASE_URL (PostgreSQL - Neon)
   - ✅ REDIS_URL (Redis Cloud)
   - ✅ STRIPE_PUBLISHABLE_KEY (Live mode)
   - ✅ STRIPE_SECRET_KEY (Live mode)
   - ✅ SESSION_SECRET
   - ✅ REPLIT_BUCKET_ID (Cloud storage)
   - ✅ SENDGRID_API_KEY
   - ⚠️ SENTRY_DSN (Optional - not yet configured)

5. **Click "Publish"**
   - First deployment takes 3-5 minutes
   - You'll receive a production URL: `https://your-app-name.replit.app`

---

## ✅ Step 2: Test Critical User Flows on Production

### Production Testing Checklist

#### 🔐 Authentication & Onboarding
- [ ] **Sign Up Flow**
  - Create new account with email/password
  - Verify email validation works
  - Check welcome email received (SendGrid)
  - Confirm user redirected to onboarding

- [ ] **Onboarding Wizard**
  - Complete 4-step wizard (Welcome → Account Type → Goals → Experience)
  - Verify data saves to database
  - Check dashboard loads after completion

- [ ] **Login Flow**
  - Log in with email/password
  - Test "Remember me" functionality
  - Verify session persists (Redis)
  - Test logout and session cleanup

- [ ] **Password Reset**
  - Request password reset
  - Receive reset email (SendGrid)
  - Complete password reset flow
  - Login with new password

#### 💳 Subscription & Payments (Stripe Live Mode)
- [ ] **Free Trial**
  - New users get 7-day trial with premium access
  - Verify premium features accessible during trial
  - Check trial expiration date shown correctly

- [ ] **Subscription Purchase**
  - Test Monthly ($49/month): `price_1SEWW4GIdnrORdO6gJkLUYf6`
  - Test Yearly ($468/year): `price_1SEWW4GIdnrORdO6rqHRJXqU`
  - Test Lifetime ($699): `price_1SEWW4GIdnrORdO67f0bFAe0`
  - Verify Stripe checkout redirects correctly
  - Confirm subscription activates in database

- [ ] **Subscription Enforcement**
  - After trial expires, premium features locked
  - Free tier can still access basic features
  - Upgrade prompts shown on premium pages

#### 🎵 Music Studio (DAW)
- [ ] **Load Studio**
  - Navigate to /studio
  - Verify canvas renders waveforms
  - Check mixer loads 24 channels
  - Test playback controls (play/pause/stop)

- [ ] **File Operations**
  - Upload audio file (WAV/MP3)
  - Verify file stored in Replit Cloud Storage
  - Export project
  - Download exported file

- [ ] **Audio Processing**
  - Test AI Mixing (OpenAI integration)
  - Test AI Mastering
  - Verify processed audio plays correctly

#### 📱 Social Media Automation
- [ ] **OAuth Connections**
  - Connect Twitter account (test OAuth flow)
  - Connect Facebook/Instagram
  - Verify tokens stored in database
  - Check connection status shown in UI

- [ ] **Content Posting**
  - Create new post in Content Generator
  - Schedule post for future time
  - Verify post saves to database
  - Check autopilot engine processes scheduled posts

- [ ] **Real Social Media Posting** (CRITICAL)
  - Create test post and publish immediately
  - Verify post appears on connected Twitter/Facebook
  - Check engagement analytics update
  - Test multi-platform posting (post to all platforms)

#### 🛒 Beat Marketplace
- [ ] **Browse Listings**
  - Navigate to /marketplace
  - Browse beat listings
  - Search for specific beats
  - Filter by price/genre

- [ ] **Create Listing** (Premium Feature)
  - Upload beat file
  - Set price and metadata
  - Publish listing
  - Verify appears in marketplace

- [ ] **Purchase Flow**
  - Add beat to cart
  - Complete Stripe Connect checkout
  - Verify seller receives payout (instant payout)
  - Buyer receives download link

#### 📊 Analytics & AI Insights
- [ ] **Dashboard Analytics**
  - View streaming metrics
  - Check revenue forecasting
  - Verify charts render correctly
  - Test anomaly detection alerts

- [ ] **AI Analytics**
  - Navigate to /ai-analytics
  - Verify 5 analytics endpoints work:
    - Predict Metrics
    - Churn Prediction
    - Revenue Forecasting
    - Anomaly Detection
    - AI Insights
  - Check real statistical calculations (not mock data)

#### 🔒 Security & Monitoring
- [ ] **Security Dashboard**
  - Navigate to /security
  - Check system health metrics
  - Verify behavioral alerts
  - Test security logs display

- [ ] **24/7 Reliability System**
  - Monitor uptime from deployment start
  - Check garbage collection running (--expose-gc)
  - Verify no memory leaks over 24 hours

#### 📧 Email System (SendGrid)
- [ ] **Transactional Emails**
  - Welcome email on signup
  - Password reset email
  - Subscription confirmation email
  - Distribution status emails

---

## 📈 Step 3: Monitor Performance & Error Logs

### Production Monitoring Setup

#### 1. **Replit Built-in Monitoring**

Access from Publishing Tool:
- **Logs Tab**: View real-time application logs
- **Analytics Tab**: Monitor requests, response times, errors
- **Metrics Tab**: CPU, memory, network usage

Key Metrics to Monitor:
```
Response Time: Target <100ms (currently 12-17ms in dev)
Error Rate: Target <0.1%
Uptime: Target 99.9%
Memory Usage: Monitor for leaks (should stabilize after 1 hour)
CPU Usage: Target <70% average
```

#### 2. **Application-Level Monitoring**

**Health Endpoints:**
```bash
# Basic health check
curl https://your-app.replit.app/api/health

# Readiness check (database + Redis)
curl https://your-app.replit.app/api/health/ready

# Liveness check (fast response)
curl https://your-app.replit.app/api/health/live
```

**Database Connection Pool:**
- Monitor active connections (max 20)
- Alert if connections > 15 for >5 minutes

**Redis Session Store:**
- Monitor session count (80B Redis Cloud capacity)
- Alert if sessions > 60B

**Replit Object Storage:**
- Monitor storage usage
- Alert if usage > 80%

#### 3. **Error Tracking**

**Current Setup:**
- Enhanced global error handler logs all errors
- Critical errors logged with stack traces
- Audit system tracks security events

**Log Locations in Production:**
```bash
# View production logs
Open Publishing Tool → Logs tab

# Filter for errors
Search: "ERROR" or "CRITICAL"

# Monitor specific services
Search: "PAYMENT ERROR" / "SOCIAL MEDIA ERROR" / "DATABASE ERROR"
```

**Common Issues to Monitor:**

| Issue | Log Pattern | Action |
|-------|-------------|--------|
| Redis disconnection | `Redis connection error` | Check REDIS_URL secret |
| Database timeout | `Database query timeout` | Check connection pool |
| Stripe webhook failure | `Stripe webhook error` | Verify webhook secret |
| Social media API failure | `SOCIAL MEDIA ERROR` | Check OAuth tokens |
| File upload failure | `Storage error` | Check REPLIT_BUCKET_ID |

#### 4. **Performance Monitoring**

**Response Time Benchmarks:**
```
API Endpoints:
  /api/auth/* : <50ms
  /api/studio/* : <200ms (file processing)
  /api/analytics/* : <300ms (statistical calculations)
  /api/marketplace/* : <100ms

WebSocket Connections:
  Connection time: <100ms
  Message latency: <50ms
```

**Load Testing (Monthly):**
```bash
# Run load test against production
node load-test.js --url https://your-app.replit.app --users 100
```

Expected Results:
- Average response time: <20ms
- Requests/sec: >20
- Error rate: 0%

#### 5. **Security Monitoring**

**Self-Healing Security System:**
- Monitors 400+ endpoints continuously
- Auto-detects behavioral anomalies
- Logs penetration test results

**Access Dashboard:**
```
Production URL: https://your-app.replit.app/security
Admin login required
```

**Weekly Security Checklist:**
- [ ] Review security alerts in dashboard
- [ ] Check failed login attempts
- [ ] Monitor suspicious API calls
- [ ] Verify SSL certificate valid
- [ ] Review audit logs for unauthorized access

#### 6. **Business Metrics Dashboard**

**Key Metrics to Track:**

```
User Metrics:
  - Total users (target: 1,000 in month 1)
  - Active users (DAU/MAU ratio)
  - Trial-to-paid conversion rate (target: 15%)

Revenue Metrics:
  - MRR (Monthly Recurring Revenue)
  - Subscription breakdown (monthly/yearly/lifetime)
  - Marketplace transaction volume

Engagement Metrics:
  - Average studio sessions per user
  - Social media posts published
  - Beats purchased per month
  - Distribution releases per month
```

Access from:
```
Production URL: https://your-app.replit.app/admin/analytics
Admin-only access
```

---

## 🔧 Step 4: (Optional) Integrate Sentry Error Tracking

### Current Status
⚠️ **Sentry v8 Integration Attempted - Removed Due to Module Conflicts**

Sentry packages installed but integration code removed to maintain stability:
- `@sentry/node` v8.40.0
- `@sentry/react` v8.40.0
- `@sentry/browser` v8.40.0

### Future Integration Options

**Option A: Wait for Sentry v8 Compatibility Fix**
- Monitor Sentry v8 changelog for drizzle-orm compatibility
- Test in development branch before production

**Option B: Downgrade to Sentry v7 (Stable)**
```bash
npm install @sentry/node@7 @sentry/react@7 @sentry/browser@7
```

Sentry v7 uses legacy API that works with current setup:
```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

**Option C: Alternative Error Tracking Services**
- **Rollbar** (simpler integration, good React support)
- **Bugsnag** (excellent error grouping, affordable)
- **LogRocket** (session replay + error tracking)

### Recommendation
Use Replit's built-in logging for first 30 days, then evaluate:
- If error volume is low (<10/day), Replit logs are sufficient
- If error volume is high or complex debugging needed, integrate Sentry v7

---

## 🎯 Post-Deployment Checklist

### Week 1: Launch & Stabilization
- [ ] Deploy to production (Reserved VM)
- [ ] Complete all critical flow tests
- [ ] Monitor logs daily for errors
- [ ] Fix any P0 (critical) bugs immediately
- [ ] Announce launch to beta users

### Week 2: Performance Tuning
- [ ] Run load tests with real traffic patterns
- [ ] Optimize slow endpoints (>500ms)
- [ ] Review and tune database queries
- [ ] Monitor memory usage trends
- [ ] Set up automated health checks

### Week 3: Business Metrics
- [ ] Track conversion rates (trial → paid)
- [ ] Monitor subscription churn
- [ ] Analyze feature usage patterns
- [ ] Gather user feedback
- [ ] Plan feature priorities based on data

### Week 4: Scaling Preparation
- [ ] Review Reserved VM resource usage
- [ ] Plan for horizontal scaling if needed
- [ ] Optimize Redis cache strategy
- [ ] Consider CDN for static assets
- [ ] Document runbooks for common issues

---

## 🚨 Emergency Procedures

### Production Down (500 errors)
1. Check Replit Publishing Tool → Logs
2. Look for crash loops or startup errors
3. Verify all environment secrets present
4. Check database/Redis connectivity
5. Rollback to previous deployment if needed

### High Error Rate (>1% requests)
1. Filter logs by "ERROR" in Publishing Tool
2. Identify error pattern (auth, payment, database, etc.)
3. Check external service status (Stripe, SendGrid, Redis Cloud)
4. Deploy hotfix if specific bug identified

### Performance Degradation
1. Check CPU/memory usage in Publishing Tool
2. Review slow query logs in PostgreSQL
3. Clear Redis cache if stale
4. Restart deployment if memory leak suspected

### Security Incident
1. Access Security Dashboard: `/security`
2. Review behavioral alerts and audit logs
3. Suspend suspicious user accounts
4. Rotate API keys if compromised
5. Contact Replit support if DDoS attack

---

## 📞 Support Resources

**Replit Support:**
- Documentation: https://docs.replit.com
- Community: https://replit.com/talk
- Support: Click "Help" in Replit workspace

**Service Provider Support:**
- Stripe: https://support.stripe.com
- Redis Cloud: https://redis.com/support
- Neon (PostgreSQL): https://neon.tech/docs
- SendGrid: https://support.sendgrid.com

**Platform Monitoring:**
- Replit Status: https://status.replit.com
- Stripe Status: https://status.stripe.com

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ All health checks return 200 OK
- ✅ Users can sign up, subscribe, and access features
- ✅ Social media posting works on real platforms
- ✅ Payments process correctly (Stripe live mode)
- ✅ File uploads persist in cloud storage
- ✅ Response times <100ms for 95% of requests
- ✅ Uptime >99% for first week
- ✅ No critical errors in production logs

---

**Deployment Date:** _____________
**Production URL:** _____________
**Initial Users:** _____________
**First Week Revenue:** _____________
