// Request logging middleware
// Logs incoming requests with method, URL, status code, duration, and IP

import { Request, Response, NextFunction } from 'express';
import { serverConfig } from '../config';

// Get client IP address
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

// Format timestamp
const formatTimestamp = (): string => {
  return new Date().toISOString();
};

// Format duration in milliseconds
const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

// Get log level based on status code
const getLogLevel = (statusCode: number): string => {
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  return 'INFO';
};

// Format log message
const formatLogMessage = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  ip: string
): string => {
  const timestamp = formatTimestamp();
  const level = getLogLevel(statusCode);
  const durationFormatted = formatDuration(duration);

  return `[${timestamp}] ${level} ${method} ${url} ${statusCode} ${durationFormatted} ${ip}`;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Capture start time
  const startTime = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = getClientIp(req);

  // Log incoming request (only in development for less noise)
  if (serverConfig.nodeEnv === 'development') {
    console.log(`[${formatTimestamp()}] ${method} ${url} ${ip}`);
  }

  // Listen for when response is finished
  res.on('finish', () => {
    // Calculate duration
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Format and log the complete request/response info
    const logMessage = formatLogMessage(method, url, statusCode, duration, ip);

    // Use appropriate log level
    if (statusCode >= 500) {
      console.error(logMessage);
    } else if (statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }

    // Warn about slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request detected: ${method} ${url} took ${formatDuration(duration)}`);
    }
  });

  // Continue to next middleware
  next();
};
