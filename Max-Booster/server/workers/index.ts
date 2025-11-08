/**
 * Worker Process Entry Point
 * 
 * This file creates worker processes for processing background jobs from all queues.
 * Workers should be run as separate processes to enable horizontal scaling.
 * 
 * Run with: node --loader tsx server/workers/index.ts
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../config/defaults.js';
import { AudioService } from '../services/audioService.js';
import { RoyaltiesCSVImportService } from '../services/royaltiesCSVImportService.js';
import { AnalyticsAnomalyService } from '../services/analyticsAnomalyService.js';
import sgMail from '@sendgrid/mail';
import type {
  AudioConvertJobData,
  AudioMixJobData,
  AudioJobResult,
  CSVImportJobData,
  CSVImportResult,
  AnalyticsJobData,
  EmailJobData,
} from '../services/queueService.js';

// Initialize services
const audioService = new AudioService();
const csvImportService = new RoyaltiesCSVImportService();
const anomalyService = new AnalyticsAnomalyService();

// Initialize SendGrid for email worker
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized for email worker');
} else {
  console.warn('⚠️  SendGrid API key not configured. Email worker will fail to send emails.');
}

// Create Redis connection for BullMQ
function createRedisConnection(): Redis {
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

const connection = createRedisConnection();

// ==================== AUDIO WORKER ====================
const audioWorker = new Worker<AudioConvertJobData | AudioMixJobData, AudioJobResult>(
  'audio',
  async (job: Job<AudioConvertJobData | AudioMixJobData, AudioJobResult>) => {
    console.log(`🎵 Processing ${job.name} job ${job.id}...`);
    
    try {
      switch (job.name) {
        case 'convert':
          return await audioService.processAudioConversion(job.data as AudioConvertJobData);
        
        case 'mix':
          return await audioService.processAudioMix(job.data as AudioMixJobData);
        
        case 'waveform':
          return await audioService.processWaveformGeneration(job.data as AudioConvertJobData);
        
        default:
          throw new Error(`Unknown audio job type: ${job.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Audio job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: config.queue.concurrency.audio,
  }
);

audioWorker.on('active', (job: Job) => {
  console.log(`▶️  Audio job ${job.id} (${job.name}) is now active`);
});

audioWorker.on('completed', (job: Job, result: AudioJobResult) => {
  console.log(`✅ Audio job ${job.id} completed - Output: ${result.storageKey}`);
});

audioWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ Audio job ${job?.id} failed:`, err.message);
});

audioWorker.on('progress', (job: Job, progress: number | object) => {
  console.log(`📊 Audio job ${job.id} progress:`, progress);
});

// ==================== CSV WORKER ====================
const csvWorker = new Worker<CSVImportJobData, CSVImportResult>(
  'csv',
  async (job: Job<CSVImportJobData, CSVImportResult>) => {
    console.log(`📊 Processing CSV import job ${job.id}...`);
    
    try {
      return await csvImportService.processCSVImport(job.data);
    } catch (error: any) {
      console.error(`❌ CSV job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: config.queue.concurrency.csv,
  }
);

csvWorker.on('active', (job: Job) => {
  console.log(`▶️  CSV job ${job.id} is now active - User: ${job.data.userId}`);
});

csvWorker.on('completed', (job: Job, result: CSVImportResult) => {
  console.log(`✅ CSV job ${job.id} completed - Processed: ${result.rowsProcessed} rows in ${result.duration}ms`);
});

csvWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ CSV job ${job?.id} failed:`, err.message);
});

csvWorker.on('progress', (job: Job, progress: number | object) => {
  console.log(`📊 CSV job ${job.id} progress:`, progress);
});

// ==================== ANALYTICS WORKER ====================
const analyticsWorker = new Worker<AnalyticsJobData, any>(
  'analytics',
  async (job: Job<AnalyticsJobData, any>) => {
    console.log(`📈 Processing analytics job ${job.id} (${job.data.type})...`);
    
    try {
      switch (job.data.type) {
        case 'anomaly-detection':
          return await anomalyService.processAnomalyDetection(job.data);
        
        default:
          throw new Error(`Unknown analytics job type: ${job.data.type}`);
      }
    } catch (error: any) {
      console.error(`❌ Analytics job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: config.queue.concurrency.analytics,
  }
);

analyticsWorker.on('active', (job: Job) => {
  console.log(`▶️  Analytics job ${job.id} (${job.data.type}) is now active`);
});

analyticsWorker.on('completed', (job: Job, result: any) => {
  console.log(`✅ Analytics job ${job.id} completed`, result);
});

analyticsWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ Analytics job ${job?.id} failed:`, err.message);
});

analyticsWorker.on('progress', (job: Job, progress: number | object) => {
  console.log(`📊 Analytics job ${job.id} progress:`, progress);
});

// ==================== EMAIL WORKER ====================
const emailWorker = new Worker<EmailJobData, void>(
  'email',
  async (job: Job<EmailJobData, void>) => {
    console.log(`📧 Processing email job ${job.id} - To: ${job.data.to}...`);
    
    try {
      const { to, subject, html, from } = job.data;
      
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('⚠️  SendGrid not configured, skipping email send');
        return;
      }
      
      const fromEmail = from || process.env.SENDGRID_FROM_EMAIL || 'noreply@maxbooster.ai';
      
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        html,
      });
      
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error(`❌ Email job ${job.id} failed:`, error.message);
      throw error;
    }
  },
  {
    connection,
    concurrency: config.queue.concurrency.email,
  }
);

emailWorker.on('active', (job: Job) => {
  console.log(`▶️  Email job ${job.id} is now active - To: ${job.data.to}`);
});

emailWorker.on('completed', (job: Job) => {
  console.log(`✅ Email job ${job.id} completed - Sent to: ${job.data.to}`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

emailWorker.on('progress', (job: Job, progress: number | object) => {
  console.log(`📊 Email job ${job.id} progress:`, progress);
});

// ==================== GRACEFUL SHUTDOWN ====================
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Received ${signal}, shutting down workers gracefully...`);
  
  try {
    await Promise.all([
      audioWorker.close(),
      csvWorker.close(),
      analyticsWorker.close(),
      emailWorker.close(),
    ]);
    
    console.log('✅ All workers closed successfully');
    
    // Close Redis connection
    await connection.quit();
    console.log('✅ Redis connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// ==================== STARTUP ====================
console.log('🚀 Background workers started successfully');
console.log('📋 Active workers:');
console.log(`   - Audio (concurrency: ${config.queue.concurrency.audio})`);
console.log(`   - CSV Import (concurrency: ${config.queue.concurrency.csv})`);
console.log(`   - Analytics (concurrency: ${config.queue.concurrency.analytics})`);
console.log(`   - Email (concurrency: ${config.queue.concurrency.email})`);
console.log('🔌 Connected to Redis:', config.redis.url);
console.log('\n⏳ Waiting for jobs...\n');
