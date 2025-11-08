/**
 * Queue Service - Redis-backed job queue for async processing
 * 
 * Handles all long-running operations:
 * - Audio processing (FFmpeg)
 * - CSV imports
 * - Analytics calculations
 * - Email sending
 * 
 * This enables horizontal scaling by offloading CPU-intensive work to dedicated worker processes.
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { config } from '../config/defaults.js';
import { Redis } from 'ioredis';

// Job data types
export interface AudioConvertJobData {
  userId: string;
  filePath: string;
  format: 'mp3' | 'wav' | 'flac' | 'aiff' | 'ogg' | 'm4a';
  quality?: 'low' | 'medium' | 'high';
  storageKey?: string;
}

export interface AudioMixJobData {
  userId: string;
  tracks: Array<{ storageKey: string; volume: number }>;
  outputFormat: string;
}

export interface CSVImportJobData {
  userId: string;
  storageKey: string;
  type: 'royalties' | 'analytics';
}

export interface AnalyticsJobData {
  userId?: string;
  type: 'anomaly-detection' | 'report-generation';
  params?: any;
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Job result types
export interface AudioJobResult {
  storageKey: string;
  duration: number;
  format: string;
}

export interface CSVImportResult {
  rowsProcessed: number;
  errors: number;
  duration: number;
}

// Create Redis connection for BullMQ
function createRedisConnection() {
  const redisUrl = config.redis.url;
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null, // BullMQ requirement
    retryStrategy: (times) => {
      if (times > config.redis.maxRetries) {
        return null; // Stop retrying
      }
      return Math.min(times * config.redis.retryDelay, 3000);
    },
  });
}

/**
 * Queue Service - Manages all job queues
 */
class QueueService {
  // Queues
  public audioQueue: Queue<AudioConvertJobData | AudioMixJobData, AudioJobResult>;
  public csvQueue: Queue<CSVImportJobData, CSVImportResult>;
  public analyticsQueue: Queue<AnalyticsJobData, any>;
  public emailQueue: Queue<EmailJobData, void>;

  // Queue events (for monitoring)
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor() {
    const connection = createRedisConnection();

    // Initialize queues
    this.audioQueue = new Queue('audio', {
      connection,
      defaultJobOptions: {
        attempts: config.queue.retries.audio,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs for debugging
      },
    });

    this.csvQueue = new Queue('csv', {
      connection,
      defaultJobOptions: {
        attempts: config.queue.retries.csv,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    });

    this.analyticsQueue = new Queue('analytics', {
      connection,
      defaultJobOptions: {
        attempts: config.queue.retries.analytics,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    this.emailQueue = new Queue('email', {
      connection,
      defaultJobOptions: {
        attempts: config.queue.retries.email,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 500,
      },
    });

    console.log('📋 Job queues initialized');
  }

  /**
   * Add an audio processing job
   */
  async addAudioJob(
    type: 'convert' | 'mix',
    data: AudioConvertJobData | AudioMixJobData,
    priority?: number
  ): Promise<Job<AudioConvertJobData | AudioMixJobData, AudioJobResult>> {
    return await this.audioQueue.add(type, data, {
      priority,
      timeout: config.queue.timeout.audio,
    });
  }

  /**
   * Add a CSV import job
   */
  async addCSVImportJob(
    data: CSVImportJobData
  ): Promise<Job<CSVImportJobData, CSVImportResult>> {
    return await this.csvQueue.add('import', data, {
      timeout: config.queue.timeout.csv,
    });
  }

  /**
   * Add an analytics job
   */
  async addAnalyticsJob(
    type: string,
    data: AnalyticsJobData,
    priority?: number
  ): Promise<Job<AnalyticsJobData, any>> {
    return await this.analyticsQueue.add(type, data, {
      priority,
      timeout: config.queue.timeout.analytics,
    });
  }

  /**
   * Add an email job
   */
  async addEmailJob(
    data: EmailJobData,
    priority?: number
  ): Promise<Job<EmailJobData, void>> {
    return await this.emailQueue.add('send', data, {
      priority,
      timeout: config.queue.timeout.email,
    });
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(queueName: string, jobId: string): Promise<{
    state: string;
    progress: number;
    result?: any;
    failedReason?: string;
  }> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue ${queueName}`);
    }

    const state = await job.getState();
    const progress = job.progress || 0;

    return {
      state,
      progress: typeof progress === 'number' ? progress : 0,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const queue = this.getQueue(queueName);
    
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<Record<string, any>> {
    const [audio, csv, analytics, email] = await Promise.all([
      this.getQueueStats('audio'),
      this.getQueueStats('csv'),
      this.getQueueStats('analytics'),
      this.getQueueStats('email'),
    ]);

    return { audio, csv, analytics, email };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    console.log(`⏸️  Queue ${queueName} paused`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    console.log(`▶️  Queue ${queueName} resumed`);
  }

  /**
   * Clean completed/failed jobs
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour
    status: 'completed' | 'failed' = 'completed'
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 1000, status);
    console.log(`🧹 Cleaned ${status} jobs from ${queueName} queue`);
  }

  /**
   * Get queue instance by name
   */
  private getQueue(queueName: string): Queue {
    switch (queueName) {
      case 'audio':
        return this.audioQueue;
      case 'csv':
        return this.csvQueue;
      case 'analytics':
        return this.analyticsQueue;
      case 'email':
        return this.emailQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  /**
   * Close all queues (for graceful shutdown)
   */
  async close(): Promise<void> {
    await Promise.all([
      this.audioQueue.close(),
      this.csvQueue.close(),
      this.analyticsQueue.close(),
      this.emailQueue.close(),
    ]);

    for (const events of this.queueEvents.values()) {
      await events.close();
    }

    console.log('📋 All queues closed');
  }
}

// Export singleton instance
export const queueService = new QueueService();

// Export Worker class for creating workers
export { Worker, Job };
