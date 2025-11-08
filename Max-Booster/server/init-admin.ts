import bcrypt from 'bcrypt';
import { storage } from './storage';

export async function initializeAdmin() {
  try {
    // Calculate 30 days from now for trial accounts
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const users = [
      {
        username: 'admin',
        email: 'brandonlawson720@gmail.com',
        password: 'admin123!',
        role: 'admin' as const,
        subscriptionPlan: 'lifetime' as const,
        subscriptionStatus: 'active' as const,
        trialEndsAt: null, // Admin never expires
      },
      {
        username: 'testmonthly',
        email: 'test.monthly@maxbooster.com',
        password: 'test123!',
        role: 'user' as const,
        subscriptionPlan: 'lifetime' as const, // Full lifetime access during trial
        subscriptionStatus: 'trialing' as const,
        trialEndsAt: trialEndDate,
      },
      {
        username: 'testyearly',
        email: 'test.yearly@maxbooster.com',
        password: 'test123!',
        role: 'user' as const,
        subscriptionPlan: 'lifetime' as const, // Full lifetime access during trial
        subscriptionStatus: 'trialing' as const,
        trialEndsAt: trialEndDate,
      },
      {
        username: 'testlifetime',
        email: 'test.lifetime@maxbooster.com',
        password: 'test123!',
        role: 'user' as const,
        subscriptionPlan: 'lifetime' as const, // Full lifetime access during trial
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

      console.log(`${userData.username} created successfully:`, user.email);
      createdUsers.push(user);
    }

    console.log(`\n✅ Initialization complete - ${createdUsers.length} accounts ready:`);
    console.log('   Admin: brandonlawson720@gmail.com / admin123! (Lifetime - No Expiry)');
    console.log(`   Test Accounts (30-day trial with full lifetime access, expires: ${trialEndDate.toLocaleDateString()}):`);
    console.log('     - test.monthly@maxbooster.com / test123!');
    console.log('     - test.yearly@maxbooster.com / test123!');
    console.log('     - test.lifetime@maxbooster.com / test123!');
    
    // Seed plugin catalog with custom peak-performance plugins
    console.log('\n🎛️  Seeding plugin catalog...');
    await storage.seedPluginCatalog();
    console.log('✅ Plugin catalog seeded with custom peak-performance plugins');
    
    return createdUsers;
  } catch (error) {
    console.error('Error initializing users:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeAdmin()
    .then(() => {
      console.log('Admin initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin initialization failed:', error);
      process.exit(1);
    });
}
