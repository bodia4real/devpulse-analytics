// Load environment variables FIRST
import './config';

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { serverConfig } from './config';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';

const app: Application = express();
const port = serverConfig.port;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (after body parsing, before routes)
app.use(requestLogger);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// Health check endpoint
app.use('/health', healthRouter);

// Error handler middleware (must be last, after all routes)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});