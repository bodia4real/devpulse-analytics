import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackUrl: process.env.GITHUB_CALLBACK_URL!,
    },
    frontendUrl: process.env.FRONTEND_URL!,
  };
  
  // Validate required env vars on startup
  if (!config.databaseUrl || !config.jwtSecret) {
    throw new Error('Missing required environment variables');
  }