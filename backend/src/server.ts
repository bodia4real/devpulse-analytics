import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route with DB test
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server running but database connection failed',
      database: 'disconnected'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});