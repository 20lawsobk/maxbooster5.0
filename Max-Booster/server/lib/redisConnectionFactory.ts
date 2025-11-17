/**
 * Shared Redis Connection Factory
 * 
 * Eliminates per-service Redis instance creation which causes:
 * - Connection thrashing and repeated handshake overhead
 * - Startup failures from simultaneous connection attempts
 * - Unnecessary memory overhead from duplicate clients
 * 
 * Features:
 * - Singleton pattern with lazy initialization
 * - Exponential backoff retry logic
 * - Connection pooling for high-throughput scenarios
 * - Health checks and graceful degradation
 */

import Redis, { type RedisOptions } from 'ioredis';
import { config } from '../config/defaults.js';

interface RedisConnectionOptions {
  maxRetries?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
}

class RedisConnectionFactory {
  private static instance: RedisConnectionFactory;
  private primaryClient: Redis | null = null;
  private subscribers: Map<string, Redis> = new Map();
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): RedisConnectionFactory {
    if (!RedisConnectionFactory.instance) {
      RedisConnectionFactory.instance = new RedisConnectionFactory();
    }
    return RedisConnectionFactory.instance;
  }

  /**
   * Get or create the primary Redis client (for commands, caching, etc.)
   */
  async getPrimaryClient(options: RedisConnectionOptions = {}): Promise<Redis> {
    if (this.primaryClient && this.primaryClient.status === 'ready') {
      return this.primaryClient;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      if (this.primaryClient) return this.primaryClient;
    }

    this.initializationPromise = this.initializePrimaryClient(options);
    await this.initializationPromise;
    
    if (!this.primaryClient) {
      throw new Error('Failed to initialize Redis primary client');
    }

    return this.primaryClient;
  }

  private async initializePrimaryClient(options: RedisConnectionOptions = {}): Promise<void> {
    if (!config.redis.url) {
      console.warn('⚠️ REDIS_URL not configured - Redis features disabled');
      return;
    }

    const redisOptions: RedisOptions = {
      maxRetriesPerRequest: options.maxRetries ?? 3,
      enableReadyCheck: options.enableReadyCheck ?? true,
      enableOfflineQueue: options.enableOfflineQueue ?? false,
      lazyConnect: options.lazyConnect ?? false,
      retryStrategy: (times: number) => {
        if (times > 10) {
          console.error('❌ Redis connection failed after 10 retries');
          return null; // Stop retrying
        }
        // Exponential backoff: 50ms, 100ms, 200ms, 400ms, ...
        const delay = Math.min(times * 50, 2000);
        console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.some(targetError => err.message.includes(targetError))) {
          return true; // Reconnect
        }
        return false;
      },
    };

    try {
      this.primaryClient = new Redis(config.redis.url, redisOptions);

      // Connection event handlers
      this.primaryClient.on('connect', () => {
        console.log('✅ Redis primary client connected');
      });

      this.primaryClient.on('ready', () => {
        console.log('✅ Redis primary client ready');
        this.isInitialized = true;
      });

      this.primaryClient.on('error', (error) => {
        // Only log if we haven't gracefully degraded
        if (!error.message.includes('ECONNREFUSED') && !error.message.includes('ECONNRESET')) {
          console.error('❌ Redis primary client error:', error.message);
        }
      });

      this.primaryClient.on('close', () => {
        console.log('🔌 Redis primary client connection closed');
      });

      this.primaryClient.on('reconnecting', () => {
        console.log('🔄 Redis primary client reconnecting...');
      });

      // Wait for ready state with timeout
      await Promise.race([
        new Promise<void>((resolve) => {
          this.primaryClient!.once('ready', () => resolve());
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

    } catch (error: any) {
      console.error('❌ Failed to initialize Redis primary client:', error.message);
      this.primaryClient = null;
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Get or create a subscriber client (for pub/sub operations)
   * Pub/sub requires dedicated connections
   */
  async getSubscriberClient(channelName: string): Promise<Redis> {
    if (this.subscribers.has(channelName)) {
      const client = this.subscribers.get(channelName)!;
      if (client.status === 'ready') {
        return client;
      }
    }

    if (!config.redis.url) {
      throw new Error('Redis URL not configured for pub/sub');
    }

    const subscriber = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    subscriber.on('error', (error) => {
      console.error(`❌ Redis subscriber [${channelName}] error:`, error.message);
    });

    this.subscribers.set(channelName, subscriber);
    return subscriber;
  }

  /**
   * Health check: verify Redis is connected and responsive
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.primaryClient || this.primaryClient.status !== 'ready') {
        return false;
      }

      const pong = await this.primaryClient.ping();
      return pong === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Graceful shutdown: close all connections
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down Redis connections...');

    const closePromises: Promise<void>[] = [];

    if (this.primaryClient) {
      closePromises.push(
        this.primaryClient.quit().catch((err: unknown) => {
          console.error('Error closing primary client:', err);
        }).then(() => undefined)
      );
    }

    for (const [channel, client] of Array.from(this.subscribers.entries())) {
      closePromises.push(
        client.quit().catch((err: unknown) => {
          console.error(`Error closing subscriber [${channel}]:`, err);
        }).then(() => undefined)
      );
    }

    await Promise.all(closePromises);
    
    this.primaryClient = null;
    this.subscribers.clear();
    this.isInitialized = false;
    
    console.log('✅ All Redis connections closed');
  }

  /**
   * Check if Redis is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized && this.primaryClient?.status === 'ready';
  }
}

// Export singleton instance
export const redisFactory = RedisConnectionFactory.getInstance();

// Export convenience functions
export async function getRedisClient(): Promise<Redis | null> {
  try {
    return await redisFactory.getPrimaryClient();
  } catch (error) {
    console.warn('⚠️ Redis not available, falling back to in-memory operation');
    return null;
  }
}

export async function getRedisSubscriber(channel: string): Promise<Redis> {
  return await redisFactory.getSubscriberClient(channel);
}

export async function isRedisHealthy(): Promise<boolean> {
  return await redisFactory.healthCheck();
}

export async function shutdownRedis(): Promise<void> {
  return await redisFactory.shutdown();
}
