#!/usr/bin/env tsx
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Master Test Runner - Tests All Max Booster Systems
// This script runs comprehensive tests for all platform features

interface TestResult {
  system: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const tests = [
  { name: 'Security System', file: 'test-security.ts', icon: '🛡️' },
  { name: 'AI Analytics', file: 'test-analytics.ts', icon: '📊' },
  { name: 'Social Media', file: 'test-social-media.ts', icon: '📱' },
  { name: 'Advertising', file: 'test-advertising.ts', icon: '📢' },
  { name: 'Marketplace', file: 'test-marketplace.ts', icon: '🛒' },
  { name: 'Studio/Audio', file: 'test-studio.ts', icon: '🎛️' },
  { name: 'Distribution', file: 'test-distribution.ts', icon: '🌍' }
];

async function runTest(testFile: string): Promise<{ passed: boolean; duration: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    await execAsync(`npx tsx ${testFile}`, {
      timeout: 60000 // 60 second timeout per test
    });
    
    return {
      passed: true,
      duration: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      passed: false,
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🚀 Max Booster Platform - Comprehensive System Tests\n');
  console.log('=' .repeat(60));
  console.log('Testing all major platform systems...\n');

  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`\n${test.icon} Testing ${test.name}...`);
    console.log('-'.repeat(60));
    
    const result = await runTest(test.file);
    
    results.push({
      system: test.name,
      ...result
    });
    
    if (result.passed) {
      console.log(`✅ ${test.name} PASSED (${result.duration}ms)`);
    } else {
      console.log(`❌ ${test.name} FAILED (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    // Add 2 second delay between tests to avoid rate limiting
    if (tests.indexOf(test) < tests.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${successRate}%`);

  console.log('\nDetailed Results:');
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`  ${status} ${r.system.padEnd(20)} ${r.duration}ms`);
  });

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check logs above for details.');
    console.log('Common issues:');
    console.log('  - Make sure the server is running (npm run dev)');
    console.log('  - Verify test accounts exist in database');
    console.log('  - Check API endpoints are accessible');
    process.exit(1);
  } else {
    console.log('\n🎉 All systems operational!');
    console.log('Max Booster Platform is ready for production.');
    process.exit(0);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n❌ Test runner failed:', error);
  process.exit(1);
});
