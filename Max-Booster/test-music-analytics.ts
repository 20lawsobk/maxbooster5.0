import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'brandonlawson720@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123!';

async function testMusicCareerAnalytics() {
  console.log('🎵 Testing Music Career AI Analytics...\n');
  
  // Login as admin
  console.log('1️⃣  Logging in as admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('✅ Admin logged in successfully\n');
  
  // Test 1: Career Growth Prediction
  console.log('2️⃣  Testing Career Growth Prediction...');
  const careerGrowthRes = await fetch(`${BASE_URL}/api/analytics/music/career-growth`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies || ''
    },
    body: JSON.stringify({ metric: 'streams', timeline: '30d' })
  });
  
  if (careerGrowthRes.ok) {
    const data = await careerGrowthRes.json();
    console.log('✅ Career Growth Prediction:', {
      metric: data.metric,
      currentValue: data.currentValue,
      predictedValue: data.predictedValue,
      growthRate: data.growthRate + '%',
      recommendations: data.recommendations?.length || 0
    });
  } else {
    console.log('❌ Failed:', await careerGrowthRes.text());
  }
  
  // Test 2: Release Strategy
  console.log('\n3️⃣  Testing Release Strategy...');
  const releaseStrategyRes = await fetch(`${BASE_URL}/api/analytics/music/release-strategy`, {
    headers: { 'Cookie': cookies || '' }
  });
  
  if (releaseStrategyRes.ok) {
    const data = await releaseStrategyRes.json();
    console.log('✅ Release Strategy:', {
      bestDay: data.bestReleaseDay,
      bestTime: data.bestReleaseTime,
      frequency: data.optimalFrequency,
      genreTrends: data.genreTrends?.length || 0,
      recommendations: data.recommendations?.length || 0
    });
  } else {
    console.log('❌ Failed:', await releaseStrategyRes.text());
  }
  
  // Test 3: Fanbase Analysis
  console.log('\n4️⃣  Testing Fanbase Analysis...');
  const fanbaseRes = await fetch(`${BASE_URL}/api/analytics/music/fanbase`, {
    headers: { 'Cookie': cookies || '' }
  });
  
  if (fanbaseRes.ok) {
    const data = await fanbaseRes.json();
    console.log('✅ Fanbase Analysis:', {
      totalFans: data.totalFans,
      activeListeners: data.activeListeners,
      engagementRate: data.engagementRate + '%',
      platforms: data.topPlatforms?.length || 0,
      opportunities: data.growthOpportunities?.length || 0
    });
  } else {
    console.log('❌ Failed:', await fanbaseRes.text());
  }
  
  // Test 4: Career Milestones
  console.log('\n5️⃣  Testing Career Milestones...');
  const milestonesRes = await fetch(`${BASE_URL}/api/analytics/music/milestones`, {
    headers: { 'Cookie': cookies || '' }
  });
  
  if (milestonesRes.ok) {
    const data = await milestonesRes.json();
    console.log('✅ Career Milestones:', data.map((m: any) => ({
      type: m.type,
      current: m.current,
      next: m.nextMilestone,
      progress: m.progress.toFixed(1) + '%'
    })));
  } else {
    console.log('❌ Failed:', await milestonesRes.text());
  }
  
  // Test 5: Music Insights
  console.log('\n6️⃣  Testing Music Industry Insights...');
  const insightsRes = await fetch(`${BASE_URL}/api/analytics/music/insights`, {
    headers: { 'Cookie': cookies || '' }
  });
  
  if (insightsRes.ok) {
    const data = await insightsRes.json();
    console.log('✅ Music Insights:', data.map((i: any) => ({
      category: i.category,
      title: i.title,
      impact: i.impact,
      actions: i.actionable?.length || 0
    })));
  } else {
    console.log('❌ Failed:', await insightsRes.text());
  }
  
  console.log('\n🎉 All Music Career AI Analytics endpoints tested!');
}

testMusicCareerAnalytics().catch(console.error);
