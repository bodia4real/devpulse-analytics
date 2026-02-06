import { testConnection } from './config/database';

async function main() {
  console.log('🔍 Testing PostgreSQL direct connection (postgres.js)...\n');
  
  try {
    await testConnection();
    console.log('\n🎉 PostgreSQL connection test passed!');
    console.log('✅ You can now use direct SQL queries with postgres.js\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ PostgreSQL connection test failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('  1. Your DATABASE_URL is set in .env file');
    console.error('  2. Get it from: Supabase Dashboard > Settings > Database > Connection string');
    console.error('  3. Use "Transaction pooler" for serverless/short-lived connections');
    console.error('  4. Use "Session pooler" for long-lived connections\n');
    process.exit(1);
  }
}

main();
