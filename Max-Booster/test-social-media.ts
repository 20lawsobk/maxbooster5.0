#!/usr/bin/env tsx
import axios from 'axios';

// Test Social Media Management System
// This script tests the social media posting, scheduling, and analytics

const API_BASE = 'http://localhost:5000/api';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestUser123!@#';

async function testSocialMedia() {
  console.log('📱 Testing Social Media System...\n');

  try {
    // Step 1: Login as test user
    console.log('Step 1: Logging in as test user...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.monthly@maxbooster.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!@#',
    });

    const sessionCookie = loginRes.headers['set-cookie']?.[0];
    if (!sessionCookie) throw new Error('Failed to get session cookie');

    console.log('✅ Logged in successfully\n');

    // Step 2: Check connected platforms
    console.log('Step 2: Checking connected platforms...');
    const platformsRes = await axios.get(`${API_BASE}/social-media/platforms`, {
      headers: { Cookie: sessionCookie },
    });
    console.log('✅ Connected Platforms:', platformsRes.data);

    // Step 3: Create a post
    console.log('\nStep 3: Creating a social media post...');
    const postRes = await axios.post(
      `${API_BASE}/social-media/posts`,
      {
        content: 'Test post from Max Booster - Testing social media integration! 🎵',
        platforms: ['twitter', 'facebook'],
        mediaUrls: [],
        scheduledFor: null, // Post immediately
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Post Created:', postRes.data);

    // Step 4: Get posts history
    console.log('\nStep 4: Fetching posts history...');
    const historyRes = await axios.get(`${API_BASE}/social-media/posts`, {
      headers: { Cookie: sessionCookie },
    });
    console.log('✅ Posts History:', historyRes.data);

    // Step 5: Test post scheduling
    console.log('\nStep 5: Testing post scheduling...');
    const scheduleRes = await axios.post(
      `${API_BASE}/social-media/posts`,
      {
        content: 'Scheduled post test - Will post in 1 hour',
        platforms: ['twitter'],
        scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Scheduled Post:', scheduleRes.data);

    // Step 6: Get scheduled posts
    console.log('\nStep 6: Fetching scheduled posts...');
    const scheduledRes = await axios.get(`${API_BASE}/social-media/scheduled`, {
      headers: { Cookie: sessionCookie },
    });
    console.log('✅ Scheduled Posts:', scheduledRes.data);

    // Step 7: Test social analytics
    console.log('\nStep 7: Fetching social analytics...');
    const analyticsRes = await axios.get(`${API_BASE}/social-media/analytics`, {
      headers: { Cookie: sessionCookie },
    });
    console.log('✅ Social Analytics:', analyticsRes.data);

    // Step 8: Test engagement metrics
    console.log('\nStep 8: Fetching engagement metrics...');
    const engagementRes = await axios.get(`${API_BASE}/social-media/engagement`, {
      headers: { Cookie: sessionCookie },
    });
    console.log('✅ Engagement Metrics:', engagementRes.data);

    // Step 9: Test campaign creation
    console.log('\nStep 9: Creating social media campaign...');
    const campaignRes = await axios.post(
      `${API_BASE}/social-media/campaigns`,
      {
        name: 'Test Campaign',
        objective: 'engagement',
        platforms: ['twitter', 'instagram'],
        budget: 0, // Organic campaign
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Campaign Created:', campaignRes.data);

    console.log('\n🎉 Social media test completed successfully!');
    console.log('Social media management system is working correctly.');

    return {
      success: true,
      platforms: platformsRes.data,
      postCreated: postRes.data,
      analytics: analyticsRes.data,
    };
  } catch (error: any) {
    console.error('\n❌ Social media test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
testSocialMedia().then((result) => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
