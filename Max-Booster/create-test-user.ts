import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  const email = 'test.monthly@maxbooster.com';
  const password = 'TestUser123!@#';
  const username = 'testuser';

  try {
    // Check if user already exists
    const existing = await storage.getUserByEmail(email);

    if (existing) {
      console.log('✅ Test user already exists:', email);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      subscriptionTier: 'monthly',
      subscriptionStatus: 'active',
      emailVerified: true,
      onboardingComplete: true,
    });

    console.log('✅ Test user created:', email);
    console.log('🔒 Password:', password);
    console.log('📧 Username:', username);
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createTestUser();
