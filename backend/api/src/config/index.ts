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

// GitHub OAuth configuration
export const githubConfig = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/platforms/connect/github/callback',
};

// JWT configuration (for authentication)
export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

// Validate required environment variables
if (!databaseConfig.url) {
    throw new Error('DATABASE_URL environment variable is required');
}

if (!supabaseConfig.url || !supabaseConfig.anonKey || !supabaseConfig.serviceRoleKey) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are required');
}

if (!githubConfig.clientId || !githubConfig.clientSecret) {
    throw new Error('GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are required');
}

if (!jwtConfig.secret) {
    throw new Error('JWT_SECRET environment variable is required');
}

// Export all config as a single object (optional, for convenience)
export const config = {
    server: serverConfig,
    database: databaseConfig,
    supabase: supabaseConfig,
    github: githubConfig,
    jwt: jwtConfig,
};
