#!/usr/bin/env ts-node
import axios from 'axios';

// Test Studio/Audio System
// This script tests the DAW, audio processing, and AI music tools

const API_BASE = 'http://localhost:5000/api';

async function testStudio() {
  console.log('🎛️  Testing Studio/Audio System...\n');

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

    // Step 2: Create a project
    console.log('Step 2: Creating studio project...');
    const projectRes = await axios.post(
      `${API_BASE}/studio/projects`,
      {
        title: 'Test Track - Max Booster',
        description: 'Testing studio functionality',
        bpm: 128,
        key: 'C',
        timeSignature: '4/4',
        genre: 'Electronic'
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Project Created:', projectRes.data);

    // Step 3: Get user's projects
    console.log('\nStep 3: Fetching user projects...');
    const projectsRes = await axios.get(`${API_BASE}/studio/projects`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ User Projects:', projectsRes.data);

    // Step 4: Add track to project
    console.log('\nStep 4: Adding track to project...');
    const trackRes = await axios.post(
      `${API_BASE}/studio/projects/${projectRes.data.id}/tracks`,
      {
        name: 'Kick Drum',
        type: 'audio',
        audioUrl: '/uploads/kick.wav',
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Track Added:', trackRes.data);

    // Step 5: Get available plugins
    console.log('\nStep 5: Fetching available plugins...');
    const pluginsRes = await axios.get(`${API_BASE}/studio/plugins`, {
      headers: { Cookie: sessionCookie }
    });
    console.log('✅ Available Plugins:', pluginsRes.data);

    // Step 6: Apply AI mixing
    console.log('\nStep 6: Testing AI mixing...');
    const mixRes = await axios.post(
      `${API_BASE}/audio/ai-mix`,
      {
        projectId: projectRes.data.id,
        style: 'modern-edm',
        intensity: 'medium'
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ AI Mixing Result:', mixRes.data);

    // Step 7: Apply AI mastering
    console.log('\nStep 7: Testing AI mastering...');
    const masterRes = await axios.post(
      `${API_BASE}/audio/ai-master`,
      {
        trackId: trackRes.data.id,
        targetLoudness: -14, // LUFS
        style: 'streaming-optimized'
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ AI Mastering Result:', masterRes.data);

    // Step 8: Test stem separation
    console.log('\nStep 8: Testing stem separation...');
    const stemRes = await axios.post(
      `${API_BASE}/audio/separate-stems`,
      {
        audioUrl: '/uploads/full-mix.wav',
        outputFormat: 'wav'
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Stem Separation:', stemRes.data);

    // Step 9: Generate AI-assisted melody
    console.log('\nStep 9: Testing AI melody generation...');
    const melodyRes = await axios.post(
      `${API_BASE}/audio/generate-melody`,
      {
        key: 'C',
        scale: 'major',
        mood: 'uplifting',
        duration: 16 // bars
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ AI Melody:', melodyRes.data);

    // Step 10: Export project
    console.log('\nStep 10: Exporting project...');
    const exportRes = await axios.post(
      `${API_BASE}/studio/projects/${projectRes.data.id}/export`,
      {
        format: 'wav',
        quality: 'high',
        sampleRate: 44100,
        bitDepth: 24
      },
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Export Result:', exportRes.data);

    // Step 11: Get project analytics
    console.log('\nStep 11: Fetching project analytics...');
    const analyticsRes = await axios.get(
      `${API_BASE}/studio/projects/${projectRes.data.id}/analytics`,
      { headers: { Cookie: sessionCookie } }
    );
    console.log('✅ Project Analytics:', analyticsRes.data);

    console.log('\n🎉 Studio test completed successfully!');
    console.log('DAW and audio processing system is working correctly.');
    
    return {
      success: true,
      project: projectRes.data,
      track: trackRes.data,
      aiMixing: mixRes.data
    };

  } catch (error: any) {
    console.error('\n❌ Studio test failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.status, error.response?.statusText);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testStudio().then(result => {
  console.log('\n📊 Test Summary:', result);
  process.exit(result.success ? 0 : 1);
});
