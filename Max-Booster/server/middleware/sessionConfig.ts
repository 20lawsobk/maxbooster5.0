import session from 'express-session';
import crypto from 'crypto';
import { RedisStore } from 'connect-redis';
import { getRedisClient } from '../lib/redisConnectionFactory.js';

export async function createSessionStore() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use Redis for production-grade horizontal scaling
  if (process.env.REDIS_URL) {
    try {
      console.log('🔗 Connecting to Redis for session storage...');
      
      // Get shared Redis client (eliminates connection thrashing)
      const redisClient = await getRedisClient();
      
      if (!redisClient) {
        throw new Error('Redis client not available');
      }

      // Create Redis session store (connect-redis v7 with official redis library)
      const store = new RedisStore({
        client: redisClient,
        prefix: 'maxbooster:sess:',
        ttl: 86400, // 24 hours in seconds
      });

      console.log('✅ Redis session store created successfully');
      console.log('📊 Session persistence: ENABLED (Redis Cloud - 80 billion capacity)');
      console.log('🚀 Horizontal scaling: READY (sessions shared across all instances)');
      
      return store;
    } catch (error: any) {
      console.error('❌ Failed to create Redis session store:', error.message);
      throw new Error('Session storage initialization failed - cannot start in production without Redis');
    }
  } else {
    throw new Error('REDIS_URL not configured - cannot initialize session storage for production scaling');
  }
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