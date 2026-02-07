import dotenv from 'dotenv';
import path from 'path';

// Load .env file FIRST, before any other imports
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Server configuration
export const serverConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
};

// Database configuration
export const databaseConfig = {
    url: process.env.DATABASE_URL,
};

// Supabase configuration
export const supabaseConfig = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Validate required environment variables
if (!databaseConfig.url) {
    throw new Error('DATABASE_URL environment variable is required');
}

if (!supabaseConfig.url || !supabaseConfig.anonKey || !supabaseConfig.serviceRoleKey) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are required');
}

// Export all config as a single object (optional, for convenience)
export const config = {
    server: serverConfig,
    database: databaseConfig,
    supabase: supabaseConfig,
};
