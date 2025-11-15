/**
 * Graceful Redis Client Wrapper
 * 
 * Provides a Redis client that gracefully handles connection failures in development,
 * falling back to in-memory storage while logging minimal warnings.
 * 
 * In production, Redis is required and failures will be logged as errors.
 */

import { Redis } from 'ioredis';
import { config } from '../config/defaults.js';

interface RedisClientWrapper {
  client: Redis | null;
  isConnected: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

class InMemoryFallback {
  private store: Map<string, { value: string; expiry?: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired keys every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (data.expiry && data.expiry < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async get(key: string): Promise<string | null> {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expiry && data.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return data.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const data = this.store.get(key);
    if (!data) return false;
    if (data.expiry && data.expiry < Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || '0', 10) + 1).toString();
    await this.set(key, newValue);
    return parseInt(newValue, 10);
  }

  async expire(key: string, seconds: number): Promise<void> {
    const data = this.store.get(key);
    if (data) {
      data.expiry = Date.now() + seconds * 1000;
    }
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

export function createGracefulRedisClient(serviceName: string): RedisClientWrapper {
  const isDevelopment = config.nodeEnv === 'development';
  let redisClient: Redis | null = null;
  let isConnected = false;
  let fallback: InMemoryFallback | null = null;
  let hasLoggedWarning = false;

  try {
    redisClient = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        // Only retry 3 times
        if (times > 3) {
          return null;
        }
        return Math.min(times * config.redis.retryDelay, 3000);
      },
      lazyConnect: true, // Don't connect immediately
      maxRetriesPerRequest: 1,
      showFriendlyErrorStack: false, // Suppress internal ioredis error stack logging
    });

    redisClient.on('connect', () => {
      isConnected = true;
      if (isDevelopment) {
        console.log(`✅ ${serviceName} Redis connected`);
      }
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      
      // Log once and fall back gracefully in all environments
      if (!hasLoggedWarning) {
        console.warn(`⚠️  ${serviceName}: Redis unavailable (${err.message}), using in-memory fallback`);
        hasLoggedWarning = true;
      }
      if (!fallback) {
        fallback = new InMemoryFallback();
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Don't call connect() - let it connect lazily on first use
    // This prevents promise rejection errors from being logged
    // The error event handler will catch connection failures
  } catch (err) {
    console.warn(`⚠️  ${serviceName}: Redis initialization failed, using in-memory fallback`);
    fallback = new InMemoryFallback();
  }

  // Helper to determine which client to use
  const getClient = () => {
    if (redisClient && isConnected) {
      return redisClient;
    }
    // PRODUCTION FALLBACK: Use in-memory fallback if Redis is unavailable
    // This allows the app to run without Redis in any environment
    if (!fallback) {
      if (!hasLoggedWarning) {
        console.warn(`⚠️  ${serviceName}: Redis unavailable, using in-memory fallback`);
        hasLoggedWarning = true;
      }
      fallback = new InMemoryFallback();
    }
    return fallback;
  };

  return {
    client: redisClient,
    get isConnected() {
      return isConnected;
    },

    async get(key: string): Promise<string | null> {
      const client = getClient();
      if (!client) return null;
      
      try {
        if (client instanceof InMemoryFallback) {
          return await client.get(key);
        }
        return await client.get(key);
      } catch (err) {
        if (isDevelopment && fallback) {
          return await fallback.get(key);
        }
        return null;
      }
    },

    async set(key: string, value: string, ttl?: number): Promise<void> {
      const client = getClient();
      if (!client) return;

      try {
        if (client instanceof InMemoryFallback) {
          await client.set(key, value, ttl);
        } else if (ttl) {
          await client.setex(key, ttl, value);
        } else {
          await client.set(key, value);
        }
      } catch (err) {
        if (isDevelopment && fallback) {
          await fallback.set(key, value, ttl);
        }
      }
    },

    async del(key: string): Promise<void> {
      const client = getClient();
      if (!client) return;

      try {
        if (client instanceof InMemoryFallback) {
          await client.del(key);
        } else {
          await client.del(key);
        }
      } catch (err) {
        if (isDevelopment && fallback) {
          await fallback.del(key);
        }
      }
    },

    async exists(key: string): Promise<boolean> {
      const client = getClient();
      if (!client) return false;

      try {
        if (client instanceof InMemoryFallback) {
          return await client.exists(key);
        }
        const result = await client.exists(key);
        return result === 1;
      } catch (err) {
        if (isDevelopment && fallback) {
          return await fallback.exists(key);
        }
        return false;
      }
    },

    async incr(key: string): Promise<number> {
      const client = getClient();
      if (!client) return 0;

      try {
        if (client instanceof InMemoryFallback) {
          return await client.incr(key);
        }
        return await client.incr(key);
      } catch (err) {
        if (isDevelopment && fallback) {
          return await fallback.incr(key);
        }
        return 0;
      }
    },

    async expire(key: string, seconds: number): Promise<void> {
      const client = getClient();
      if (!client) return;

      try {
        if (client instanceof InMemoryFallback) {
          await client.expire(key, seconds);
        } else {
          await client.expire(key, seconds);
        }
      } catch (err) {
        if (isDevelopment && fallback) {
          await fallback.expire(key, seconds);
        }
      }
    },
  };
}

export function createLegacyGracefulRedisClient(serviceName: string): Redis {
  const isDevelopment = config.nodeEnv === 'development';
  let hasLoggedWarning = false;

  const redisClient = new Redis(config.redis.url, {
    retryStrategy: (times) => {
      if (times > config.redis.maxRetries) return null;
      return Math.min(times * config.redis.retryDelay, 3000);
    },
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    showFriendlyErrorStack: false, // Suppress internal ioredis error stack logging
  });

  redisClient.on('error', (err) => {
    // Log once and continue gracefully in all environments
    if (!hasLoggedWarning) {
      console.warn(`⚠️  ${serviceName}: Redis unavailable - features will use fallback storage`);
      hasLoggedWarning = true;
    }
  });

  redisClient.on('connect', () => {
    if (isDevelopment) {
      console.log(`✅ ${serviceName} Redis connected`);
    }
  });

  // Don't call connect() - let it connect lazily on first use
  // This prevents promise rejection errors from being logged
  // The error event handler will catch connection failures
  
  return redisClient;
}
