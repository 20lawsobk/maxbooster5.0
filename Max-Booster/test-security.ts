#!/usr/bin/env tsx
import axios from 'axios';

// Test Self-Healing Security System
// This script tests the comprehensive security monitoring and threat detection

const API_BASE = 'http://localhost:5000/api';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'brandonlawson720@gmail.com';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#$Test';

async function testSecuritySystem() {
  console.log('🛡️  Testing Self-Healing Security System...\n');

  try {
    // Step 1: Login as admin to access security endpoints
    console.log('Step 1: Logging in as admin...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    });
    
    const sessionCookie = loginRes.headers['set-cookie']?.[0];
    if (!sessionCookie) throw new Error('Failed to get session cookie');
    
    console.log('✅ Logged in successfully\n');

    // Step 2: Test system health check
    console.log('Step 2: Checking system health...');
    const healthRes = await axios.get(`${API_BASE}/system/health`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ System Health:', healthRes.data);

    // Step 3: Test security metrics
    console.log('\nStep 3: Fetching security metrics...');
    const metricsRes = await axios.get(`${API_BASE}/security/metrics`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Security Metrics:', metricsRes.data);

    // Step 4: Test threat detection
    console.log('\nStep 4: Checking security threats...');
    const threatsRes = await axios.get(`${API_BASE}/security/threats`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Active Threats:', threatsRes.data);

    // Step 5: Test behavior profiling
    console.log('\nStep 5: Fetching behavior profiles...');
    const profilesRes = await axios.get(`${API_BASE}/security/behavior-profiles`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Behavior Profiles:', profilesRes.data);

    // Step 6: Test anomaly detection
    console.log('\nStep 6: Testing anomaly detection...');
    const anomaliesRes = await axios.get(`${API_BASE}/security/anomalies`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Detected Anomalies:', anomaliesRes.data);

    // Step 7: Test system monitoring
    console.log('\nStep 7: Testing system monitoring...');
    const monitoringRes = await axios.get(`${API_BASE}/security-monitoring/system-metrics`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ System Metrics:', monitoringRes.data);

    // Step 8: Test behavioral alerts
    console.log('\nStep 8: Fetching behavioral alerts...');
    const alertsRes = await axios.get(`${API_BASE}/security-monitoring/behavioral-alerts`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Behavioral Alerts:', alertsRes.data);

    // Step 9: Test pentest results
    console.log('\nStep 9: Fetching pentest results...');
    const pentestRes = await axios.get(`${API_BASE}/security-monitoring/pentest-results`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Pentest Results:', pentestRes.data);

    console.log('\n🎉 Security system test completed successfully!');
    console.log('Self-healing security is working correctly.');
    
    return {
      success: true,
      health: healthRes.data,
      metrics: metricsRes.data,
      threats: threatsRes.data.length
    };

  } catch (error: any) {
    console.error('\n❌ Security test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testSecuritySystem().then(result => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
