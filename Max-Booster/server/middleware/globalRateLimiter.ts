import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { config } from '../config/defaults.js';

// Aggressive rate limiting for extreme load protection
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the request limit. Please slow down and try again later.',
    retryAfter: `${Math.ceil(config.rateLimiting.windowMs / 1000)} seconds`
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.startsWith('10.82.');
    const isStaticAsset = req.path.startsWith('/@fs/') || req.path.startsWith('/src/') || req.path.startsWith('/node_modules/');
    return (isDevelopment && isLocalhost) || isStaticAsset;
  },
  handler: (req: Request, res: Response) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the request limit. Please slow down and try again later.',
      retryAfter: Math.ceil(config.rateLimiting.windowMs / 1000)
    });
  }
});

// Critical endpoints get stricter limits
export const criticalEndpointLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.criticalMax,
  message: {
    error: 'Too many requests to critical endpoint',
    message: 'This endpoint is rate-limited. Please try again later.'
  }
});
