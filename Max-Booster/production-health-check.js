#!/usr/bin/env node

/**
 * Production Health Check Script
 * 
 * Usage:
 *   node production-health-check.js https://your-app.replit.app
 * 
 * Tests all critical endpoints and reports production readiness
 */

const PRODUCTION_URL = process.argv[2] || 'http://localhost:5000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
};

async function checkEndpoint(name, path, options = {}) {
  const url = `${PRODUCTION_URL}${path}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      signal: AbortSignal.timeout(options.timeout || 10000),
    });
    
    const duration = Date.now() - startTime;
    const expectedStatus = options.expectedStatus || 200;
    
    if (response.status === expectedStatus) {
      log.success(`${name} - ${response.status} (${duration}ms)`);
      return { success: true, duration, status: response.status };
    } else {
      log.error(`${name} - Expected ${expectedStatus}, got ${response.status} (${duration}ms)`);
      return { success: false, duration, status: response.status };
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runHealthChecks() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏥 Max Booster Production Health Check`);
  console.log(`📍 Target: ${PRODUCTION_URL}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const results = [];

  // Core Health Endpoints
  log.info('Testing Core Health Endpoints...');
  results.push(await checkEndpoint('Basic Health Check', '/api/health'));
  results.push(await checkEndpoint('Readiness Check', '/api/health/ready'));
  results.push(await checkEndpoint('Liveness Check', '/api/health/live'));
  console.log('');

  // Authentication Endpoints
  log.info('Testing Authentication Endpoints...');
  results.push(await checkEndpoint('Auth Status', '/api/auth/me', { expectedStatus: 401 })); // Expects unauthorized when not logged in
  results.push(await checkEndpoint('Login Page', '/login', { expectedStatus: 200 }));
  results.push(await checkEndpoint('Register Page', '/register', { expectedStatus: 200 }));
  console.log('');

  // Static Assets
  log.info('Testing Static Assets...');
  results.push(await checkEndpoint('Homepage', '/', { expectedStatus: 200 }));
  results.push(await checkEndpoint('Favicon', '/favicon.ico', { expectedStatus: 200 }));
  console.log('');

  // API Endpoints (public)
  log.info('Testing Public API Endpoints...');
  results.push(await checkEndpoint('Subscription Plans', '/api/subscriptions/plans'));
  results.push(await checkEndpoint('Marketplace Listings', '/api/marketplace/listings', { expectedStatus: 200 }));
  console.log('');

  // Performance Checks
  log.info('Testing Performance...');
  const perfTests = [];
  for (let i = 0; i < 5; i++) {
    const result = await checkEndpoint(`Performance Test ${i + 1}`, '/api/health');
    if (result.success) perfTests.push(result.duration);
  }
  
  if (perfTests.length > 0) {
    const avgResponseTime = perfTests.reduce((a, b) => a + b, 0) / perfTests.length;
    const maxResponseTime = Math.max(...perfTests);
    const minResponseTime = Math.min(...perfTests);
    
    console.log('');
    log.info(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    log.info(`Min Response Time: ${minResponseTime}ms`);
    log.info(`Max Response Time: ${maxResponseTime}ms`);
    
    if (avgResponseTime < 100) {
      log.success('Response times are excellent! (<100ms average)');
    } else if (avgResponseTime < 500) {
      log.warning('Response times are acceptable (100-500ms average)');
    } else {
      log.error('Response times are slow (>500ms average)');
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  console.log(`📊 Results: ${successCount}/${totalCount} checks passed (${successRate}%)`);
  
  if (successRate === '100.0') {
    log.success('🎉 All health checks passed! Production is ready.');
  } else if (successRate >= '80.0') {
    log.warning('⚠️  Most checks passed, but some issues detected.');
  } else {
    log.error('❌ Multiple health checks failed. Review errors above.');
  }
  
  console.log(`${'='.repeat(60)}\n`);

  // Exit with appropriate code
  process.exit(successRate === '100.0' ? 0 : 1);
}

// Run the checks
runHealthChecks().catch(error => {
  console.error('Fatal error running health checks:', error);
  process.exit(1);
});
