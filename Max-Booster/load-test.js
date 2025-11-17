/**
 * Max Booster Load Testing Script
 * 
 * Tests platform capacity with 1000+ concurrent users
 * Validates production readiness for horizontal scaling
 * 
 * Usage:
 *   node load-test.js [concurrent-users] [duration-seconds]
 *   node load-test.js 1000 60  # 1000 users for 60 seconds
 */

import http from 'http';
import https from 'https';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const CONCURRENT_USERS = parseInt(process.argv[2]) || 1000;
const TEST_DURATION = parseInt(process.argv[3]) || 60; // seconds
const RAMP_UP_TIME = 10; // seconds to ramp up to full load

console.log('🧪 Max Booster Load Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Configuration:`);
console.log(`   Target URL: ${BASE_URL}`);
console.log(`   Concurrent Users: ${CONCURRENT_USERS}`);
console.log(`   Test Duration: ${TEST_DURATION}s`);
console.log(`   Ramp-up Time: ${RAMP_UP_TIME}s`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test scenarios simulating real user behavior
const scenarios = [
  { name: 'Home Page', path: '/', weight: 30 },
  { name: 'Login', path: '/api/auth/me', weight: 20 },
  { name: 'Dashboard', path: '/dashboard', weight: 15 },
  { name: 'Analytics', path: '/api/analytics/overview?days=30', weight: 10 },
  { name: 'Projects', path: '/api/projects', weight: 10 },
  { name: 'Marketplace', path: '/api/marketplace/listings', weight: 8 },
  { name: 'Distribution', path: '/api/distribution/releases', weight: 5 },
  { name: 'System Health', path: '/api/system/health', weight: 2 }
];

// Metrics tracking
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  statusCodes: {},
  errors: {},
  concurrentUsers: 0,
  startTime: Date.now()
};

// Select scenario based on weight
function selectScenario() {
  const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const scenario of scenarios) {
    random -= scenario.weight;
    if (random <= 0) return scenario;
  }
  return scenarios[0];
}

// Make HTTP request
function makeRequest(scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(scenario.path, BASE_URL);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({ success: true, statusCode: res.statusCode, responseTime });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({ success: false, error: error.message, responseTime });
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({ success: false, error: 'Timeout', responseTime });
    });
  });
}

// Simulate single user session
async function simulateUser(userId) {
  metrics.concurrentUsers++;
  const startTime = Date.now();
  const endTime = startTime + (TEST_DURATION * 1000);
  
  while (Date.now() < endTime) {
    const scenario = selectScenario();
    const result = await makeRequest(scenario);
    
    // Update metrics
    metrics.totalRequests++;
    if (result.success && result.statusCode < 400) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }
    
    metrics.totalResponseTime += result.responseTime;
    metrics.minResponseTime = Math.min(metrics.minResponseTime, result.responseTime);
    metrics.maxResponseTime = Math.max(metrics.maxResponseTime, result.responseTime);
    
    // Track status codes
    if (result.statusCode) {
      metrics.statusCodes[result.statusCode] = (metrics.statusCodes[result.statusCode] || 0) + 1;
    }
    
    // Track errors
    if (!result.success || result.statusCode >= 400) {
      const errorKey = result.error || `HTTP ${result.statusCode}`;
      metrics.errors[errorKey] = (metrics.errors[errorKey] || 0) + 1;
    }
    
    // Random delay between requests (1-5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 4000));
  }
  
  metrics.concurrentUsers--;
}

