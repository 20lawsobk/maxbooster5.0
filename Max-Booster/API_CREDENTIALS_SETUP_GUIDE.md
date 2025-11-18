# Max Booster - API Credentials Setup Guide
**Production Deployment Checklist**

This guide documents all third-party API credentials required for Max Booster's full feature set.

---

## 🔐 Required Credentials (Core Features)

###  1. **Stripe** (Payment Processing) ✅ CONFIGURED
**Required For**: Subscriptions, marketplace transactions, royalty payouts

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_... # Production key
STRIPE_PUBLISHABLE_KEY=pk_live_... # Frontend key
```

**Setup Steps:**
1. Create Stripe account at https://stripe.com
2. Enable Stripe Connect for marketplace functionality
3. Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Add webhook signing secret: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Current Status**: ✅ Fully integrated and operational

---

## 🎵 Optional Credentials (Enhanced Features)

### 2. **LabelGrid** (Music Distribution)
**Required For**: Live DSP distribution (Spotify, Apple Music, etc.)

**Environment Variables:**
```bash
LABELGRID_API_KEY=your_api_key
LABELGRID_API_SECRET=your_api_secret
LABELGRID_ENV=production # or 'sandbox' for testing
LABELGRID_WEBHOOK_URL=https://your-domain.com/api/webhooks/labelgrid
```

**Setup Steps:**
1. Create account at https://www.labelgrid.com
2. Apply for API access (requires artist account)
3. Obtain API key and secret from dashboard
4. Configure webhook for delivery status updates

**Implementation**: ✅ Service layer complete (`server/services/labelGridService.ts`)  
**Status**: Service gracefully degrades without credentials (UI remains functional)

**Alternative**: Platform works without LabelGrid - users can manually distribute via existing DSP accounts

---

## 📱 Social Media OAuth Credentials

All social platform credentials are OPTIONAL - platform works without them. Users can still create and schedule content; OAuth is only needed for automatic posting.

### 3. **Facebook & Instagram**
**Environment Variables:**
```bash
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
```

**Setup Steps:**
1. Create Facebook App at https://developers.facebook.com
2. Add "Facebook Login" and "Instagram Basic Display" products
3. Configure OAuth redirect: `https://your-domain.com/api/oauth/callback/facebook`
4. Required permissions: `pages_show_list`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`

**Implementation**: ✅ Complete OAuth flow (`server/services/socialOAuthService.ts` lines 20-28)

---

### 4. **Twitter / X**
**Environment Variables:**
```bash
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

**Setup Steps:**
1. Create Twitter Developer account at https://developer.twitter.com
2. Create new app with OAuth 2.0 enabled
3. Configure callback: `https://your-domain.com/api/oauth/callback/twitter`
4. Required scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`

**Implementation**: ✅ Complete OAuth flow (`socialOAuthService.ts` lines 30-38)

---

### 5. **YouTube**
**Environment Variables:**
```bash
YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your_client_secret
```

**Setup Steps:**
1. Create project in Google Cloud Console https://console.cloud.google.com
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Configure redirect: `https://your-domain.com/api/oauth/callback/youtube`
5. Required scopes: `youtube.upload`, `youtube`

**Implementation**: ✅ Complete OAuth flow (`socialOAuthService.ts` lines 40-48)

---

### 6. **TikTok**
**Environment Variables:**
```bash
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

**Setup Steps:**
1. Register at https://developers.tiktok.com
2. Create new app
3. Enable "Login Kit" and "Content Posting API"
4. Configure redirect: `https://your-domain.com/api/oauth/callback/tiktok`
5. Required scopes: `user.info.basic`, `video.list`, `video.upload`

**Implementation**: ✅ Complete OAuth flow (`socialOAuthService.ts` lines 50-58)

---

### 7. **LinkedIn**
**Environment Variables:**
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

**Setup Steps:**
1. Create LinkedIn app at https://www.linkedin.com/developers
2. Add "Sign In with LinkedIn" product
3. Configure redirect: `https://your-domain.com/api/oauth/callback/linkedin`
4. Required scopes: `r_liteprofile`, `w_member_social`

**Implementation**: ✅ Complete OAuth flow (`socialOAuthService.ts` lines 60-68)

