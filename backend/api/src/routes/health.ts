// Health check endpoint
// Returns server status and basic health information

import { Request, Response, Router } from 'express';
import { serverConfig } from '../config';
import sql from '../config/database';

const router = Router();

// Track server start time for uptime calculation
const serverStartTime = Date.now();

// Calculate uptime in seconds
const getUptime = (): number => {
  return Math.floor((Date.now() - serverStartTime) / 1000);
};

// Format uptime as human-readable string
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Test database connection
const checkDatabase = async (): Promise<{ status: string; responseTime?: number }> => {
  try {
    const startTime = Date.now();
    await sql`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
    };
  }
};

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const uptime = getUptime();
  const database = await checkDatabase();

  // Determine overall health status
  const isHealthy = database.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503; // 503 Service Unavailable if unhealthy

  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime),
    },
    server: {
      environment: serverConfig.nodeEnv,
      port: serverConfig.port,
    },
    database: {
      status: database.status,
      ...(database.responseTime && { responseTime: `${database.responseTime}ms` }),
    },
  };

  res.status(statusCode).json(healthData);
});

export default router;
