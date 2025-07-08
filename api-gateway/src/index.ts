import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { validateEnv } from './utils/validateEnv';

// Load environment variables
dotenv.config();

// Validate environment variables only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnv();
  } catch (error) {
    console.warn('⚠️ Environment validation failed, continuing with defaults for development');
  }
}

const app: Application = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 4000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://swiftchat-frontend.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      auth: process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_SERVICE_PORT || 4002}`,
      chat: process.env.CHAT_SERVICE_URL || `http://localhost:${process.env.CHAT_SERVICE_PORT || 4003}`,
      notification: process.env.NOTIFICATION_SERVICE_URL || `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 4004}`,
    }
  });
});

// Get service URLs with fallbacks
const getAuthServiceUrl = () => {
  return process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_SERVICE_PORT || 4002}`;
};

const getChatServiceUrl = () => {
  return process.env.CHAT_SERVICE_URL || `http://localhost:${process.env.CHAT_SERVICE_PORT || 4003}`;
};

const getNotificationServiceUrl = () => {
  return process.env.NOTIFICATION_SERVICE_URL || `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 4004}`;
};

// Authentication routes (public)
app.use('/api/auth', createProxyMiddleware({
  target: getAuthServiceUrl(),
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err);
    if (res && !res.headersSent) {
      res.status(503).json({ error: 'Auth service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔐 Proxying to Auth Service: ${req.method} ${req.url}`);
  }
}));

// Protected routes middleware
app.use('/api/chat', authMiddleware);
app.use('/api/groups', authMiddleware);
app.use('/api/users', authMiddleware);
app.use('/api/notifications', authMiddleware);

// Chat service routes
app.use('/api/chat', createProxyMiddleware({
  target: getChatServiceUrl(),
  changeOrigin: true,
  pathRewrite: {
    '^/api/chat': '/api/chat',
  },
  onError: (err, req, res) => {
    console.error('Chat Service Proxy Error:', err);
    if (res && !res.headersSent) {
      res.status(503).json({ error: 'Chat service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`💬 Proxying to Chat Service: ${req.method} ${req.url}`);
  }
}));

// Group management routes (part of chat service)
app.use('/api/groups', createProxyMiddleware({
  target: getChatServiceUrl(),
  changeOrigin: true,
  pathRewrite: {
    '^/api/groups': '/api/groups',
  },
  onError: (err, req, res) => {
    console.error('Chat Service Proxy Error:', err);
    if (res && !res.headersSent) {
      res.status(503).json({ error: 'Chat service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`👥 Proxying to Chat Service (Groups): ${req.method} ${req.url}`);
  }
}));

// User management routes (part of auth service)
app.use('/api/users', createProxyMiddleware({
  target: getAuthServiceUrl(),
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users',
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err);
    if (res && !res.headersSent) {
      res.status(503).json({ error: 'Auth service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`👤 Proxying to Auth Service (Users): ${req.method} ${req.url}`);
  }
}));

// Notification service routes
app.use('/api/notifications', createProxyMiddleware({
  target: getNotificationServiceUrl(),
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications',
  },
  onError: (err, req, res) => {
    console.error('Notification Service Proxy Error:', err);
    if (res && !res.headersSent) {
      res.status(503).json({ error: 'Notification service unavailable' });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔔 Proxying to Notification Service: ${req.method} ${req.url}`);
  }
}));

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`� CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log('🔗 Service URLs:');
  console.log(`  🔐 Auth service: ${getAuthServiceUrl()}`);
  console.log(`  💬 Chat service: ${getChatServiceUrl()}`);
  console.log(`  🔔 Notification service: ${getNotificationServiceUrl()}`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ API Gateway shut down complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
