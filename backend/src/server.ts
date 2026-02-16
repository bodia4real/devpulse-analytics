import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth.middleware';
import authRouter from './routes/auth.router';
import reposRouter from './routes/repos.routes';
import { ctrlWrapper } from './utils/ctrlWrapper';
import { healthCheck } from './utils/health';
import contributionsRouter from './routes/contributions.routes';

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 5001;

// Keep process alive on unhandled errors (log instead of exit)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Middleware (allow FRONTEND_URL in prod, all origins in dev)
const corsOrigin = process.env.FRONTEND_URL || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', ctrlWrapper(healthCheck));
app.use('/api/auth', authRouter);
app.use('/api/repos', reposRouter);
app.use('/api/contributions', contributionsRouter);
// Global error handler – must be last so it catches errors from all routes
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});