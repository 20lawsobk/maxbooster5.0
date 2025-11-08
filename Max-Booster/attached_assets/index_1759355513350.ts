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

// CRITICAL: Enforce --expose-gc flag for 24/7 reliability
if (process.env.NODE_ENV === 'production' && typeof (global as any).gc !== 'function') {
  console.error('🚨 FATAL: Production server requires --expose-gc flag for memory management');
  console.error('🚨 Start with: NODE_ENV=production node --expose-gc dist/index.js');
  console.error('🚨 This prevents memory leaks in 24/7/365 operation');
  process.exit(1);
}

const app = express();

// Trust proxy for rate limiting accuracy
app.set('trust proxy', 1);

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth attempts to 10 per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit uploads to 50 per hour
  message: { message: 'Upload limit exceeded, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/projects/upload', uploadLimiter);
app.use('/api', generalLimiter);

// Compression for better performance
app.use(compression());

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
app.use(memoryMonitoring);
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

  // Initialize admin user
  await initializeAdmin();

  // Initialize 24/7/365 Reliability System
  await initializeMaxBooster247();
  
  // Initialize audit and testing systems
  const auditSystem = AuditSystem.getInstance();
  const testingSystem = TestingSystem.getInstance();
  
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

  console.log('🚀 Max Booster Platform - 24/7/365 Ready!');
  console.log('✅ High-availability monitoring active');
  console.log('🔄 Auto-recovery systems enabled');
  console.log('📊 Real-time health tracking operational');
})();
