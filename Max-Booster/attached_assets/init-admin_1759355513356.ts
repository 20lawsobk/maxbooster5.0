import bcrypt from 'bcrypt';
import { storage } from './storage';

export async function initializeAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByEmail('brandonlawson720@gmail.com');

    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123!', 10);

    const adminUser = await storage.createUser({
      username: 'admin',
      email: 'brandonlawson720@gmail.com',
      password: hashedPassword,
      role: 'admin',
      subscriptionPlan: 'lifetime',
      subscriptionStatus: 'active',
    });

    console.log('Admin user created successfully:', adminUser.email);
    return adminUser;
  } catch (error) {
    console.error('Error initializing admin user:', error);
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
