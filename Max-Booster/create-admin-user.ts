import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  const email = 'brandonlawson720@gmail.com';
  const password = 'admin123!';
  const username = 'admin';

  try {
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      console.log('✅ Admin user already exists:', email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      subscriptionTier: 'lifetime',
      subscriptionStatus: 'active',
      emailVerified: true,
      onboardingComplete: true,
      isAdmin: true,
    });

    console.log('✅ Admin user created:', email);
    console.log('🔒 Password:', password);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
