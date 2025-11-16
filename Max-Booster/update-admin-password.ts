import { db } from './server/db.js';
import { users } from './shared/schema.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function updateAdminPassword() {
  const email = 'brandonlawson720@gmail.com';
  const newPassword = 'admin123!';
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));
    
    console.log('✅ Admin password updated successfully');
    console.log('📧 Email:', email);
    console.log('🔒 Password: admin123!');
  } catch (error) {
    console.error('❌ Failed to update password:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

updateAdminPassword();
