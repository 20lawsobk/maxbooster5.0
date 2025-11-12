import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from './config/defaults.js';

neonConfig.webSocketConstructor = ws;

if (!config.database.url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Database Query Telemetry with bounded ring buffer (O(1) memory, O(1) updates)
interface QueryRecord {
  timestamp: number;
  sqlHash: string; // Only store hash for security
  duration: number;
}

class QueryTelemetry {
  private ringBuffer: QueryRecord[] = [];
  private bufferIndex: number = 0;
  private readonly maxSize = 1000; // Bounded to 1000 queries max
  
  // Running aggregates for O(1) calculations
  private lifetimeTotal = 0;
  private lifetimeSlow = 0;
  private runningSum = 0;
  private slowestEver: { sqlHash: string; duration: number } | null = null;

  private hashSql(sql: string): string {
    // Simple hash for SQL identification without exposing content
    let hash = 0;
    for (let i = 0; i < Math.min(sql.length, 100); i++) {
      hash = ((hash << 5) - hash) + sql.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return `sql_${Math.abs(hash).toString(16)}`;
  }

  recordQuery(sql: string, duration: number): void {
    const now = Date.now();
    const sqlHash = this.hashSql(sql);
    
    // Add to ring buffer (overwrites oldest when full)
    this.ringBuffer[this.bufferIndex] = { timestamp: now, sqlHash, duration };
    this.bufferIndex = (this.bufferIndex + 1) % this.maxSize;
    
    // Update running aggregates
    this.lifetimeTotal++;
    this.runningSum += duration;
    
    if (duration > 100) {
      this.lifetimeSlow++;
      console.warn(`⚠️ Slow query detected (${duration}ms):`, sqlHash);
    }
    
    // Track slowest query
    if (!this.slowestEver || duration > this.slowestEver.duration) {
      this.slowestEver = { sqlHash, duration };
    }
  }

  getMetrics() {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    // Filter recent queries from ring buffer
    const recentQueries = this.ringBuffer.filter(q => 
      q && q.timestamp && (now - q.timestamp < windowMs)
    );
    
    if (recentQueries.length === 0) {
      return {
        windowedQueries: 0,
        windowedSlow: 0,
        p95Latency: 0,
        windowedAverage: 0,
        lifetimeTotal: this.lifetimeTotal,
        lifetimeSlow: this.lifetimeSlow,
        lifetimeAverage: this.lifetimeTotal > 0 ? Math.round((this.runningSum / this.lifetimeTotal) * 100) / 100 : 0,
        slowestQuery: this.slowestEver,
        lastRefresh: new Date().toISOString(),
        windowMinutes: 15
      };
    }

    // Calculate windowed metrics
    const windowedSlow = recentQueries.filter(q => q.duration > 100).length;
    const durations = recentQueries.map(q => q.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    const p95Latency = durations[p95Index] || 0;
    const windowedAverage = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    return {
      windowedQueries: recentQueries.length,
      windowedSlow,
      p95Latency: Math.round(p95Latency * 100) / 100,
      windowedAverage: Math.round(windowedAverage * 100) / 100,
      lifetimeTotal: this.lifetimeTotal,
      lifetimeSlow: this.lifetimeSlow,
      lifetimeAverage: this.lifetimeTotal > 0 ? Math.round((this.runningSum / this.lifetimeTotal) * 100) / 100 : 0,
      slowestQuery: this.slowestEver,
      lastRefresh: new Date().toISOString(),
      windowMinutes: 15
    };
  }
}

const queryTelemetry = new QueryTelemetry();

// Export telemetry accessor
export function getQueryTelemetry() {
  return queryTelemetry.getMetrics();
}

// Instrumented Pool that measures actual query execution time
class InstrumentedPool extends Pool {
  async query(...args: any[]): Promise<any> {
    const startTime = Date.now();
    const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text || 'unknown';
    
    try {
      const result = await super.query(...args);
      const duration = Date.now() - startTime;
      queryTelemetry.recordQuery(sql, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      queryTelemetry.recordQuery(sql, duration);
      throw error;
    }
  }
}

// Configure connection pool for optimal performance and scalability
export const pool = new InstrumentedPool({ 
  connectionString: config.database.url,
  max: config.database.poolSize,
  idleTimeoutMillis: config.database.idleTimeout,
  connectionTimeoutMillis: config.database.connectionTimeout,
});

export const db = drizzle({ client: pool, schema });