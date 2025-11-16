# Production Deployment Requirements

## Critical: Redis Configuration Required

### Current Status
⚠️ **BLOCKER**: Redis connection is failing. The platform is falling back to in-memory session storage.

### Why This Matters
- **User sessions**: Without Redis, user logins are lost when the server restarts
- **Job queues**: Background tasks (email sending, analytics, AI processing) need persistent queues
- **Caching**: Performance optimizations require distributed caching
- **Scalability**: Multiple server instances need shared session storage

### Impact
```
📝 Using memorystore for session management
❌ Users will be logged out on every server restart
❌ Background jobs won't persist
❌ Cannot scale horizontally
```

### Solution Options

#### Option 1: Replit Redis (Recommended for Replit deployments)
1. Enable Redis add-on in Replit dashboard
2. Replit automatically sets `REDIS_URL` secret
3. Restart application
4. ✅ Done!

**Cost**: Included with Replit Pro/Teams plans

#### Option 2: External Redis Service
Popular managed Redis providers:

**Upstash** (Serverless Redis)
- Free tier: 10,000 commands/day
- Paid: $0.20 per 100K commands
- Global edge network
- Setup: https://upstash.com/

**Redis Cloud** (Redis Labs)
- Free tier: 30MB
- Paid: From $5/month
- High availability
- Setup: https://redis.com/cloud/

**AWS ElastiCache**
- No free tier
- From $15/month
- Best for AWS deployments
- Setup: AWS Console

#### Option 3: Self-Hosted Redis
For advanced users only:
```bash
# Docker
docker run -d -p 6379:6379 redis:alpine

# Or install directly
apt-get install redis-server
```

### Configuration

Once you have a Redis URL, set it as a secret:

```bash
# Replit Secrets
REDIS_URL=redis://username:password@host:port
```

**Example URLs**:
```
redis://localhost:6379  # Local
redis://user:pass@redis.example.com:6379  # Remote
rediss://user:pass@redis.example.com:6380  # TLS
```

### Verification

After configuring Redis, check startup logs for:
```
✅ Redis primary client connected
📝 Using Redis for session management
```

Instead of:
```
❌ Redis connection failed after 10 retries
⚠️ Redis not available, falling back to in-memory operation
```

### Performance Requirements

For Max Booster Platform with expected load:

| Users | Redis Size | Estimated Cost |
|-------|------------|----------------|
| 0-100 | Free tier (Upstash/Redis Cloud) | $0 |
| 100-1K | 100MB | $5-10/month |
| 1K-10K | 500MB | $20-50/month |
| 10K+ | 1GB+ | $50-200/month |

### Current Fallback Behavior

The platform handles Redis unavailability gracefully:

✅ **Working**:
- Sessions (in-memory, lost on restart)
- Authentication (per-request)
- API endpoints

⚠️ **Degraded**:
- Background job queues (fall back to immediate execution)
- AI services (fall back to in-memory cache)
- Analytics (limited caching)

❌ **Not Working**:
- Persistent sessions across restarts
- Distributed caching
- Horizontal scaling
- Job queue persistence

### Next Steps

1. Choose a Redis option (Replit Redis recommended)
2. Set `REDIS_URL` secret
3. Restart the application
4. Verify Redis connection in logs
5. Test user login persists across restarts

### Estimated Time to Fix
- Replit Redis: **5 minutes**
- External service: **15-30 minutes**
- Self-hosted: **1-2 hours**

## Other Production Requirements

### ✅ Already Configured
- ✅ PostgreSQL database (Neon serverless)
- ✅ Stripe payments ($49/month, $468/year, $699/lifetime)
- ✅ SendGrid email (transactional emails)
- ✅ Replit App Storage (file persistence)
- ✅ Session secret (secure authentication)
- ✅ LabelGrid API token (music distribution)

### 🔍 Pending
- 🔍 **Redis** - CRITICAL for production
- 🔍 LabelGrid account activation (7-day free trial available)

### Production Readiness Checklist

- [x] Database configured (PostgreSQL + Neon)
- [x] Payment processing (Stripe Live mode)
- [x] Email service (SendGrid with templates)
- [x] File storage (Replit App Storage)
- [x] Security (session secrets, CORS, rate limiting)
- [x] Monitoring (health checks, metrics, logging)
- [x] Error handling (graceful degradation)
- [ ] **Redis session storage** ⚠️ REQUIRED
- [ ] LabelGrid distribution API (start 7-day trial)

### Deployment Command

Once Redis is configured:

1. Click "Publish" in Replit
2. Select "Reserved VM" deployment
3. Verify all secrets are set
4. Deploy!

**Estimated time to production**: 30 minutes after Redis setup

---

**Need help?** Check the logs for specific error messages or contact Replit support for Redis setup assistance.
