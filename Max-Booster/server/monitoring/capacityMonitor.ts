import { pool } from '../db';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export class CapacityMonitor {
  private static readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes (optimized from 1 minute to reduce slow queries)
  private static readonly ALERT_THRESHOLD = 0.75; // 75% capacity
  
  static startMonitoring() {
    setInterval(async () => {
      await CapacityMonitor.checkCapacity();
    }, CapacityMonitor.CHECK_INTERVAL);
    
    console.log('📊 Capacity monitoring started (checks every 5 minutes)');
  }
  
  private static async checkCapacity() {
    try {
      // Check database pool
      const poolUtilization = pool.totalCount / 20;
      if (poolUtilization >= CapacityMonitor.ALERT_THRESHOLD) {
        console.warn(`⚠️ CAPACITY ALERT: Database pool at ${(poolUtilization * 100).toFixed(1)}% capacity`);
      }
      
      // Check active sessions (within last 24 hours)
      const sessionResult = await db.execute(sql`SELECT COUNT(*) as count FROM sessions WHERE last_activity > NOW() - INTERVAL '24 hours'`);
      const activeSessions = parseInt(sessionResult.rows[0].count as string);
      const sessionUtilization = activeSessions / 50000;
      
      if (sessionUtilization >= CapacityMonitor.ALERT_THRESHOLD) {
        console.warn(`⚠️ CAPACITY ALERT: ${activeSessions} active sessions (${(sessionUtilization * 100).toFixed(1)}% of max)`);
      }
      
      // Log health status
      if (poolUtilization < CapacityMonitor.ALERT_THRESHOLD && sessionUtilization < CapacityMonitor.ALERT_THRESHOLD) {
        console.log(`✅ Capacity healthy: Pool ${(poolUtilization * 100).toFixed(1)}%, Sessions ${activeSessions}`);
      }
    } catch (error) {
      console.error('Capacity monitoring error:', error);
    }
  }
}
