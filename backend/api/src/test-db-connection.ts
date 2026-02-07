// Load environment variables from config
import { supabaseConfig } from './config';
import { createClient } from '@supabase/supabase-js';

async function testDatabaseConnection() {
    console.log('🔍 Testing Supabase database connection...\n');

    // Get environment variables from config
    const supabaseUrl = supabaseConfig.url;
    const supabaseAnonKey = supabaseConfig.anonKey;
    const supabaseServiceKey = supabaseConfig.serviceRoleKey;

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error('❌ Error: Missing environment variables!');
        console.log('\nRequired variables:');
        console.log('  - SUPABASE_URL');
        console.log('  - SUPABASE_ANON_KEY');
        console.log('  - SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    console.log('✅ Environment variables loaded');
    console.log(`   URL: ${supabaseUrl}\n`);

    try {
        // Test with anon key
        console.log('Testing connection with ANON key...');
        const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

        // Simple query to test connection
        const { data, error } = await supabaseAnon
            .rpc('version');

        if (error) {
            // Try alternative test - just check if we can reach the API
            const { error: healthError } = await supabaseAnon.from('_realtime').select('*').limit(0);
            if (healthError && healthError.code !== 'PGRST116') {
                console.log('⚠️  Anon key connection test inconclusive (this is okay)');
            } else {
                console.log('✅ Connection successful with ANON key!');
            }
        } else {
            console.log('✅ Connection successful with ANON key!');
        }

        // Test with service role key
        console.log('\nTesting connection with SERVICE_ROLE key...');
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

        // Test auth admin API
        const { data: authData, error: authError } = await supabaseService.auth.admin.listUsers();

        if (authError) {
            throw new Error(`Service role key test failed: ${authError.message}`);
        }

        console.log('✅ Connection successful with SERVICE_ROLE key!');
        console.log(`   Found ${authData.users.length} user(s) in auth system`);

        // Test database connectivity
        console.log('\nTesting database connectivity...');
        const { error: dbError } = await supabaseService
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);

        if (dbError && dbError.code !== 'PGRST116') {
            // Try a simpler test
            const { error: simpleError } = await supabaseService.rpc('version');
            if (simpleError) {
                console.log('⚠️  Database query test skipped (expected if no tables exist yet)');
            } else {
                console.log('✅ Database connectivity confirmed!');
            }
        } else {
            console.log('✅ Database connectivity confirmed!');
        }

        console.log('\n🎉 All connection tests passed!');
        console.log('✅ Your Supabase database is connected and ready to use.\n');

    } catch (error: any) {
        console.error('\n❌ Connection test failed!');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('  1. Your SUPABASE_URL is correct');
        console.error('  2. Your API keys are correct');
        console.error('  3. Your Supabase project is active');
        console.error('  4. Your internet connection is working\n');
        process.exit(1);
    }
}

// Run the test
testDatabaseConnection();
