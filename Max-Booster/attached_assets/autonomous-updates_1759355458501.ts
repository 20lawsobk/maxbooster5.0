import { EventEmitter } from 'events';

type UpdateFrequency = 'hourly' | 'daily' | 'weekly';

interface AutoUpdatesConfig {
  enabled: boolean;
  frequency: UpdateFrequency;
  externalApiBaseUrl?: string;
  productSignalsEnabled: boolean;
  dependencyAuditEnabled: boolean;
  seoGrowthEnabled: boolean;
  roadmapEvolutionEnabled: boolean;
}

interface AutoUpdatesStatus {
  isRunning: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  runsCompleted: number;
  lastResult?: Record<string, any>;
}

export class AutonomousUpdatesOrchestrator extends EventEmitter {
  private config: AutoUpdatesConfig;
  private timer: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private status: AutoUpdatesStatus = {
    isRunning: false,
    runsCompleted: 0,
  };

  constructor() {
    super();
    this.config = this.defaultConfig();
  }

  private defaultConfig(): AutoUpdatesConfig {
    return {
      enabled: false,
      frequency: 'daily',
      externalApiBaseUrl: process.env.EXTERNAL_API_BASE_URL || process.env.REPLIT_API_BASE_URL || '',
      productSignalsEnabled: true,
      dependencyAuditEnabled: true,
      seoGrowthEnabled: true,
      roadmapEvolutionEnabled: true,
    };
  }

  async configure(updates: Partial<AutoUpdatesConfig>): Promise<AutoUpdatesConfig> {
    this.config = { ...this.config, ...updates };
    this.emit('configUpdated', this.config);
    if (this.config.enabled && !this.running) await this.start();
    if (!this.config.enabled && this.running) await this.stop();
    return this.config;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.status.isRunning = true;
    this.scheduleNextRun();
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    this.status.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit('stopped');
  }

  getStatus(): AutoUpdatesStatus {
    return { ...this.status };
  }

  private scheduleNextRun(): void {
    const now = Date.now();
    const delay = this.getIntervalMs(this.config.frequency);
    const next = new Date(now + delay);
    this.status.nextRunAt = next.toISOString();
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.runOnce().catch(() => void 0).finally(() => {
        if (this.running) this.scheduleNextRun();
      });
    }, delay);
  }

  private getIntervalMs(freq: UpdateFrequency): number {
    switch (freq) {
      case 'hourly':
        return 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'daily':
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  async runOnce(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const startedAt = new Date();

    try {
      if (this.config.productSignalsEnabled) {
        result.productSignals = await this.collectProductSignals();
      }
    } catch (e: any) {
      result.productSignalsError = e?.message || 'product signals failed';
    }

    try {
      if (this.config.dependencyAuditEnabled) {
        result.dependencyAudit = await this.runDependencyAudit();
      }
    } catch (e: any) {
      result.dependencyAuditError = e?.message || 'dependency audit failed';
    }

    try {
      if (this.config.seoGrowthEnabled) {
        result.seoGrowth = await this.generateSeoGrowthAssets();
      }
    } catch (e: any) {
      result.seoGrowthError = e?.message || 'seo growth failed';
    }

    try {
      if (this.config.roadmapEvolutionEnabled) {
        result.roadmap = await this.evolveProductRoadmap(result);
      }
    } catch (e: any) {
      result.roadmapError = e?.message || 'roadmap evolution failed';
    }

    this.status.lastRunAt = startedAt.toISOString();
    this.status.runsCompleted += 1;
    this.status.lastResult = result;
    this.emit('runCompleted', result);
    return result;
  }

  // External calls (point these to Replit-hosted APIs)
  private async collectProductSignals(): Promise<any> {
    const base = this.config.externalApiBaseUrl || '';
    if (!base) return { skipped: true };
    const url = `${base}/signals/collect`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`signals ${res.status}`);
    return res.json();
  }

  private async runDependencyAudit(): Promise<any> {
    const base = this.config.externalApiBaseUrl || '';
    if (!base) return { skipped: true };
    const url = `${base}/dependencies/audit`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`deps ${res.status}`);
    return res.json();
  }

  private async generateSeoGrowthAssets(): Promise<any> {
    const base = this.config.externalApiBaseUrl || '';
    if (!base) return { skipped: true };
    const url = `${base}/growth/seo/generate`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error(`seo ${res.status}`);
    return res.json();
  }

  private async evolveProductRoadmap(context: Record<string, any>): Promise<any> {
    const base = this.config.externalApiBaseUrl || '';
    if (!base) return { skipped: true };
    const url = `${base}/product/roadmap/evolve`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context }) });
    if (!res.ok) throw new Error(`roadmap ${res.status}`);
    return res.json();
  }
}

export const autonomousUpdates = new AutonomousUpdatesOrchestrator();



