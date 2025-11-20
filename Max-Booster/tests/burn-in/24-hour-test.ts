import { schedule } from 'node-cron';
import logger from '../../server/logger.js';

interface BurnInMetrics {
  startTime: Date;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  queueHealthChecks: number;
  aiModelChecks: number;
  systemHealthChecks: number;
  errors: Array<{ timestamp: Date; error: string }>;
  memorySnapshots: Array<{ timestamp: Date; heapUsed: number; rss: number }>;
  queueMetrics: Array<{ timestamp: Date; redisLatency: number; waiting: number; failed: number }>;
}

class BurnInTest {
  private metrics: BurnInMetrics;
  private isRunning = false;
  private baseUrl = 'http://localhost:5000';
  private intervalMinutes = 5;

  constructor() {
    this.metrics = {
      startTime: new Date(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      queueHealthChecks: 0,
      aiModelChecks: 0,
      systemHealthChecks: 0,
      errors: [],
      memorySnapshots: [],
      queueMetrics: [],
    };
  }

  async makeRequest(url: string, description: string): Promise<boolean> {
    this.metrics.totalRequests++;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.metrics.successfulRequests++;
      logger.info(`✅ Burn-in test: ${description} - OK`);
      return true;
    } catch (error) {
      this.metrics.failedRequests++;
      const errorMsg = `${description}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.metrics.errors.push({ timestamp: new Date(), error: errorMsg });
      logger.error(`❌ Burn-in test: ${errorMsg}`);
      return false;
    }
  }

  async checkQueueHealth(): Promise<void> {
    this.metrics.queueHealthChecks++;
    const success = await this.makeRequest(
      `${this.baseUrl}/api/monitoring/queue-health`,
      'Queue Health Check'
    );

    if (success) {
      try {
        const response = await fetch(`${this.baseUrl}/api/monitoring/queue-metrics`);
        const data = await response.json();
        if (data.metrics && data.metrics.length > 0) {
          const queueData = data.metrics[0];
          this.metrics.queueMetrics.push({
            timestamp: new Date(),
            redisLatency: queueData.redisLatency || 0,
            waiting: queueData.waiting || 0,
            failed: queueData.failed || 0,
          });
        }
      } catch (error) {
        logger.warn('Failed to capture queue metrics detail');
      }
    }
  }

  async checkAIModels(): Promise<void> {
    this.metrics.aiModelChecks++;
    await this.makeRequest(
      `${this.baseUrl}/api/monitoring/ai-models`,
      'AI Model Telemetry Check'
    );
  }

  async checkSystemHealth(): Promise<void> {
    this.metrics.systemHealthChecks++;
    await this.makeRequest(
      `${this.baseUrl}/api/monitoring/system-health`,
      'System Health Check'
    );
  }

  captureMemorySnapshot(): void {
    const memUsage = process.memoryUsage();
    this.metrics.memorySnapshots.push({
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      rss: memUsage.rss,
    });
  }

  async runHealthCheckCycle(): Promise<void> {
    logger.info('🔄 Running burn-in test cycle...');
    
    await Promise.all([
      this.checkQueueHealth(),
      this.checkAIModels(),
      this.checkSystemHealth(),
    ]);

    this.captureMemorySnapshot();
    this.printCurrentStatus();
  }

  printCurrentStatus(): void {
    const runtime = (Date.now() - this.metrics.startTime.getTime()) / 1000 / 60 / 60;
    const successRate = this.metrics.totalRequests > 0
      ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2)
      : '0';

    const latestMemory = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];
    const memoryMB = latestMemory ? (latestMemory.heapUsed / 1024 / 1024).toFixed(2) : '0';

    logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║           24-HOUR BURN-IN TEST - STATUS REPORT                ║
╠═══════════════════════════════════════════════════════════════╣
║ Runtime:          ${runtime.toFixed(2)} hours / 24 hours                  ║
║ Total Requests:   ${this.metrics.totalRequests}                                      ║
║ Success Rate:     ${successRate}%                                   ║
║ Failed Requests:  ${this.metrics.failedRequests}                                      ║
║ Memory Usage:     ${memoryMB} MB                                ║
║                                                               ║
║ Health Checks:                                                ║
║   - Queue Health:    ${this.metrics.queueHealthChecks} checks                         ║
║   - AI Models:       ${this.metrics.aiModelChecks} checks                         ║
║   - System Health:   ${this.metrics.systemHealthChecks} checks                         ║
║                                                               ║
║ Recent Errors:    ${this.metrics.errors.slice(-3).length} (last 3 shown)              ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    if (this.metrics.errors.length > 0) {
      logger.warn('Recent errors:');
      this.metrics.errors.slice(-3).forEach((err) => {
        logger.warn(`  - [${err.timestamp.toISOString()}] ${err.error}`);
      });
    }
  }

  printFinalReport(): void {
    const totalRuntime = (Date.now() - this.metrics.startTime.getTime()) / 1000 / 60 / 60;
    const successRate = ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2);

    const memoryGrowth = this.analyzeMemoryGrowth();
    const queuePerformance = this.analyzeQueuePerformance();

    logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║         24-HOUR BURN-IN TEST - FINAL REPORT                   ║
╠═══════════════════════════════════════════════════════════════╣
║ Start Time:       ${this.metrics.startTime.toISOString()}       ║
║ End Time:         ${new Date().toISOString()}       ║
║ Total Runtime:    ${totalRuntime.toFixed(2)} hours                           ║
║                                                               ║
║ REQUEST STATISTICS:                                           ║
║   Total Requests:     ${this.metrics.totalRequests}                              ║
║   Successful:         ${this.metrics.successfulRequests} (${successRate}%)                    ║
║   Failed:             ${this.metrics.failedRequests}                              ║
║                                                               ║
║ MEMORY ANALYSIS:                                              ║
║   Initial Heap:       ${memoryGrowth.initial} MB                      ║
║   Final Heap:         ${memoryGrowth.final} MB                      ║
║   Growth:             ${memoryGrowth.growth} MB (${memoryGrowth.growthPercent}%)         ║
║   Status:             ${memoryGrowth.status}                          ║
║                                                               ║
║ QUEUE PERFORMANCE:                                            ║
║   Avg Redis Latency:  ${queuePerformance.avgLatency} ms                     ║
║   Max Redis Latency:  ${queuePerformance.maxLatency} ms                     ║
║   Total Failed Jobs:  ${queuePerformance.totalFailed}                              ║
║   Status:             ${queuePerformance.status}                          ║
║                                                               ║
║ ERRORS ENCOUNTERED:   ${this.metrics.errors.length}                              ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    if (this.metrics.errors.length > 0) {
      logger.warn('\n📋 ERROR SUMMARY:');
      this.metrics.errors.forEach((err) => {
        logger.warn(`  - [${err.timestamp.toISOString()}] ${err.error}`);
      });
    }

    const verdict = this.getVerdict(successRate, memoryGrowth, queuePerformance);
    logger.info(`\n${verdict}`);
  }

  analyzeMemoryGrowth() {
    if (this.metrics.memorySnapshots.length === 0) {
      return { initial: 0, final: 0, growth: 0, growthPercent: '0.00', status: 'No data' };
    }

    const initial = this.metrics.memorySnapshots[0].heapUsed / 1024 / 1024;
    const final = this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1].heapUsed / 1024 / 1024;
    const growth = final - initial;
    const growthPercent = ((growth / initial) * 100).toFixed(2);

    let status = '✅ HEALTHY';
    if (growth > 500) {
      status = '⚠️ POTENTIAL LEAK';
    } else if (growth > 200) {
      status = '⚠️ HIGH GROWTH';
    }

    return {
      initial: initial.toFixed(2),
      final: final.toFixed(2),
      growth: growth.toFixed(2),
      growthPercent,
      status,
    };
  }

  analyzeQueuePerformance() {
    if (this.metrics.queueMetrics.length === 0) {
      return { avgLatency: 0, maxLatency: 0, totalFailed: 0, status: 'No data' };
    }

    const latencies = this.metrics.queueMetrics.map(m => m.redisLatency);
    const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
    const maxLatency = Math.max(...latencies);
    const totalFailed = this.metrics.queueMetrics[this.metrics.queueMetrics.length - 1].failed;

    let status = '✅ HEALTHY';
    if (maxLatency > 100) {
      status = '⚠️ HIGH LATENCY';
    } else if (totalFailed > 50) {
      status = '⚠️ HIGH FAILURES';
    }

    return {
      avgLatency,
      maxLatency,
      totalFailed,
      status,
    };
  }

  getVerdict(successRate: string, memoryGrowth: any, queuePerformance: any): string {
    const rate = parseFloat(successRate);

    if (rate >= 99.9 && memoryGrowth.status === '✅ HEALTHY' && queuePerformance.status === '✅ HEALTHY') {
      return `
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ VERDICT: PASS                           ║
║                                                               ║
║  The platform successfully completed the 24-hour burn-in      ║
║  test with excellent stability metrics. The system is         ║
║  PRODUCTION-READY for paying customers.                       ║
╚═══════════════════════════════════════════════════════════════╝`;
    } else if (rate >= 95) {
      return `
╔═══════════════════════════════════════════════════════════════╗
║                 ⚠️ VERDICT: CONDITIONAL PASS                  ║
║                                                               ║
║  The platform completed the burn-in test with minor issues.   ║
║  Review warnings before production deployment.                ║
╚═══════════════════════════════════════════════════════════════╝`;
    } else {
      return `
╔═══════════════════════════════════════════════════════════════╗
║                    ❌ VERDICT: FAIL                           ║
║                                                               ║
║  The platform encountered significant issues during the       ║
║  burn-in test. DO NOT deploy to production until resolved.    ║
╚═══════════════════════════════════════════════════════════════╝`;
    }
  }

  async start(): Promise<void> {
    this.isRunning = true;
    logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║        STARTING 24-HOUR BURN-IN TEST                          ║
╠═══════════════════════════════════════════════════════════════╣
║  This test will run for 24 hours, continuously monitoring:    ║
║    - Queue health and Redis performance                       ║
║    - AI model cache behavior                                  ║
║    - System health metrics                                    ║
║    - Memory usage trends                                      ║
║                                                               ║
║  Health checks will run every ${this.intervalMinutes} minutes.                   ║
║                                                               ║
║  Press Ctrl+C to stop the test early (not recommended).       ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    await this.runHealthCheckCycle();

    schedule(`*/${this.intervalMinutes} * * * *`, async () => {
      if (this.isRunning) {
        await this.runHealthCheckCycle();
      }
    });

    setTimeout(() => {
      this.stop();
    }, 24 * 60 * 60 * 1000);
  }

  stop(): void {
    this.isRunning = false;
    logger.info('🛑 Stopping 24-hour burn-in test...');
    this.printFinalReport();
    process.exit(0);
  }
}

const burnInTest = new BurnInTest();

process.on('SIGINT', () => {
  logger.info('\n⚠️ Received interrupt signal...');
  burnInTest.stop();
});

burnInTest.start().catch((error) => {
  logger.error('Fatal error in burn-in test:', error);
  process.exit(1);
});
