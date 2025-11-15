#!/usr/bin/env ts-node
import axios from 'axios';

// Test AI Analytics System
// This script tests the comprehensive AI-powered analytics and predictions

const API_BASE = 'http://localhost:5000/api';

async function testAnalytics() {
  console.log('📊 Testing AI Analytics System...\n');

  try {
    // Step 1: Login as test user
    console.log('Step 1: Logging in as test user...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.monthly@maxbooster.com',
      password: 'test123!'
    });
    
    const sessionCookie = loginRes.headers['set-cookie']?.[0];
    if (!sessionCookie) throw new Error('Failed to get session cookie');
    
    console.log('✅ Logged in successfully\n');

    // Step 2: Test dashboard stats
    console.log('Step 2: Fetching dashboard stats...');
    const statsRes = await axios.get(`${API_BASE}/analytics/dashboard`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Dashboard Stats:', statsRes.data);

    // Step 3: Test metric predictions
    console.log('\nStep 3: Testing metric predictions...');
    const predictRes = await axios.post(
      `${API_BASE}/ai-analytics/predict-metrics`,
      { days: 30 },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Metric Predictions:', predictRes.data);

    // Step 4: Test churn prediction
    console.log('\nStep 4: Testing churn prediction...');
    const churnRes = await axios.get(`${API_BASE}/ai-analytics/churn-prediction`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Churn Prediction:', churnRes.data);

    // Step 5: Test revenue forecast
    console.log('\nStep 5: Testing revenue forecast...');
    const forecastRes = await axios.post(
      `${API_BASE}/ai-analytics/revenue-forecast`,
      { months: 6 },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Revenue Forecast:', forecastRes.data);

    // Step 6: Test anomaly detection
    console.log('\nStep 6: Testing anomaly detection...');
    const anomalyRes = await axios.get(`${API_BASE}/ai-analytics/anomaly-detection`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Anomaly Detection:', anomalyRes.data);

    // Step 7: Test AI insights
    console.log('\nStep 7: Fetching AI insights...');
    const insightsRes = await axios.get(`${API_BASE}/ai-analytics/insights`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ AI Insights:', insightsRes.data);

    // Step 8: Test platform breakdown
    console.log('\nStep 8: Testing platform breakdown...');
    const platformRes = await axios.get(`${API_BASE}/analytics/platforms`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Platform Breakdown:', platformRes.data);

    // Step 9: Test growth trends
    console.log('\nStep 9: Fetching growth trends...');
    const trendsRes = await axios.get(`${API_BASE}/analytics/trends?period=30`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Growth Trends:', trendsRes.data);

    console.log('\n🎉 Analytics test completed successfully!');
    console.log('AI Analytics system is working correctly.');
    
    return {
      success: true,
      stats: statsRes.data,
      predictions: predictRes.data,
      insights: insightsRes.data
    };

  } catch (error: any) {
    console.error('\n❌ Analytics test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testAnalytics().then(result => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
