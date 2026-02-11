import { Request, Response } from 'express';
import { pool } from '../config/database';

/**
 * GET /api/health – server and database status
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW()');
    res.setHeader('Content-Type', 'application/json');
    res.json({
      status: 'ok',
      message: 'Server is running',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      status: 'error',
      message: 'Server running but database connection failed',
      database: 'disconnected',
    });
  }
}
