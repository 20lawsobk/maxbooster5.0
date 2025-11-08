import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import os from 'os';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: {
        heapUsed: number;
        heapTotal: number;
        heapPercent: number;
        rss: number;
      };
    };
    cpu: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      loadAverage: number[];
    };
  };
  environment: string;
}

// Check database connectivity
async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
  try {
    const startTime = Date.now();
    // Simple query to test database connectivity
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Check memory usage
function checkMemory(): { status: 'healthy' | 'degraded' | 'unhealthy'; usage: any } {
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (heapPercent > 90) {
    status = 'unhealthy';
  } else if (heapPercent > 75) {
    status = 'degraded';
  }

  return {
    status,
    usage: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapPercent: Math.round(heapPercent),
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    }
  };
}

// Check CPU load
function checkCPU(): { status: 'healthy' | 'degraded' | 'unhealthy'; loadAverage: number[] } {
  const loadAverage = os.loadavg();
  const cpuCount = os.cpus().length;
  const normalizedLoad = loadAverage[0] / cpuCount;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (normalizedLoad > 0.9) {
    status = 'unhealthy';
  } else if (normalizedLoad > 0.7) {
    status = 'degraded';
  }

  return {
    status,
    loadAverage: loadAverage.map((load: number) => Math.round(load * 100) / 100)
  };
}

// Comprehensive health check
export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    const startTime = Date.now();
    
    // Run all health checks
    const [databaseCheck, memoryCheck, cpuCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkCPU())
    ]);

    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseCheck,
        memory: memoryCheck,
        cpu: cpuCheck
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // Determine overall status
    const services = [databaseCheck.status, memoryCheck.status, cpuCheck.status];
    if (services.includes('unhealthy')) {
      health.status = 'unhealthy';
    } else if (services.includes('degraded')) {
      health.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    res.set('X-Response-Time', `${responseTime}ms`);

    // Set appropriate HTTP status
    const httpStatus = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Simple readiness check
export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Check only critical dependencies
    const dbCheck = await checkDatabase();
    
    if (dbCheck.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: dbCheck.status
      });
    } else {
      res.status(503).json({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        database: dbCheck.status,
        error: dbCheck.error
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not-ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
}

// Simple liveness check
export function livenessCheck(req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
}