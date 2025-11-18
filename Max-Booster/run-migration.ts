import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔄 Connecting to database...');

    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'migrations', '0006_add_missing_columns.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 0006_add_missing_columns.sql');
    console.log(migrationSQL);

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   - Added "expire" column to sessions table');
    console.log('   - Added "max_tracks" column to users table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
