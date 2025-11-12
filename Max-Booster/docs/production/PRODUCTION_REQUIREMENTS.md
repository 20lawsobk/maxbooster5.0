# Max Booster - Production Requirements

This document outlines the critical infrastructure requirements for deploying Max Booster to production.

## Database Requirements

### PostgreSQL Database
- **Required**: Yes
- **Version**: PostgreSQL 14 or higher
- **Connection**: Set `DATABASE_URL` environment variable
- **Schema Sync**: Run `npm run db:push` after deployment to sync schema
- **Connection Pooling**: Configured for 20 connections (adjustable via `DB_POOL_SIZE`)

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
DB_POOL_SIZE=20  # Optional, default: 20
DB_MAX_CONNECTIONS=100  # Optional, default: 100
```

## Redis Requirements

### Redis for Production Scaling
- **Required**: Strongly recommended for production
- **Version**: Redis 6.0 or higher
- **Purpose**: Session storage, caching, rate limiting, analytics
- **Fallback**: Development mode uses in-memory fallback; production should always use Redis

**Features using Redis:**
- Session management across multiple servers
- API rate limiting (distributed)
- Real-time analytics caching
- AI service result caching
- Social queue management

**Environment Variables:**
```bash
REDIS_URL=redis://host:port  # Required for production
REDIS_MAX_RETRIES=3  # Optional, default: 3
REDIS_RETRY_DELAY=1000  # Optional, default: 1000ms
```

**Without Redis in Production:**
- ⚠️ Sessions won't persist across server restarts
- ⚠️ Rate limiting won't work across multiple instances
- ⚠️ Analytics will be slower without caching
- ⚠️ AI services will recompute results instead of using cache

### Graceful Degradation

In development mode:
- Redis connection failures automatically fall back to in-memory storage
- Minimal logging to avoid spam
- All features continue to work (with reduced performance)

In production mode:
- Redis connection failures are logged as errors
- Features degrade gracefully but may have reduced performance
- Recommended to monitor Redis health

## Security Requirements

### Session Secret
- **Required**: Yes (production only)
- **Minimum Length**: 32 characters
- **Purpose**: Session cookie encryption

**Environment Variables:**
```bash
SESSION_SECRET=your-secure-random-string-min-32-chars
```

### Stripe (Payment Processing)
- **Required**: For payment features
- **API Key Format**: Must start with `sk_test_` (test) or `sk_live_` (production)

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_...  # Live key for production
```

## Storage Requirements

### File Storage
- **Default**: Local filesystem (development)
- **Production Options**: Local or S3-compatible storage

**For S3/Object Storage:**
```bash
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT=https://s3.amazonaws.com  # Optional, for MinIO/custom S3
```

## Monitoring & Scaling

### Performance Monitoring
- Query telemetry enabled by default
- Automatic slow query detection (>100ms)
- Memory and connection pool monitoring

### Capacity Planning
- **Database Connections**: 20-100 recommended
- **Max Sessions**: 50,000 default (configurable via `MAX_SESSIONS`)
- **Rate Limiting**: 100 requests/minute default (configurable via `RATE_LIMIT_MAX`)

## Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` with production database
- [ ] Configure `REDIS_URL` with production Redis instance
- [ ] Set secure `SESSION_SECRET` (min 32 characters)
- [ ] Configure Stripe with live API key
- [ ] Set up S3/object storage (if not using local filesystem)
- [ ] Run `npm run db:push` to sync database schema
- [ ] Verify all environment variables are set
- [ ] Test Redis connection
- [ ] Test database connection
- [ ] Enable HTTPS (automatic in production)
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and alerting

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Redis | Optional (in-memory fallback) | Strongly recommended |
| Session Secret | Auto-generated | Required (env var) |
| HTTPS | Disabled | Enabled |
| Error Logging | Verbose | Error-only |
| Redis Error Logging | Suppressed | Full logging |
| Session Store | Memory | Redis preferred |

## Health Checks

Monitor these endpoints:
- `GET /api/health` - Overall system health
- Database connection pool utilization
- Redis connection status
- Memory usage
- Active sessions count

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Verify connection string
echo $REDIS_URL
```

### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check schema sync status
npm run db:push
```

### Session Issues
- Verify `SESSION_SECRET` is set in production
- Check Redis connection for distributed sessions
- Verify cookie settings allow HTTPS in production

## Support & Resources

- **Database Migrations**: Use `npm run db:push` to sync schema changes
- **Redis Documentation**: https://redis.io/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Stripe Documentation**: https://stripe.com/docs

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive configuration
3. **Rotate SESSION_SECRET** periodically
4. **Use TLS/SSL** for Redis and PostgreSQL connections in production
5. **Enable Redis AUTH** for production Redis instances
6. **Implement database SSL** for production PostgreSQL connections
7. **Regular security audits** of dependencies

---

**Last Updated**: November 2025
**Maintained by**: Max Booster Platform Team
