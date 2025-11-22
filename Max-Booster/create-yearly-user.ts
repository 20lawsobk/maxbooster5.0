import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function createYearlyUser() {
  const email = 'test.yearly@maxbooster.com';
  const password = 'TestUser123!@#';
  const username = 'testyearly';

  try {
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      console.log('✅ Yearly test user already exists:', email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      subscriptionTier: 'yearly',
      subscriptionStatus: 'active',
      emailVerified: true,
      onboardingComplete: true,
    });

    console.log('✅ Yearly test user created:', email);
    console.log('🔒 Password:', password);
  } catch (error) {
    console.error('❌ Failed to create yearly test user:', error);
  } finally {
    process.exit(0);
  }
}

createYearlyUser();
