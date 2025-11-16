// IMPORTANT: Import console error filter FIRST, before any Redis clients are created
import './lib/consoleErrorFilter.js';

import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeAdmin } from "./init-admin";
import { auditLogger } from "./middleware/auditLogger";
import AuditSystem from "./audit-system";
import TestingSystem from "./testing-system";
import { globalErrorHandler, handleUnhandledRejection, handleUncaughtException, asyncHandler, setupGracefulShutdown } from "./middleware/errorHandler";
import { requestCorrelation, performanceMonitoring, memoryMonitoring } from "./middleware/requestCorrelation";
import { requestLogger, errorContext } from "./middleware/requestLogger";
import { healthCheck, readinessCheck, livenessCheck } from "./middleware/healthCheck";
import { reliabilityCoordinator } from "./reliability/reliability-coordinator";
import { initializeMaxBooster247, maxBooster247 } from "./reliability-system";
import { CapacityMonitor } from './monitoring/capacityMonitor';
import { ensureStripeProductsAndPrices } from "./services/stripeSetup";
import { SelfHealingSecuritySystem } from "./security-system";
import { config, validateConfig, logConfig } from './config/defaults.js';

// IMPORTANT: Warn if --expose-gc flag is missing (recommended for 24/7 reliability)
if (process.env.NODE_ENV === 'production' && typeof (global as any).gc !== 'function') {
  console.warn('⚠️  WARNING: Production server running without --expose-gc flag');
  console.warn('⚠️  Recommended start: NODE_ENV=production node --expose-gc dist/index.js');
  console.warn('⚠️  This flag enables manual garbage collection for 24/7/365 operation');
  console.warn('⚠️  Server will continue but may experience memory pressure over time');
}

const app = express();

// CRITICAL: Set Express environment from NODE_ENV (Express defaults to production)
app.set('env', process.env.NODE_ENV || 'production');

// Trust proxy for rate limiting accuracy
app.set('trust proxy', 1);

// Enable strong ETags for better caching
app.set('etag', 'strong');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"], // unsafe-eval needed for Vite dev
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://maps.googleapis.com"],
      mediaSrc: ["'self'", "blob:", "data:"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Stripe integration
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://maxbooster.replit.app', 'https://*.replit.app']
    : ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter - Stricter limits for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // More permissive in dev for testing
  message: { message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter - Prevent abuse
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: { message: 'Too many upload requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cache headers middleware for API routes (SAFE: only for non-personalized GET endpoints)
const cacheHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only cache GET and HEAD requests (never cache mutations)
  // HEAD must be treated same as GET since they share HTTP caches
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  
  // IMPORTANT: req.path doesn't include /api prefix when middleware is mounted at /api
  // So we check the path WITHOUT the /api prefix
  const publicEndpoints = [
    '/studio/plugins', // Plugin catalog (same for all users) - no /api prefix!
  ];
  
  // Check if endpoint is in public whitelist
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isPublicEndpoint) {
    // Public endpoints can use shared caching
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  } else {
    // All other authenticated endpoints use private caching only
    // This prevents CDN/shared caching of personalized data
    res.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
    // Use vary() to append without overwriting existing Vary headers
    res.vary('Authorization');
    res.vary('Cookie'); // Also vary by cookie since we use session cookies
  }
  
  next();
};

// Apply rate limiting
// Apply strict auth limiter only to login/register endpoints (not logout or /me)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/projects/upload', uploadLimiter);
app.use('/api', generalLimiter);

// Apply cache headers to API routes
app.use('/api', cacheHeadersMiddleware);

// Enhanced compression for better performance
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Request logging
app.use(morgan('combined', {
  skip: (req: Request) => req.path.startsWith('/assets') || req.path.startsWith('/static'),
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced monitoring and error handling middleware
app.use(requestCorrelation);
app.use(performanceMonitoring);
// Disabled: memoryMonitoring causes false "memory leak" warnings on Vite TypeScript compilation
// app.use(memoryMonitoring);
app.use(requestLogger);
app.use(errorContext);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate and log configuration before anything else
  validateConfig();
  logConfig();

  // Initialize admin user
  await initializeAdmin();

  // Initialize Stripe products and prices
  await ensureStripeProductsAndPrices();

  // Initialize 24/7/365 Reliability System
  await initializeMaxBooster247();
  
  // Initialize Analytics Anomaly Detection Job (every 5 minutes)
  const { analyticsAnomalyService } = await import('./services/analyticsAnomalyService.js');
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  setInterval(async () => {
    try {
      log('Running analytics anomaly detection...');
      await analyticsAnomalyService.detectAnomaliesForAllUsers();
      log('Analytics anomaly detection completed');
    } catch (error: any) {
      console.error('Error in anomaly detection job:', error);
    }
  }, FIVE_MINUTES);
  
  // Run initial detection after 1 minute
  setTimeout(async () => {
    try {
      await analyticsAnomalyService.detectAnomaliesForAllUsers();
      log('Initial analytics anomaly detection completed');
    } catch (error: any) {
      console.error('Error in initial anomaly detection:', error);
    }
  }, 60000);
  
  // Initialize audit and testing systems
  const auditSystem = AuditSystem.getInstance();
  const testingSystem = TestingSystem.getInstance();
  
  // Initialize Self-Healing Security System
  const securitySystem = SelfHealingSecuritySystem.getInstance();
  log('🛡️  Self-Healing Security System initialized and monitoring all routes');
  
  // Health check endpoints (must be before routes)
  app.get('/api/health', asyncHandler(healthCheck));
  app.get('/api/health/ready', asyncHandler(readinessCheck));
  app.get('/api/health/live', livenessCheck);

  const server = await registerRoutes(app);

  // Enhanced global error handler
  app.use(globalErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Setup graceful shutdown handlers with server reference
  handleUnhandledRejection(server);
  handleUncaughtException(server);
  setupGracefulShutdown(server);

  // Track server connections for reliability monitoring
  server.on('connection', (socket) => {
    (global as any).activeConnections = ((global as any).activeConnections || 0) + 1;
    maxBooster247.trackConnection(1);
    
    socket.on('close', () => {
      (global as any).activeConnections = Math.max(0, ((global as any).activeConnections || 1) - 1);
      maxBooster247.trackConnection(-1);
    });
  });

  // Start capacity monitoring
  CapacityMonitor.startMonitoring();

  console.log('🚀 Max Booster Platform - 24/7/365 Ready!');
  console.log('✅ High-availability monitoring active');
  console.log('🔄 Auto-recovery systems enabled');
  console.log('📊 Real-time health tracking operational');
})();
