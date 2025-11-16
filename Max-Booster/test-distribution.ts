#!/usr/bin/env tsx
import axios from 'axios';

// Test Distribution Flow Script
// This script tests the end-to-end LabelGrid integration

const API_BASE = 'http://localhost:5000/api';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestUser123!@#';

async function testDistribution() {
  console.log('🚀 Testing LabelGrid Distribution Integration...\n');

  try {
    // Step 1: Login as test user
    console.log('Step 1: Logging in as test user...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'test.monthly@maxbooster.com',  // Changed from 'email' to 'username'
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!@#'
    });
    
    const sessionCookie = loginRes.headers['set-cookie']?.[0];
    if (!sessionCookie) throw new Error('Failed to get session cookie');
    
    console.log('✅ Logged in successfully\n');

    // Step 2: Create a test track (simulating user having uploaded music)
    console.log('Step 2: Creating test track...');
    const trackData = {
      title: 'Test Release - Max Booster Demo',
      artist: 'Max Booster Test Artist',
      duration: 180, // 3 minutes
      audioUrl: '/uploads/test-track.mp3', // This would be S3 URL in production
      genre: 'Electronic',
      isrc: null, // Will be generated
      metadata: {
        bpm: 128,
        key: 'C Major',
        mood: 'Energetic'
      }
    };

    // Step 3: Create distribution release
    console.log('Step 3: Creating distribution release...');
    const distributionRes = await axios.post(
      `${API_BASE}/distribution/releases`,
      {
        title: 'Test Release - Max Booster Integration',
        artistName: 'Max Booster Test Artist',
        releaseType: 'single',
        primaryGenre: 'Electronic',
        language: 'English',
        labelName: 'Max Booster Records',
        copyrightYear: new Date().getFullYear(),
        copyrightOwner: 'Max Booster Records',
        isExplicit: false,
        releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        territoryMode: 'worldwide',
        selectedPlatforms: ['spotify', 'apple-music', 'youtube-music']
      },
      {
        headers: {
          Cookie: sessionCookie
        }
      }
    );

    console.log('✅ Distribution Response:', distributionRes.data);

    // Step 4: Check distribution status
    console.log('\nStep 4: Checking distribution status...');
    const statusRes = await axios.get(
      `${API_BASE}/distribution/releases/${distributionRes.data.id}`,
      {
        headers: {
          Cookie: sessionCookie
        }
      }
    );

    console.log('✅ Distribution Status:', statusRes.data);

    // Step 5: Test ISRC generation
    console.log('\nStep 5: Testing ISRC generation...');
    const isrcRes = await axios.post(
      `${API_BASE}/distribution/generate-isrc`,
      { trackId: 'test-track-001' },
      {
        headers: {
          Cookie: sessionCookie
        }
      }
    );

    console.log('✅ Generated ISRC:', isrcRes.data);

    // Step 6: Test UPC generation
    console.log('\nStep 6: Testing UPC generation...');
    const upcRes = await axios.post(
      `${API_BASE}/distribution/generate-upc`,
      { releaseId: distributionRes.data.id },  // Changed from releaseId to id
      {
        headers: {
          Cookie: sessionCookie
        }
      }
    );

    console.log('✅ Generated UPC:', upcRes.data);

    console.log('\n🎉 Distribution test completed successfully!');
    console.log('LabelGrid integration is working correctly.');
    
    return {
      success: true,
      releaseId: distributionRes.data.id,  // Changed from releaseId to id
      status: statusRes.data
    };

  } catch (error: any) {
    console.error('\n❌ Distribution test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testDistribution().then(result => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});