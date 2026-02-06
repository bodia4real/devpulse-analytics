import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Get database connection string from environment
// For Supabase, you can find this in: Settings > Database > Connection string
// Use "Transaction pooler" for serverless/short-lived connections
// Use "Session pooler" for long-lived connections
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
// Options:
// - max: Maximum number of connections in the pool (default: 10)
// - idle_timeout: Close idle connections after this many seconds (default: 0 = never)
// - connect_timeout: Connection timeout in seconds (default: 30)
const sql = postgres(connectionString, {
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

// Export the sql client for direct PostgreSQL queries
export default sql;

// Also export a helper function for testing the connection
export async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ PostgreSQL connection successful');
    console.log(`   PostgreSQL version: ${result[0].version}`);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
}
