import { Queue } from 'bullmq';
import { logger } from '../logger.js';
import { EventEmitter } from 'events';

interface BackpressureConfig {
  maxQueueSize: number;
  maxMemoryMB: number;
  checkIntervalMs: number;
}

interface BackpressureStatus {
  active: boolean;
  reason?: 'queue_size' | 'memory_limit' | 'manual';
  queueSize?: number;
  memoryUsageMB?: number;
  timestamp: number;
}

export class QueueBackpressureManager extends EventEmitter {
  private config: BackpressureConfig;
  private backpressureActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private queues: Map<string, Queue> = new Map();

  constructor(config?: Partial<BackpressureConfig>) {
    super();

    this.config = {
      maxQueueSize: config?.maxQueueSize || 1000,
      maxMemoryMB: config?.maxMemoryMB || 1200,
      checkIntervalMs: config?.checkIntervalMs || 30000,
    };

    logger.info('🚦 Queue Backpressure Manager initialized');
    logger.info(`   Max Queue Size: ${this.config.maxQueueSize}`);
    logger.info(`   Max Memory: ${this.config.maxMemoryMB}MB`);
  }

  registerQueue(name: string, queue: Queue): void {
    this.queues.set(name, queue);
    logger.info(`📊 Registered queue for backpressure monitoring: ${name}`);
  }

  start(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    logger.info('🚦 Starting backpressure monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.checkBackpressure();
    }, this.config.checkIntervalMs);
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('🛑 Stopped backpressure monitoring');
  }

  private async checkBackpressure(): Promise<void> {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

    if (heapUsedMB > this.config.maxMemoryMB) {
      if (!this.backpressureActive) {
        logger.warn(`⚠️  BACKPRESSURE ACTIVATED: Memory usage ${heapUsedMB.toFixed(0)}MB exceeds limit ${this.config.maxMemoryMB}MB`);
        this.activateBackpressure('memory_limit', heapUsedMB);
      }
      return;
    }

    for (const [name, queue] of this.queues.entries()) {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed');
        const totalJobs = (counts.waiting || 0) + (counts.active || 0) + (counts.delayed || 0);

        if (totalJobs > this.config.maxQueueSize) {
          if (!this.backpressureActive) {
            logger.warn(`⚠️  BACKPRESSURE ACTIVATED: Queue '${name}' size ${totalJobs} exceeds limit ${this.config.maxQueueSize}`);
            this.activateBackpressure('queue_size', undefined, totalJobs);
          }
          return;
        }
      } catch (error) {
        logger.error(`Error checking queue ${name}:`, error);
      }
    }

    if (this.backpressureActive) {
      logger.info('✅ BACKPRESSURE DEACTIVATED: System within limits');
      this.deactivateBackpressure();
    }
  }

  private activateBackpressure(
    reason: 'queue_size' | 'memory_limit' | 'manual',
    memoryUsageMB?: number,
    queueSize?: number
  ): void {
    this.backpressureActive = true;

    const status: BackpressureStatus = {
      active: true,
      reason,
      memoryUsageMB,
      queueSize,
      timestamp: Date.now(),
    };

    this.emit('backpressure:activated', status);

    this.pauseAllQueues();
  }

  private deactivateBackpressure(): void {
    this.backpressureActive = false;

    const status: BackpressureStatus = {
      active: false,
      timestamp: Date.now(),
    };

    this.emit('backpressure:deactivated', status);

    this.resumeAllQueues();
  }

  private async pauseAllQueues(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.pause();
        logger.info(`⏸️  Paused queue: ${name}`);
      } catch (error) {
        logger.error(`Error pausing queue ${name}:`, error);
      }
    }
  }

  private async resumeAllQueues(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.resume();
        logger.info(`▶️  Resumed queue: ${name}`);
      } catch (error) {
        logger.error(`Error resuming queue ${name}:`, error);
      }
    }
  }

  isBackpressureActive(): boolean {
    return this.backpressureActive;
  }

  async getStatus(): Promise<BackpressureStatus> {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

    return {
      active: this.backpressureActive,
      memoryUsageMB: heapUsedMB,
      timestamp: Date.now(),
    };
  }

  forceBackpressure(): void {
    logger.warn('⚠️  MANUAL BACKPRESSURE ACTIVATION');
    this.activateBackpressure('manual');
  }

  releaseBackpressure(): void {
    logger.info('ℹ️  MANUAL BACKPRESSURE RELEASE');
    this.deactivateBackpressure();
  }
}

export const queueBackpressure = new QueueBackpressureManager({
  maxQueueSize: 1000,
  maxMemoryMB: 1200,
  checkIntervalMs: 30000,
});
