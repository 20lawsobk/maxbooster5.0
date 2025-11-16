# Max Booster Platform - Production Setup Guide

## 🔒 Security-First Production Deployment

This guide ensures your Max Booster Platform is deployed securely for paid users.

---

## Prerequisites

- Replit Reserved VM deployment (NOT Autoscale)
- Production environment secrets configured
- Database backup strategy in place
- Strong admin credentials ready

---

## Step 1: Configure Environment Secrets

### Required Secrets

Configure these in Replit's Secrets tool:

```bash
# Database (Auto-configured by Replit)
DATABASE_URL=<auto-configured>
PGHOST=<auto-configured>
PGPORT=<auto-configured>
PGDATABASE=<auto-configured>
PGUSER=<auto-configured>
PGPASSWORD=<auto-configured>

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Redis (Optional - for production caching)
REDIS_URL=redis://...

# LabelGrid (Music Distribution)
LABELGRID_API_TOKEN=<your-production-token>

# Production Mode
NODE_ENV=production
```

### ⚠️ NEVER Set These in Production:
```bash
# SECURITY: These enable test accounts with weak passwords
ENABLE_DEV_ACCOUNTS=true  # ❌ NEVER SET IN PRODUCTION
```

---

## Step 2: Deploy to Reserved VM

1. **Configure Deployment Target**
   - Deployment must use `cloudrun` (Reserved VM) NOT `autoscale`
   - Verified in `.replit` file: `deploymentTarget = "cloudrun"`

2. **Deploy Application**
   ```bash
   # In Replit, click "Deploy" button
   # Select "Reserved VM" deployment
   # Choose appropriate instance size based on expected load
   ```

---

## Step 3: Create Secure Admin Account

**After deployment**, create your admin account using the secure bootstrap script:

```bash
# Run in Replit Shell (or SSH to production server)
ADMIN_EMAIL=your-admin@example.com \
ADMIN_PASSWORD=YourSecurePassword123! \
npm run bootstrap:admin
```

### Password Requirements:
- ✅ Minimum 12 characters
- ✅ Must contain uppercase letters
- ✅ Must contain lowercase letters  
- ✅ Must contain numbers
- ✅ Must contain special characters

### After Bootstrap:
```bash
# IMPORTANT: Remove password from environment immediately
unset ADMIN_PASSWORD
```

---

## Step 4: Verify Production Deployment

### Health Checks

```bash
# Check API health
curl https://your-deployment.replit.app/api/health

# Expected response:
{
  "status": "healthy",
  "uptime": "...",
  "version": "1.0.0"
}
```

### Database Connection

```bash
# Verify database is accessible
curl https://your-deployment.replit.app/api/health/ready

# Expected: 200 OK
```

### Background Jobs

Check deployment logs for:
```
✅ Queue Service initialized (Redis)
✅ Analytics anomaly detection running
✅ Security monitoring active
🚀 Max Booster Platform - 24/7/365 Ready!
```

---

## Step 5: Configure Stripe Products

Verify Stripe products are using **live mode** price IDs:

```bash
# In deployment logs, confirm:
✅ Stripe configured in live mode
✅ Products: Monthly ($49), Yearly ($468), Lifetime ($699)
```

---

## Step 6: Test Critical Flows

### Test Signup Flow

1. Visit: `https://your-deployment.replit.app/signup`
2. Create account with valid email
3. Verify email delivery (SendGrid)
4. Complete onboarding flow

### Test Payment Flow

1. Login as test user
2. Navigate to Settings → Subscription
3. Attempt upgrade (use Stripe test card in test mode first)
4. Verify subscription status updates

### Test Studio Access

1. Login as subscribed user
2. Navigate to Studio
3. Verify DAW loads correctly
4. Test audio upload and playback

---

## Step 7: Enable Monitoring

### Application Monitoring

Deployment includes built-in monitoring:
- Health checks: `/api/health`, `/api/health/ready`, `/api/health/live`
- Performance metrics logged every 60 seconds
- Security monitoring active 24/7

### External Monitoring (Recommended)

Configure external monitoring services:
- **Uptime**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry (optional)
- **Logs**: Replit Logs, LogTail (optional)

---

## Step 8: Database Backups

### Replit Automatic Backups

Replit PostgreSQL includes automatic backups. Configure:
- Backup frequency: Daily
- Retention: 7-30 days
- Point-in-time recovery enabled

### Manual Backup (Optional)

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Store backup securely (S3, etc.)
```

---

## Security Checklist

- [x] No hardcoded credentials in code
- [x] Production secrets configured in Replit Secrets
- [x] Admin account created with strong password
- [x] ENABLE_DEV_ACCOUNTS not set in production
- [x] Stripe using live mode keys
- [x] SendGrid configured with production API key
- [x] Database backups enabled
- [x] Health monitoring active
- [x] Reserved VM deployment (not Autoscale)

---

## Troubleshooting

### Issue: "503 Service Unavailable"

**Cause**: Server not starting properly

**Fix**:
1. Check deployment logs for errors
2. Verify all required secrets are set
3. Verify `NODE_ENV=production` is set
4. Check database connection

### Issue: "Admin login fails"

**Cause**: Admin account not created

**Fix**:
```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=SecurePass123! \
npm run bootstrap:admin
```

### Issue: "Payments not working"

**Cause**: Stripe keys not configured or in test mode

**Fix**:
1. Verify `STRIPE_SECRET_KEY` starts with `sk_live_`
2. Check Stripe dashboard for webhook configuration
3. Test with Stripe test card first

---

## Support

For production support:
- Documentation: `/DEPLOYMENT_CHECKLIST.md`
- Health Status: `https://your-deployment.replit.app/api/health`
- Logs: Replit Deployment → Logs tab

---

## Post-Launch Checklist

After successful deployment:

- [ ] Admin account created and verified
- [ ] Test user signup flow end-to-end
- [ ] Test payment processing with Stripe test card
- [ ] Verify all email notifications sending
- [ ] Monitor deployment logs for errors (first 24h)
- [ ] Set up uptime monitoring
- [ ] Document any production-specific configuration
- [ ] Add Terms of Service page
- [ ] Add Privacy Policy page
- [ ] Configure custom domain (optional)

---

**🎉 Congratulations! Your Max Booster Platform is production-ready!**