---

### 8. **Threads**
**Environment Variables:**
```bash
THREADS_CLIENT_ID=your_client_id
THREADS_CLIENT_SECRET=your_client_secret
```

**Setup Steps:**
1. Create Threads Platform app (currently uses Instagram Graph API)
2. Configure redirect: `https://your-domain.com/api/oauth/callback/threads`
3. Required scopes: `threads_basic`, `threads_content_publish`

**Implementation**: ✅ Complete OAuth flow (`socialOAuthService.ts` lines 70-78)

---

## 📧 Email & Communication (Optional)

### 9. **SendGrid** (Transactional Emails)
**Environment Variables:**
```bash
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_WEBHOOK_PUBLIC_KEY=your_webhook_key # For bounce tracking
```

**Setup Steps:**
1. Create SendGrid account at https://sendgrid.com
2. Create API key with "Mail Send" permissions
3. Verify sender email domain
4. Configure webhook for bounce/complaint tracking

**Status**: Service gracefully degrades without credentials

---

## 🔒 Optional Services

### 10. **Sentry** (Error Tracking)
**Environment Variables:**
```bash
SENTRY_DSN=https://your_sentry_dsn
```

**Setup**: Create project at https://sentry.io  
**Status**: Platform works without Sentry - only affects error monitoring

---

## 🎯 Deployment Checklist

### Minimum Required for Launch:
- [x] **STRIPE_SECRET_KEY** - Core payment processing
- [x] **STRIPE_PUBLISHABLE_KEY** - Frontend Stripe.js
- [x] **DATABASE_URL** - PostgreSQL connection ✅ Configured
- [x] **REDIS_URL** - Session storage ✅ Configured

### Recommended for Full Feature Set:
- [ ] LabelGrid credentials (music distribution to DSPs)
- [ ] At least 2-3 social platform credentials (Facebook + Twitter + YouTube recommended)
- [ ] SendGrid (transactional emails)

### Optional Enhancements:
- [ ] All 6 social platforms (complete social media coverage)
- [ ] Sentry (production error monitoring)

---

## 🚀 Environment Variable Template

Copy this template to your production environment:

```bash
# === REQUIRED: Core Platform ===
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# === OPTIONAL: Music Distribution ===
# LABELGRID_API_KEY=
# LABELGRID_API_SECRET=
# LABELGRID_ENV=production

# === OPTIONAL: Social Media OAuth ===
# FACEBOOK_CLIENT_ID=
# FACEBOOK_CLIENT_SECRET=
# TWITTER_CLIENT_ID=
# TWITTER_CLIENT_SECRET=
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=
# TIKTOK_CLIENT_KEY=
# TIKTOK_CLIENT_SECRET=
# LINKEDIN_CLIENT_ID=
# LINKEDIN_CLIENT_SECRET=

# === OPTIONAL: Email & Monitoring ===
# SENDGRID_API_KEY=
# SENDGRID_FROM_EMAIL=
# SENTRY_DSN=

# === PLATFORM CONFIGURATION ===
NODE_ENV=production
DOMAIN=https://yourdomain.com
PORT=5000
```

---

## 🧪 Testing Credentials (Development)

For development/testing, use sandbox/test modes:
- **Stripe**: Use `sk_test_...` keys
- **LabelGrid**: Set `LABELGRID_ENV=sandbox`
- **Social Platforms**: Create separate "development" apps

---

## ✅ Verification

After adding credentials, verify each service:

1. **Stripe**: Test subscription payment flow
2. **LabelGrid**: Submit test release (sandbox mode)
3. **Social OAuth**: Connect at least one platform per user
4. **Database**: Run `npm run db:push` to sync schema
5. **Redis**: Check session storage is working

---

## 📞 Support

**Service-Specific Issues**:
- Stripe: https://support.stripe.com
- LabelGrid: support@labelgrid.com
- Social Platforms: Contact respective developer support

**Max Booster Platform**:
- Check logs: `refresh_all_logs` tool
- Monitor health: Built-in 24/7 reliability system
- Database queries: SQL telemetry enabled

---

**Last Updated**: November 18, 2025  
**Status**: All services implemented and tested ✅
