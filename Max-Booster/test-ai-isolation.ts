/**
 * AI Model Metadata Isolation Test
 * 
 * CRITICAL SECURITY TEST: Verifies per-user metadata isolation across cache evictions
 * Tests that user-specific state (segments, metrics, scalers) doesn't leak between users
 * 
 * This test prevents the cross-tenant data leakage vulnerability identified by Architect
 */

import { aiModelManager } from './server/services/aiModelManager.js';
import { db } from './db/index.js';
import { userAIModels } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Colors for console output
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

function log(message: string, color: string = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

/**
 * Test Scenario:
 * 1. User A trains advertising model with specific metadata
 * 2. User B trains advertising model with different metadata
 * 3. Force cache eviction and reload both models
 * 4. Verify each user's metadata remains isolated and correct
 */
async function testAdvertisingAutopilotIsolation() {
  log('\n🧪 Testing Advertising Autopilot AI Metadata Isolation', COLORS.CYAN);
  log('='.repeat(70), COLORS.CYAN);

  const userA = 'test-user-a-' + Date.now();
  const userB = 'test-user-b-' + Date.now();

  try {
    // STEP 1: Train model for User A
    log('\n📝 Step 1: Training model for User A...', COLORS.BLUE);
    const modelA1 = await aiModelManager.getAdvertisingAutopilot(userA);
    
    // Simulate training with User A's data
    const userACampaigns = [
      {
        campaignId: 'a1',
        platforms: ['instagram', 'twitter'],
        content: {
          headline: 'User A Test',
          body: 'User A content',
          hashtags: ['userA'],
          mentions: [],
          mediaType: 'image' as const,
        },
        timing: {
          publishedAt: new Date(),
          hourOfDay: 14,
          dayOfWeek: 3,
          isOptimalTime: true,
        },
        performance: {
          impressions: 1000,
          reach: 800,
          organicReach: 700,
          clicks: 50,
          engagement: 100,
          likes: 70,
          comments: 20,
          shares: 10,
          saves: 5,
          conversions: 5,
          engagementRate: 0.1,
          viralCoefficient: 0.01,
          authenticityScore: 0.9,
        },
        algorithms: {
          engagementVelocity: 10,
          algorithmicBoost: 1.5,
          decayRate: 0.1,
          peakEngagementTime: 2,
        },
        audience: {
          segmentIds: ['userA-segment'],
          demographicsReached: { '18-24': 50, '25-34': 30 },
          influencersEngaged: [],
          networkPropagation: 1.2,
        },
        objective: 'awareness' as const,
        wentViral: false,
      },
    ];
    
    // Add more campaigns to meet minimum training threshold
    for (let i = 0; i < 30; i++) {
      userACampaigns.push({
        ...userACampaigns[0],
        campaignId: `a${i + 2}`,
        performance: {
          ...userACampaigns[0].performance,
          impressions: 1000 + i * 100,
          reach: 800 + i * 80,
          organicReach: 700 + i * 70,
        },
      });
    }
    
    await modelA1.trainOnOrganicCampaigns(userACampaigns);
    await aiModelManager.saveAdvertisingModel(userA);
    
    const metadataA1 = modelA1.serializeMetadata();
    log(`✅ User A trained: viralSuccessRate=${metadataA1.viralSuccessRate}, reachMultiplier=${metadataA1.avgOrganicReachMultiplier}`, COLORS.GREEN);
    
    // STEP 2: Train model for User B with DIFFERENT data
    log('\n📝 Step 2: Training model for User B...', COLORS.BLUE);
    const modelB1 = await aiModelManager.getAdvertisingAutopilot(userB);
    
    const userBCampaigns = [
      {
        campaignId: 'b1',
        platforms: ['facebook', 'youtube'],
        content: {
          headline: 'User B Test',
          body: 'User B content',
          hashtags: ['userB'],
          mentions: [],
          mediaType: 'video' as const,
        },
        timing: {
          publishedAt: new Date(),
          hourOfDay: 18,
          dayOfWeek: 5,
          isOptimalTime: true,
        },
        performance: {
          impressions: 5000,
          reach: 4000,
          organicReach: 3500,
          clicks: 250,
          engagement: 500,
          likes: 350,
          comments: 100,
          shares: 50,
          saves: 25,
          conversions: 25,
          engagementRate: 0.1,
          viralCoefficient: 0.01,
          authenticityScore: 0.95,
        },
        algorithms: {
          engagementVelocity: 50,
          algorithmicBoost: 2.0,
          decayRate: 0.05,
          peakEngagementTime: 1,
        },
        audience: {
          segmentIds: ['userB-segment'],
          demographicsReached: { '25-34': 60, '35-44': 40 },
          influencersEngaged: [],
          networkPropagation: 1.8,
        },
        objective: 'conversions' as const,
        wentViral: true,
      },
    ];
    
    for (let i = 0; i < 30; i++) {
      userBCampaigns.push({
        ...userBCampaigns[0],
        campaignId: `b${i + 2}`,
        performance: {
          ...userBCampaigns[0].performance,
          impressions: 5000 + i * 500,
          reach: 4000 + i * 400,
          organicReach: 3500 + i * 350,
        },
      });
    }
    
    await modelB1.trainOnOrganicCampaigns(userBCampaigns);
    await aiModelManager.saveAdvertisingModel(userB);
    
    const metadataB1 = modelB1.serializeMetadata();
    log(`✅ User B trained: viralSuccessRate=${metadataB1.viralSuccessRate}, reachMultiplier=${metadataB1.avgOrganicReachMultiplier}`, COLORS.GREEN);
    
    // STEP 3: Force cache eviction by clearing internal caches
    log('\n🔄 Step 3: Simulating cache eviction...', COLORS.BLUE);
    // In production, this happens automatically when cache reaches MAX_ADVERTISING_MODELS (50)
    // For testing, we'll reload models from database to simulate this
    
    // STEP 4: Reload models from database and verify metadata isolation
    log('\n🔍 Step 4: Reloading models and verifying metadata isolation...', COLORS.BLUE);
    
    // Clear models from memory (simulate eviction)
    (aiModelManager as any).advertisingModels.clear();
    
    // Reload User A's model
    const modelA2 = await aiModelManager.getAdvertisingAutopilot(userA);
    const metadataA2 = modelA2.serializeMetadata();
    
    // Reload User B's model
    const modelB2 = await aiModelManager.getAdvertisingAutopilot(userB);
    const metadataB2 = modelB2.serializeMetadata();
    
    // VERIFICATION: Check that metadata is correctly isolated
    log('\n📊 Verification Results:', COLORS.CYAN);
    log('-'.repeat(70), COLORS.CYAN);
    
    let passed = true;
    
    // Verify User A's metadata persisted correctly
    if (metadataA2.viralSuccessRate !== metadataA1.viralSuccessRate) {
      log(`❌ User A viralSuccessRate changed: ${metadataA1.viralSuccessRate} → ${metadataA2.viralSuccessRate}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User A viralSuccessRate persisted: ${metadataA2.viralSuccessRate}`, COLORS.GREEN);
    }
    
    if (metadataA2.avgOrganicReachMultiplier !== metadataA1.avgOrganicReachMultiplier) {
      log(`❌ User A avgOrganicReachMultiplier changed: ${metadataA1.avgOrganicReachMultiplier} → ${metadataA2.avgOrganicReachMultiplier}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User A avgOrganicReachMultiplier persisted: ${metadataA2.avgOrganicReachMultiplier}`, COLORS.GREEN);
    }
    
    // Verify User B's metadata persisted correctly
    if (metadataB2.viralSuccessRate !== metadataB1.viralSuccessRate) {
      log(`❌ User B viralSuccessRate changed: ${metadataB1.viralSuccessRate} → ${metadataB2.viralSuccessRate}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User B viralSuccessRate persisted: ${metadataB2.viralSuccessRate}`, COLORS.GREEN);
    }
    
    if (metadataB2.avgOrganicReachMultiplier !== metadataB1.avgOrganicReachMultiplier) {
      log(`❌ User B avgOrganicReachMultiplier changed: ${metadataB1.avgOrganicReachMultiplier} → ${metadataB2.avgOrganicReachMultiplier}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User B avgOrganicReachMultiplier persisted: ${metadataB2.avgOrganicReachMultiplier}`, COLORS.GREEN);
    }
    
    // Critical: Verify no cross-contamination
    if (metadataA2.viralSuccessRate === metadataB2.viralSuccessRate && metadataA1.viralSuccessRate !== metadataB1.viralSuccessRate) {
      log(`❌ CRITICAL: Cross-tenant data leakage detected! Users have identical metrics after reload`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ Users maintain distinct metadata (no cross-contamination)`, COLORS.GREEN);
    }
    
    // Verify campaign history isolation
    if (metadataA2.campaignHistory.length !== userACampaigns.length) {
      log(`❌ User A campaign history lost: expected ${userACampaigns.length}, got ${metadataA2.campaignHistory.length}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User A campaign history persisted: ${metadataA2.campaignHistory.length} campaigns`, COLORS.GREEN);
    }
    
    if (metadataB2.campaignHistory.length !== userBCampaigns.length) {
      log(`❌ User B campaign history lost: expected ${userBCampaigns.length}, got ${metadataB2.campaignHistory.length}`, COLORS.RED);
      passed = false;
    } else {
      log(`✅ User B campaign history persisted: ${metadataB2.campaignHistory.length} campaigns`, COLORS.GREEN);
    }
    
    // Cleanup test data
    await db.delete(userAIModels).where(
      and(
        eq(userAIModels.userId, userA),
        eq(userAIModels.modelType, 'advertising_autopilot')
      )
    );
    await db.delete(userAIModels).where(
      and(
        eq(userAIModels.userId, userB),
        eq(userAIModels.modelType, 'advertising_autopilot')
      )
    );
    
    if (passed) {
      log('\n✅ AI Model Metadata Isolation Test PASSED', COLORS.GREEN);
      log('='.repeat(70), COLORS.GREEN);
      return true;
    } else {
      log('\n❌ AI Model Metadata Isolation Test FAILED', COLORS.RED);
      log('='.repeat(70), COLORS.RED);
      return false;
    }
  } catch (error) {
    log(`\n❌ Test error: ${error}`, COLORS.RED);
    log('='.repeat(70), COLORS.RED);
    throw error;
  }
}

// Run the test
async function runTests() {
  log('\n🔒 AI METADATA ISOLATION REGRESSION TEST', COLORS.CYAN);
  log('Testing cross-tenant data leakage prevention', COLORS.CYAN);
  log('='.repeat(70), COLORS.CYAN);
  
  try {
    const result = await testAdvertisingAutopilotIsolation();
    
    if (result) {
      log('\n🎉 All isolation tests passed! Production-ready.', COLORS.GREEN);
      process.exit(0);
    } else {
      log('\n💥 Isolation test failed! NOT production-ready.', COLORS.RED);
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 Test suite failed: ${error}`, COLORS.RED);
    process.exit(1);
  }
}

// Execute
runTests();
