import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function createSellerUser() {
  const email = 'test.yearly@maxbooster.com';
  const password = 'TestUser123!@#';
  const username = 'testseller';

  try {
    const existing = await storage.getUserByEmail(email);

    if (existing) {
      console.log('✅ Seller user already exists:', email);
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

    console.log('✅ Seller user created:', email);
    console.log('🔒 Password:', password);
    console.log('📧 Username:', username);
  } catch (error) {
    console.error('❌ Failed to create seller user:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createSellerUser();
