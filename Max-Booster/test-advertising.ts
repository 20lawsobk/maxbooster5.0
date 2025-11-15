#!/usr/bin/env ts-node
import axios from 'axios';

// Test Zero-Cost Advertising System
// This script tests the AI-powered advertising and organic amplification

const API_BASE = 'http://localhost:5000/api';

async function testAdvertising() {
  console.log('📢 Testing Zero-Cost Advertising System...\n');

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

    // Step 2: Get available ad platforms
    console.log('Step 2: Fetching available ad platforms...');
    const platformsRes = await axios.get(`${API_BASE}/advertising/platforms`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Available Platforms:', platformsRes.data);

    // Step 3: Create an ad campaign
    console.log('\nStep 3: Creating ad campaign...');
    const campaignRes = await axios.post(
      `${API_BASE}/advertising/campaigns`,
      {
        name: 'Test Music Promotion',
        objective: 'awareness',
        targetAudience: {
          ageRange: { min: 18, max: 35 },
          interests: ['music', 'electronic', 'indie'],
          locations: ['US', 'UK', 'CA']
        },
        budget: 0, // Zero-cost organic campaign
        creativesType: 'auto-generated',
        platforms: ['organic-social']
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Campaign Created:', campaignRes.data);

    // Step 4: Get campaign analytics
    console.log('\nStep 4: Fetching campaign analytics...');
    const analyticsRes = await axios.get(
      `${API_BASE}/advertising/campaigns/${campaignRes.data.id}/analytics`,
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Campaign Analytics:', analyticsRes.data);

    // Step 5: Test AI content generation
    console.log('\nStep 5: Testing AI content generation...');
    const contentRes = await axios.post(
      `${API_BASE}/advertising/generate-content`,
      {
        campaignId: campaignRes.data.id,
        platform: 'twitter',
        tone: 'engaging',
        includeHashtags: true
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ AI-Generated Content:', contentRes.data);

    // Step 6: Get all campaigns
    console.log('\nStep 6: Fetching all campaigns...');
    const allCampaignsRes = await axios.get(`${API_BASE}/advertising/campaigns`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ All Campaigns:', allCampaignsRes.data);

    // Step 7: Test performance metrics
    console.log('\nStep 7: Fetching performance metrics...');
    const metricsRes = await axios.get(`${API_BASE}/advertising/metrics`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Performance Metrics:', metricsRes.data);

    // Step 8: Test audience insights
    console.log('\nStep 8: Fetching audience insights...');
    const insightsRes = await axios.get(`${API_BASE}/advertising/audience-insights`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Audience Insights:', insightsRes.data);

    // Step 9: Test campaign optimization suggestions
    console.log('\nStep 9: Getting AI optimization suggestions...');
    const optimizeRes = await axios.get(
      `${API_BASE}/advertising/campaigns/${campaignRes.data.id}/optimize`,
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Optimization Suggestions:', optimizeRes.data);

    console.log('\n🎉 Advertising test completed successfully!');
    console.log('Zero-cost advertising system is working correctly.');
    
    return {
      success: true,
      campaign: campaignRes.data,
      analytics: analyticsRes.data,
      metrics: metricsRes.data
    };

  } catch (error: any) {
    console.error('\n❌ Advertising test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testAdvertising().then(result => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
