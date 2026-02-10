/**
 * Run this to test database connection:  npm run test:db
 * Loads .env, uses the same pool as the app.
 */
import { pool } from './config/database';

async function testConnection() {
  console.log('Testing database connection...\n');
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('✅ Connected to PostgreSQL');
    console.log('   Database:', result.rows[0].db);
    console.log('   Server time:', result.rows[0].now);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', (err as Error).message);
    console.error('\nCheck: DATABASE_URL in .env (Supabase Dashboard → Settings → Database)\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