// Print live metrics
function printMetrics() {
  const duration = (Date.now() - metrics.startTime) / 1000;
  const avgResponseTime = metrics.totalRequests > 0 ? 
    (metrics.totalResponseTime / metrics.totalRequests).toFixed(2) : 0;
  const requestsPerSec = (metrics.totalRequests / duration).toFixed(2);
  const successRate = metrics.totalRequests > 0 ? 
    ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) : 0;
  
  console.clear();
  console.log('🧪 Max Booster Load Test - LIVE METRICS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s / ${TEST_DURATION}s`);
  console.log(`👥 Active Users: ${metrics.concurrentUsers} / ${CONCURRENT_USERS}`);
  console.log(`📊 Total Requests: ${metrics.totalRequests}`);
  console.log(`✅ Successful: ${metrics.successfulRequests} (${successRate}%)`);
  console.log(`❌ Failed: ${metrics.failedRequests}`);
  console.log(`⚡ Requests/sec: ${requestsPerSec}`);
  console.log(`📈 Response Times:`);
  console.log(`   Average: ${avgResponseTime}ms`);
  console.log(`   Min: ${metrics.minResponseTime === Infinity ? 'N/A' : metrics.minResponseTime}ms`);
  console.log(`   Max: ${metrics.maxResponseTime}ms`);
  
  if (Object.keys(metrics.statusCodes).length > 0) {
    console.log(`📋 Status Codes:`);
    for (const [code, count] of Object.entries(metrics.statusCodes).sort()) {
      console.log(`   ${code}: ${count}`);
    }
  }
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log(`⚠️  Errors:`);
    for (const [error, count] of Object.entries(metrics.errors).slice(0, 5)) {
      console.log(`   ${error}: ${count}`);
    }
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Print final report
function printFinalReport() {
  const duration = (Date.now() - metrics.startTime) / 1000;
  const avgResponseTime = metrics.totalRequests > 0 ? 
    (metrics.totalResponseTime / metrics.totalRequests).toFixed(2) : 0;
  const requestsPerSec = (metrics.totalRequests / duration).toFixed(2);
  const successRate = metrics.totalRequests > 0 ? 
    ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) : 0;
  
  console.log('\n\n🏁 Load Test Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Duration: ${duration.toFixed(2)}s`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful Requests: ${metrics.successfulRequests} (${successRate}%)`);
  console.log(`Failed Requests: ${metrics.failedRequests}`);
  console.log(`Requests/Second: ${requestsPerSec}`);
  console.log(`\nResponse Times:`);
  console.log(`  Average: ${avgResponseTime}ms`);
  console.log(`  Minimum: ${metrics.minResponseTime === Infinity ? 'N/A' : metrics.minResponseTime}ms`);
  console.log(`  Maximum: ${metrics.maxResponseTime}ms`);
  
  console.log(`\nStatus Code Distribution:`);
  for (const [code, count] of Object.entries(metrics.statusCodes).sort()) {
    const percentage = ((count / metrics.totalRequests) * 100).toFixed(1);
    console.log(`  ${code}: ${count} (${percentage}%)`);
  }
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log(`\nTop Errors:`);
    const sortedErrors = Object.entries(metrics.errors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    for (const [error, count] of sortedErrors) {
      console.log(`  ${error}: ${count}`);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Performance verdict
  console.log('\n🎯 PERFORMANCE VERDICT:');
  if (successRate >= 99.9 && parseFloat(avgResponseTime) < 200) {
    console.log('   ✅ EXCELLENT - Production Ready!');
  } else if (successRate >= 99 && parseFloat(avgResponseTime) < 500) {
    console.log('   ✅ GOOD - Production Ready with monitoring');
  } else if (successRate >= 95 && parseFloat(avgResponseTime) < 1000) {
    console.log('   ⚠️  ACCEPTABLE - Needs optimization');
  } else {
    console.log('   ❌ NEEDS WORK - Not production ready');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Main test execution
async function runLoadTest() {
  console.log('🚀 Starting load test...\n');
  
  // Start metric display
  const metricsInterval = setInterval(printMetrics, 1000);
  
  // Ramp up users gradually
  const usersPerSecond = CONCURRENT_USERS / RAMP_UP_TIME;
  const users = [];
  
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    users.push(simulateUser(i + 1));
    
    // Delay to ramp up gradually
    if ((i + 1) % usersPerSecond === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Wait for all users to finish
  await Promise.all(users);
  
  // Clean up and print report
  clearInterval(metricsInterval);
  printFinalReport();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  printFinalReport();
  process.exit(0);
});

// Run the test
runLoadTest().catch(error => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});
