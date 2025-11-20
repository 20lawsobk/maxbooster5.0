import { logger } from '../../server/logger.js';
import { spawn } from 'child_process';

function getMillisecondsUntil730AM(): number {
  const now = new Date();
  const target = new Date();
  
  target.setHours(7, 30, 0, 0);
  
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
}

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

async function main() {
  const msUntilStart = getMillisecondsUntil730AM();
  const startTime = new Date(Date.now() + msUntilStart);
  
  logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║           BURN-IN TEST - SCHEDULED START                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Current Time:     ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}                ║
║  Scheduled Start:  ${startTime.toLocaleString('en-US', { timeZone: 'America/New_York' })}                ║
║  Time Until Start: ${formatTimeRemaining(msUntilStart)}                              ║
║                                                               ║
║  The 12-hour accelerated burn-in test will automatically      ║
║  start at 7:30 AM and complete at 7:30 PM.                    ║
║                                                               ║
║  Press Ctrl+C to cancel the scheduled start.                  ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  logger.info(`⏰ Waiting until 7:30 AM to start burn-in test...`);
  
  await new Promise(resolve => setTimeout(resolve, msUntilStart));
  
  logger.info(`🚀 Starting 12-hour burn-in test NOW at 7:30 AM...`);
  
  const child = spawn('tsx', ['tests/burn-in/24-hour-test.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });
  
  child.on('exit', (code) => {
    logger.info(`Burn-in test completed with exit code: ${code}`);
    process.exit(code || 0);
  });
  
  process.on('SIGINT', () => {
    logger.warn('\n⚠️ Received interrupt signal, stopping burn-in test...');
    child.kill('SIGINT');
  });
}

main().catch((error) => {
  logger.error('Fatal error in scheduled burn-in test:', error);
  process.exit(1);
});
