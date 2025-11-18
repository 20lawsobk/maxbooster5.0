import session from 'express-session';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { createClient } from 'redis';

// Production-ready memory store with TTL management
class TTLMemoryStore extends EventEmitter {
  private sessions: Map<string, { session: any; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    super();
    // Clean up expired sessions every 15 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      15 * 60 * 1000
    );
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;

    for (const [sid, data] of this.sessions.entries()) {
      if (data.expires < now) {
        this.sessions.delete(sid);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
    }
  }

  get(sid: string, callback: (err: any, session?: any) => void) {
    const data = this.sessions.get(sid);

    if (!data) {
      return callback(null, null);
    }

    // Check if session has expired
    if (data.expires < Date.now()) {
      this.sessions.delete(sid);
      return callback(null, null);
    }

    callback(null, data.session);
  }

  set(sid: string, session: any, callback?: (err?: any) => void) {
    const maxAge = session.cookie?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
    const expires = Date.now() + maxAge;

    this.sessions.set(sid, { session, expires });
    if (callback) callback();
  }

  destroy(sid: string, callback?: (err?: any) => void) {
    this.sessions.delete(sid);
    if (callback) callback();
  }

  length(callback: (err: any, length?: number) => void) {
    callback(null, this.sessions.size);
  }

  clear(callback?: (err?: any) => void) {
    this.sessions.clear();
    if (callback) callback();
  }

  touch(sid: string, session: any, callback?: (err?: any) => void) {
    const data = this.sessions.get(sid);
    if (data) {
      const maxAge = session.cookie?.maxAge || 24 * 60 * 60 * 1000;
      data.expires = Date.now() + maxAge;
      data.session = session;
    }
    if (callback) callback();
  }

  // Cleanup method for graceful shutdown
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export async function createSessionStore() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Try Redis for production scaling
  if (process.env.REDIS_URL) {
    try {
      console.log('🔗 Attempting to connect to Redis for session storage...');

      const redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectAfterMs: 2000,
        },
      });

      redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected for session storage');
      });

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      await redisClient.connect();

      // Use connect-redis for session storage
      const connectRedis = require('connect-redis');
      const RedisSessionStore = connectRedis.default(session);
      return new RedisSessionStore({
        client: redisClient,
        prefix: 'maxbooster:sess:',
        ttl: 24 * 60 * 60, // 24 hours in seconds
      });
    } catch (error) {
      console.error('❌ Failed to connect to Redis, falling back to memory store:', error);
      if (isProduction) {
        console.warn(
          '⚠️  WARNING: Using memory store in production - sessions will not persist across restarts!'
        );
      }
    }
  } else if (isProduction) {
    console.warn('⚠️  WARNING: No REDIS_URL provided in production - using memory store');
  }

  // Fallback to enhanced memory store with TTL management
  console.log('📝 Using enhanced memory store with TTL management');
  return new TTLMemoryStore();
}

export function getSessionConfig(store: any) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Enforce strong session secret in production
  const sessionSecret = process.env.SESSION_SECRET;
  if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
    throw new Error('SESSION_SECRET must be at least 32 characters in production');
  }

  if (!sessionSecret) {
    console.warn('⚠️  Using default session secret - set SESSION_SECRET environment variable');
  }

  return {
    store,
    secret: sessionSecret || 'dev-secret-key-change-in-production-immediately',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    name: 'maxbooster.sid', // Custom session name
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true, // Prevent XSS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    },
    // Enhanced session security
    genid: () => {
      // Generate cryptographically secure session IDs
      return crypto.randomBytes(32).toString('hex');
    },
  };
}
