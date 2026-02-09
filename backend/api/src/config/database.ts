// Import config (this ensures .env is loaded first)
import { databaseConfig } from './index';
import postgres from 'postgres';

// Get database connection string from config
const connectionString = databaseConfig.url!;

// Create postgres client with connection pooling
// Connection pooling reuses connections for better performance
const sql = postgres(connectionString, {
    max: 20, // Maximum number of connections
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout
});

// Export the sql client - use it directly for queries
// Example: const users = await sql`SELECT * FROM profiles WHERE id = ${userId}`;
export default sql;

// Test database connection
export async function testConnection(): Promise<boolean> {
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
