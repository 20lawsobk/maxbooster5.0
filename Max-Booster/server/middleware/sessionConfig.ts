import session from 'express-session';
import crypto from 'crypto';
import createMemoryStore from 'memorystore';
import { RedisStore } from 'connect-redis';
import { getRedisClient } from '../lib/redisConnectionFactory.js';

export async function createSessionStore() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Try Redis for production scaling
  if (process.env.REDIS_URL) {
    try {
      console.log('🔗 Attempting to connect to Redis for session storage...');
      
      // Use shared Redis connection factory (eliminates connection thrashing)
      const redisClient = await getRedisClient();
      
      if (!redisClient) {
        throw new Error('Redis client not available');
      }

      // Use connect-redis for session storage (supports ioredis)
      const store = new RedisStore({
        client: redisClient,
        prefix: 'maxbooster:sess:',
        ttl: 24 * 60 * 60, // 24 hours in seconds
      });
      console.log('✅ Redis session store created successfully');
      return store;
    } catch (error) {
      console.error('❌ Failed to connect to Redis, falling back to memory store:', error);
      if (isProduction) {
        console.warn('⚠️  WARNING: Using memory store in production - sessions will not persist across restarts!');
      }
    }
  } else if (isProduction) {
    console.warn('⚠️  WARNING: No REDIS_URL provided in production - using memory store');
  }

  // Fallback to memorystore - production-ready memory session store
  console.log('📝 Using memorystore for session management');
  const MemoryStore = createMemoryStore(session);
  return new MemoryStore({
    checkPeriod: 86400000, // 24 hours cleanup interval
    ttl: 86400000, // 24 hours TTL
  });
}

export function getSessionConfig(store: any) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // CRITICAL: Validate SESSION_SECRET exists in production
  const sessionSecret = process.env.SESSION_SECRET;
  
  if (isProduction) {
    if (!sessionSecret) {
      throw new Error('SESSION_SECRET environment variable is required in production');
    }
    
    if (sessionSecret.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters for cryptographic security');
    }
  } else if (!sessionSecret) {
    console.warn('⚠️  WARNING: SESSION_SECRET not set. Using default for development only.');
    console.warn('⚠️  Set SESSION_SECRET environment variable for production security.');
  }
  
  // Use provided secret or secure development default
  const finalSecret = sessionSecret || crypto.randomBytes(32).toString('hex');
  
  return {
    store,
    secret: finalSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    name: 'sessionId', // Don't use default 'connect.sid' (security)
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' as const, // CSRF protection
    },
    // Enhanced session security
    genid: () => {
      // Generate cryptographically secure session IDs
      return crypto.randomBytes(32).toString('hex');
    }
  };
}