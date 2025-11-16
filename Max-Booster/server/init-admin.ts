import bcrypt from 'bcrypt';
import { storage } from './storage';

/**
 * Production-Safe Initialization
 * 
 * SECURITY: This file does NOT automatically create admin accounts in production.
 * 
 * For development: Set ENABLE_DEV_ACCOUNTS=true to create test accounts
 * For production: Use the secure bootstrap script: npm run bootstrap:admin
 */

export async function initializeAdmin() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const enableDevAccounts = process.env.ENABLE_DEV_ACCOUNTS === 'true';
    
    // SECURITY: NEVER auto-create accounts in production, regardless of flags
    if (isProduction) {
      console.log('🔒 Production mode: Automatic account creation disabled');
      console.log('💡 To create admin account, run: npm run bootstrap:admin');
      
      if (enableDevAccounts) {
        console.warn('⚠️  WARNING: ENABLE_DEV_ACCOUNTS is set but ignored in production');
        console.warn('⚠️  For security, accounts are never auto-created in production');
      }
      
      // Only seed plugin catalog in production
      console.log('🎛️  Seeding plugin catalog...');
      await storage.seedPluginCatalog();
      console.log('✅ Plugin catalog seeded');
      
      return [];
    }
    
    // Development mode only: Create test accounts
    if (enableDevAccounts && !isProduction) {
      console.log('⚠️  DEV MODE: Creating test accounts (NEVER enable in production!)');
      
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      const users = [
        {
          username: 'devadmin',
          email: 'dev.admin@maxbooster.local',
          password: 'DevOnly123!ChangeMeNow',
          role: 'admin' as const,
          subscriptionPlan: 'lifetime' as const,
          subscriptionStatus: 'active' as const,
          trialEndsAt: null,
        },
        {
          username: 'testuser',
          email: 'test.user@maxbooster.local',
          password: 'TestUser123!',
          role: 'user' as const,
          subscriptionPlan: 'lifetime' as const,
          subscriptionStatus: 'trialing' as const,
          trialEndsAt: trialEndDate,
        }
      ];

      const createdUsers = [];
      
      for (const userData of users) {
        const existingUser = await storage.getUserByEmail(userData.email);
        
        if (existingUser) {
          console.log(`${userData.username} already exists`);
          createdUsers.push(existingUser);
          continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = await storage.createUser({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          subscriptionPlan: userData.subscriptionPlan,
          subscriptionStatus: userData.subscriptionStatus,
          trialEndsAt: userData.trialEndsAt,
        });

        console.log(`${userData.username} created:`, user.email);
        createdUsers.push(user);
      }

      console.log(`\n✅ DEV accounts created - ${createdUsers.length} total`);
      
      // Seed plugin catalog
      console.log('\n🎛️  Seeding plugin catalog...');
      await storage.seedPluginCatalog();
      console.log('✅ Plugin catalog seeded');
      
      return createdUsers;
    }
    
    // Seed plugin catalog for any environment
    console.log('🎛️  Seeding plugin catalog...');
    await storage.seedPluginCatalog();
    console.log('✅ Plugin catalog seeded');
    
    return [];
  } catch (error) {
    console.error('Error during initialization:', error);
    throw error;
  }
}

/**
 * Secure Admin Bootstrap (Production-Safe)
 * 
 * Creates admin account with environment-provided credentials.
 * Requires strong password validation.
 */
export async function bootstrapAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables required');
  }
  
  // Validate strong password
  if (adminPassword.length < 12) {
    throw new Error('Admin password must be at least 12 characters');
  }
  
  const hasUpperCase = /[A-Z]/.test(adminPassword);
  const hasLowerCase = /[a-z]/.test(adminPassword);
  const hasNumbers = /\d/.test(adminPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(adminPassword);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new Error('Admin password must contain uppercase, lowercase, numbers, and special characters');
  }
  
  // Check if admin already exists
  const existingAdmin = await storage.getUserByEmail(adminEmail);
  if (existingAdmin) {
    throw new Error(`Admin account already exists: ${adminEmail}`);
  }
  
  // Create admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await storage.createUser({
    username: adminEmail.split('@')[0],
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    subscriptionPlan: 'lifetime',
    subscriptionStatus: 'active',
    trialEndsAt: null,
  });
  
  console.log(`✅ Admin account created: ${admin.email}`);
  console.log('🔒 Please store credentials securely and delete ADMIN_PASSWORD from environment');
  
  return admin;
}
