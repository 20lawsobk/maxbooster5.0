import * as Y from 'yjs';
import { storage } from '../storage';
import crypto from 'crypto';
import { Redis } from 'ioredis';
import { config } from '../config/defaults.js';

// Yjs document structure:
// {
//   tracks: Y.Array of track objects
//   timeline: Y.Map with markers, automation
//   mixer: Y.Map with bus settings, volumes
//   metadata: Y.Map with project info
// }

function generateHash(data: Uint8Array): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Redis client for Yjs document caching (shared across all server instances)
const redisClient = new Redis(config.redis.url, {
  retryStrategy: (times) => {
    if (times > config.redis.maxRetries) {
      console.error('Redis connection failed after max retries');
      return null;
    }
    return Math.min(times * config.redis.retryDelay, 3000);
  },
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('✅ Yjs Redis connected'));

export class YjsCollaborationService {
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly SAVE_DEBOUNCE_MS = 2000; // Save snapshots every 2 seconds max
  private readonly REDIS_DOC_PREFIX = 'yjs:doc:';
  private readonly REDIS_TTL = 3600; // 1 hour cache TTL
  
  // Load Yjs document for project
  async loadDocument(projectId: string): Promise<Y.Doc> {
    // Try to load from Redis cache first (shared across all server instances)
    const redisKey = `${this.REDIS_DOC_PREFIX}${projectId}`;
    const cachedState = await redisClient.get(redisKey);
    
    const doc = new Y.Doc();
    
    // CRITICAL: Initialize document schema BEFORE applying updates
    // This ensures all required collections exist for clients
    doc.getArray('tracks');       // Y.Array for track objects
    doc.getMap('timeline');       // Y.Map for markers, automation
    doc.getMap('mixer');          // Y.Map for bus settings, volumes
    doc.getMap('metadata');       // Y.Map for project info
    
    if (cachedState) {
      // Load from Redis cache (fast path)
      try {
        const buffer = Buffer.from(cachedState, 'base64');
        Y.applyUpdate(doc, new Uint8Array(buffer));
      } catch (error) {
        console.error('Failed to load from Redis cache:', projectId, error);
        // Fall through to database load
      }
    }
    
    if (!cachedState) {
      // Load from database (slow path)
      const snapshot = await storage.getLatestCollabSnapshot(projectId);
      if (snapshot && snapshot.documentState) {
        try {
          // Convert base64 string back to Uint8Array
          const buffer = Buffer.from(snapshot.documentState, 'base64');
          Y.applyUpdate(doc, new Uint8Array(buffer));
          
          // Cache in Redis for future requests
          await redisClient.setex(redisKey, this.REDIS_TTL, snapshot.documentState);
        } catch (error) {
          console.error('Failed to load snapshot for project:', projectId, error);
        }
      }
    }
    
    // Auto-save on changes (debounced)
    doc.on('update', async (update: Uint8Array) => {
      // Clear existing timer
      const existingTimer = this.saveTimers.get(projectId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Set new timer to save after debounce period
      const timer = setTimeout(async () => {
        try {
          // CRITICAL: Encode FULL document state, not just the incremental update
          const fullDocumentState = Y.encodeStateAsUpdate(doc);
          
          // Convert Uint8Array to base64 string for storage
          const base64State = Buffer.from(fullDocumentState).toString('base64');
          
          // Save to database (persistent)
          await storage.saveCollabSnapshot({
            projectId,
            documentState: base64State,
            snapshotHash: generateHash(fullDocumentState)
          });
          
          // Update Redis cache (shared across instances)
          await redisClient.setex(redisKey, this.REDIS_TTL, base64State);
          
          // Clean up old snapshots (keep last 10)
          await storage.deleteOldCollabSnapshots(projectId, 10);
        } catch (error) {
          console.error('Failed to save collab snapshot:', error);
        }
      }, this.SAVE_DEBOUNCE_MS);
      
      this.saveTimers.set(projectId, timer);
    });
    
    return doc;
  }
  
  // Clean up document (clear timers and optionally clear Redis cache)
  async unloadDocument(projectId: string, clearCache: boolean = false) {
    // Clear save timer
    const timer = this.saveTimers.get(projectId);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(projectId);
    }
    
    // Optionally clear Redis cache (useful when project is deleted)
    if (clearCache) {
      const redisKey = `${this.REDIS_DOC_PREFIX}${projectId}`;
      await redisClient.del(redisKey);
    }
  }
  
  // Invalidate Redis cache for a project (forces reload from database)
  async invalidateCache(projectId: string) {
    const redisKey = `${this.REDIS_DOC_PREFIX}${projectId}`;
    await redisClient.del(redisKey);
  }
  
  // Check if document exists in Redis cache
  async isCached(projectId: string): Promise<boolean> {
    const redisKey = `${this.REDIS_DOC_PREFIX}${projectId}`;
    const exists = await redisClient.exists(redisKey);
    return exists === 1;
  }
}

export const yjsService = new YjsCollaborationService();
